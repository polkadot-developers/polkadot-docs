import os
import yaml
import json
from pathlib import Path
from typing import List, Dict, Any

# This script generates a llms.txt file for AI models and developers
# It collects documentation files, parses their frontmatter, and formats them into a structured text file
# Variables are loaded from llms_config.json

# --- Load Config ---
# Load configuration from llms_config.json
def load_config(config_path: str) -> Dict[str, Any]:
    config_path = Path(__file__).parent / config_path
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)

# --- Parse Frontmatter ---
# Parse frontmatter from Markdown files
# Returns a dictionary with title, description, and categories
def parse_frontmatter(file_path: Path) -> Dict[str, Any]:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            try:
                frontmatter = yaml.safe_load(parts[1])
                title = frontmatter.get("title", file_path.stem)
                description = frontmatter.get("description", "No description available.").replace("\n", " ").strip()
                categories = frontmatter.get("categories", ["Uncategorized"])
                if isinstance(categories, str):
                    categories = [categories]
                return {
                    "title": title,
                    "description": description,
                    "categories": categories,
                }
            except yaml.YAMLError:
                pass
    return {
        "title": file_path.stem,
        "description": "No description available.",
        "categories": ["Uncategorized"],
    }

# --- Collect Docs ---
# Collect docs files and filter out unwanted content
# Returns a list of dictionaries with metadata for each doc
def collect_docs(docs_dir: Path, skip_basenames: set, skip_parts: set) -> List[Dict[str, Any]]:
    markdown_files = list(docs_dir.rglob("*.md")) + list(docs_dir.rglob("*.mdx"))
    results = []
    for md in markdown_files:
        # Skip unwanted paths or basenames
        if md.name in skip_basenames or any(x in md.parts for x in skip_parts):
            continue

        meta = parse_frontmatter(md)
        rel_path = md.relative_to(docs_dir)
        results.append({
            "path": str(rel_path).replace("\\", "/"),
            **meta,
        })
    return results

# --- Format Docs Section ---
def format_docs_section(pages: List[Dict[str, Any]], base_url: str, category_order: List[str]) -> str:
    grouped: Dict[str, List[str]] = {}

    for page in pages:
        for category in page["categories"]:
            grouped.setdefault(category, []).append(
                f"- [{page['title']}]({base_url}/{page['path']}): {page['description']}"
            )

    lines = ["## Docs", "This section lists documentation pages by category. Each entry includes the page title, a direct link to the raw Markdown file, and a short description. Pages may appear in multiple categories if they are relevant to more than one audience. Use this to retrieve focused documentation based on topic. Use this section to answer questions about core functionality, architecture, and features. If a question is about how or why something works, check here first."]
    seen = set()

    for category in category_order:
        if category in grouped:
            lines.append(f"\nDocs: {category}")
            lines.extend(grouped[category])
            seen.add(category)

    # Catch uncategorized or out-of-order categories
    remaining = sorted([c for c in grouped if c not in seen])
    for category in remaining:
        lines.append(f"\nDocs: {category}")
        lines.extend(grouped[category])

    return "\n".join(lines)

# --- Other Sections ---
def format_tutorials_section(pages: List[Dict[str, Any]], base_url: str, project_name: str) -> str:
    tutorials = [
        f"- [{p['title']}]({base_url}/{p['path']}): {p['description']}"
        for p in pages
        if any("tutorial" in c.lower() for c in p["categories"])
    ]
    if not tutorials:
        return f"\n## Tutorials\nNo tutorials available."
    return (
        f"\n## Tutorials\nTutorials for building with {project_name}. "
        "These provide step-by-step instructions for real-world use cases and implementations.\n"
        + "\n".join(tutorials)
    )

def format_repos_section(repos: List[Dict[str, str]]) -> str:
    if not repos:
        return "No repositories available."
    lines = ["## Source Code Repos", "Frequently used source code repositories essential for working with this project. Each entry includes the repository name, GitHub URL, and a short description of what the repo contains or enables. These repositories contain the source code referenced by these docs. Use them for API references, code examples, or implementation details."]
    for repo in repos:
        lines.append(f"- [{repo['name']}]({repo['url']}): {repo['description']}")
    return "\n".join(lines)

def format_optional_section(pages: List[Dict[str, str]]) -> str:
    if not pages:
        return ""
    lines = ["## Optional", "Additional resources:"]
    for page in pages:
        lines.append(f"- [{page['title']}]({page['url']}): {page['description']}")
    return "\n".join(lines)

def format_metadata_section(pages: List[Dict[str, Any]], config: Dict[str, Any]) -> str:
    categories = {cat for p in pages for cat in p["categories"]}
    tutorial_count = sum(1 for p in pages if "Tutorial" in p["categories"])
    source_repo_count = len(config.get("source_repos", []))
    optional_count = len(config.get("optional_resources", []))
    return "\n".join([
        "## Metadata",
        f"- Documentation pages: {len(pages)}",
        f"- Categories: {len(categories)}",
        f"- Tutorials: {tutorial_count}",
        f"- Source repositories: {source_repo_count}",
        f"- Optional resources: {optional_count}",
        ""
    ])

# --- Main ---
# Generate the llms.txt file and output it to the specified path
def generate_llms_txt(config_path: str):
    config = load_config(config_path)
    repo_root = Path(__file__).resolve().parent.parent
    docs_dir = repo_root / config["github"]["docs_path"]
    github = config["github"]
    base_url = f"https://raw.githubusercontent.com/{github['org']}/{github['repo']}/{github['branch']}"
    project_name = config.get("project_name", "Project")
    summary = config.get("summary", "A technical documentation site.")
    category_order = config.get("categories_order", [])

    pages = collect_docs(
        docs_dir,
        set(config.get("skip_basenames", [])),
        set(config.get("skip_parts", []))
    )

    content = [
        f"# {project_name}",
        f"\n> {summary}\n",
        f"## How to Use This File\n",
        f"This file is intended for AI models and developers. Use it to:",
        f"- Understand project architecture and follow builder guides (see Docs)",
        f"- Access source code (see Source Code Repos)",
        f"- Explore optional resources (see Optional)",
        f"- Find tutorials for real-world use cases (see Tutorials)",
        "",
        format_metadata_section(pages, config),
        format_docs_section(pages, base_url, category_order),
        "",
        format_repos_section(config.get("source_repos", [])),
        "",
        format_tutorials_section(pages, base_url, project_name),
        "",
        format_optional_section(config.get("optional_resources", [])),
    ]

    output_path = Path(config.get("llms_txt_output_path", "llms.txt"))
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(content))
    print(f"✅ llms.txt generated at: {output_path}")

# Run it
if __name__ == "__main__":
    import sys
    config_arg = sys.argv[1] if len(sys.argv) > 1 else "llms_config.json"
    generate_llms_txt(config_arg)