#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Sync the demo copy of 25maths-games-legends into the upstream repo.

Default is DRY-RUN. Use --apply to actually write changes.

Usage:
  scripts/sync-legends-demo-to-upstream.sh [--apply] [--delete] [--source DIR] [--target DIR]

Options:
  --apply         Apply changes (default: dry-run)
  --delete        Also delete files in target that don't exist in source (off by default)
  --source DIR    Source directory (default: <repo>/25maths-games-legends)
  --target DIR    Target directory (default: /Users/zhuxingzhe/Project/ExamBoard/25maths-games-legends)
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

MODE="dry-run"
DO_DELETE="0"
SRC="${REPO_ROOT}/25maths-games-legends"
DST="/Users/zhuxingzhe/Project/ExamBoard/25maths-games-legends"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply)
      MODE="apply"
      shift
      ;;
    --dry-run)
      MODE="dry-run"
      shift
      ;;
    --delete)
      DO_DELETE="1"
      shift
      ;;
    --source)
      SRC="${2:-}"
      shift 2
      ;;
    --target)
      DST="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

SRC="${SRC%/}/"
DST="${DST%/}/"

if [[ ! -d "$SRC" ]]; then
  echo "Source not found: $SRC" >&2
  exit 1
fi
if [[ ! -d "$DST" ]]; then
  echo "Target not found: $DST" >&2
  exit 1
fi
if [[ ! -d "${DST}.git" ]]; then
  echo "Warning: target does not look like a git repo (missing .git): $DST" >&2
fi

RSYNC_ARGS=(
  -av
  --no-owner
  --no-group
  --itemize-changes
  --exclude ".git/"
  --exclude "node_modules/"
  --exclude "dist/"
  --exclude "output/"
  --exclude ".DS_Store"
  --exclude ".env.local"
)

if [[ "$MODE" == "dry-run" ]]; then
  RSYNC_ARGS=(-n "${RSYNC_ARGS[@]}")
fi
if [[ "$DO_DELETE" == "1" ]]; then
  RSYNC_ARGS+=(--delete-after)
fi

echo "Source: $SRC"
echo "Target: $DST"
echo "Mode:   $MODE"
echo "Delete: $DO_DELETE"
echo
echo "Running:"
printf "rsync"
for arg in "${RSYNC_ARGS[@]}"; do printf " %q" "$arg"; done
printf " %q %q\n" "$SRC" "$DST"
echo

rsync "${RSYNC_ARGS[@]}" "$SRC" "$DST"

if [[ "$MODE" == "dry-run" ]]; then
  echo
  echo "Dry-run only. Re-run with --apply to write changes."
fi

