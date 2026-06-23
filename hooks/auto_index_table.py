"""MkDocs hook: auto-generate index tables from nav structure.

Place one or more marker blocks anywhere in a page:

  <!-- INDEX TABLE START -->
  <!-- INDEX TABLE END -->

Each block is replaced with a generated table on every build. Custom content
outside the markers is left untouched, so multiple blocks and hand-written
sections can coexist freely on the same page.

Optional YAML config in the opening comment:

  <!-- INDEX TABLE START
  dir: dev-environments
  columns: [title, tools, description]
  -->

Config options:
  dir        - directory to scan, relative to the page (default: page's own dir)
               use a leading / to make it relative to docs_dir instead
  columns    - columns to include and their display order
               (default: [title, difficulty, tools, description])
               available: title, difficulty, tools, description
  flat       - if true, all pages are collected into a single table with no
               section headings (default: false); when false, directory entries
               are recursively expanded by following .nav.yml files in
               subdirectories
  extra_rows - list of extra rows appended after the auto-generated ones
               each entry is a dict with: title (raw markdown), description,
               tools, and optionally difficulty
  overrides  - dict keyed by filename (e.g. accounts.md) to override any
               field on a specific auto-generated row: title, description,
               tools, or difficulty

Fields used per row:
  title       - taken from .nav.yml key first (icon prefixes stripped),
                falls back to frontmatter title; page is skipped if both missing
  description - read from frontmatter short_description first, falls back to
                description; page is skipped if both missing
  tools       - frontmatter field; accepts a list or a comma/semicolon-separated
                string; shows N/A if absent
  difficulty  - from page_badges.tutorial_badge frontmatter; shows N/A if absent

Note: index.md files are always skipped regardless of nav configuration.
"""

import os
import re
import yaml

from mkdocs.utils.meta import get_data

import logging
log = logging.getLogger('mkdocs')

_ICON_RE = re.compile(r'^:[a-z0-9_+-]+:\s*')

BLOCK_RE = re.compile(
    r'(<!--\s*INDEX TABLE START\s*.*?-->)'
    r'.*?'
    r'<!--\s*INDEX TABLE END\s*-->',
    re.DOTALL,
)

END_MARKER = '<!-- INDEX TABLE END -->'

DEFAULT_COLUMNS = ['title', 'difficulty', 'tools', 'description']

COLUMN_HEADERS = {
    'title':       'Title',
    'difficulty':  'Difficulty',
    'tools':       'Tools',
    'description': 'Description',
}

ACRONYMS = {'API', 'SDK', 'CLI', 'AI', 'ML', 'CPU', 'GPU', 'EVM', 'PVM', 'NFT', 'DApp'}
DIFFICULTY_MAP = {
    'beginner':     '🟢 Beginner',
    'intermediate': '🟡 Intermediate',
    'advanced':     '🔴 Advanced',
}

def on_page_markdown(markdown, page, config, files, **kwargs):
    if '<!-- INDEX TABLE START' not in markdown:
        return markdown

    docs_dir = config['docs_dir']
    page_dir = os.path.dirname(page.file.abs_src_path)

    def replace_block(match):
        opening = match.group(1)

        yaml_match = re.match(r'<!--\s*INDEX TABLE START\s*(.*?)-->', opening, re.DOTALL)
        raw_config = yaml_match.group(1).strip() if yaml_match else ''

        cfg = {}
        if raw_config:
            try:
                cfg = yaml.safe_load(raw_config) or {}
            except Exception as e:
                log.warning(f"auto_index: invalid YAML config in {page.file.src_path}: {e} — using defaults")

        columns = cfg.get('columns', DEFAULT_COLUMNS)
        if isinstance(columns, str):
            columns = [columns]
        unknown = [c for c in columns if c not in COLUMN_HEADERS]
        if unknown:
            log.warning(f"auto_index: unknown column(s) {unknown} in {page.file.src_path} — falling back to defaults")
            columns = DEFAULT_COLUMNS
        flat = cfg.get('flat', False)
        extra_rows = cfg.get('extra_rows') or []
        overrides = cfg.get('overrides') or {}

        dir_config = cfg.get('dir')
        if dir_config:
            scan_dir = _resolve(page_dir, str(dir_config), docs_dir)
            if not scan_dir:
                log.warning(f"auto_index: 'dir: {dir_config}' in {page.file.src_path} resolves outside docs_dir — skipping block")
                return match.group(0)
            if not os.path.isdir(scan_dir):
                log.warning(f"auto_index: 'dir: {dir_config}' in {page.file.src_path} does not exist — skipping block")
                return match.group(0)
        else:
            scan_dir = page_dir

        generated = _build_content(scan_dir, docs_dir, columns, flat, extra_rows, overrides)
        inner = f"\n\n{generated}\n" if generated else "\n"
        return f"{opening}{inner}{END_MARKER}"

    return BLOCK_RE.sub(replace_block, markdown)


