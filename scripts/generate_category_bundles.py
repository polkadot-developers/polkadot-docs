#!/usr/bin/env python3
"""
generate_category_bundles.py

Build category-based bundles from reconstituted Markdown artifacts under /.ai/pages/*.md.

Behavior:
  - Each category in content.categories_order gets a bundle.
  - Categories listed in content.base_context_categories:
      * get their own standalone bundle
      * and are also INCLUDED in every non-base category bundle (shared base context)
  - If category information is missing or empty in llms_config.json, no bundles are created.


Outputs (written under /.ai/categories/):
  - <category-slug>.manifest.json  (when --format manifest/all)
    {
      "category": "Smart Contracts",
      "category_slug": "smart-contracts",
      "includes_base": true,
      "base_categories": ["Basics","Reference"],
      "count": 12,
      "estimated_token_count_total": 12345,
      "token_estimator": "heuristic-v1",
      "generated_at": "2025-09-02T12:34:56Z",
      "pages": [
        {
          "title": "Intro to XCM",
          "slug": "develop-interoperability-intro-to-xcm",
          "raw_md_url": "https://raw.githubusercontent.com/<org>/<repo>/<branch>/.ai/pages/<slug>.md",
          "html_url": "https://docs.example.com/develop/interoperability/intro-to-xcm/",
          "description": "Short lede…",
          "categories": ["Basics","Networks"],
          "estimated_token_count": 678
        }
      ]
    }

  - <category-slug>.bundle.jsonl    (when --format jsonl/all)
    # One JSON object per line, INCLUDING full page content
    {"title":"…","slug":"…","html_url":"…","raw_md_url":"…","categories":[…],"description":"…","estimated_token_count":210,"token_estimator":"heuristic-v1","content":"<full markdown>"}

  - <category-slug>.md       (when --format md/all)
    # A single concatenated Markdown file with page boundaries and titles

Usage:
  python3 scripts/generate_category_bundles.py
  python3 scripts/generate_category_bundles.py --dry-run --limit 5
  python3 scripts/generate_category_bundles.py --format all
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple
import yaml


# ----------------------------
# Config & paths
# ----------------------------

def load_config(config_path: str) -> Dict[str, Any]:
    cfg = Path(config_path)
    if not cfg.is_absolute():
        cfg = Path(__file__).parent / config_path
    with open(cfg, "r", encoding="utf-8") as f:
        return json.load(f)

def normalize_branch(name: str) -> str:
    return name.replace("refs/heads/", "", 1) if name.startswith("refs/heads/") else name

def resolve_ai_dir(repo_root: Path, config: Dict[str, Any]) -> Path:
    # Prefer repository.ai_artifacts_path; else outputs.public_root + outputs.files.pages_dir
    repo = config.get("repository", {})
    ai_path = repo.get("ai_artifacts_path")
    if not ai_path:
        public_root = config.get("outputs", {}).get("public_root", "/.ai/").strip("/")
        pages_dir = config.get("outputs", {}).get("files", {}).get("pages_dir", "pages").strip("/")
        ai_path = f"{public_root}/{pages_dir}"
    return (repo_root / ai_path).resolve()

def build_raw_base(config: Dict[str, Any]) -> str:
    repo = config["repository"]
    org = repo["org"]
    name = repo["repo"]
    branch = normalize_branch(repo["default_branch"])
    ai_path = repo.get("ai_artifacts_path")
    if not ai_path:
        public_root = config.get("outputs", {}).get("public_root", "/.ai/").strip("/")
        pages_dir = config.get("outputs", {}).get("files", {}).get("pages_dir", "pages").strip("/")
        ai_path = f"{public_root}/{pages_dir}"
    ai_path = ai_path.strip("/")
    return f"https://raw.githubusercontent.com/{org}/{name}/{branch}/{ai_path}"

def categories_from_config(config: Dict[str, Any]) -> Tuple[List[str], List[str]]:
    content = config.get("content", {})
    order = content.get("categories_order", []) or []
    base = content.get("base_context_categories", []) or []
    return order, base


# ----------------------------
# Read AI pages
# ----------------------------

FM_PATTERN = re.compile(r"^---\s*\n(.*?)\n---\s*\n?", re.DOTALL)

@dataclass
class AiPage:
    path: Path
    slug: str
    title: str
    description: str
    categories: List[str]
    html_url: str | None
    body: str

def read_ai_page(md_path: Path) -> AiPage:
    text = md_path.read_text(encoding="utf-8")
    fm: Dict[str, Any] = {}
    body = text

    m = FM_PATTERN.match(text)
    if m:
        fm_text = m.group(1)
        try:
            fm = yaml.safe_load(fm_text) or {}
        except Exception:
            fm = {}
        body = text[m.end():]

    title = fm.get("title") or md_path.stem
    desc_val = fm.get("description") or fm.get("summary") or ""
    if isinstance(desc_val, str):
        description = " ".join(desc_val.splitlines()).strip()
    else:
        description = str(desc_val).strip() if desc_val is not None else ""
    if not description:
        description = "No description available."

    cats = fm.get("categories")
    if isinstance(cats, list):
        categories = [str(c).strip() for c in cats if str(c).strip()]
    elif isinstance(cats, str):
        s = cats.strip()
        if s.startswith("[") and s.endswith("]"):
            try:
                parsed = yaml.safe_load(s)
                categories = [str(c).strip() for c in parsed if str(c).strip()] if isinstance(parsed, list) else [s]
            except Exception:
                categories = [x.strip() for x in s.strip("[]").split(",") if x.strip()]
        else:
            categories = [x.strip() for x in s.split(",") if x.strip()] or [s]
    else:
        categories = ["Uncategorized"]

    html_url = fm.get("url")
    return AiPage(path=md_path, slug=md_path.stem, title=title,
                  description=description, categories=categories,
                  html_url=html_url, body=body)

def load_all_pages(ai_dir: Path) -> List[AiPage]:
    pages: List[AiPage] = []
    for md in sorted(ai_dir.glob("*.md")):
        pages.append(read_ai_page(md))
    return pages


# ----------------------------
# Token estimation
# ----------------------------

def _heuristic_token_count(s: str) -> int:
    """
    Dependency-free token estimate:
      - counts words and standalone punctuation
      - decent for prose and code; model-agnostic
    """
    return len(re.findall(r"\w+|[^\s\w]", s, flags=re.UNICODE))

def _cl100k_token_count(s: str) -> int:
    """
    Optional: if tiktoken is installed and estimator name is 'cl100k',
    compute tokens via cl100k_base; otherwise fall back to heuristic.
    """
    try:
        import tiktoken  # type: ignore
        enc = tiktoken.get_encoding("cl100k_base")
        return len(enc.encode(s))
    except Exception:
        return _heuristic_token_count(s)

def estimate_tokens(text: str, estimator: str = "heuristic-v1") -> int:
    if estimator == "heuristic-v1":
        return _heuristic_token_count(text)
    if estimator == "cl100k":
        return _cl100k_token_count(text)
    # Unknown/custom estimator name → compute via heuristic but keep the label in outputs.
    return _heuristic_token_count(text)


# ----------------------------
# Category logic
# ----------------------------

def slugify_category(name: str) -> str:
    s = name.strip().lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "category"

def select_pages_for_category(category: str, pages: List[AiPage]) -> List[AiPage]:
    cat_lower = category.lower()
    return [p for p in pages if any(c.lower() == cat_lower for c in p.categories)]

def union_pages(sets: List[List[AiPage]]) -> List[AiPage]:
    seen = set()
    out: List[AiPage] = []
    for lst in sets:
        for p in lst:
            if p.slug in seen:
                continue
            seen.add(p.slug)
            out.append(p)
    return out


# ----------------------------
# Writers
# ----------------------------

def write_manifest(out_path: Path, category: str, category_slug: str,
                   includes_base: bool, base_categories: List[str],
                   pages: List[AiPage], raw_base: str,
                   estimator_label: str, page_tokens: Dict[str, int]) -> None:
    est_total = sum(page_tokens.get(p.slug, 0) for p in pages)
    record = {
        "category": category,
        "category_slug": category_slug,
        "includes_base": includes_base,
        "base_categories": base_categories,
        "count": len(pages),
        "estimated_token_count_total": est_total,
        "token_estimator": estimator_label,
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "pages": [
            {
                "title": p.title,
                "slug": p.slug,
                "raw_md_url": f"{raw_base}/{p.slug}.md",
                "html_url": p.html_url,
                "description": p.description,
                "categories": p.categories,
                "estimated_token_count": page_tokens.get(p.slug, 0),
            }
            for p in pages
        ],
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2, ensure_ascii=False)

def write_jsonl(out_path: Path, pages: List[AiPage], raw_base: str,
                estimator_label: str, page_tokens: Dict[str, int]) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        for p in pages:
            obj = {
                "title": p.title,
                "slug": p.slug,
                "raw_md_url": f"{raw_base}/{p.slug}.md",
                "html_url": p.html_url,
                "categories": p.categories,
                "description": p.description,
                "estimated_token_count": page_tokens.get(p.slug, 0),
                "token_estimator": estimator_label,
                "content": p.body,
            }
            f.write(json.dumps(obj, ensure_ascii=False) + "\n")

def write_markdown(out_path: Path, category: str, includes_base: bool,
                   base_categories: List[str], pages: List[AiPage], raw_base: str) -> None:
    """
    Concatenate pages into a single Markdown with clear boundaries.
    (Note: pages already contain headings; we avoid adding extra YAML to keep it simple.)
    """
    out_path.parent.mkdir(parents=True, exist_ok=True)
    lines: List[str] = []
    lines.append(f"# Bundle: {category}")
    if includes_base:
        lines.append(f"> Includes shared base categories: {', '.join(base_categories)}")
    lines.append("")
    for idx, p in enumerate(pages, 1):
        lines.append(f"\n---\n\n# {p.title}\n")
        lines.append(f"> Source (raw): {raw_base}/{p.slug}.md")
        if p.html_url:
            lines.append(f"> Canonical (HTML): {p.html_url}")
        if p.description:
            lines.append(f"> Summary: {p.description}")
        lines.append("")  # spacer
        lines.append(p.body.strip())
        lines.append("")  # spacer
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


# ----------------------------
# Main
# ----------------------------

def build_category_bundles(config_path: str, fmt: str, dry_run: bool, limit: int,
                           token_estimator: str):
    config = load_config(config_path)
    repo_root = Path(__file__).resolve().parent.parent
    ai_dir = resolve_ai_dir(repo_root, config)
    raw_base = build_raw_base(config)

    categories_order, base_cats = categories_from_config(config)
    if not categories_order:
        print("[!] No categories_order configured under content.categories_order.")
        return

    pages = load_all_pages(ai_dir)

    # Optional: limit pages during dry-runs
    if limit > 0:
        pages = pages[:limit]

    # Precompute token counts once per page
    page_tokens: Dict[str, int] = {p.slug: estimate_tokens(p.body, token_estimator) for p in pages}

    out_root = (repo_root / config.get("outputs", {}).get("public_root", "/.ai/").strip("/") / "categories").resolve()

    if dry_run:
        print(f"[dry-run] ai_dir={ai_dir}")
        print(f"[dry-run] total_pages={len(pages)}")
        print(f"[dry-run] categories={categories_order}")
        print(f"[dry-run] base_context={base_cats}")
        print(f"[dry-run] token_estimator={token_estimator}")
        if pages:
            sample = pages[0]
            print(f"[dry-run] sample_page: slug={sample.slug} title={sample.title} cats={sample.categories} est_tokens={page_tokens.get(sample.slug)}")
        print(f"[dry-run] output_dir={out_root}")
        print(f"[dry-run] raw_base={raw_base}")

    # Precompute base context page sets
    base_sets: List[List[AiPage]] = [select_pages_for_category(c, pages) for c in base_cats]
    base_union: List[AiPage] = union_pages(base_sets)

    # Generate bundles
    for cat in categories_order:
        cat_slug = slugify_category(cat)
        is_base = cat in base_cats

        if is_base:
            # Standalone base bundle: just this category's pages
            pages_cat = select_pages_for_category(cat, pages)
            pages_out = sorted(pages_cat, key=lambda p: p.title.lower())

            if dry_run:
                print(f"[dry-run] base bundle: {cat} ({len(pages_out)} pages)")
            else:
                out_root.mkdir(parents=True, exist_ok=True)
                if fmt in ("manifest", "all"):
                    write_manifest(out_root / f"{cat_slug}.manifest.json", cat, cat_slug, False, base_cats, pages_out, raw_base, token_estimator, page_tokens)
                if fmt in ("jsonl", "all"):
                    write_jsonl(out_root / f"{cat_slug}.bundle.jsonl", pages_out, raw_base, token_estimator, page_tokens)
                if fmt in ("md", "all"):
                    write_markdown(out_root / f"{cat_slug}.md", cat, False, base_cats, pages_out, raw_base)
            continue

        # Non-base category: include base union + this category's pages (dedup)
        pages_cat = select_pages_for_category(cat, pages)
        combined = union_pages([base_union, pages_cat])
        pages_out = sorted(combined, key=lambda p: p.title.lower())

        if dry_run:
            print(f"[dry-run] category bundle: {cat} (base+cat={len(pages_out)} pages; base={len(base_union)} cat_only={len(pages_cat)})")
        else:
            out_root.mkdir(parents=True, exist_ok=True)
            if fmt in ("manifest", "all"):
                write_manifest(out_root / f"{cat_slug}.manifest.json", cat, cat_slug, True, base_cats, pages_out, raw_base, token_estimator, page_tokens)
            if fmt in ("jsonl", "all"):
                write_jsonl(out_root / f"{cat_slug}.bundle.jsonl", pages_out, raw_base, token_estimator, page_tokens)
            if fmt in ("md", "all"):
                write_markdown(out_root / f"{cat_slug}.md", cat, True, base_cats, pages_out, raw_base)

    if dry_run:
        print("[dry-run] No files were written.")
    else:
        print(f"✅ Category bundles written to: {out_root}")


def main():
    parser = argparse.ArgumentParser(description="Build category-based bundles from /.ai/pages/*.md")
    parser.add_argument("--config", default="llms_config.json", help="Path to llms_config.json (default: scripts/llms_config.json)")
    parser.add_argument("--format", choices=["manifest", "jsonl", "md", "all"], default="md",
                        help="Output format to generate (default: md)")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be generated; do not write files")
    parser.add_argument("--limit", type=int, default=0, help="Limit pages loaded (0=all) for dry-run sanity")
    parser.add_argument("--token-estimator", default="heuristic-v1",
                        help="Estimator label. 'heuristic-v1' (default) uses a fast regex heuristic; "
                             "'cl100k' uses tiktoken cl100k_base if installed; any other name falls back to heuristic but is labeled as provided.")
    args = parser.parse_args()

    build_category_bundles(
        config_path=args.config,
        fmt=args.format,
        dry_run=args.dry_run,
        limit=args.limit,
        token_estimator=args.token_estimator,
    )

if __name__ == "__main__":
    main()
