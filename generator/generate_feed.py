#!/usr/bin/env python3
"""In-house generator for /ai/llms-full.jsonl — a clean-room replacement for the
papermoon ai_docs plugin's chunk feed, with per-chunk `source` and `url` added.

Reproduces papermoon 0.1.0a18's algorithm: heading-split sections (## .. ###),
slugified/deduped anchors, sha256(cleaned_body) version hash, the heuristic-v1
token estimator, git last-commit timestamps, and the same page_id derivation.
Snippet resolution uses the real pymdownx.snippets preprocessor (line-range,
block-form, and remote `--8<--` syntaxes), matching the site build.

`process_page()`/`chunk_row()` are the single source of truth for page → feed
records; hooks/ai_feed.py (the mkdocs integration) imports them so the deployed
feed and the CI-validated feed cannot diverge.

  python generate_feed.py --out llms-full.new.jsonl
"""
import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import unicodedata
from datetime import datetime, timezone

import yaml
from jinja2 import Environment

MAX_DEPTH = 3
TOKEN_ESTIMATOR = "heuristic-v1"
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Kept in sync with mkdocs.yml `exclude_docs` so the standalone/CI feed matches the
# in-build feed (the hook additionally uses mkdocs' own file list — see ai_feed.py).
DEFAULT_EXCLUDE_BASENAMES = {"README.md", "AGENTS.md", "CONTRIBUTING.md", "LICENSE.md"}

HEADING_RE = re.compile(r"^(#{2,6})\s+(.+?)\s*#*\s*$")
FENCE_RE = re.compile(r"^(\s*)(`{3,}|~{3,})")
HTML_COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)
# pymdownx attr_list blocks: {#id}, {.class}, {: ...}, {key=val}, {target=_blank}, ...
_ATTR = r'(?:[#.][\w:-]+|[\w-]+=(?:"[^"\n]*"|\'[^\'\n]*\'|[^\s}]+))'
ATTR_BLOCK_RE = re.compile(r'\{:?\s*' + _ATTR + r'(?:\s+' + _ATTR + r')*\s*\}')
# A trailing attr_list block on a heading line, and the explicit `#id` inside it.
TRAILING_ATTR_RE = re.compile(r'\{:?\s*([^}\n]*)\}\s*$')
ATTR_ID_RE = re.compile(r'(?:^|\s)#([\w:.-]+)')

# ----------------------------------------------------------------- preprocessing

def split_front_matter(text):
    m = re.match(r"^---\n(.*?)\n---\n?", text, re.DOTALL)
    if m:
        try:
            fm = yaml.safe_load(m.group(1)) or {}
        except Exception:
            fm = {}
        return fm if isinstance(fm, dict) else {}, text[m.end():]
    return {}, text


_SNIPPET_PRE = {}


def _snippet_preprocessor(base, url_download):
    """The real pymdownx.snippets preprocessor, configured to match mkdocs.yml
    (base_path, dedent_subsections). Cached; run() resets its own cycle-detection
    state each call, so reuse across pages is safe."""
    key = (base, url_download)
    if key not in _SNIPPET_PRE:
        import markdown
        md = markdown.Markdown(extensions=["pymdownx.snippets"], extension_configs={
            "pymdownx.snippets": {"base_path": [base], "url_download": url_download,
                                  "dedent_subsections": True, "check_paths": False}})
        _SNIPPET_PRE[key] = md.preprocessors["snippet"]
    return _SNIPPET_PRE[key]


# Fetch remote (url_download) snippets by default to match the site build; set
# GEN_SNIPPET_URL_DOWNLOAD=0 (e.g. in CI) to stay fully offline — local snippets still
# resolve and remote ones are dropped rather than fetched.
_URL_DOWNLOAD = os.environ.get("GEN_SNIPPET_URL_DOWNLOAD", "1") != "0"


def resolve_snippets(text, base):
    # Prefer remote-enabled resolution (matches the build); if a remote snippet is
    # dead it raises, so retry local-only — that resolves every local snippet and
    # drops the dead remote cleanly, rather than leaving raw --8<-- directives.
    last = None
    for url_download in ((True, False) if _URL_DOWNLOAD else (False,)):
        try:
            return "\n".join(_snippet_preprocessor(base, url_download).run(text.split("\n")))
        except ImportError:
            # markdown/pymdownx not installed is a setup error, not a dead snippet —
            # fail loud instead of silently leaving every --8<-- directive raw.
            raise
        except Exception as e:
            last = e
    print(f"[generate_feed] snippet resolution failed ({last}); leaving raw", file=sys.stderr)
    return text


def resolve_vars(text, variables, env):
    try:
        return env.from_string(text).render(**variables)
    except Exception:
        return text  # forgiving; parity report will flag any drift


