---
type: objectives
format_version: "1"
maturity: exploring
owner: "desoleary"
reviewed_at: 2026-10-05
review_every_days: 90
---

# Objectives for omni-ui-components

## Mission

Give the applications of Omni Technology Solutions, OmniTech Studio first, one generic, typed, token-themed and accessible React component library that they build their screens from exclusively, so an app holds data and composition and no custom CSS or hand-built control. It does this well when a screen is library parts plus data, a missing part is added to the library first and re-vendored, and every part arrives with its stories, tests and documentation.

## Goals

### OBJ-1 — An app is built from the library exclusively
- **kind:** utility
- **statement:** A developer builds every screen of a consuming app from library components alone, with no custom CSS and no hand-written control where a library part exists.
- **measure:** Custom CSS rules and hand-written `<input>`, `<textarea>`, `<select>` and `<button>` elements in OmniTech Studio's web app: target 0. On 2026-10-10 the Studio had 82 hand-written form elements in 28 files (`BRIEF-dynamic-form-widget-coverage`, section G); its custom CSS is uncounted.
- **status:** active

### OBJ-2 — Forms come from a schema
- **kind:** utility
- **statement:** A developer renders and validates a complete form from a JSON Schema through the `dynamic-form` entry point, and every value-holding component of the library is available to it as a widget.
- **measure:** Value-holding components reachable from a schema: 21 of 30 on 2026-10-10, target 30 of 30 (ADR-0019). Widgets with a test that names them: 14 of 26 (the tripwire allow-list holds the other 12), target 26 of 26. Use by a consuming app: none yet (the Studio does not use `DynamicForm`).
- **status:** active

### OBJ-3 — Usable with a keyboard and a screen reader
- **kind:** ux
- **statement:** A keyboard-only or screen-reader user can operate every component, and an accessibility regression cannot land unnoticed.
- **measure:** Stories failing the axe check at WCAG AA in the Storybook test run: 102 of 862 on 2026-10-10 (dark theme), target 0 beyond the one recorded exception (ADR-0006). The check becomes a gate with an allow-list (ADR-0022); until that lands nothing fails a build. Manual keyboard and screen-reader audits, and the light theme in the test run, are unmeasured.
- **status:** active

### OBJ-4 — Install, import, and it looks right
- **kind:** ease-of-use
- **statement:** A consumer adds one package to a React 18.3 or 19 app, imports a component, and sees it correctly styled inside its own CSS with no extra build or style configuration.
- **measure:** `test:isolation` proves the built stylesheet inside a host with its own CSS, but is not part of `verify`. One real consumer (OmniTech Studio, by vendored tarball). The README quick start has never been exercised in a clean React 18 and React 19 app: unmeasured.
- **status:** active

### OBJ-5 — Theme once, everything follows
- **kind:** ux
- **statement:** A consumer switches between light and dark on any subtree and sets brand tokens once, and every component follows with no unthemed surface.
- **measure:** `test/Theming/themeContract.test.ts` holds the token contract and `pnpm test:visual` compares 10 Native App captures in both themes. A per-component theme check does not exist, and nothing keeps `theme-contract.md` equal to `tokens.css`: both unmeasured.
- **status:** active

### OBJ-6 — Learn a component without reading its source
- **kind:** ease-of-use
- **statement:** A developer learns how to use any component, including its props and states, from its Storybook page and the code that page shows.
- **measure:** Of 129 exported components (130 folders; `Theming` is stories only): 128 have stories and a Docs page (Highlight has none), 120 have a `Default` story, 119 have a test file. Target: all 129 on each count. Whether the docs answer real questions is unmeasured.
- **status:** active

### OBJ-7 — Only verified versions are published
- **kind:** delivery
- **statement:** Every version a consumer installs, from npm or from a vendored tarball, has passed the whole gate, and the consumer can see what changed since the last one.
- **measure:** CI runs `pnpm verify` (Biome, typecheck, unit tests with an 80% coverage gate, build), the Storybook build, `test:storybook` and `test:visual` on every push and pull request; `CHANGELOG.md` records each version. Publishing is manual and by the owner, and `prepublishOnly` runs typecheck and build only, so the gate before a publish rests on `RELEASING.md` being followed: unenforced.
- **status:** active