def _build_content(scan_dir, docs_dir, columns, flat=False, extra_rows=None, overrides=None):
    nav_path = os.path.join(scan_dir, '.nav.yml')
    if not os.path.exists(nav_path):
        log.warning(f"auto_index: no .nav.yml found in {os.path.relpath(scan_dir, docs_dir)} — table will be empty")
        return ""

    header = '| ' + ' | '.join(COLUMN_HEADERS[c] for c in columns) + ' |'
    separator = '|' + '|'.join(':----------:' if c == 'difficulty' else '-------' for c in columns) + '|'

    nav_items = _load_nav(nav_path)

    if flat:
        rows = []
        for item in nav_items:
            if not isinstance(item, dict):
                continue
            for nav_title, path in item.items():
                if os.path.basename(str(path)) == 'index.md':
                    continue
                resolved = _resolve(scan_dir, str(path), docs_dir)
                if not resolved:
                    continue
                nt = _strip_icons(nav_title)
                if os.path.isfile(resolved) and resolved.endswith('.md'):
                    row = _make_row(resolved, docs_dir, columns, nav_title=nt, overrides=overrides)
                    if row:
                        rows.append(row)
                else:
                    md_path = resolved.rstrip('/') + '.md'
                    if os.path.isfile(md_path):
                        row = _make_row(md_path, docs_dir, columns, nav_title=nt, overrides=overrides)
                        if row:
                            rows.append(row)
        for er in (extra_rows or []):
            row = _make_extra_row(er, columns)
            if row:
                rows.append(row)
        if not rows:
            return ""
        return "\n".join([header, separator] + rows)

    sections = []
    for item in nav_items:
        if not isinstance(item, dict):
            continue
        for title, path in item.items():
            if os.path.basename(str(path)) == 'index.md':
                continue

            resolved = _resolve(scan_dir, str(path), docs_dir)
            if not resolved:
                continue

            rows = [r for r in (_make_row(f, docs_dir, columns, nav_title=nt, overrides=overrides) for f, nt in _collect_files(resolved, docs_dir)) if r]

            if rows:
                sections.append(f"## {_strip_icons(title)}\n")
                sections.append(header)
                sections.append(separator)
                sections.extend(rows)
                sections.append("")

    if extra_rows:
        extra = [_make_extra_row(er, columns) for er in extra_rows]
        extra = [r for r in extra if r]
        if extra:
            sections.append(header)
            sections.append(separator)
            sections.extend(extra)
            sections.append("")

    return "\n".join(sections)


def _make_row(md_path, docs_dir, columns, nav_title=None, overrides=None):
    fm = _read_frontmatter(md_path)
    ov = (overrides or {}).get(os.path.basename(md_path)) or {}

    title = ov.get('title') or nav_title or (fm.get('title') or '').strip()
    description = ov.get('description') or (fm.get('short_description') or fm.get('description') or '').strip()

    if not (title and description):
        return None

    page_badges = fm.get('page_badges') or {}
    tutorial_badge = (page_badges.get('tutorial_badge') or '').strip() if isinstance(page_badges, dict) else ''
    difficulty_raw = ov.get('difficulty', '')

    data = {
        'title':       f"[{_escape(title)}]({_to_site_path(md_path, docs_dir)})",
        'difficulty':  _difficulty(difficulty_raw or tutorial_badge),
        'tools':       _escape(_format_tools(ov.get('tools') or fm.get('tools', ''))),
        'description': _escape(description),
    }

    return '| ' + ' | '.join(data[c] for c in columns) + ' |'


