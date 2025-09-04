#!/usr/bin/env python3
"""
generate_site_index.py

Builds compact site catalogs from reconstituted Markdown artifacts under /.ai/pages/*.md.

Default outputs (always written):
  - /.ai/site-index.json      (array: one object per page with outline/preview/stats)
  - /.ai/llms-full.jsonl      (JSON Lines: one object per H2/H3 section)

llms-full.jsonl line schema (per section):
  {
    "page_id": "<slug>",
    "page_title": "<page title from frontmatter>",
    "index": <0-based section index on the page>,
    "depth": 2|3,
    "title": "<heading text>",
    "anchor": "<heading anchor slug>",
    "start_char": <char offset in page body>,
    "end_char": <char offset in page body>,
    "estimated_token_count": <int>,
    "token_estimator": "heuristic-v1|cl100k|<custom label>",
    "text": "<raw markdown for the section (trimmed)>"
  }

Usage:
  python3 scripts/generate_site_index.py
  python3 scripts/generate_site_index.py --dry-run --limit 5 --token-estimator cl100k
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple

import yaml


# ----------------------------
# Config loading
# ----------------------------

def load_config(config_path: str) -> Dict[str, Any]:
    cfg_path = Path(config_path)
    if not cfg_path.is_absolute():
        cfg_path = Path(__file__).parent / config_path
    with open(cfg_path, "r", encoding="utf-8") as f:
        return json.load(f)

def normalize_branch(name: str) -> str:
    return name.replace("refs/heads/", "", 1) if name.startswith("refs/heads/") else name


# ----------------------------
# Front matter & page loading
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

    # title
    title = fm.get("title") or md_path.stem

    # description (prefer description, fallback summary)
    desc_val = fm.get("description") or fm.get("summary") or ""
    if isinstance(desc_val, str):
        description = " ".join(desc_val.splitlines()).strip()
    else:
        description = str(desc_val).strip() if desc_val is not None else ""
    if not description:
        description = "No description available."

    # categories: allow list or comma-separated string
    cats = fm.get("categories")
    if isinstance(cats, list):
        categories = [str(c).strip() for c in cats if str(c).strip()]
    elif isinstance(cats, str):
        s = cats.strip()
        if s.startswith("[") and s.endswith("]"):
            try:
                parsed = yaml.safe_load(s)
                if isinstance(parsed, list):
                    categories = [str(c).strip() for c in parsed if str(c).strip()]
                else:
                    categories = [s]
            except Exception:
                categories = [x.strip() for x in s.strip("[]").split(",") if x.strip()]
        else:
            categories = [x.strip() for x in s.split(",") if x.strip()] or [s]
    else:
        categories = ["Uncategorized"]

    html_url = fm.get("url")
    return AiPage(path=md_path, slug=md_path.stem, title=title, description=description,
                  categories=categories, html_url=html_url, body=body)


# ----------------------------
# Markdown parsing helpers
# ----------------------------

HEADING_RE = re.compile(r"^(#{2,6})\s+(.+?)\s*#*\s*$")  # ## .. ######

def slugify_anchor(text: str, seen: Dict[str, int]) -> str:
    t = text.strip().lower()
    t = re.sub(r"`+", "", t)
    t = re.sub(r"[^\w\s\-]", "", t, flags=re.UNICODE)
    t = re.sub(r"\s+", "-", t)
    t = re.sub(r"-{2,}", "-", t).strip("-")
    if not t:
        t = "section"
    if t in seen:
        seen[t] += 1
        t = f"{t}-{seen[t]}"
    else:
        seen[t] = 1
    return t

def extract_outline_and_sections(body: str, max_depth: int = 3) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Returns (outline, sections):
      outline: list of {depth, title, anchor}
      sections: list of {index, depth, title, anchor, start_char, end_char, text}
    Only indexes headings outside fenced code. Sections are H2/H3 (<= max_depth).
    """
    lines = body.splitlines(keepends=True)
    in_code = False
    fence = None

    # precompute char offsets per line start
    starts = [0]
    for ln in lines[:-1]:
        starts.append(starts[-1] + len(ln))

    outline: List[Dict[str, Any]] = []
    sections_meta: List[Tuple[int, int, str, str]] = []  # (depth, line_index, title, anchor)
    anchors_seen: Dict[str, int] = {}

    for i, ln in enumerate(lines):
        # code fence toggles
        m_fence = re.match(r"^(\s*)(`{3,}|~{3,})", ln)
        if m_fence:
            token = m_fence.group(2)
            if not in_code:
                in_code, fence = True, token
            elif token == fence:
                in_code, fence = False, None
            continue

        if in_code:
            continue

        m = HEADING_RE.match(ln)
        if not m:
            continue
        hashes, text = m.group(1), m.group(2).strip()
        depth = len(hashes)
        if depth < 2 or depth > max_depth:
            continue

        anchor = slugify_anchor(text, anchors_seen)
        outline.append({"depth": depth, "title": text, "anchor": anchor})
        sections_meta.append((depth, i, text, anchor))

    # Build sections
    sections: List[Dict[str, Any]] = []
    for idx, (depth, line_idx, title, anchor) in enumerate(sections_meta):
        start_char = starts[line_idx]
        next_start_char = len(body)
        if idx + 1 < len(sections_meta):
            next_start_char = starts[sections_meta[idx + 1][1]]
        text = body[start_char:next_start_char].strip()
        sections.append({
            "index": idx,
            "depth": depth,
            "title": title,
            "anchor": anchor,
            "start_char": start_char,
            "end_char": next_start_char,
            "text": text
        })

    return outline, sections

