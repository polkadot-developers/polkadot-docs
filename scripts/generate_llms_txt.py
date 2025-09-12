"""
generate_llms_txt.py

Generates an llms.txt that links to the reconstituted Markdown artifacts under
/.ai/pages/*.md (or whatever path you set in llms_config.json -> repository.ai_artifacts_path).

Assumes you've already run your ai-page exporter to create those files.
"""

import sys
import yaml
import json
from pathlib import Path
from typing import List, Dict, Any

# --------------------------
# Config loading
# --------------------------

def load_config(config_path: str) -> Dict[str, Any]:
    """
    Load llms_config.json. If config_path isn't absolute, resolve it relative to this script's dir.
    """
    cfg_path = Path(config_path)
    if not cfg_path.is_absolute():
        cfg_path = Path(__file__).parent / config_path
    with open(cfg_path, "r", encoding="utf-8") as f:
        return json.load(f)

def normalize_branch(name: str) -> str:
    """Strip 'refs/heads/' prefix if present."""
    return name.replace("refs/heads/", "", 1) if name.startswith("refs/heads/") else name

# --------------------------
# Frontmatter parsing
# --------------------------

def parse_frontmatter(file_path: Path) -> Dict[str, Any]:
    """
    Parse YAML frontmatter from an .md artifact.
    Robust to:
      - categories as YAML list
      - categories as comma-separated string
      - categories as bracketed string "[A, B]"
    Falls back safely when FM is missing/invalid.
    """
    try:
        text = file_path.read_text(encoding="utf-8")
    except Exception:
        return {"title": file_path.stem, "description": "No description available.",
                "categories": ["Uncategorized"], "url": None}

    title = file_path.stem
    description = "No description available."
    categories = ["Uncategorized"]
    url = None

    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            fm_text = parts[1]
            try:
                fm = yaml.safe_load(fm_text) or {}
                # title
                title = fm.get("title", title)
                # description (prefer 'description', fallback 'summary')
                desc = fm.get("description") or fm.get("summary")
                if isinstance(desc, str) and desc.strip():
                    description = " ".join(desc.splitlines()).strip()
                # categories normalization
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
                # url
                if isinstance(fm.get("url"), str):
                    url = fm["url"].strip()
            except yaml.YAMLError:
                # leave defaults; FM was malformed
                pass

    return {"title": title, "description": description, "categories": categories, "url": url}


# --------------------------
# AI pages collection
# --------------------------

def collect_ai_pages(ai_dir: Path) -> List[Dict[str, Any]]:
    """
    Read /.ai/pages/*.md and extract (slug, title, description, categories, docs_url).
    """
    if not ai_dir.exists():
        raise FileNotFoundError(f"AI artifacts directory not found: {ai_dir}")

    pages: List[Dict[str, Any]] = []
    for md in sorted(ai_dir.glob("*.md")):
        fm = parse_frontmatter(md)
        slug = md.stem  # e.g., 'develop-networks'
        pages.append({
            "slug": slug,
            "title": fm["title"],
            "description": fm["description"],
            "categories": fm["categories"],
            "docs_url": fm["url"],
        })
    return pages

# --------------------------
# Sections
# --------------------------

def format_docs_section(pages: List[Dict[str, Any]], raw_base: str, category_order: List[str]) -> str:
    grouped: Dict[str, List[str]] = {}
    for p in pages:
        raw_url = f"{raw_base}/{p['slug']}.md"
        for cat in p["categories"]:
            grouped.setdefault(cat, []).append(f"- [{p['title']}]({raw_url}): {p['description']}")

    lines = [
        "## Docs",
        ("This section lists documentation pages by category. Each entry links to a raw markdown version of the page and includes a short description. A page may appear in multiple categories.")
    ]
    seen = set()

    # Preferred order first
    for cat in category_order:
        if cat in grouped:
            lines.append(f"\nDocs: {cat}")
            lines.extend(grouped[cat])
            seen.add(cat)

    # Then any remaining categories (sorted)
    remaining = sorted([c for c in grouped if c not in seen])
    for cat in remaining:
        lines.append(f"\nDocs: {cat}")
        lines.extend(grouped[cat])

    return "\n".join(lines)

def format_tutorials_section(pages: List[Dict[str, Any]], raw_base: str, project_name: str) -> str:
    tutorials = [
        f"- [{p['title']}]({raw_base}/{p['slug']}.md): {p['description']}"
        for p in pages
        if any("tutorial" in c.lower() for c in p["categories"])
    ]
    if not tutorials:
        return "\n## Tutorials\nNo tutorials available."
    return (
        f"\n## Tutorials\nTutorials for building with {project_name}. "
        "These provide step-by-step instructions for real-world use cases and implementations.\n"
        + "\n".join(tutorials)
    )

def format_metadata_section(pages: List[Dict[str, Any]]) -> str:
    categories = {cat for p in pages for cat in p["categories"]}
    tutorial_count = sum(1 for p in pages if any("tutorial" in c.lower() for c in p["categories"]))
    return "\n".join([
        "## Metadata",
        f"- Documentation pages: {len(pages)}",
        f"- Categories: {len(categories)}",
        f"- Tutorials: {tutorial_count}",
        ""
    ])

# --------------------------
# Main
# --------------------------

def generate_llms_txt(config_path: str = "llms_config.json"):
    config = load_config(config_path)
    repo_root = Path(__file__).resolve().parent.parent  # repo root

    # Config pieces (v1.0 schema)
    project = config.get("project", {})
    repository = config.get("repository", {})
    content_cfg = config.get("content", {})

    org = repository["org"]
    repo_name = repository["repo"]
    branch = normalize_branch(repository["default_branch"])

    # Where AI artifacts are stored in the repo (e.g., ".ai/pages")
    ai_artifacts_path = repository.get("ai_artifacts_path", ".ai/pages").lstrip("/")
    ai_dir = (repo_root / ai_artifacts_path).resolve()

    # Raw base URL to the artifacts folder
    raw_base = f"https://raw.githubusercontent.com/{org}/{repo_name}/{branch}/{ai_artifacts_path}"

    # Collect pages from /.ai/pages/*.md
    pages = collect_ai_pages(ai_dir)

    project_name = project.get("name", "Project")
    summary_line = project.get("docs_base_url", "").strip()
    category_order = content_cfg.get("categories_order", [])

    # Build the llms.txt content
    content_lines = [
        f"# {project_name}",
        f"\n> {summary_line}\n" if summary_line else "",
        "## How to Use This File",
        ("This directory lists URLs for raw Markdown pages that complement the rendered pages on the documentation site. Use these Markdown files to retain semantic context when prompting models while avoiding passing HTML elements."),
        "",
        format_metadata_section(pages),
        format_docs_section(pages, raw_base, category_order),
        "",
        format_tutorials_section(pages, raw_base, project_name),
        ""
    ]

    # Output path (relative to repo root unless absolute)
    out_rel = config.get("llms_txt_output_path", "llms.txt")
    out_path = (repo_root / out_rel) if not Path(out_rel).is_absolute() else Path(out_rel)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join([line for line in content_lines if line is not None]), encoding="utf-8")

    print(f"✅ llms.txt generated at: {out_path}")
    print(f"   Pages listed: {len(pages)}")

# --------------------------
# Entrypoint
# --------------------------

if __name__ == "__main__":
    cfg_arg = sys.argv[1] if len(sys.argv) > 1 else "llms_config.json"
    generate_llms_txt(cfg_arg)