### OBJ-8 — A component knows nothing about the app that uses it
- **kind:** utility
- **statement:** A second app can use any component unchanged, because no component carries app wording, app or server types, navigation, fetching or uploading.
- **measure:** unmeasured. The rule is ADR-0001 and is checked in review; no automated check exists, and a second consuming app has not yet adopted the library.
- **status:** active

### OBJ-9 — Every component arrives complete
- **kind:** delivery
- **statement:** A developer can rely on every component and widget having its stories, `Default` story, Docs page, test, overview row and public export, with interactions exercised by a `play` function and stories built from the shared factories.
- **measure:** Lines in `packages/core/test/Tripwires/componentParts.allowlist.ts`, which `pnpm verify` holds exact: 79 on 2026-10-10 (31 for missing parts, 48 for `play` functions and factories). Target 0; a new component adds none.
- **status:** active

### OBJ-10 — A missing part is added to the library first
- **kind:** delivery
- **statement:** When an app needs a part the library lacks, the developer gets it by extending the library and re-vendoring, never by building it in the app.
- **measure:** unmeasured. The proxy is OBJ-1's count not rising, and the consumer's vendored tarball being a build that passed `pnpm verify`.
- **status:** active

### OBJ-11 — Tables come from columns and data
- **kind:** utility
- **statement:** A developer renders a sortable, filterable, editable or virtualised table from typed column definitions and row data, without writing table markup.
- **measure:** The Table test suites and stories pass and Table has its own overview page. Use by a consuming app is unmeasured.
- **status:** active

## Shifts

_Newest first. Append a row whenever the mission or a goal changes; never rewrite history above._

| date | shifted | from | to | why |
|------|---------|------|----|-----|
| 2026-10-10 | OBJ-11 | (none) | Tables come from columns and data | Owner: data-driven tables are a goal of their own, beside schema-driven forms. |
| 2026-10-10 | OBJ-10 | (none) | A missing part is added to the library first | Owner's rule of 2026-10-08 (library first, then re-vendor), until now written only in the consuming app. |
| 2026-10-10 | OBJ-9 | (none) | Every component arrives complete | Owner: mandatory parts are enforced by tripwires; `Default`, `play` functions and factories are now checked. |
| 2026-10-10 | OBJ-8 | (none) | A component knows nothing about the app that uses it | Owner: the component philosophy (generic, typed, prop-driven) is a goal, not only a convention. |
| 2026-10-10 | OBJ-7 | "There is no CI and no changelog" | CI runs the whole gate and a changelog exists; the open gap is the manual publish | The measure was stale against `.github/workflows/verify.yml` and `CHANGELOG.md`. |
| 2026-10-10 | OBJ-6 | 85 components, 71 with tests | 129 exported components, counted per part | The counts were stale (audit brief C.1). |
| 2026-10-10 | OBJ-5 | "no visual-regression or per-component theme check" | The theme contract test and 10 visual captures exist; per component still none | The measure was stale. |
| 2026-10-10 | OBJ-3 | The a11y check "runs at `test: 'error'`" | It ran in no gate; it becomes one with an allow-list (ADR-0022), measured at 102 of 862 | The check was configured and never executed by the test run (audit brief K). |
| 2026-10-10 | OBJ-2 | Tests pass for every registered widget | Every value-holding component has a widget; measured 21 of 30 | Owner's decision of 2026-10-10 (ADR-0019): every form-usable component gets a shallow widget. |
| 2026-10-10 | OBJ-1 | Cover the screens teams build; 85 components, unmeasured | An app is built from the library exclusively; measured in the consumer | Owner: consumers build from the library only, with no custom CSS. |
| 2026-10-10 | mission | One dependable library so teams ship consistent screens without rebuilding primitives | Apps build their screens from the library exclusively; a missing part is added to the library first | Owner's instruction to rewrite the objectives to the project's real goals. |
