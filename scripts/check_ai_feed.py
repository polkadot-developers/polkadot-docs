#!/usr/bin/env python3
"""Validate the AI artifacts a `mkdocs build` just produced.

Runs against the real deploy output in `site/` — the feed `hooks/ai_feed.py`
wrote during the build — so the gate cannot drift from what actually ships (same
page set, resolved snippets, same macros env as production).

Three families of checks:

  Shape      the feed is not truncated, the row schema is intact, and no raw
             `--8<--` snippet directives or unresolved `{{ x | filter }}` template
             expressions leaked into the text.

  Links      every chunk `url` resolves to a page that was really built, and every
             chunk `anchor` exists as a heading id on that page. This is the check
             that catches the two ways anchors silently rot: a page whose HTML the
             build (or a plugin) removed after the feed was written, and an anchor
             slugified by a different algorithm than mkdocs' `toc` uses. Both
             shipped undetected before this existed.

  Artifacts  every per-page `.md` artifact has a sibling HTML page, and every
             `llms.txt` entry points at one. An artifact or index entry for a
             route that 404s is worse than a missing one: it advertises a dead URL
             to the agents that consume these files.

Usage:
    python scripts/check_ai_feed.py [site_dir]

Exits 1 with every failure listed, rather than dying on the first one, so a
single CI run tells you everything that needs fixing.
"""
import json
import os
import re
import sys
from urllib.parse import urlparse

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MIN_CHUNKS = 1500
MIN_PAGES = 180
REQUIRED_KEYS = {"source", "page_id", "url", "anchor", "page_version_hash",
                 "page_title", "title", "text"}

# Heading ids only: the feed anchors sections, so a chunk anchor that matches some
# unrelated id (an inline SVG's, say) is not a resolvable section link.
HEADING_ID_RE = re.compile(r'<h[1-6][^>]*\sid="([^"]+)"', re.IGNORECASE)
LLMS_TXT_ENTRY_RE = re.compile(r'^- \[[^\]]*\]\((\S+)\)\s*$', re.MULTILINE)
# Leaked mkdocs template filters. Targets the pipe so literals like
# `{{ $labels.instance }}` in a code sample do not false-positive.
LEAKED_TEMPLATE_RE = re.compile(r'\{\{[^}\n]*\|[^}\n]*\}\}')

MAX_REPORTED = 20


def base_path():
    """The URL path prefix the site is served under, so a docs_base_url with a
    subdirectory still maps onto `site/`."""
    try:
        with open(os.path.join(REPO_ROOT, "llms_config.json"), encoding="utf-8") as f:
            url = json.load(f).get("project", {}).get("docs_base_url", "")
        return urlparse(url).path.strip("/")
    except Exception:
        return ""


def route_of(url, prefix):
    """Map a feed URL to its route relative to the site root."""
    path = urlparse(url).path.strip("/")
    if prefix and (path == prefix or path.startswith(prefix + "/")):
        path = path[len(prefix):].strip("/")
    return path


def heading_ids(site_dir, route, cache):
    """Heading ids on a built page, or None when the page was not built."""
    if route not in cache:
        page = os.path.join(site_dir, *route.split("/"), "index.html") if route \
            else os.path.join(site_dir, "index.html")
        if os.path.exists(page):
            with open(page, encoding="utf-8") as f:
                cache[route] = set(HEADING_ID_RE.findall(f.read()))
        else:
            cache[route] = None
    return cache[route]


def check_shape(rows, raw, fail):
    pages = {r["page_id"] for r in rows}
    if len(rows) < MIN_CHUNKS:
        fail(f"chunk count collapsed: {len(rows)} < {MIN_CHUNKS}")
    if len(pages) < MIN_PAGES:
        fail(f"page count collapsed: {len(pages)} < {MIN_PAGES}")
    missing = REQUIRED_KEYS - set(rows[0]) if rows else REQUIRED_KEYS
    if missing:
        fail(f"schema regression, missing keys: {sorted(missing)}")
    if "--8<--" in raw:
        fail("unresolved --8<-- snippet directives in feed")
    leaked = LEAKED_TEMPLATE_RE.findall(raw)
    if leaked:
        fail(f"unresolved template filters leaked into feed: {leaked[:3]}")
    return len(rows), len(pages)


