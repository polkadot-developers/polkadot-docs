"""Build-time AI artifacts — in-house replacement for the papermoon `ai_docs` plugin.

Produces, during `mkdocs build`:
  1. site/ai/llms-full.jsonl   — the chunked corpus feed (with `source` + `url`).
  2. site/<route>.md           — one resolved-markdown artifact per page.
  3. Page-action dropdowns     — injected into `.page-header-row`.
  4. site/llms.txt             — llms.txt index.
  5. The ai-resources.md page  — fills in its body (via on_page_markdown).

All chunking/metadata logic lives in generator/generate_feed.py (single source of
truth via process_page/chunk_row); this hook only handles mkdocs integration.
It honors mkdocs `exclude_docs` by working off the build's own file list.
"""
import html
import json
import logging
import os
import re
import sys
from urllib.parse import quote, urlparse

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(_ROOT, "generator"))

import yaml  # noqa: E402
from jinja2 import Environment  # noqa: E402

from generate_feed import estimate_tokens, process_page  # noqa: E402

log = logging.getLogger("mkdocs")
SOURCE_TAG = "polkadot-docs"
_CFG = None
_INCLUDED = None  # {src_uri: abs_path} for pages mkdocs actually builds (post exclude_docs)


def _load_cfg(config):
    global _CFG
    if _CFG is not None:
        return _CFG
    with open(os.path.join(_ROOT, "llms_config.json"), encoding="utf-8") as f:
        llms = json.load(f)
    excl = llms.get("content", {}).get("exclusions", {})
    _CFG = {
        "docs_base_url": llms.get("project", {}).get("docs_base_url", config["site_url"]).rstrip("/"),
        "skip_basenames": set(excl.get("skip_basenames", [])),
        "skip_paths": excl.get("skip_paths", []),
        "variables": yaml.safe_load(open(os.path.join(config["docs_dir"], "variables.yml"), encoding="utf-8")) or {},
        "env": Environment(),
        "snippets": os.path.join(config["docs_dir"], ".snippets"),
        "site_path": urlparse(config["site_url"] or "/").path.rstrip("/"),
    }
    return _CFG


def _feed_excluded(src_uri, cfg, meta=None):
    """True = keep this page OUT of the aggregate feed/llms.txt. (Artifacts and the
    dropdown are still emitted; only the AI corpus is opt-out.)"""
    if src_uri == "index.md" or os.path.basename(src_uri) in cfg["skip_basenames"]:
        return True
    if any(part in cfg["skip_paths"] for part in src_uri.split("/")):
        return True
    if meta and meta.get("hide_ai_actions"):  # full opt-out: no dropdown AND no feed text
        return True
    return False


def on_files(files, config, **kwargs):
    # Authoritative page set AFTER mkdocs applies exclude_docs — so README.md,
    # AGENTS.md, etc. never get an artifact, feed entry, or 404'd llms.txt link.
    global _INCLUDED
    _INCLUDED = {f.src_uri: f.abs_src_path for f in files.documentation_pages()}
    return files


# --------------------------------------------------------------- ai-resources page

AI_RESOURCES_MD = """
Machine-readable versions of this documentation, for LLMs and AI tools.

## Full corpus feed

- [`/ai/llms-full.jsonl`](/ai/llms-full.jsonl): every documentation page, pre-chunked
  by section. One JSON object per line with `source`, `page_id`, `url`, heading
  `anchor`, `page_version_hash`, and the section `text`. Regenerated on every docs
  deploy — it is a snapshot of the current docs, not a log.
- [`/llms.txt`](/llms.txt): index file following the [llms.txt convention](https://llmstxt.org/).

## Per-page Markdown

Every page is also published as resolved Markdown next to its HTML — append `.md`
to a page's path (for example `/apps/build.md`), or use the "Markdown for LLMs"
menu at the top of any page to copy, view, or download it.
"""


def on_page_markdown(markdown, page, config, files, **kwargs):
    if page.file.src_uri == "ai-resources.md":
        return AI_RESOURCES_MD
    return markdown


# --------------------------------------------------------------- dropdown injection

_MD_ICON = (
    '<svg viewBox="0 0 208 128" width="16" height="16" aria-hidden="true">'
    '<rect width="198" height="118" x="5" y="5" ry="10" fill="none" stroke="currentColor" stroke-width="10"/>'
    '<path fill="currentColor" d="M30 98V30h20l20 25 20-25h20v68H90V59L70 84 50 59v39zm125 0-30-33h20V30h20v35h20z"/></svg>'
)
_CHEVRON = (
    '<svg class="ai-file-actions-chevron" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">'
    '<path fill="currentColor" d="M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6z"/></svg>'
)


