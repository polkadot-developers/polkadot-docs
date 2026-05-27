"""MkDocs hook: adds glossary definitions as paragraph tooltips.

Glossary terms are maintained in ``reference/glossary.md``. During the build,
this hook reads the glossary, turns headings and definitions into a term map,
applies exclusions from ``mkdocs.yml``, and annotates matching terms after
MkDocs has rendered each page to HTML.

This hook:
  1. Reads ``reference/glossary.md`` from the configured MkDocs docs_dir.
  2. Parses second- and third-level glossary headings with their definitions.
  3. Builds an in-memory term map, for example:
     ``{"Runtime": "The runtime represents..."}``
  4. Expands parenthesized aliases, so ``Term (Alias)`` can match both names.
  5. Removes terms configured in ``mkdocs.yml``:
     ``extra.glossary_tooltips.exclude_terms: ["Polkadot"]``.
  6. Scans the rendered HTML for each Markdown page.
  7. Processes only normal ``<p>`` paragraph text.
  8. Replaces matched text with ``<abbr title="...">Term</abbr>`` so the
     Material theme can display the tooltip.
"""

from __future__ import annotations

import html
import re
from pathlib import Path
from typing import Pattern

from bs4 import BeautifulSoup, NavigableString

_FRONT_MATTER_RE = re.compile(r"\A---\n.*?\n---\n", re.DOTALL)
_HEADING_RE = re.compile(r"^(#{2,3})\s+(.+?)\s*$", re.MULTILINE)
_INLINE_LINK_RE = re.compile(r"\[([^\]]+)\]\([^)]+\)(?:\{[^}]*\})?")
_REFERENCE_LINK_RE = re.compile(r"\[([^\]]+)\]\[[^\]]+\]")
_HTML_TAG_RE = re.compile(r"<[^>]+>")
_PAREN_RE = re.compile(r"^(?P<name>.+?)\s*\((?P<alias>[^)]+)\)$")
_SKIP_TAGS = {
    "a",
    "abbr",
    "b",
    "button",
    "code",
    "kbd",
    "pre",
    "script",
    "strong",
    "style",
    "svg",
}

_cache: dict[str, object] = {
    "path": None,
    "mtime": None,
    "terms": {},
    "pattern": None,
}


def on_page_content(content: str, *, config, **kwargs):
    excluded_terms = _excluded_terms(config)
    terms, pattern = _load_terms(config, excluded_terms)
    if not terms or pattern is None:
        return content

    soup = BeautifulSoup(content, "html.parser")

    for paragraph in soup.find_all("p"):
        if _inside_grid_cards(paragraph):
            continue

        for text_node in list(paragraph.find_all(string=True)):
            if not isinstance(text_node, NavigableString):
                continue
            if _has_skipped_parent(text_node, paragraph):
                continue

            replacement = _tooltip_nodes(soup, str(text_node), terms, pattern)
            if replacement:
                text_node.replace_with(*replacement)

    return str(soup)


def _load_terms(
    config,
    excluded_terms: frozenset[str],
) -> tuple[dict[str, str], Pattern[str] | None]:
    glossary_path = Path(config["docs_dir"]) / "reference" / "glossary.md"

    try:
        mtime = glossary_path.stat().st_mtime
    except OSError:
        return {}, None

    if (
        _cache["path"] == glossary_path
        and _cache["mtime"] == mtime
        and _cache.get("excluded_terms") == excluded_terms
    ):
        return dict(_cache["terms"]), _cache["pattern"]  # type: ignore[return-value]

    try:
        glossary = glossary_path.read_text(encoding="utf-8")
    except OSError:
        return {}, None

    terms = _exclude_terms(_build_terms(glossary), excluded_terms)
    pattern = _build_pattern(terms)
    _cache.update({
        "path": glossary_path,
        "mtime": mtime,
        "excluded_terms": excluded_terms,
        "terms": terms,
        "pattern": pattern,
    })
    return terms, pattern


def _build_terms(markdown: str) -> dict[str, str]:
    body = _FRONT_MATTER_RE.sub("", markdown)
    headings = list(_HEADING_RE.finditer(body))
    definitions: dict[str, str] = {}

    for index, heading in enumerate(headings):
        term = _plain_text(heading.group(2))
        if not term or term.lower() == "glossary":
            continue

        start = heading.end()
        end = headings[index + 1].start() if index + 1 < len(headings) else len(body)
        definition = _section_definition(body[start:end])
        if not definition:
            continue

        for alias in _term_aliases(term):
            definitions.setdefault(alias, definition)

    return dict(sorted(
        definitions.items(),
        key=lambda item: (-len(item[0]), item[0].casefold()),
    ))


def _build_pattern(terms: dict[str, str]) -> Pattern[str] | None:
    if not terms:
        return None

    alternatives = "|".join(re.escape(term) for term in terms)
    return re.compile(rf"(?<![\w-])({alternatives})(?![\w-])")


def _excluded_terms(config) -> frozenset[str]:
    tooltip_config = config.get("extra", {}).get("glossary_tooltips", {})
    terms = tooltip_config.get("exclude_terms", [])

    if not isinstance(terms, list):
        return frozenset()

    return frozenset(
        term.casefold()
        for term in terms
        if isinstance(term, str) and term.strip()
    )


def _exclude_terms(
    terms: dict[str, str],
    excluded_terms: frozenset[str],
) -> dict[str, str]:
    if not excluded_terms:
        return terms

    return {
        term: definition
        for term, definition in terms.items()
        if term.casefold() not in excluded_terms
    }


def _section_definition(section: str) -> str:
    for paragraph in re.split(r"\n\s*\n", section.strip()):
        paragraph = paragraph.strip()
        if not paragraph or paragraph.startswith(("- ", "* ", "```", "!!!", "???", "|")):
            continue
        return _plain_text(" ".join(line.strip() for line in paragraph.splitlines()))
    return ""


def _term_aliases(term: str) -> list[str]:
    aliases = [term]

    match = _PAREN_RE.match(term)
    if match:
        aliases.extend([match.group("name").strip(), match.group("alias").strip()])

    return [alias for alias in dict.fromkeys(aliases) if alias]


def _plain_text(value: str) -> str:
    value = _INLINE_LINK_RE.sub(r"\1", value)
    value = _REFERENCE_LINK_RE.sub(r"\1", value)
    value = _HTML_TAG_RE.sub("", value)
    value = value.replace("`", "")
    value = value.replace("*", "")
    value = value.replace("_", "")
    value = re.sub(r"\s+", " ", value).strip()
    return html.unescape(value)


def _has_skipped_parent(text_node: NavigableString, paragraph) -> bool:
    parent = text_node.parent
    while parent is not None and parent is not paragraph:
        if getattr(parent, "name", None) in _SKIP_TAGS:
            return True
        parent = parent.parent
    return False


def _inside_grid_cards(tag) -> bool:
    for parent in tag.parents:
        classes = parent.get("class", [])
        if "grid" in classes and "cards" in classes:
            return True
    return False


def _tooltip_nodes(
    soup: BeautifulSoup,
    text: str,
    terms: dict[str, str],
    pattern: Pattern[str],
):
    nodes = []
    last_end = 0

    for match in pattern.finditer(text):
        if match.start() > last_end:
            nodes.append(NavigableString(text[last_end:match.start()]))

        term = match.group(0)
        abbr = soup.new_tag("abbr", title=terms[term])
        abbr.string = term
        nodes.append(abbr)
        last_end = match.end()

    if not nodes:
        return []

    if last_end < len(text):
        nodes.append(NavigableString(text[last_end:]))

    return nodes
