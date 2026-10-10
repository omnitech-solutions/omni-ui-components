# Preamble for every delegated worker (read this fully, then your unit in `lib-work-units.md`)

You are one worker on `omni-ui-components` (`@oc-tech/omni-ui-components`, React + Tailwind 4 + cva + Radix, pnpm
monorepo; source in `packages/core/src/<Component>/`). Your unit is self-contained: do it, prove it, report. You do not need
any other context than this file and your unit. Make no changes outside your unit's "Owns" list except the small additive
edits to shared files described in section 3.

## 1. Git workflow

- The orchestrator created an integration branch `lib-completion` from `master`. Create `lib/<unit-id>-<slug>` from it (your
  own worktree/clone if you can), commit in small steps with message style `feat(x): ...` / `fix(x): ...` and the trailer the
  session gives you, and open a PR **into `lib-completion`** (never into `master`).
- **Never push to `master`. Never publish to npm. Never edit** Crux or `.claude` configuration, `.gitignore` (the
  `!packages/core/src/Icon/` re-include must stay: a common global gitignore line `Icon` otherwise hides that folder), the
  lockfile by hand, or any file listed under another unit's "Owns".
- Use `/bin/rm -f` (not plain `rm`), give `rg` an explicit path, and wrap long shell commands with
  `perl -e 'alarm N; exec @ARGV' ...` (macOS has no `timeout`; on Linux use `timeout`).

## 2. Conventions (binding; reviewers check every one)

1. **Props only.** No React context bus, no `Assistant` root, no app/server types. Names never contain `Assistant`.
2. **One folder per component**: `X.tsx`, `X.types.ts`, `X.variants.ts` (cva), `X.factories.tsx` (demos, props factories;
   lucide icons live here only), `X.stories.tsx`, `index.ts`; tests in `packages/core/test/<X>/`; a row in
   `.storybook/getting-started/ComponentOverview.stories.tsx`; export in `packages/core/src/index.ts`. Style: single quotes,
   width 150.
3. **Icons are `ReactNode` props.** Every user-visible string goes through a `labels` prop with exported `DEFAULT_<X>_LABELS`.
4. **Callbacks are plain optional props named `on` + Verb**, receiving the **full item by reference** first and context after
   (`onOpen(conversation)`, `onToggle(integration, enabled)`); value callbacks receive the value. A callback may return a
   promise; the component ignores it. **No pending state, no `onError`, no async helper** (one was removed on the owner's
   instruction: do not reintroduce it).
5. **An absent callback means the control that exists for it is not rendered.**
6. **List-like components are generic over an extendable base item type** (`X<T extends XItem = XItem>`); items pass
   through untouched; test with an extended item asserting `toBe` the original and (type-level) that extra fields are visible.
7. **Controlled and uncontrolled** state via `lib/use-controllable-state.ts`; the change callback always fires.
8. **Styling only through `--oui-*` tokens** (`styles/tokens.css`, light and dark). See-through backgrounds use
   `color-mix(... var(--oui-panel-see-through, 1) ...)` on backgrounds only; text and icons stay opaque. Respect
   `prefers-reduced-motion`.
9. **Storybook docs are not Markdown.** `parameters.docs.description` supports only `` `inline code` ``,
   `<primary>emphasis</primary>` and `<code>signature</code>`: no tables, bold, italics or line breaks.
10. **Story files must be syntactically valid at every save.** One parse error makes Storybook's indexer cache the failure
    and every story time out until the server restarts. Parse-check with
    `pnpm exec esbuild <file> --loader:.tsx=tsx --log-level=error` before moving on.
11. Keep or improve accessibility: roles, names, focus return, keyboard. Anything you add is tested.

## 3. Shared files and merge rule

These files are touched by many units: `packages/core/src/index.ts`, `.storybook/getting-started/ComponentOverview.stories.tsx`,
`packages/core/src/styles/tokens.css`, `packages/core/package.json`, `bionic/journal/2026-10.md`,
`bionic/research/references/native-app-control-variations.md`. Make **small additive edits only** (append a line or a row;
re-read the file immediately before editing; never reformat or reorder). On a merge conflict in these files, **keep both
sides**. For `pnpm-lock.yaml`: take the base version and re-run `pnpm install`. Never rewrite a shared file wholesale.

## 4. How to verify (do all of it, then say what you did)

- Gate: `pnpm verify` at the repo root (lint, typecheck, tests, build) must be green before every PR. One directory:
  `cd packages/core && pnpm exec vitest run --config ../../vitest.config.ts test/<Dir>`. (Baseline at `eabe37c`: 173 test
  files, 1,405 tests.)
- **Storybook on your own port** (never share a server): `pnpm exec storybook dev -p <PORT> --ci --no-open`, where PORT is the
  one your unit names. If `/index.json` is 200 but stories time out, restart it.
- **Render and drive.** Headless Playwright: `waitUntil: 'domcontentloaded'` (never `networkidle`), then
  `waitForSelector('#storybook-root > :not(style)', { state: 'attached' })`; add the init script
  `window.__name=function(f){return f};`; check **0 console errors in dark and light** (`&globals=theme:dark`); iframe URL
  `/iframe.html?id=<story-id>&viewMode=story`. Then drive the interaction yourself (click, keyboard, hover, Esc, focus) and
  read computed styles; a story's own `play` function is not proof. Read focus a beat after Esc (Radix restores it
  asynchronously).
- Compare against the designer boards in `bionic/research/design/native-panel-cleanup/` (`board-1a/1c/1d/1e.png`, brief in
  `brief-T-M-F.md`) whenever your unit touches the Native App set.

## 5. Report format (your final message, plain text)

1. What you changed (files). 2. `pnpm verify` result with counts. 3. What you **drove by hand** and observed (and what you
only tested). 4. Anything you could not close, deviations, and **questions for the owner** (publish, a visual choice, the
meaning of a width). 5. Follow-ups you noticed but did not do. Be honest: say what is unverified.

## 6. Stop rules

If a unit's acceptance cannot be met, stop at a consistent state (green gate, nothing half-done), write why, and report. Do
not widen scope, do not "fix" other units' files, do not skip a failing test.
