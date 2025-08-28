import os
import re
import json
import yaml
import requests
from pathlib import Path

# --- Load Config ---
def load_config(config_path: str) -> dict:
    base_path = Path(__file__).parent  # directory where this script lives
    with open(base_path / config_path, "r", encoding="utf-8") as f:
        return json.load(f)

# --- Load YAML ---
def load_yaml(yaml_file: str):
    with open(yaml_file, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

# --- Utility: Nested value lookup ---
def get_value_from_path(data, path):
    keys = path.split('.')
    value = data
    for key in keys:
        if not isinstance(value, dict) or key not in value:
            return None
        value = value[key]
    return value

# --- Replace {{ placeholders }} from variables.yml ---
def resolve_markdown_placeholders(content: str, variables: dict) -> str:
    def replacer(match):
        key_path = match.group(1).strip()
        value = get_value_from_path(variables, key_path)
        return str(value) if value is not None else match.group(0)
    return re.sub(r"{{(.*?)}}", replacer, content)
# Remove HTML comments so they don't appear in the output
def remove_html_comments(content: str) -> str:
    """
    Remove HTML-style comments like <!-- ... --> from markdown content.
    Supports multiline comments.
    """
    return re.sub(r"<!--.*?-->", "", content, flags=re.DOTALL)

# --- Snippet handling (cleaned) ---
SNIPPET_REGEX = r"-?8<--\s*['\"]([^'\"]+)['\"]"

def parse_line_range(snippet_path):
    parts = snippet_path.split(':')
    file_only = parts[0]
    line_start = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else None
    line_end = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else None
    return file_only, line_start, line_end

def fetch_local_snippet(snippet_ref, snippet_directory):
    file_only, line_start, line_end = parse_line_range(snippet_ref)
    absolute_snippet_path = os.path.join(snippet_directory, file_only)

    if not os.path.exists(absolute_snippet_path):
        return f"<!-- MISSING LOCAL SNIPPET {snippet_ref} -->"

    with open(absolute_snippet_path, 'r', encoding='utf-8') as snippet_file:
        snippet_content = snippet_file.read()

    lines = snippet_content.split('\n')
    if line_start is not None and line_end is not None:
        if line_start == line_end:
            snippet_content = lines[line_start - 1: line_end]
        snippet_content = '\n'.join(lines[line_start - 1: line_end])

    # Recursively resolve nested snippets
    return replace_snippet_placeholders(snippet_content, snippet_directory, {})

def fetch_remote_snippet(snippet_ref):
    match = re.match(r'^(https?://[^:]+)(?::(\d+))?(?::(\d+))?$', snippet_ref)
    if not match:
        return f"<!-- INVALID REMOTE SNIPPET {snippet_ref} -->"

    url = match.group(1)
    line_start = int(match.group(2)) if match.group(2) else None
    line_end = int(match.group(3)) if match.group(3) else None

    try:
        response = requests.get(url)
        response.raise_for_status()
        snippet_content = response.text
        if line_start and line_end:
            lines = snippet_content.split('\n')
            snippet_content = '\n'.join(lines[line_start - 1: line_end])
        return snippet_content.strip()
    except requests.RequestException as e:
        return f"<!-- ERROR FETCHING REMOTE SNIPPET {snippet_ref} -->"

def replace_snippet_placeholders(markdown, snippet_directory, yaml_data):
    """
    Recursively replace --8<-- snippet placeholders until none remain.
    Handles nested snippet references and multiple snippet blocks.
    Also resolves {{placeholders}} in snippet paths before fetching.
    """
    def fetch_and_replace(snippet_ref):
        snippet_ref_resolved = resolve_markdown_placeholders(snippet_ref, yaml_data)
        if snippet_ref_resolved.startswith("http"):
            return fetch_remote_snippet(snippet_ref_resolved)
        else:
            return fetch_local_snippet(snippet_ref_resolved, snippet_directory)

    while re.search(SNIPPET_REGEX, markdown):
        markdown = re.sub(SNIPPET_REGEX, lambda match: fetch_and_replace(match.group(1)), markdown)
    return markdown

# --- Collect markdown files ---
def get_all_markdown_files(directory, skip_basenames, skip_parts):
    results = []
    for root, _, files in os.walk(directory):
        if any(x in root for x in skip_parts):
            continue
        for file in files:
            if file.endswith(('.md', '.mdx')) and file not in skip_basenames:
                results.append(os.path.join(root, file))
    return sorted(results)

# --- Build index ---
def build_index_section(files, raw_base_url, docs_dir):
    section = "## List of doc pages:\n"
    for file in files:
        relative_path = os.path.relpath(file, docs_dir)
        if '.snippets' in relative_path.split(os.sep):
            continue
        raw_url = f"{raw_base_url}/{relative_path.replace(os.sep, '/')}"
        section += f"Doc-Page: {raw_url}\n"
    return section

# --- Build full content ---
def build_content_section(files, docs_url, docs_dir, snippet_dir, variables):
    section = "\n## Full content for each doc page\n\n"
    for file in files:
        relative_path = os.path.relpath(file, docs_dir)
        if '.snippets' in relative_path.split(os.sep):
            continue

        doc_url_path = re.sub(r'\.(md|mdx)$', '', relative_path)
        doc_url = f"{docs_url}/{doc_url_path}".rstrip('/index')

        with open(file, 'r', encoding='utf-8') as file_content:
            content = file_content.read()

        content = replace_snippet_placeholders(content, snippet_dir, variables)
        content = resolve_markdown_placeholders(content, variables)
        content = remove_html_comments(content)
        section += f"Doc-Content: {doc_url}/\n"
        section += "--- BEGIN CONTENT ---\n"
        section += content.strip()
        section += "\n--- END CONTENT ---\n\n"
    return section

# --- Main ---
def generate_standard_llms():
    config = load_config("llms_config.json")
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    docs_dir = os.path.join(repo_root, config["github"]["docs_path"])
    snippet_dir = os.path.join(docs_dir, ".snippets")
    yaml_file = os.path.join(docs_dir, "variables.yml")
    variables = load_yaml(yaml_file)

    raw_base_url = f"https://raw.githubusercontent.com/{config['github']['org']}/{config['github']['repo']}/{config['github']['branch']}"
    docs_url = config.get("project_url", "")
    skip_basenames = set(config.get("skip_basenames", []))
    skip_parts = set(config.get("skip_parts", []))

    files = get_all_markdown_files(docs_dir, skip_basenames, skip_parts)

    llms_content = f"# {config['project_name']} llms-full.txt\n"
    llms_content += f"{config['project_name']}. {config['summary']}\n\n"
    llms_content += "## Generated automatically. Do not edit directly.\n\n"
    llms_content += f"Documentation: {docs_url}\n\n"

    llms_content += build_index_section(files, raw_base_url, docs_dir)
    llms_content += build_content_section(files, docs_url, docs_dir, snippet_dir, variables)

    output_file = os.path.join(docs_dir, "llms-full.txt")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(llms_content)

    print(f"llms-full.txt created or updated at: {output_file}")

if __name__ == "__main__":
    generate_standard_llms()