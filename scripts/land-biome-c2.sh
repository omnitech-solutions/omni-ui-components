#!/usr/bin/env bash
# Land C2: the repo-wide Biome reformat plus mechanical lint fixes, as ONE commit,
# then switch `verify` from `lint` to `check` (format enforced) as a second commit.
#
# Run it from a clean tree, in a quiet window, on the branch that will carry C2
# (after C1, the tooling commit, is on it). Open branches then absorb C2 with
# scripts/rebase-over-biome.sh.
#
#   scripts/land-biome-c2.sh
#   SKIP_SLOW=1 scripts/land-biome-c2.sh   # skip typecheck/tests/storybook/visual (script testing only)
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
export LEFTHOOK=0 # never run git hooks for these commits

if [ -n "$(git status --porcelain)" ]; then
  echo "error: working tree is not clean; commit or stash first" >&2
  exit 1
fi

step() { printf '\n==> %s\n' "$*"; }
slow() { if [ "${SKIP_SLOW:-0}" = "1" ]; then echo "(skipped: SKIP_SLOW=1) $*"; else "$@"; fi; }

step "1/6 format the whole repo"
pnpm exec biome format --write .

step "2/6 mechanical lint fixes (unused imports, import type)"
pnpm exec biome lint --write --unsafe \
  --only=correctness/noUnusedImports --only=style/useImportType

step "3/6 safe fixes and import sorting"
pnpm exec biome check --write .

step "4/6 the tree must now pass biome check with no errors"
pnpm exec biome check .

step "5/6 typecheck before committing"
slow pnpm typecheck

step "6/6 commit C2"
git add -A
if git diff --cached --quiet; then
  echo "nothing to commit: the tree is already formatted" >&2
  exit 1
fi
git commit -q -m "style: biome format and mechanical lint fixes across the repo

Pure formatting (biome format --write), plus noUnusedImports and
useImportType autofixes and import sorting. No behavior change.
Add this commit to .git-blame-ignore-revs.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
C2_SHA="$(git rev-parse HEAD)"

step "verify uses check (format enforced) from now on"
node -e "
const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));
p.scripts.verify=p.scripts.verify.replace('pnpm lint &&','pnpm check &&');
fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n');"
git diff --stat package.json
slow pnpm verify
slow pnpm test:storybook --maxWorkers=2
slow pnpm test:visual

git add package.json
git commit -q -m "chore(tooling): verify enforces biome check (format) now that the tree is formatted

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"

step "done"
echo "C2 = $C2_SHA"
echo
echo "Next:"
echo "  1. echo '$C2_SHA' >> .git-blame-ignore-revs   (with a '# biome format' comment line)"
echo "     git config blame.ignoreRevsFile .git-blame-ignore-revs"
echo "  2. open branches: scripts/rebase-over-biome.sh <C1-sha> $C2_SHA"
