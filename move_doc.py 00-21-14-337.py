import shutil
from pathlib import Path
import sys
import re
import json

# Root directories
ROOT_DIR = Path(".")
DOCS_DIR = ROOT_DIR
SNIPPETS_CODE_DIR = ROOT_DIR / ".snippets/code"
SNIPPETS_TEXT_DIR = ROOT_DIR / ".snippets/text"
IMAGES_DIR = ROOT_DIR / "images"

def to_link_path(md_path: Path) -> str:
    """
    Convert a markdown file path to its URL path.
    - Removes .md suffix
    - Drops 'index' from the end of the path
    """
    parts = md_path.with_suffix("").parts
    if parts[-1] == "index":
        parts = parts[:-1]
    return "/" + "/".join(parts) + "/"

def update_links_in_file(file_path: Path, old_link: str, new_link: str):
    """
    Replace all links in a file (Markdown or JSON) from old_link to new_link,
    preserving anchors (#something)
    """
    content = file_path.read_text()
    # Regex to match old_link with optional #anchor
    pattern = re.compile(re.escape(old_link) + r'(#\S*)?')
    new_content, count = pattern.subn(lambda m: new_link + (m.group(1) or ""), content)
    if count > 0:
        print(f"Updating links in {file_path}: {old_link} -> {new_link}")
        file_path.write_text(new_content)

def update_links_in_docs(old_link: str, new_link: str):
    """
    Update links in all markdown and JSON files
    """
    for file_path in DOCS_DIR.rglob("*"):
        if file_path.suffix in [".md", ".json", ".jsonl"]:
            update_links_in_file(file_path, old_link, new_link)

def move_doc_with_assets(old_doc_path: str, new_doc_path: str):
    old_doc_path = Path(old_doc_path)
    new_doc_path = Path(new_doc_path)

    print(f"Moving doc: {old_doc_path} -> {new_doc_path}")

    # Move Markdown file
    new_doc_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(old_doc_path), str(new_doc_path))

    # Compute relative paths
    old_rel = Path(*old_doc_path.with_suffix("").parts)

    # New filesystem path (keep 'index' if new_doc_path is index.md)
    if new_doc_path.stem == "index":
        new_fs_rel = Path(*new_doc_path.with_suffix("").parts)  # includes 'index'
    else:
        new_fs_rel = Path(*new_doc_path.with_suffix("").parts)

    # Update snippet/image references inside Markdown
    content = new_doc_path.read_text()
    content = content.replace(str(SNIPPETS_CODE_DIR / old_rel), str(SNIPPETS_CODE_DIR / new_fs_rel))
    content = content.replace(str(SNIPPETS_TEXT_DIR / old_rel), str(SNIPPETS_TEXT_DIR / new_fs_rel))
    content = content.replace(str(IMAGES_DIR / old_rel), str(IMAGES_DIR / new_fs_rel))
    new_doc_path.write_text(content)

    # Move snippet directories if they exist
    for snippets_dir in [SNIPPETS_CODE_DIR, SNIPPETS_TEXT_DIR]:
        old_snippet_dir = snippets_dir / old_rel
        new_snippet_dir = snippets_dir / new_fs_rel
        if old_snippet_dir.exists():
            print(f"Moving snippet dir: {old_snippet_dir} -> {new_snippet_dir}")
            new_snippet_dir.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(old_snippet_dir), str(new_snippet_dir))

    # Move image directories if they exist
    old_image_dir = IMAGES_DIR / old_rel
    new_image_dir = IMAGES_DIR / new_fs_rel
    if old_image_dir.exists():
        print(f"Moving image dir: {old_image_dir} -> {new_image_dir}")
        new_image_dir.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(old_image_dir), str(new_image_dir))

    # --- Update internal links in all other files ---
    old_link_path = to_link_path(old_doc_path)
    new_link_path = to_link_path(new_doc_path)
    if old_link_path != new_link_path:
        update_links_in_docs(old_link_path, new_link_path)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python move_doc.py old_doc.md new_doc.md")
    else:
        move_doc_with_assets(sys.argv[1], sys.argv[2])