def strip_attr_blocks(body):
    """Strip pymdownx attr_list blocks line by line, keeping the explicit heading
    ids they carry.

    mkdocs' toc honors an explicit `{: #my-id }` on a heading instead of
    slugifying its text, so those ids have to survive the strip or the feed's
    anchors will not match the ids that ship in the HTML. Returns the cleaned
    body plus `{line_index: explicit_id}`. Stripping is line-wise so the indices
    stay valid against the returned body (attr_list is line-level syntax).
    """
    ids, out = {}, []
    for i, line in enumerate(body.split("\n")):
        hm = HEADING_RE.match(line)
        if hm:
            am = TRAILING_ATTR_RE.search(hm.group(2))
            if am:
                im = ATTR_ID_RE.search(am.group(1))
                if im:
                    ids[i] = im.group(1)
        out.append(ATTR_BLOCK_RE.sub("", line))
    return "\n".join(out), ids


def clean_body(raw, variables, env, snippet_base):
    """FM split -> snippets -> {{vars}} -> strip HTML comments -> strip {..} attr
    blocks. Returns `(front_matter, body, explicit_heading_ids)`."""
    fm, body = split_front_matter(raw)
    body = resolve_snippets(body, snippet_base)
    body = resolve_vars(body, variables, env)
    body = HTML_COMMENT_RE.sub("", body)
    body, heading_ids = strip_attr_blocks(body)
    return fm, body, heading_ids

# ----------------------------------------------------------------- chunking

IDCOUNT_RE = re.compile(r"^(.*)_([0-9]+)$")


def slugify_anchor(text):
    """A heading's slug, reproducing `markdown.extensions.toc.slugify` with the
    default `-` separator: fold Extended Latin to ASCII, drop everything that is
    not a word char / whitespace / dash, then collapse dash-and-space runs.

    Deliberately not our own scheme — these anchors have to resolve against the
    ids mkdocs actually renders, so the algorithm is copied, not approximated.
    """
    value = unicodedata.normalize("NFKD", text.replace("`", ""))
    value = value.encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^\w\s-]", "", value).strip().lower()
    return re.sub(r"[-\s]+", "-", value)


def unique_anchor(value, seen):
    """Reproduce `markdown.extensions.toc.unique`: the first use of a slug wins,
    and later collisions get `_1`, `_2`, ... (an underscore, not a dash — and a
    slug already ending in `_<n>` has that number incremented instead)."""
    while value in seen or not value:
        m = IDCOUNT_RE.match(value)
        value = f"{m.group(1)}_{int(m.group(2)) + 1}" if m else f"{value}_1"
    seen.add(value)
    return value


def estimate_tokens(text):
    return len(re.findall(r"\w+|[^\s\w]", text, flags=re.UNICODE))


def extract_sections(body, max_depth=MAX_DEPTH, explicit_ids=None):
    """Split a cleaned body into heading-anchored sections.

    `explicit_ids` maps a line index to the id an attr_list block put on that
    heading (see `strip_attr_blocks`). Those ids win over the slugified text,
    exactly as mkdocs' toc treats a pre-existing `id`.
    """
    explicit_ids = explicit_ids or {}
    lines = body.splitlines(keepends=True)
    starts = [0]
    for ln in lines[:-1]:
        starts.append(starts[-1] + len(ln))
    heads, fence_char = [], None
    for i, ln in enumerate(lines):
        fm = FENCE_RE.match(ln)
        if fm:
            ch = fm.group(2)[0]
            if fence_char is None:
                fence_char = ch
            elif ch == fence_char:
                fence_char = None
            continue
        if fence_char is not None:
            continue
        hm = HEADING_RE.match(ln)
        if hm and 2 <= len(hm.group(1)) <= max_depth:
            heads.append((i, len(hm.group(1)), hm.group(2).strip()))
    # toc seeds its used-id set from every id already in the document before it
    # assigns any, so an explicit id further down the page still pushes an
    # earlier auto-slug to `_1`. Seed the same way, including ids on headings
    # deeper than `max_depth` that we do not emit sections for.
    seen = set(explicit_ids.values())
    sections = []
    for idx, (li, depth, title) in enumerate(heads):
        start = starts[li]
        end = starts[heads[idx + 1][0]] if idx + 1 < len(heads) else len(body)
        anchor = explicit_ids.get(li) or unique_anchor(slugify_anchor(title), seen)
        sections.append({
            "index": idx, "depth": depth, "title": title,
            "anchor": anchor,
            "start_char": start, "end_char": end,
            "text": body[start:end].strip(),
        })
    return sections

# ----------------------------------------------------------------- page metadata

