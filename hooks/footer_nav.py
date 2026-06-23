"""MkDocs hook: footer_nav support.

Usage:
  - Sections: add `footer_nav: true` (or a position number) to the section's .nav.yml
  - Pages:    add `footer_nav: true` (or a position number) to the page's YAML front matter

  footer_nav: true   → include in footer, order determined by nav discovery
  footer_nav: 1      → include in footer, appears first
  footer_nav: 2      → include in footer, appears second
  (numbered items sort before un-numbered ones)

Items marked with footer_nav are:
  1. Given `meta = {'footer_nav': True}` so nav-item.html can skip them.
  2. Collected into config.extra['footer_nav'] (list of {title, url}) for
     use in the footer template, sorted by their position value.
"""

import os

import yaml
from mkdocs.structure.nav import Section
from mkdocs.structure.pages import Page
from mkdocs.utils.meta import get_data


def on_nav(nav, *, config, **kwargs):
    docs_dir = config["docs_dir"]
    footer_items = []

    _process_items(nav.items, docs_dir, footer_items)

    # Stable sort: explicit integers first, then boolean `true` items in
    # discovery order.  bool is a subclass of int in Python, so we check
    # for bool before int.
    footer_items.sort(key=lambda x: x.pop("_order"))

    if "extra" not in config or config["extra"] is None:
        config["extra"] = {}
    config["extra"]["footer_nav"] = footer_items

    return nav


def _order_key(value):
    """Return a sort key for a footer_nav value.

    int (non-bool) → use as-is
    bool True       → float('inf') so it sorts after all numbered items
    """
    if isinstance(value, bool):
        return float("inf")
    return value


def _process_items(items, docs_dir, footer_items):
    for item in items:
        if isinstance(item, Section):
            section_dir = _get_section_dir(item, docs_dir)
            if section_dir:
                nav_yml_path = os.path.join(section_dir, ".nav.yml")
                if os.path.exists(nav_yml_path):
                    with open(nav_yml_path, encoding="utf-8") as f:
                        data = yaml.safe_load(f) or {}
                    fv = data.get("footer_nav")
                    if fv:
                        item.meta = {"footer_nav": True}
                        url = _get_first_page_url(item)
                        if url:
                            footer_items.append({
                                "title": item.title,
                                "url": url,
                                "_order": _order_key(fv),
                            })
                        continue  # don't recurse into footer sections
            _process_items(item.children, docs_dir, footer_items)

        elif isinstance(item, Page):
            if item.file and item.file.abs_src_path:
                try:
                    with open(item.file.abs_src_path, encoding="utf-8-sig") as f:
                        content = f.read()
                    _, meta = get_data(content)
                    fv = meta.get("footer_nav")
                    if fv:
                        footer_items.append({
                            "title": item.title,
                            "url": item.url,
                            "_order": _order_key(fv),
                        })
                except OSError:
                    pass


def _get_section_dir(section, docs_dir):
    """Return the absolute directory of a section via its first direct Page child."""
    for item in section.children:
        if isinstance(item, Page) and item.file:
            return os.path.join(docs_dir, os.path.dirname(item.file.src_path))
    return None


def _get_first_page_url(section):
    """Return the URL of the first page anywhere in a section tree."""
    for item in section.children:
        if isinstance(item, Page) and item.url:
            return item.url
        if isinstance(item, Section):
            url = _get_first_page_url(item)
            if url:
                return url
    return None