def _make_extra_row(row_data, columns):
    if not isinstance(row_data, dict):
        return None
    title = str(row_data.get('title', '')).replace('|', r'\|').strip()
    description = _escape(str(row_data.get('description', '')))
    if not (title and description):
        return None

    data = {
        'title':       title,
        'difficulty':  _difficulty(row_data.get('difficulty', '')),
        'tools':       _escape(_format_tools(row_data.get('tools', ''))),
        'description': description,
    }
    return '| ' + ' | '.join(data[c] for c in columns) + ' |'


def _collect_files(path, docs_dir, nav_title=None):
    """Recursively collect (md_path, nav_title) from a path, following .nav.yml files."""
    if os.path.isfile(path) and path.endswith('.md'):
        return [(path, nav_title)]

    if os.path.isdir(path):
        sub_nav = os.path.join(path, '.nav.yml')
        if os.path.exists(sub_nav):
            files = []
            for item in _load_nav(sub_nav):
                if not isinstance(item, dict):
                    continue
                for item_title, sub_path in item.items():
                    if os.path.basename(str(sub_path)) == 'index.md':
                        continue
                    resolved = _resolve(path, str(sub_path), docs_dir)
                    if resolved:
                        files.extend(_collect_files(resolved, docs_dir, _strip_icons(item_title)))
            return files
        return [
            (os.path.join(path, f), None)
            for f in sorted(os.listdir(path))
            if f.endswith('.md') and f != 'index.md'
        ]

    md_path = path.rstrip('/') + '.md'
    if os.path.isfile(md_path):
        return [(md_path, nav_title)]

    return []


def _difficulty(badge):
    badge = str(badge).strip()
    if not badge:
        return 'N/A'
    return DIFFICULTY_MAP.get(badge.lower(), f'⚪ {badge.title()}')


def _strip_icons(text):
    return _ICON_RE.sub('', str(text)).strip()


def _read_frontmatter(path):
    try:
        with open(path, encoding='utf-8-sig') as f:
            _, meta = get_data(f.read())
        return meta or {}
    except Exception:
        return {}


def _load_nav(nav_path):
    try:
        with open(nav_path, encoding='utf-8') as f:
            data = yaml.safe_load(f) or {}
        return data if isinstance(data, list) else data.get('nav', [])
    except Exception:
        return []


def _resolve(base_dir, path, docs_dir):
    if path.startswith('/'):
        resolved = os.path.normpath(os.path.join(docs_dir, path.lstrip('/')))
    else:
        resolved = os.path.normpath(os.path.join(base_dir, path))
    if os.path.commonpath([resolved, os.path.normpath(docs_dir)]) != os.path.normpath(docs_dir):
        return None
    return resolved


def _to_site_path(abs_path, docs_dir):
    rel = os.path.relpath(abs_path, docs_dir).replace('\\', '/')
    if rel.endswith('.md'):
        rel = rel[:-3]
        if rel.endswith('/index') or rel == 'index':
            return '/' + rel[:-len('index')]
        return '/' + rel + '/'
    return '/' + rel


def _format_tools(tools):
    if not tools:
        return 'N/A'
    parts = tools if isinstance(tools, list) else re.split(r'[;,]', str(tools))
    out = []
    for t in (p.strip() for p in parts if str(p).strip()):
        if t.upper() in ACRONYMS:
            out.append(t.upper())
        elif t.islower() and ' ' not in t:
            out.append(t.capitalize())
        else:
            out.append(t)
    return ', '.join(out) if out else 'N/A'


def _escape(text):
    return str(text).replace('|', r'\|').replace('`', r'\`').replace('\n', ' ').strip()