def compute_route(docs_dir, path):
    rel = os.path.relpath(path, docs_dir).replace(os.sep, "/")
    route = re.sub(r"\.(md|mdx)$", "", rel)
    if route.endswith("/index"):
        route = route[: -len("/index")]
    return route


_GIT_DATES = None


def _git_dates():
    """One `git log` walk over the repo, newest-commit ISO per path — vs one
    subprocess per file (~30ms x 250 files). Built once, cached."""
    global _GIT_DATES
    if _GIT_DATES is None:
        _GIT_DATES = {}
        try:
            out = subprocess.run(
                ["git", "log", "--name-only", "--diff-filter=ACMR", "--pretty=format:%x00%cI"],
                capture_output=True, text=True, cwd=REPO_ROOT).stdout
            ts = None
            for line in out.splitlines():
                if line.startswith("\x00"):
                    ts = line[1:].strip()
                elif line and ts and line not in _GIT_DATES:
                    _GIT_DATES[line] = ts
        except Exception:
            pass
    return _GIT_DATES


def git_last_updated(path):
    rel = os.path.relpath(os.path.abspath(path), REPO_ROOT).replace(os.sep, "/")
    ts = _git_dates().get(rel)
    if ts:
        try:
            return datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(timezone.utc).isoformat()
        except Exception:
            pass
    return datetime.fromtimestamp(os.path.getmtime(path), timezone.utc).isoformat()


def iter_markdown(docs_dir):
    files = []
    for root, dirs, names in os.walk(docs_dir):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        for n in names:
            if n.startswith(".") or not n.endswith((".md", ".mdx")):
                continue
            full = os.path.join(root, n)
            if os.path.abspath(full) == os.path.abspath(os.path.join(docs_dir, "index.md")):
                continue  # root index.md skipped, matching papermoon
            files.append(os.path.abspath(full))
    return sorted(files)

# ----------------------------------------------------------------- shared page -> records

def chunk_row(source, page_id, page_url, page_title, version_hash, last_updated, sec):
    """The single feed-record shape. Used by build() and hooks/ai_feed.py so the
    deployed and CI-validated feeds share one schema."""
    return {
        "source": source,
        "page_id": page_id,
        "url": f'{page_url}#{sec["anchor"]}',
        "page_title": page_title,
        "index": sec["index"],
        "depth": sec["depth"],
        "title": sec["title"],
        "anchor": sec["anchor"],
        "start_char": sec["start_char"],
        "end_char": sec["end_char"],
        "estimated_token_count": estimate_tokens(sec["text"]),
        "token_estimator": TOKEN_ESTIMATOR,
        "page_version_hash": version_hash,
        "last_updated": last_updated,
        "text": sec["text"],
    }


def toggle_variant(fm):
    """(group, is_canonical) for a page in a `page_toggle` group, else (None, False)."""
    t = fm.get("toggle")
    if not isinstance(t, dict):
        return None, False
    if not t.get("group") or not t.get("variant"):
        return None, False  # page_toggle ignores an incomplete declaration; so do we
    return t.get("group"), bool(t.get("canonical"))


