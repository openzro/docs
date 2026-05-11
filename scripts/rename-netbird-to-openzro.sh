#!/usr/bin/env bash
# Rename every file and directory under public/docs-static/img whose name
# contains "netbird", replacing that substring with "openzro". Uses `git mv`
# so the rename is tracked in history.
#
# Run from the repo root: bash scripts/rename-netbird-to-openzro.sh

set -euo pipefail

ROOT="public/docs-static/img"

if [ ! -d "$ROOT" ]; then
  echo "error: $ROOT not found — run this script from the repo root" >&2
  exit 1
fi

# -depth ensures leaves are renamed before their parent directories,
# so renaming a parent dir doesn't invalidate the queued child paths.
find "$ROOT" -depth -name '*netbird*' -print0 |
while IFS= read -r -d '' path; do
  dir=$(dirname "$path")
  base=$(basename "$path")
  new_base=${base//netbird/openzro}
  new_path="$dir/$new_base"

  if [ "$path" = "$new_path" ]; then
    continue
  fi

  if [ -e "$new_path" ]; then
    echo "skip: destination already exists: $new_path" >&2
    continue
  fi

  echo "renaming: $path -> $new_path"
  git mv "$path" "$new_path"
done
