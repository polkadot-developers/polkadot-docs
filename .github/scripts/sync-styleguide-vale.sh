#!/usr/bin/env bash
# Sync canonical Vale rules and the style guide vocab from the
# paritytech/documentation-style-guide repository into this repo's
# styles/ directory. The synced files are vendored (committed); run this
# to refresh them, then review and commit the result.
#
# Usage:
#   ./.github/scripts/sync-styleguide-vale.sh           # sync from main
#   ./.github/scripts/sync-styleguide-vale.sh <ref>     # sync from a branch, tag, or sha
#
# Upstream still ships its Vale style as `PaperMoon`; it is copied here
# as `StyleGuide`. Override the upstream name with UPSTREAM_STYLE if the
# fork renames it.
#
# Project-specific vocab (styles/config/vocabularies/Polkadot/) is
# managed in this repo and is NOT overwritten.

set -euo pipefail

REPO=paritytech/documentation-style-guide
REF=${1:-main}
UPSTREAM_STYLE=${UPSTREAM_STYLE:-PaperMoon}
LOCAL_STYLE=StyleGuide

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT

echo "Cloning $REPO@$REF..."
git clone --depth=1 --branch="$REF" --quiet "https://github.com/$REPO" "$tmpdir/styleguide"

mkdir -p "styles/$LOCAL_STYLE" "styles/config/vocabularies/$LOCAL_STYLE"

cp "$tmpdir/styleguide/styles/$UPSTREAM_STYLE"/*.yml "styles/$LOCAL_STYLE/"
cp "$tmpdir/styleguide/LICENSE" "styles/$LOCAL_STYLE/LICENSE"
cp "$tmpdir/styleguide/styles/config/vocabularies/$UPSTREAM_STYLE/accept.txt" \
   "styles/config/vocabularies/$LOCAL_STYLE/accept.txt"

echo "Synced Vale rules and vocab from $REPO@$REF into styles/$LOCAL_STYLE/."
echo "Update the source commit in styles/$LOCAL_STYLE/VENDORED.md, then run 'vale .' to lint."
