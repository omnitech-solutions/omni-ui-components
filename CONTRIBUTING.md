# Contributing

## Setup

```sh
pnpm install --frozen-lockfile   # also runs `lefthook install` through the prepare script
```

Node 22+ and the pnpm version in `package.json` (`packageManager`).

## Git hooks (lefthook)

`pnpm install` installs the hooks via `"prepare": "lefthook install || true"`.

| Hook | What runs | Bypass |
|---|---|---|
| pre-commit | `biome check` on staged js/ts/tsx/json/jsonc/css files | `LEFTHOOK=0 git commit` |
| pre-push | `pnpm verify` | `LEFTHOOK=0 git push` |

Try a hook without committing: `pnpm hooks:run:pre-commit` or `pnpm hooks:run:pre-push`
(or `pnpm exec lefthook run pre-commit --no-auto-install --files path/to/file.ts`).

Git worktrees share one `.git/hooks`, and `lefthook install` writes the path of the
checkout it ran in into those hook files. If hooks point at a deleted worktree, rerun
`pnpm exec lefthook install` from the main checkout. CI sets `LEFTHOOK=0`.

## Format and lint (Biome)

Prettier is not used for the repo (it stays a dependency only because Storybook's source
snippets call it as a library).

| Command | Effect |
|---|---|
| `pnpm lint` | lint only; exits non-zero on errors (warnings are the backlog) |
| `pnpm lint:fix` | apply safe lint fixes |
| `pnpm format` | check formatting |
| `pnpm format:write` | format everything |
| `pnpm check` | lint + format + import sorting, the full Biome gate |
| `pnpm verify` | `pnpm check` + typecheck + unit tests with the coverage gate + build (the local and CI gate) |

Configuration lives in `biome.json`. Stories, factories, tests and `.storybook/**` have
relaxed rules via `overrides`. A set of judgement rules is temporarily `warn`; the list is in
`bionic/briefs/BRIEF-biome-rule-backlog.md`. Promote a rule to `error` once its findings
are fixed. CSS is linted but not formatted. The decision is ADR-0010.

## Tests and coverage

- `pnpm test` unit tests; `pnpm test:storybook` runs every story's `play` in Chromium;
  `pnpm test:visual` compares screenshots.
- `pnpm test:coverage` produces coverage with `@vitest/coverage-v8` and is part of `verify`:
  80% of lines, statements, branches and functions (`vitest.config.ts`). No coverage artifact
  is uploaded by CI.
- What each command proves and does not prove, and the parts every component must have
  (enforced by `packages/core/test/Tripwires/`): see the README, "How things are built here".
  The decisions: ADR-0017 (the gates), ADR-0011 (coverage), ADR-0012 (visual baselines),
  ADR-0015 (mandatory parts), all in `bionic/adrs/`.
- Publishing is the owner's alone (ADR-0013, `RELEASING.md`).

## The Biome reformat: C1, C2 and open branches

Both have landed on `master` (C2 is `2a91f90`, listed in `.git-blame-ignore-revs`); this
section is kept for a branch that still predates them.

- C1 (`chore(tooling)`) added the config, hooks and scripts without reformatting the tree.
- C2 is the one repo-wide reformat commit, produced by `scripts/land-biome-c2.sh`. It also
  switched `verify` to `pnpm check`. Run `git config blame.ignoreRevsFile .git-blame-ignore-revs`
  once so blame skips it.
- A branch from before C2 absorbs it without conflicts:

  ```sh
  git checkout my-branch
  scripts/rebase-over-biome.sh <C1-sha> <C2-sha>
  ```

  That script does a normal merge of C1, `git merge -s ours --no-commit <C2>`, formats the
  branch with Biome and commits the merge. Never use `-X ours` for this: it still applies
  C2's hunks and reintroduces conflicts. Do not rebase onto C2 by hand.
