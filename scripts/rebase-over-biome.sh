#!/usr/bin/env bash
# Bring an open branch over the Biome reformat (C2) without conflicts.
#
#   scripts/rebase-over-biome.sh <C1> <C2>
#
# C1 = the tooling commit (biome.json, lefthook, scripts); C2 = the repo-wide
# reformat commit printed by scripts/land-biome-c2.sh. Run it on the open branch
# with a clean tree.
#
# Recipe (tested):
#   1. normal merge of C1            : takes the config; code is untouched so it is clean
#   2. merge -s ours --no-commit C2  : records C2 as an ancestor WITHOUT taking its content
#                                      (never -X ours: that would still apply C2's hunks)
#   3. biome format + the C2 autofixes on the branch's own code
#   4. one merge commit
# History then contains C2, so later merges from the integration branch do not
# conflict on formatting, and git blame can skip C2 via .git-blame-ignore-revs.
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "usage: $0 <C1> <C2>" >&2
  exit 2
fi
cd "$(git rev-parse --show-toplevel)"
export LEFTHOOK=0

C1="$(git rev-parse --verify "$1^{commit}")"
C2="$(git rev-parse --verify "$2^{commit}")"

if [ -n "$(git status --porcelain)" ]; then
  echo "error: working tree is not clean" >&2
  exit 1
fi
if ! git merge-base --is-ancestor "$C1" "$C2"; then
  echo "error: C1 ($C1) is not an ancestor of C2 ($C2)" >&2
  exit 1
fi
if git merge-base --is-ancestor "$C2" HEAD; then
  echo "error: this branch already contains C2" >&2
  exit 1
fi

step() { printf '\n==> %s\n' "$*"; }

step "1/4 merge C1 (tooling) normally"
if ! git merge-base --is-ancestor "$C1" HEAD; then
  git merge --no-edit -m "merge: biome tooling (C1) into $(git rev-parse --abbrev-ref HEAD)" "$C1"
else
  echo "branch already contains C1"
fi

# The install must match C1's lockfile/deps so `pnpm exec biome` exists.
step "2/4 record C2 as merged, keeping this branch's content"
git merge -s ours --no-commit "$C2"

step "3/4 format this branch's code with the same commands as C2"
pnpm exec biome format --write .
pnpm exec biome lint --write --unsafe \
  --only=correctness/noUnusedImports --only=style/useImportType
pnpm exec biome check --write .

step "4/4 commit the merge"
git add -A
git commit -q -m "merge: biome reformat (C2) into $(git rev-parse --abbrev-ref HEAD)

Merged with -s ours, then reformatted with biome, so this branch's own
changes are formatted and no conflicts arise from C2."
echo
echo "done: $(git rev-parse --short HEAD) (parents: $(git rev-list --parents -n1 HEAD | cut -d' ' -f2- | tr ' ' ','))"
echo "check: pnpm exec biome check . && pnpm verify"