def extract_preview(body: str, max_chars: int = 500) -> str:
    lines = body.splitlines()
    in_code = False
    fence = None
    para: List[str] = []

    def bad_start(s: str) -> bool:
        s = s.lstrip()
        return (
            not s
            or s.startswith("#")
            or s.startswith(">")
            or s.startswith("- ")
            or s.startswith("* ")
            or re.match(r"^\d+\.\s", s) is not None
        )

    def finish(p: List[str]) -> str:
        text = " ".join(" ".join(p).split())
        return text[:max_chars].rstrip()

    for ln in lines:
        if re.match(r"^(\s*)(`{3,}|~{3,})", ln):
            in_code = not in_code
            fence = None if not in_code else "fenced"
            if para:
                break
            continue

        if in_code:
            continue

        if ln.strip() == "":
            if para:
                break
            else:
                continue

        if not para and bad_start(ln):
            continue

        para.append(ln)

    return finish(para) if para else ""


# ----------------------------
# Hash, counts, tokens
# ----------------------------

def sha256_text(s: str) -> str:
    import hashlib as _hashlib
    return "sha256:" + _hashlib.sha256(s.encode("utf-8")).hexdigest()

def word_count(s: str) -> int:
    return len(re.findall(r"\b\w+\b", s, flags=re.UNICODE))

def _heuristic_token_count(s: str) -> int:
    return len(re.findall(r"\w+|[^\s\w]", s, flags=re.UNICODE))

def _cl100k_token_count(s: str) -> int:
    try:
        import tiktoken  # type: ignore
        enc = tiktoken.get_encoding("cl100k_base")
        return len(enc.encode(s))
    except Exception:
        return _heuristic_token_count(s)

def estimate_tokens(text: str, estimator: str = "heuristic-v1") -> int:
    if estimator == "cl100k":
        return _cl100k_token_count(text)
    return _heuristic_token_count(text)


# ----------------------------
# Paths
# ----------------------------

def resolve_ai_dir(repo_root: Path, config: Dict[str, Any]) -> Path:
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


# ----------------------------
# Main build
# ----------------------------