def merge_toggle_variants(pages, source):
    """Fold non-canonical `page_toggle` variants into their group's canonical page.

    The `page_toggle` plugin renders every variant of a group into the canonical
    page's HTML and then deletes the variant's own output file, so a variant
    route 404s. Emitting a per-variant `.md` artifact, llms.txt entry, and feed
    rows would advertise those dead URLs; dropping the variants instead would
    lose content a reader can plainly see on the canonical page. So re-attribute
    each variant's body and chunks to the canonical page, which is where that
    content is actually served.

    Anchors are taken from a per-variant split rather than from the concatenated
    body: each variant's HTML is rendered from its own file, so its heading ids
    are slugified (and deduped) within that variant alone.

    `pages` is a list of process_page() dicts. Returns a new list with the
    variants removed and their canonical page rewritten in place, order
    preserved.
    """
    canonical = {}
    for p in pages:
        group, is_canonical = toggle_variant(p["fm"])
        if group and is_canonical:
            canonical[group] = p

    folded, absorbed = {}, set()
    for p in pages:
        group, is_canonical = toggle_variant(p["fm"])
        if not group or is_canonical:
            continue
        target = canonical.get(group)
        if target is None or target is p:
            continue  # a variant whose group has no canonical page still stands alone
        folded.setdefault(id(target), []).append(p)
        absorbed.add(id(p))

    for p in pages:
        variants = folded.get(id(p))
        if not variants:
            continue
        members = [p, *variants]
        # Anchors come from a per-variant split, not the merged body: each variant's
        # HTML is rendered from its own file, so toc dedupes heading ids within that
        # variant alone. Two variants that share a heading therefore share an anchor.
        anchors = [sec["anchor"] for m in members
                   for sec in extract_sections(m["body"], explicit_ids=m.get("heading_ids"))]
        kept = [m for m in members if m["body"].strip()]
        # Re-key each member's explicit heading ids onto the merged body: drop the
        # leading lines `.strip()` removes, then shift past the members already
        # placed (+1 each for the blank line `"\n\n".join` inserts between them).
        merged_ids, offset = {}, 0
        for m in kept:
            stripped = m["body"].strip()
            lead = m["body"][: len(m["body"]) - len(m["body"].lstrip())].count("\n")
            for li, anchor_id in (m.get("heading_ids") or {}).items():
                merged_ids[li - lead + offset] = anchor_id
            offset += stripped.count("\n") + 2
        p["body"] = "\n\n".join(m["body"].strip() for m in kept)
        p["heading_ids"] = merged_ids
        p["version_hash"] = "sha256:" + hashlib.sha256(p["body"].encode("utf-8")).hexdigest()
        stamps = [m["last_updated"] for m in members if m["last_updated"]]
        if stamps:
            p["last_updated"] = max(stamps)
        sections = extract_sections(p["body"], explicit_ids=merged_ids)
        # Positional zip is safe because concatenation preserves section order. The
        # length guard is a backstop: if joining ever shifts a boundary (say an
        # unbalanced code fence), keep the merged-body anchors instead of misaligning.
        if len(sections) == len(anchors):
            for sec, anchor in zip(sections, anchors):
                sec["anchor"] = anchor
        p["chunks"] = [chunk_row(source, p["page_id"], p["url"], p["title"],
                                 p["version_hash"], p["last_updated"], sec)
                       for sec in sections]

    return [p for p in pages if id(p) not in absorbed]


def process_page(path, docs_dir, variables, env, snippet_base, docs_base_url, source):
    """Resolve one markdown file to its cleaned body + metadata + feed rows."""
    with open(path, encoding="utf-8") as f:
        raw = f.read()
    fm, body, heading_ids = clean_body(raw, variables, env, snippet_base)
    route = compute_route(docs_dir, path)
    page_id = route.replace("/", "-").lower()
    title = fm.get("title") or page_id
    page_url = f"{docs_base_url.rstrip('/')}/{route}/"
    version_hash = "sha256:" + hashlib.sha256(body.encode("utf-8")).hexdigest()
    last_updated = git_last_updated(path)
    chunks = [chunk_row(source, page_id, page_url, title, version_hash, last_updated, sec)
              for sec in extract_sections(body, explicit_ids=heading_ids)]
    return {"fm": fm, "body": body, "route": route, "page_id": page_id, "title": title,
            "url": page_url, "version_hash": version_hash, "last_updated": last_updated,
            "heading_ids": heading_ids, "chunks": chunks}

# ----------------------------------------------------------------- main

def build(args):
    with open(args.vars, encoding="utf-8") as f:
        variables = yaml.safe_load(f) or {}
    env = Environment()
    with open(args.config, encoding="utf-8") as f:
        cfg = json.load(f)
    excl = cfg.get("content", {}).get("exclusions", {})
    skip_base = set(excl.get("skip_basenames", [])) | DEFAULT_EXCLUDE_BASENAMES
    skip_paths = excl.get("skip_paths", [])
    docs_base_url = cfg.get("project", {}).get("docs_base_url", "https://docs.polkadot.com/")

    processed = []
    for path in iter_markdown(args.docs):
        rel = os.path.relpath(path, args.docs)
        if os.path.basename(path) in skip_base or any(sp in rel.split(os.sep) for sp in skip_paths):
            continue
        processed.append(process_page(path, args.docs, variables, env, args.snippets,
                                      docs_base_url, args.source))

    rows = []
    for page in merge_toggle_variants(processed, args.source):
        rows.extend(page["chunks"])
    with open(args.out, "w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    pages = len({r["page_id"] for r in rows})
    print(f"wrote {args.out}: {len(rows)} chunks across {pages} pages")
    return rows


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    root = os.path.dirname(here)
    ap = argparse.ArgumentParser()
    ap.add_argument("--docs", default=os.path.join(root, "docs"))
    ap.add_argument("--vars", default=os.path.join(root, "docs", "variables.yml"))
    ap.add_argument("--snippets", default=os.path.join(root, "docs", ".snippets"))
    ap.add_argument("--config", default=os.path.join(root, "llms_config.json"))
    ap.add_argument("--source", default="polkadot-docs")
    ap.add_argument("--out", default=os.path.join(here, "llms-full.new.jsonl"))
    args = ap.parse_args()
    build(args)
