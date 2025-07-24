import os
import re
import json
import yaml

# --- Load Config ---
def load_config(config_path: str) -> dict:
    config_path = os.path.join(os.path.dirname(__file__), config_path)
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)

# --- Extract documentation blocks for a specific category ---
def extract_category(category, all_content, base_context_cats, config):
    """
    Returns index lines and content blocks for all pages in the target category,
    plus any shared base context categories (if applicable).
    """
    # Regex to capture doc blocks
    blocks = re.findall(
        r"Doc-Content: (.*?)\n--- BEGIN CONTENT ---\n(.*?)\n--- END CONTENT ---",
        all_content, re.DOTALL
    )

    category_blocks = []
    for url, content in blocks:
        metadata_match = re.search(r"---\n(.*?)\n---", content, re.DOTALL)
        if not metadata_match:
            continue
        metadata = metadata_match.group(1)
        category_line = re.search(r"categories:\s*(.*)", metadata)
        if not category_line:
            continue

        tags = [tag.strip().lower() for tag in category_line.group(1).split(',')]
        if category.lower() in tags or (
            category.lower() not in [c.lower() for c in base_context_cats]
            and any(c.lower() in tags for c in [b.lower() for b in base_context_cats])
        ):
            category_blocks.append((url, content))

    index_lines = []
    for url, content in category_blocks:
        # Extract metadata frontmatter
        metadata_match = re.search(r"---\n(.*?)\n---", content, re.DOTALL)
        title, description = "Untitled", "No description available."
        if metadata_match:
            try:
                metadata_yaml = yaml.safe_load(metadata_match.group(1))
                title = metadata_yaml.get("title", title)
                description = metadata_yaml.get("description", description)
            except yaml.YAMLError:
                pass

        # Build raw GitHub URL for this page
        relative_path = url.replace("https://www.tanssi.network/", "").rstrip("/") + ".md"
        raw_url = f"https://raw.githubusercontent.com/{config['github']['org']}/{config['github']['repo']}/{config['github']['branch']}/{relative_path}"

        # Normalize description and append
        description = description.replace("\n", " ").strip()
        index_lines.append(f"[{title}]({raw_url}): {description}")

    content_blocks = [
        f"Doc-Content: {url}\n--- BEGIN CONTENT ---\n{content.strip()}\n--- END CONTENT ---"
        for url, content in category_blocks
    ]
    return index_lines, content_blocks

# --- Generate one category file ---
def generate_category_file(category, shared_cats, all_content, output_dir, config):
    index_lines, content_blocks = extract_category(category, all_content, shared_cats, config)

    if not content_blocks:
        print(f"[!] Skipping {category} – no matching pages.")
        return

    safe_cat_name = category.lower().replace(" ", "-")
    output_file = os.path.join(output_dir, f"llms-{safe_cat_name}.txt")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(f"# {config['project_name']} Developer Documentation (LLMS Format)\n\n")
        f.write(f"This file contains documentation for {config['project_name']} ({config['project_url']}). {config['summary']}\n")
        f.write("It is intended for use with large language models (LLMs) to support developers working with this product.\n\n")
        f.write(f"## Included Categories\n")
        if category in shared_cats:
            f.write(f"- {category}\n")
        else:
            for shared in shared_cats:
                f.write(f"- {shared} (shared context)\n")
            f.write(f"- {category}\n")

        f.write("\n## List of doc pages:\n")
        f.write("\n".join(index_lines))
        f.write("\n\n## Full content for each doc page\n\n")
        f.write("\n\n".join(content_blocks))

    print(f"[✓] Generated {output_file} with {len(content_blocks)} pages")

def generate_all_categories(config_path="llms_config.json"):
    config = load_config(config_path)
    categories = config["categories_order"]
    shared_cats = config.get("base_context_categories", [])
    docs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    llms_input_path = os.path.join(docs_dir, "llms-full.txt")
    output_dir = os.path.join(docs_dir, "llms-files")
    os.makedirs(output_dir, exist_ok=True)

    with open(llms_input_path, "r", encoding="utf-8") as f:
        all_content = f.read()

    for cat in categories:
        generate_category_file(cat, shared_cats, all_content, output_dir, config)


# --- Main ---
def main():
    # Load config
    config = load_config("llms_config.json")
    categories = config["categories_order"]
    shared_cats = config.get("base_context_categories", [])
    docs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    llms_input_path = os.path.join(docs_dir, "llms-full.txt")
    output_dir = os.path.join(docs_dir, "llms-files")
    os.makedirs(output_dir, exist_ok=True)

    # Read full llms content
    with open(llms_input_path, "r", encoding="utf-8") as f:
        all_content = f.read()

    # Generate files for each category
    for cat in categories:
        generate_category_file(cat, shared_cats, all_content, output_dir, config)

if __name__ == "__main__":
    main()