def build_site_index(config_path: str, dry_run: bool = False, limit: int = 0,
                     preview_chars: int = 500, max_depth: int = 3,
                     token_estimator: str = "heuristic-v1"):
    config = load_config(config_path)
    repo_root = Path(__file__).resolve().parent.parent

    ai_dir = resolve_ai_dir(repo_root, config)
    raw_base = build_raw_base(config)
    pages_files = sorted(ai_dir.glob("*.md"))
    if limit > 0:
        pages_files = pages_files[:limit]

    site_index: List[Dict[str, Any]] = []
    jsonl_lines: List[str] = []

    for md_path in pages_files:
        page = read_ai_page(md_path)
        outline, sections = extract_outline_and_sections(page.body, max_depth=max_depth)
        preview = extract_preview(page.body, max_chars=preview_chars) or page.description

        # per-section JSONL with token estimates
        total_tokens = 0
        for sec in sections:
            est = estimate_tokens(sec["text"], token_estimator)
            total_tokens += est
            jsonl_lines.append(json.dumps({
                "page_id": page.slug,
                "page_title": page.title,          # << added page-level metadata
                "index": sec["index"],
                "depth": sec["depth"],
                "title": sec["title"],
                "anchor": sec["anchor"],
                "start_char": sec["start_char"],
                "end_char": sec["end_char"],
                "estimated_token_count": est,
                "token_estimator": token_estimator,
                "text": sec["text"],
            }, ensure_ascii=False))

        # compact per-page index
        body_chars = len(page.body)
        stats = {
            "chars": body_chars,
            "words": word_count(page.body),
            "headings": len(outline),
            "estimated_token_count_total": total_tokens,
        }
        file_mtime = datetime.fromtimestamp(md_path.stat().st_mtime, tz=timezone.utc).isoformat(timespec="seconds")
        site_index.append({
            "id": page.slug,
            "title": page.title,
            "slug": page.slug,
            "categories": page.categories,
            "raw_md_url": f"{raw_base}/{page.slug}.md",
            "html_url": page.html_url,
            "preview": preview,
            "outline": outline,
            "stats": stats,
            "hash": sha256_text(page.body),
            "last_modified": file_mtime,
            "token_estimator": token_estimator,
        })

    # Output paths
    public_root = config.get("outputs", {}).get("public_root", "/.ai/").strip("/")
    index_out = (repo_root / public_root / "site-index.json").resolve()
    jsonl_out = (repo_root / public_root / "llms-full.jsonl").resolve()

    if dry_run:
        print(f"[dry-run] ai_dir={ai_dir}")
        print(f"[dry-run] pages={len(pages_files)}  (limit={limit or 'all'})")
        if site_index:
            sample = site_index[0].copy()
            sample["preview"] = sample["preview"][:120] + ("…" if len(sample["preview"]) > 120 else "")
            print("[dry-run] sample site-index record:")
            print(json.dumps(sample, indent=2, ensure_ascii=False))
        if jsonl_lines:
            print(f"[dry-run] sample llms-full.jsonl line:\n{jsonl_lines[0][:300]}{'…' if len(jsonl_lines[0])>300 else ''}")
        print(f"[dry-run] would write: {index_out}")
        print(f"[dry-run] would write: {jsonl_out}  (lines={len(jsonl_lines)})")
        return

    # Write files
    index_out.parent.mkdir(parents=True, exist_ok=True)
    with open(index_out, "w", encoding="utf-8") as f:
        json.dump(site_index, f, indent=2, ensure_ascii=False)

    jsonl_out.parent.mkdir(parents=True, exist_ok=True)
    with open(jsonl_out, "w", encoding="utf-8") as f:
        for line in jsonl_lines:
            f.write(line + "\n")

    print(f"✅ site-index.json written: {index_out}  (pages={len(site_index)})")
    print(f"✅ llms-full.jsonl written: {jsonl_out}  (lines={len(jsonl_lines)})")


# ----------------------------
# CLI
# ----------------------------

def main():
    parser = argparse.ArgumentParser(description="Generate site catalogs from /.ai/pages/*.md")
    parser.add_argument("--config", default="llms_config.json", help="Path to llms_config.json (default: scripts/llms_config.json)")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be generated; do not write files")
    parser.add_argument("--limit", type=int, default=0, help="Process at most N pages (0=all)")
    parser.add_argument("--preview-chars", type=int, default=500, help="Max characters for the preview field")
    parser.add_argument("--max-depth", type=int, default=3, help="Max heading depth to index (2..6)")
    parser.add_argument("--token-estimator", default="heuristic-v1",
                        help="Estimator for token counts (heuristic-v1|cl100k|<custom label>)")
    args = parser.parse_args()

    build_site_index(
        config_path=args.config,
        dry_run=args.dry_run,
        limit=args.limit,
        preview_chars=args.preview_chars,
        max_depth=args.max_depth,
        token_estimator=args.token_estimator,
    )

if __name__ == "__main__":
    main()