def check_links(rows, site_dir, prefix, fail):
    cache = {}
    dead_routes, bad_anchors = {}, []
    for r in rows:
        route = route_of(r["url"], prefix)
        ids = heading_ids(site_dir, route, cache)
        if ids is None:
            dead_routes.setdefault(route, 0)
            dead_routes[route] += 1
        elif r["anchor"] not in ids:
            bad_anchors.append((route, r["anchor"], r["title"]))

    for route, n in sorted(dead_routes.items()):
        fail(f"feed page was never built (404): /{route}/ — {n} chunk(s) point at it")
    for route, anchor, title in bad_anchors[:MAX_REPORTED]:
        fail(f"anchor missing from page: /{route}/#{anchor} (section {title!r})")
    if len(bad_anchors) > MAX_REPORTED:
        fail(f"...and {len(bad_anchors) - MAX_REPORTED} more missing anchors")
    return len(cache), len(dead_routes), len(bad_anchors)


def check_artifacts(site_dir, prefix, fail):
    orphans = 0
    for root, _, files in os.walk(site_dir):
        for name in files:
            if not name.endswith(".md"):
                continue
            path = os.path.join(root, name)
            if not os.path.exists(os.path.join(path[: -len(".md")], "index.html")):
                rel = os.path.relpath(path, site_dir)
                fail(f"orphan .md artifact, no page to go with it: /{rel}")
                orphans += 1

    txt = os.path.join(site_dir, "llms.txt")
    entries = missing = 0
    if not os.path.exists(txt):
        fail("llms.txt was not generated")
        return orphans, entries, missing
    with open(txt, encoding="utf-8") as f:
        urls = LLMS_TXT_ENTRY_RE.findall(f.read())
    entries = len(urls)
    if not entries:
        fail("llms.txt lists no pages")
    cache = {}
    for url in urls:
        route = route_of(url, prefix)
        if heading_ids(site_dir, route, cache) is None:
            fail(f"llms.txt lists a page that was never built: {url}")
            missing += 1
    return orphans, entries, missing


def main(argv):
    site_dir = argv[1] if len(argv) > 1 else "site"
    if not os.path.isdir(site_dir):
        print(f"error: no such site directory: {site_dir}", file=sys.stderr)
        print("build it first: mkdocs build -d site", file=sys.stderr)
        return 2

    feed = os.path.join(site_dir, "ai", "llms-full.jsonl")
    if not os.path.exists(feed):
        print(f"error: feed not found: {feed}", file=sys.stderr)
        return 2
    with open(feed, encoding="utf-8") as f:
        raw = f.read()
    rows = [json.loads(line) for line in raw.splitlines() if line.strip()]
    if not rows:
        print("error: feed is empty", file=sys.stderr)
        return 1

    failures = []
    def fail(msg):
        failures.append(msg)

    prefix = base_path()
    n_chunks, n_pages = check_shape(rows, raw, fail)
    n_routes, n_dead, n_bad = check_links(rows, site_dir, prefix, fail)
    n_orphans, n_entries, n_missing = check_artifacts(site_dir, prefix, fail)

    if failures:
        print(f"AI feed check FAILED — {len(failures)} problem(s):\n", file=sys.stderr)
        for msg in failures:
            print(f"  ✖ {msg}", file=sys.stderr)
        print("\nIf anchors are the problem, generator/generate_feed.py must slugify and\n"
              "dedupe exactly as markdown.extensions.toc does — see slugify_anchor and\n"
              "unique_anchor. If whole pages are missing, a plugin removed the HTML after\n"
              "the feed was written (page_toggle does this to non-canonical variants).",
              file=sys.stderr)
        return 1

    print(f"AI feed OK: {n_chunks} chunks / {n_pages} pages, schema intact, "
          "no raw snippets or template leaks")
    print(f"  links:     {n_routes} routes resolved, {n_dead} dead, {n_bad} bad anchors")
    print(f"  artifacts: {n_orphans} orphan .md, {n_entries} llms.txt entries, "
          f"{n_missing} unbuilt")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
