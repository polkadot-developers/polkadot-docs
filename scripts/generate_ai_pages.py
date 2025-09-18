# generate_ai_pages.py
# - write resolved per-page Markdown to /.ai/pages/<slug>.md
# - snippets -> variables -> strip HTML comments
# - minimal front-matter: title, description, categories, url
# - Raw URLs will look like:
#   https://raw.githubusercontent.com/<org>/<repo>/<branch>/.ai/pages/<slug>.md

import os
import re
import json
import yaml
import argparse
import textwrap
import requests
from pathlib import Path

# -------------- CLI flags (module-level toggles) --------------
ALLOW_REMOTE = True
DRY_RUN = False

# ----------------------------
# Core loaders
# ----------------------------

def load_config(config_filename: str = "llms_config.json") -> dict:
    """Load llms_config.json from the scripts directory."""
    base_path = Path(__file__).parent  # scripts/
    with open(base_path / config_filename, "r", encoding="utf-8") as f:
        return json.load(f)

def load_yaml(yaml_file: str):
    """Load a YAML file; return {} if missing/empty."""
    if not os.path.exists(yaml_file):
        return {}
    with open(yaml_file, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return data or {}

def load_mkdocs_docs_dir(repo_root: Path) -> Path:
    """Prefer mkdocs.yml 'docs_dir' if present; fallback to config later."""
    mkdocs_path = repo_root / "mkdocs.yml"
    if mkdocs_path.exists():
        mk = load_yaml(str(mkdocs_path))
        dd = mk.get("docs_dir")
        if dd:
            return (repo_root / dd).resolve()
    return None  # caller will fallback

# ----------------------------
# Front-matter helpers
# ----------------------------

FM_PATTERN = re.compile(r"^---\s*\n(.*?)\n---\s*\n?", re.DOTALL)

def split_front_matter(source_text: str):
    """
    Return (front_matter_dict, body_text). If no FM, dict={} and body=source_text.
    """
    m = FM_PATTERN.match(source_text)
    if not m:
        return {}, source_text
    fm_text = m.group(1)
    try:
        fm = yaml.safe_load(fm_text) or {}
    except Exception:
        fm = {}
    body = source_text[m.end():]
    return fm, body

def map_minimal_front_matter(fm: dict) -> dict:
    """
    Emit only the fields we want right now:
      - title (as-is)
      - description (prefer 'description', else fallback to 'summary' if present)
      - categories (as-is)
    """
    out = {}
    if "title" in fm:
        out["title"] = fm["title"]
    # prefer description; fallback to summary if authors used that
    if "description" in fm:
        out["description"] = fm["description"]
    elif "summary" in fm:
        out["description"] = fm["summary"]
    if "categories" in fm:
        out["categories"] = fm["categories"]
    return out

# ----------------------------
# Variables & placeholders
# ----------------------------

def get_value_from_path(data, path):
    """Simple dotted lookup (dicts only, no arrays)."""
    if not path:
        return None
    keys = [k.strip() for k in path.split(".") if k.strip()]
    value = data
    for key in keys:
        if not isinstance(value, dict) or key not in value:
            return None
        value = value[key]
    return value

PLACEHOLDER_PATTERN = re.compile(r"{{\s*([A-Za-z0-9_.-]+)\s*}}")

def resolve_markdown_placeholders(content: str, variables: dict) -> str:
    """Replace {{ dotted.keys }} using variables dict; leave unknowns intact."""
    def replacer(match):
        key_path = match.group(1)
        value = get_value_from_path(variables, key_path)
        return str(value) if value is not None else match.group(0)
    return PLACEHOLDER_PATTERN.sub(replacer, content)

# ----------------------------
# HTML comments
# ----------------------------

def remove_html_comments(content: str) -> str:
    """Remove <!-- ... --> comments (multiline)."""
    return re.sub(r"<!--.*?-->", "", content, flags=re.DOTALL)

# ----------------------------
# Snippet handling
# ----------------------------

SNIPPET_REGEX = r"-{1,}8<-{2,}\s*['\"]([^'\"]+)['\"]"

def parse_line_range(snippet_path):
    parts = snippet_path.split(":")
    file_only = parts[0]
    line_start = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else None
    line_end = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else None
    return file_only, line_start, line_end

def fetch_local_snippet(snippet_ref, snippet_directory, variables):
    file_only, line_start, line_end = parse_line_range(snippet_ref)
    absolute_snippet_path = os.path.join(snippet_directory, file_only)

    if not os.path.exists(absolute_snippet_path):
        return f"<!-- MISSING LOCAL SNIPPET {snippet_ref} -->"

    with open(absolute_snippet_path, "r", encoding="utf-8") as snippet_file:
        snippet_content = snippet_file.read()

    lines = snippet_content.split("\n")
    if line_start is not None and line_end is not None:
        snippet_content = "\n".join(lines[line_start - 1 : line_end])

    # Recursively resolve nested snippets; pass variables through
    return replace_snippet_placeholders(snippet_content, snippet_directory, variables)

def fetch_remote_snippet(snippet_ref):
    if not ALLOW_REMOTE:
        return f"<!-- REMOTE SNIPPET SKIPPED (no-remote): {snippet_ref} -->"
    # Parse {...url...}[:start[:end]] — treat trailing :N[:M] as ranges
    match = re.match(r"^(https?://.+?)(?::(\d+))?(?::(\d+))?$", snippet_ref)
    if not match:
        return f"<!-- INVALID REMOTE SNIPPET {snippet_ref} -->"

    url = match.group(1)
    line_start = int(match.group(2)) if match.group(2) else None
    line_end = int(match.group(3)) if match.group(3) else None

    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        snippet_content = resp.text
        if line_start is not None and line_end is not None:
            lines = snippet_content.split("\n")
            snippet_content = "\n".join(lines[line_start - 1 : line_end])
        return snippet_content.strip()
    except requests.RequestException:
        return f"<!-- ERROR FETCHING REMOTE SNIPPET {snippet_ref} -->"

def replace_snippet_placeholders(markdown, snippet_directory, yaml_data):
    """
    Recursively replace --8<-- snippet placeholders until none remain.
    Also resolves {{placeholders}} in snippet paths before fetching.
    """
    def fetch_and_replace(snippet_ref):
        snippet_ref_resolved = resolve_markdown_placeholders(snippet_ref, yaml_data)
        if snippet_ref_resolved.startswith("http"):
            return fetch_remote_snippet(snippet_ref_resolved)
        else:
            return fetch_local_snippet(snippet_ref_resolved, snippet_directory, yaml_data)

    while re.search(SNIPPET_REGEX, markdown):
        markdown = re.sub(SNIPPET_REGEX, lambda m: fetch_and_replace(m.group(1)), markdown)
    return markdown

# ----------------------------
# File discovery
# ----------------------------

def get_all_markdown_files(directory, skip_basenames, skip_parts):
    """Collect *.md|*.mdx, skipping basenames and paths that contain any skip_parts substring."""
    results = []
    for root, _, files in os.walk(directory):
        if any(x in root for x in skip_parts):
            continue
        for file in files:
            if file.endswith((".md", ".mdx")) and file not in skip_basenames:
                results.append(os.path.join(root, file))
    return sorted(results)

# ----------------------------
# Slug & URL
# ----------------------------

def compute_slug_and_url(rel_path_no_ext: str, docs_base_url: str):
    """
    rel_path_no_ext: docs-relative path without extension, using OS separators.
    - If endswith '/index', drop the trailing 'index' for the URL and slug base.
    - Slug = path segments joined by '-', lowercased.
    - URL = docs_base_url + route + '/'
    """
    # Normalize to forward slashes
    route = rel_path_no_ext.replace(os.sep, "/")
    if route.endswith("/index"):
        route = route[:-len("/index")]
    # slug
    slug = route.replace("/", "-").lower()
    # url (ensure one trailing slash)
    if not route.endswith("/"):
        route = route + "/"
    url = f"{docs_base_url}{route}"
    return slug, url

def build_raw_url(config: dict, slug: str) -> str:
    org = config["repository"]["org"]
    repo = config["repository"]["repo"]
    branch = config["repository"]["default_branch"]
    public_root = config.get("outputs", {}).get("public_root", "/.ai/").strip("/")
    pages_dirname = config.get("outputs", {}).get("files", {}).get("pages_dir", "pages")
    return f"https://raw.githubusercontent.com/{org}/{repo}/{branch}/{public_root}/{pages_dirname}/{slug}"

# ----------------------------
# Writer
# ----------------------------

def write_ai_page(ai_pages_dir: Path, slug: str, header: dict, body: str):
    ai_pages_dir.mkdir(parents=True, exist_ok=True)
    out_path = ai_pages_dir / f"{slug}.md"
    # Only include keys that exist & are non-empty
    fm_obj = {}
    for key in ("title", "description", "categories", "url"):
        val = header.get(key, None)
        if val not in (None, "", []):
            fm_obj[key] = val

    fm_yaml = yaml.safe_dump(fm_obj, sort_keys=False, allow_unicode=True, width=4096).strip()
    content = f"---\n{fm_yaml}\n---\n\n{body.strip()}\n"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content)
    return out_path

