"""MkDocs hook: synthesize page.ancestors for orphan pages.

For pages excluded from the nav (listed under not_in_nav), page.parent is None
and the computed page.ancestors property always returns [], so breadcrumbs
(navigation.path) never render.

This hook:
  1. Walks the nav tree once (on_nav) to map each directory path to the ordered
     list of ancestor Section objects for pages inside it (root → leaf order).
  2. For each orphan page (page.parent is None), walks up the file path to find
     the deepest matching directory in the map, then fills any intermediate
     directory levels with synthetic breadcrumb items.

Intermediate directories (not in the nav) use a title from the directory's
.nav.yml ``title:`` field if present, otherwise fall back to a formatted
version of the directory name (e.g. "pr-reviews" → "PR Reviews").

Synthetic section objects carry a pre-built ``ancestors`` attribute (leaf →
root order) so that the computed ``page.ancestors`` property resolves
correctly without requiring a setter.
"""

import os
from types import SimpleNamespace

import yaml
from mkdocs.structure.nav import Section
from mkdocs.structure.pages import Page

# Maps normalised relative directory paths to their ancestor Section objects
# in root-to-leaf order, e.g. "code-reviews/pr-reviews" → [Code Reviews, PR Reviews].
_dir_ancestors: dict[str, list] = {}


def on_nav(nav, *, config, **kwargs):
    global _dir_ancestors
    _dir_ancestors = {}
    _walk(nav.items, [])

def _walk(items, ancestors):
    for item in items:
        if isinstance(item, Section):
            _walk(item.children, ancestors + [item])
        elif isinstance(item, Page):
            d = os.path.normpath(os.path.dirname(item.file.src_path))
            if d not in _dir_ancestors:
                _dir_ancestors[d] = list(ancestors)


def on_page_context(context, page, *, config, nav, **kwargs):
    # page.parent is set for all pages that are in the nav; orphans have None.
    if page.parent is not None:
        return context

    page_dir = os.path.normpath(os.path.dirname(page.file.src_path))
    new_parent = _make_parent(page_dir, config["docs_dir"])
    if new_parent is not None:
        page.parent = new_parent

    return context


def _make_parent(page_dir, docs_dir):
    """Return a parent object (real Section or synthetic) for an orphan page."""
    if page_dir == ".":
        return None

    parts = page_dir.split(os.sep)

    # Walk up the directory tree to find the deepest nav-tracked directory.
    for i in range(len(parts), 0, -1):
        candidate = os.sep.join(parts[:i])
        if candidate not in _dir_ancestors:
            continue

        base = _dir_ancestors[candidate]  # root-to-leaf list of real Sections

        if i == len(parts):
            # The page's directory is directly in the nav — use the deepest
            # real Section as the parent.
            return base[-1] if base else None

        # There are intermediate directories between the nav boundary and the
        # page.  Build synthetic sections for each level, innermost first.
        #
        # page.ancestors is computed as [self.parent, *self.parent.ancestors].
        # Synthetic objects store a pre-built ``ancestors`` attribute (leaf→root)
        # so that chain resolves without needing StructureItem machinery.
        #
        # Example: page at code-reviews/pr-reviews/github.md
        #   base = [Code Reviews Section]   (root→leaf, 1 entry)
        #   intermediate level: "pr-reviews" → "PR Reviews"
        #   synthetic.ancestors = [Code Reviews]  (leaf→root reversed from base)
        #   page.parent = synthetic
        #   page.ancestors = [synthetic, Code Reviews]
        #   template reverses → [Code Reviews, PR Reviews] → page title  ✓

        current_ancestors = list(reversed(base))  # leaf→root for .ancestors attr
        current_section = None

        for j in range(i, len(parts)):
            rel_dir = os.sep.join(parts[: j + 1])
            title = _dir_title(rel_dir, parts[j], docs_dir)
            synthetic = SimpleNamespace(
                title=title,
                url=None,
                children=None,
                # Pre-built leaf→root ancestors list consumed by page.ancestors.
                ancestors=current_ancestors,
            )
            current_section = synthetic
            current_ancestors = [synthetic] + current_ancestors

        return current_section

    return None


def _dir_title(rel_dir, dir_name, docs_dir):
    """Return the title for an intermediate directory.

    Checks for a ``title:`` key in the directory's ``.nav.yml`` first;
    falls back to formatting the directory name.
    """
    nav_yml = os.path.join(docs_dir, rel_dir, ".nav.yml")
    if os.path.exists(nav_yml):
        try:
            with open(nav_yml, encoding="utf-8") as f:
                data = yaml.safe_load(f)
            if isinstance(data, dict) and isinstance(data.get("title"), str):
                return data["title"]
        except (OSError, yaml.YAMLError):
            pass
    return _format_name(dir_name)


def _format_name(name):
    """Convert a directory name to a human-readable title.

    Words of 1-2 characters are uppercased (e.g. "pr" → "PR");
    longer words are capitalised (e.g. "reviews" → "Reviews").
    """
    words = name.replace("-", " ").replace("_", " ").split()
    return " ".join(w.upper() if len(w) <= 2 else w.capitalize() for w in words)