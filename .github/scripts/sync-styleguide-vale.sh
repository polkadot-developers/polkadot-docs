#!/usr/bin/env bash
# Sync canonical Vale rules and the PaperMoon vocab from the
# papermoonio/documentation-style-guide repository into this repo's
# styles/ directory. The synced files are gitignored — the canonical
# repo is the single source of truth.
#
# Usage:
#   ./.github/scripts/sync-styleguide-vale.sh           # sync from main
#   ./.github/scripts/sync-styleguide-vale.sh <ref>     # sync from a branch, tag, or sha
#
# Project-specific vocab (styles/config/vocabularies/Polkadot/) is
# managed in this repo and is NOT overwritten.

set -euo pipefail

REPO=papermoonio/documentation-style-guide
REF=${1:-main}

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT

echo "Cloning $REPO@$REF..."
git clone --depth=1 --branch="$REF" --quiet "https://github.com/$REPO" "$tmpdir/styleguide"

mkdir -p styles/PaperMoon styles/config/vocabularies/PaperMoon

cp "$tmpdir/styleguide"/styles/PaperMoon/*.yml styles/PaperMoon/
cp "$tmpdir/styleguide"/styles/config/vocabularies/PaperMoon/accept.txt \
   styles/config/vocabularies/PaperMoon/accept.txt

echo "Synced Vale rules and PaperMoon vocab from $REPO@$REF."
echo "Run 'vale .' to lint."