# ----------------------------
# Main
# ----------------------------

def main():
    global ALLOW_REMOTE, DRY_RUN

    parser = argparse.ArgumentParser(description="Generate resolved AI pages.")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be created; do not write files.")
    parser.add_argument("--no-remote", action="store_true", help="Skip fetching remote snippets.")
    parser.add_argument("--limit", type=int, default=0, help="Process at most N pages (0 = all).")
    parser.add_argument("--preview-lines", type=int, default=0, help="In dry-run, print first N lines of resolved output.")
    args = parser.parse_args()

    DRY_RUN = args.dry_run
    ALLOW_REMOTE = not args.no_remote

    # Load config
    config = load_config("llms_config.json")
    repo_root = (Path(__file__).parent / "..").resolve()  # repo root
    repo_docs_root = (repo_root / config.get("repository", {}).get("docs_path", ".")).resolve()

    # docs_dir: prefer config.content.docs_dir, else mkdocs.yml, else 'docs'
    cfg_docs_dir = config.get("content", {}).get("docs_dir")
    if cfg_docs_dir:
        # If cfg_docs_dir is absolute, use it; otherwise resolve under repo_docs_root
        cfg_path = Path(cfg_docs_dir)
        docs_dir = (cfg_path if cfg_path.is_absolute() else (repo_docs_root / cfg_docs_dir)).resolve()
    else:
        docs_dir = load_mkdocs_docs_dir(repo_docs_root) or (repo_docs_root / "docs").resolve()

    snippet_dir = docs_dir / ".snippets"
    variables_path = docs_dir / "variables.yml"
    variables = load_yaml(str(variables_path))

    # Config bits
    fm_flag = config.get("content", {}).get("exclusions", {}).get("frontmatter_flag", "ai_exclude")
    skip_basenames = set(config.get("content", {}).get("exclusions", {}).get("skip_basenames", []))
    skip_parts = set(config.get("content", {}).get("exclusions", {}).get("skip_paths", []))
    docs_base_url = config.get("project", {}).get("docs_base_url", "").rstrip("/") + "/"

    # Output path: put under client repo so Raw URLs show client org
    public_root = config.get("outputs", {}).get("public_root", "/.ai/").strip("/")
    pages_dirname = config.get("outputs", {}).get("files", {}).get("pages_dir", "pages")
    ai_pages_dir = (repo_root / public_root / pages_dirname).resolve()

    # Collect files
    files = get_all_markdown_files(str(docs_dir), skip_basenames, skip_parts)

    processed = 0
    skipped = 0

    if DRY_RUN:
        print(f"[dry-run] docs_dir={docs_dir}")
        print(f"[dry-run] snippet_dir={snippet_dir}")
        print(f"[dry-run] output_dir={ai_pages_dir}")
        print(f"[dry-run] remote_snippets={'ENABLED' if ALLOW_REMOTE else 'DISABLED'}")
        print(f"[dry-run] total candidates={len(files)}\n")

    for file_path in files:
        if args.limit and processed >= args.limit:
            break

        rel = os.path.relpath(file_path, str(docs_dir))
        # Skip explicit .snippets paths if they slipped through
        if ".snippets" in rel.split(os.sep):
            skipped += 1
            continue

        with open(file_path, "r", encoding="utf-8") as f:
            raw = f.read()

        # Split FM and body
        fm, body = split_front_matter(raw)

        # Resolve snippets -> variables -> strip comments
        body = replace_snippet_placeholders(body, str(snippet_dir), variables)
        body = resolve_markdown_placeholders(body, variables)
        body = remove_html_comments(body)

        # Compute slug + canonical URL to the docs HTML
        rel_no_ext = os.path.splitext(rel)[0]
        slug, url = compute_slug_and_url(rel_no_ext, docs_base_url)

        # Minimal header based on current authoring fields
        header = map_minimal_front_matter(fm)
        header["url"] = url  # always include

        # Write .ai page
        out_path = write_ai_page(ai_pages_dir, slug, header, body)
        processed += 1

        if DRY_RUN:
            raw_url = build_raw_url(config, slug)
            print(f"CREATE: {rel}")
            print(f"  slug: {slug}")
            print(f"  out:  {out_path}")
            print(f"  url:  {url}")
            print(f"  raw:  {raw_url}")
            if header:
                print(f"  fm:   { {k: header[k] for k in ('title','description','categories') if k in header} }")
            # quick counts
            snip_ct = len(re.findall(SNIPPET_REGEX, body))
            var_ct = len(PLACEHOLDER_PATTERN.findall(body))
            print(f"  counts: snippets={snip_ct} vars={var_ct} chars_out={len(body)}")
            if args.preview_lines:
                preview = "\n".join(body.splitlines()[: args.preview_lines])
                print(textwrap.indent(preview, "    | "))
            print()

    print(f"[ai-pages] processed={processed} skipped={skipped}")
    if DRY_RUN:
        print("[dry-run] No files were written.")
    print(f"[ai-pages] output dir: {ai_pages_dir}")

if __name__ == "__main__":
    main()