def _dropdown_html(md_href, page_url_abs, filename):
    prompt = quote(f"Read {page_url_abs} so I can ask questions about it.")
    esc = html.escape(md_href, quote=True)
    return f"""
<div class="ai-file-actions-container ai-file-actions-container--dropdown">
  <button class="ai-file-actions-btn ai-file-actions-trigger" type="button"
          aria-label="Markdown for LLMs" aria-haspopup="true" aria-expanded="false"
          data-url="{esc}">
    {_MD_ICON}<span class="button-text">Markdown for LLMs</span>{_CHEVRON}
  </button>
  <div class="ai-file-actions-menu" role="menu">
    <button class="ai-file-actions-item" role="menuitem" tabindex="-1"
            data-action-type="clipboard" data-url="{esc}">Copy page</button>
    <a class="ai-file-actions-item" role="menuitem" tabindex="-1"
       href="{esc}" target="_blank" rel="noopener noreferrer">View page in Markdown</a>
    <a class="ai-file-actions-item" role="menuitem" tabindex="-1"
       href="{esc}" download="{html.escape(filename, quote=True)}">Download page in Markdown</a>
    <a class="ai-file-actions-item" role="menuitem" tabindex="-1"
       href="https://chatgpt.com/?hints=search&amp;prompt={prompt}"
       target="_blank" rel="noopener noreferrer">Open in ChatGPT</a>
    <a class="ai-file-actions-item" role="menuitem" tabindex="-1"
       href="https://claude.ai/new?q={prompt}"
       target="_blank" rel="noopener noreferrer">Open in Claude</a>
  </div>
</div>"""


# A <div> carrying `page-header-row` as a whole class token (not a substring like
# page-header-row-wrapper, and only inside class="…", never a data-* value). Tolerant
# of a second class / data-variant / attribute order. (Template-level injection in
# page-badges.html would be even cleaner; this keeps the theme untouched.)
_ROW_RE = re.compile(
    r'<div\b[^>]*\bclass\s*=\s*"[^"]*(?<![\w-])page-header-row(?![\w-])[^"]*"[^>]*>', re.I)
_DIV_TAG_RE = re.compile(r'<div\b|</div>', re.I)


def _inject_dropdown(output, widget):
    parts, pos = [], 0
    for m in _ROW_RE.finditer(output):
        # Insert before the row's DEPTH-MATCHED closing </div> (robust to nested
        # divs) so the widget renders after the badges, on the right, as before.
        depth, close = 1, None
        for t in _DIV_TAG_RE.finditer(output, m.end()):
            depth += 1 if t.group(0)[1] != "/" else -1
            if depth == 0:
                close = t.start()
                break
        if close is None:
            continue
        parts.append(output[pos:close])
        parts.append(widget)
        pos = close
    if not parts:
        return output
    parts.append(output[pos:])
    return "".join(parts)


def on_post_page(output, page, config, **kwargs):
    cfg = _load_cfg(config)
    if _feed_excluded(page.file.src_uri, cfg, page.meta):  # hidden pages get no dropdown
        return output
    route = page.url.rstrip("/")
    if not route:
        return output
    md_href = f'{cfg["site_path"]}/{route}.md'
    page_abs = f'{cfg["docs_base_url"]}/{route}/'
    widget = _dropdown_html(md_href, page_abs, os.path.basename(md_href))
    return _inject_dropdown(output, widget)


# --------------------------------------------------------------- artifacts on build

def _write_md(site_dir, route, page):
    header = {
        "title": page["title"],
        "description": page["fm"].get("description"),
        "categories": page["fm"].get("categories"),
        "url": page["url"],
        "word_count": len(re.findall(r"\b\w+\b", page["body"], re.UNICODE)),
        "token_estimate": estimate_tokens(page["body"]),
        "version_hash": page["version_hash"],
        "last_updated": page["last_updated"],
    }
    out_md = os.path.join(site_dir, *route.split("/")) + ".md"
    os.makedirs(os.path.dirname(out_md), exist_ok=True)
    with open(out_md, "w", encoding="utf-8") as f:
        f.write("---\n")
        for k, v in header.items():
            if v not in (None, "", []):
                f.write(f"{k}: {json.dumps(v, ensure_ascii=False) if isinstance(v, list) else v}\n")
        f.write("---\n\n")
        f.write(page["body"].strip() + "\n")


def on_post_build(config, **kwargs):
    cfg = _load_cfg(config)
    docs_dir = os.path.abspath(config["docs_dir"])
    site_dir = config["site_dir"]
    included = _INCLUDED or {}
    rows, pages = [], []

    for src_uri, abs_path in sorted(included.items()):
        if src_uri == "index.md":
            continue  # homepage: no .md artifact / feed entry (matches the generator)
        page = process_page(abs_path, docs_dir, cfg["variables"], cfg["env"],
                            cfg["snippets"], cfg["docs_base_url"], SOURCE_TAG)
        _write_md(site_dir, page["route"], page)
        if not _feed_excluded(src_uri, cfg, page["fm"]):
            pages.append((page["title"], page["url"]))
            rows.extend(page["chunks"])

    ai_dir = os.path.join(site_dir, "ai")
    os.makedirs(ai_dir, exist_ok=True)
    with open(os.path.join(ai_dir, "llms-full.jsonl"), "w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    with open(os.path.join(site_dir, "llms.txt"), "w", encoding="utf-8") as f:
        f.write("# Polkadot Developer Docs\n\n")
        f.write("> Developer documentation for Polkadot. Full pre-chunked corpus: "
                f'{cfg["docs_base_url"]}/ai/llms-full.jsonl — per-page resolved Markdown: '
                "append .md to any page URL.\n\n## Pages\n\n")
        for title, url in pages:
            f.write(f"- [{title}]({url})\n")

    log.info("[ai_feed] wrote %d chunks across %d pages -> ai/llms-full.jsonl, "
             "per-page .md, llms.txt", len(rows), len(pages))
