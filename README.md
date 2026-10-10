# @oc-tech/omni-ui-components

React UI components from Omni Technology Solutions.

```sh
pnpm add @oc-tech/omni-ui-components
```

```tsx
import { Button } from '@oc-tech/omni-ui-components';

export function Example() {
  return <Button>Continue</Button>;
}
```

React 18.3+ or React 19 is required.

## Install and import

The main entry point holds every component, hook and type, and includes the styles:

```tsx
import { Button } from '@oc-tech/omni-ui-components';
```

Stylesheet only (for example from a global CSS file):

```css
@import '@oc-tech/omni-ui-components/styles.css';
```

Four more entry points (`exports` in `packages/core/package.json`):

| Import | Holds |
|---|---|
| `@oc-tech/omni-ui-components/dynamic-form` | `DynamicForm` and its registries (`appWidgets`, `appFields`, `appTemplates`): forms from a JSON Schema |
| `@oc-tech/omni-ui-components/native` | the native-app control set; pulls in no markdown or highlighting engine |
| `@oc-tech/omni-ui-components/chat` | every chat part (transcript, composer, markdown, diff review, panels) |
| `@oc-tech/omni-ui-components/highlight` | the code highlighter (grammars are created on first use) |

What each entry weighs: [`bionic/research/references/bundle-weight.md`](bionic/research/references/bundle-weight.md).
How the stylesheet behaves inside a host with its own CSS:
[`bionic/research/references/css-delivery.md`](bionic/research/references/css-delivery.md).

## How things are built here

Each rule below names where it is written down. Only one ADR exists (`ADR-0000`, "record decisions as ADRs"), so
today the sources are reference pages, the changelog, the journal and the worker conventions in the inbox. Which of
these should become ADRs is listed in
[`bionic/briefs/BRIEF-bionic-docs-and-skills-audit.md`](bionic/briefs/BRIEF-bionic-docs-and-skills-audit.md).
The mission and goals (OBJ-1 to OBJ-7) are in [`bionic/objectives.md`](bionic/objectives.md): read it first.

### What a component is, and is not

A component is:

- **Generic.** Props only: no React context bus, no app or server types, no domain wording in names, stories or
  example data. A list-like component is generic over an extendable base item (`X<T extends XItem = XItem>`); items
  pass through untouched and reach every callback by reference.
- **Typed.** Exported prop types; callbacks are plain optional props named `on` + verb, receiving the full item
  first. An absent callback means its control is not drawn. State works controlled and uncontrolled through
  `lib/use-controllable-state.ts`, and the change callback always fires.
- **Themed by tokens.** Styling goes through `--oui-*` tokens (`packages/core/src/styles/tokens.css`, a light and a
  dark value), never a hard-coded colour. Icons are `ReactNode` props; every visible string goes through a `labels`
  prop.
- **Accessible.** Roles, names, focus return and keyboard are part of the component, and are tested (OBJ-3).

A component is not: a place for app knowledge, a wrapper that only one screen can use, or something a consumer
restyles. **A consuming app writes no custom CSS for library parts** and no markup where a library part exists; when
a part is missing, the library is extended first (see "Library first, then re-vendor").

Sources: [`bionic/inbox/lib-delegate-preamble.md`](bionic/inbox/lib-delegate-preamble.md) section 2 (the eleven
binding conventions),
[`native-app-control-variations.md`](bionic/research/references/native-app-control-variations.md) (callback and
item conventions), [`theme-contract.md`](bionic/research/references/theme-contract.md) (every token, per-subtree
theming, the see-through contract). The no-custom-CSS and library-first rules are the owner's (2026-10-08) and
were, until this README, written only in the consuming app.

### Folder and file layout

```
packages/core/src/<Name>/
  <Name>.tsx              the component
  <Name>.types.ts         its public types
  <Name>.variants.ts      cva variants, when it has any
  <Name>.factories.tsx    props factories and examples written as a consumer writes them
  <Name>.stories.tsx      its stories and its Docs page
  index.ts                the folder's one public entry
packages/core/test/<Name>/<Name>.test.tsx
```

Plus one line in `packages/core/src/index.ts` and one row in
`.storybook/getting-started/ComponentOverview.stories.tsx`. Shared code lives in `packages/core/src/lib`; the
shadcn primitives in `packages/core/src/components/ui` are internal and are not exported.

### The mandatory parts of every component

Enforced by `packages/core/test/Tripwires/componentParts.test.ts`, which runs in `pnpm verify`. The list of
components is read from `packages/core/src/index.ts` (every PascalCase folder it re-exports), not kept by hand.

| Part | Rule |
|---|---|
| Stories | `<Name>/**/*.stories.tsx` with at least one story, and a story named `Default` |
| Docs page | the stories' meta carries `tags: ['autodocs']`; the page is drawn by the shared `DocsPage` |
| Test | at least one `packages/core/test/<Name>/**/*.test.ts(x)` |
| Public export | a folder that holds component source is re-exported from `packages/core/src/index.ts` |
| Overview row | named in `SECTIONS` of `Getting Started/Component Overview` (Table has its own overview page) |

Not checked by the tripwire, and still expected of every new or changed component:

- **A factories file**, with examples that are real consumer code: a type that extends the library's, typed data,
  state and typed callbacks, composed from library parts, generic names. No `XDemo` wrapper, no `onAction`.
- **The shared example frame and Show code / Copy code.** Every story is drawn in `ExampleFrame`
  (`.storybook/internal/support`), on by default; a story does not draw its own code panel. Pass
  `parameters: exampleDocs(factories, 'ExampleName')` so the code shown is the code that runs. Opt out only for a
  full-page story (`parameters.example = { frame: false }`).
- **A component description** (`parameters.docs.description.component`). It is not Markdown: only `` `code` ``,
  `<primary>…</primary>` and `<code>…</code>`.
- **A `play` function** on a story for each interaction worth keeping (`pnpm test:storybook` runs them).
- **Tokens** for every colour and size, declared for both themes, with a row in `theme-contract.md`.
- **Coverage**: 80% of lines, statements, branches and functions over `packages/core/src` (`vitest.config.ts`).
- **A `CHANGELOG.md` entry** under "Unreleased", and a journal entry in `bionic/journal/` (the `log-work` skill).

Components that miss a checked part today are written down in one file,
`packages/core/test/Tripwires/componentParts.allowlist.ts` (name, what is missing, since when). A new component is
never added to it; a line is deleted when its debt is paid, and the test fails for a line that is no longer needed.

Sources: [`BRIEF-storybook-audit.md`](bionic/briefs/BRIEF-storybook-audit.md) ("Result": one renderer, real code,
a docs page for every title), `CHANGELOG.md` ("Storybook"), `bionic/journal/2026-10.md`.

### A dynamic-form widget

A widget adapts one library control to RJSF. It holds no styling and no state of its own.

1. `packages/core/src/dynamic-form/widgets/<Name>Widget/<Name>Widget.tsx`: takes `WidgetProps`, renders the
   library primitive, and reports changes through `useStableRjsfCallbacks`. `index.ts` re-exports it.
2. Register it in `packages/core/src/dynamic-form/registries/widgets.ts` under its `ui:widget` key and its own name
   (`switch: SwitchWidget, SwitchWidget`). `appWidgets` is exported from the `dynamic-form` entry point.
3. `<Name>Widget.factories.ts`: fixtures (`FormFixture`: schema, uiSchema, zod schema, defaults).
4. `<Name>Widget.stories.tsx`: built with `defineDynamicFormStories`, title `dynamic-form/widgets/<Name>Widget`,
   `tags: ['autodocs']`.
5. `packages/core/src/dynamic-form/test/DynamicForm.<widget>.test.tsx`: renders a form through
   `renderDynamicForm`, selects the widget, and asserts what is submitted. The file names the widget.

The same tripwire checks 2, 4 and 5 for every folder under `widgets/` and every widget the registry imports.
Fields (`registries/fields.ts`) and templates (`registries/templates.ts`) are registered the same way (OBJ-2).

### Library first, then re-vendor

When an app needs a part the library does not have:

1. Ask what the part is made of. Build it here from existing library parts, export its sub-parts, keep it generic.
2. Give it every mandatory part above. `pnpm verify`, and `pnpm test:storybook` when stories changed.
3. Pack it: `cd packages/core && pnpm pack --pack-destination <app>/vendor/omni-ui-components`
   (`pack` does not build: `pnpm verify` has just done so).
4. In the app: `pnpm install`, then the app's own gate. The app's `vendor/README.md` is the record of its side.

Publishing to npm is done by the owner only: [`RELEASING.md`](RELEASING.md).

### Commands: what each proves, and what it does not

| Command | Proves | Does not prove |
|---|---|---|
| `pnpm verify` | Biome (lint, format, imports), typecheck of `packages/core/src`, every unit test in happy-dom with the 80% coverage gate, the build, and the mandatory-parts tripwire | Nothing in a real browser. Stories are not run. Test, story and factories files are not typechecked. No accessibility check |
| `pnpm test:storybook` | Every story renders in real Chromium and every `play` function passes (862 stories) | **Accessibility: the a11y check does not run here** (see below). Only the dark theme. No pixels |
| `pnpm test:visual` | 10 captures of the Native App stories match their baselines, dark and light | Any other component. Baselines are per platform |
| `node scripts/storybook-inventory.mjs` | Against a running Storybook (`--base`, default `http://localhost:6006`): every entry loads, with console errors, layout facts and captures. `--a11y --theme dark\|light` records every accessibility violation node by node; `--sources` what "Show code" shows | It is a report, not a gate: it never fails a build. It starts no server |
| `pnpm --filter @oc-tech/omni-ui-components test:isolation` | The built stylesheet inside a host with its own CSS | Not part of `verify` |

CI (`.github/workflows/verify.yml`) runs `verify`, `storybook:build`, `test:storybook` and `test:visual`.
Lefthook runs Biome before a commit and `pnpm verify` before a push ([`CONTRIBUTING.md`](CONTRIBUTING.md)).

### Accessibility

The bar is WCAG AA, checked by axe through the Storybook a11y addon with `a11y.test: 'error'`
(`.storybook/preview.tsx`), in each component's own stories (the two overview pages are skipped).

- **Where it runs today:** the Accessibility panel of the story view, and `scripts/storybook-inventory.mjs --a11y`.
  It does **not** run in `pnpm test:storybook` or in CI, so an accessibility regression can still land unnoticed.
  Measured on 2026-10-10 with the check switched on: 102 of 862 stories fail. The audit brief has the numbers, the
  change that turns it on, and why it is still off.
- **The one accepted exception:** white text on the solid primary `#1677ff` is 4.10:1, under the 4.5:1 that
  `color-contrast` asks. The primary is the owner's brand colour and stays (2026-10-10). The exception is recorded
  once, in [`.storybook/a11yAllowances.ts`](.storybook/a11yAllowances.ts), scoped to that exact colour pair; the
  rule is not disabled anywhere. Text in the primary uses `--oui-foreground-primary` instead, which passes.
  No other exception is accepted: a new one is the owner's decision and goes in that file.

Sources: `CHANGELOG.md` ("Changed"), `theme-contract.md` ("The primary as a fill and as text"),
`BRIEF-storybook-audit.md` ("Accessibility", "Follow-up, 2026-10-10").

### Checklist: adding or changing a component

- [ ] It is generic: no app wording, props only, typed callbacks, `labels`, icons as nodes.
- [ ] Folder layout as above; exported from the folder's `index.ts` and from `packages/core/src/index.ts`.
- [ ] Colours and sizes are `--oui-*` tokens, both themes; new tokens have a row in `theme-contract.md`.
- [ ] Factories with consumer-style examples; stories with `Default`, `tags: ['autodocs']`, a description,
      `exampleDocs`, and a `play` for each interaction.
- [ ] A row on the Component Overview.
- [ ] Tests in `packages/core/test/<Name>/`: behaviour, keyboard, names and roles, controlled and uncontrolled.
- [ ] Looked at in Storybook, dark and light, with the Accessibility panel clean (or only the recorded exception).
      Use your own port, not the owner's 6006.
- [ ] `pnpm verify` green; `pnpm test:storybook` green when a story changed; `pnpm test:visual` when a Native App
      part changed.
- [ ] `CHANGELOG.md` "Unreleased" entry; journal entry.
- [ ] No line added to `componentParts.allowlist.ts`.

A widget: steps 1 to 5 of "A dynamic-form widget", then the last four lines above.

### Decisions and documentation

Documentation lives in [`bionic/`](bionic/) and is maintained with the Crux skills
([`bionic/AGENTS.md`](bionic/AGENTS.md), [`USER_GUIDE.md`](USER_GUIDE.md)): an architectural decision is an ADR
(`propose-adr`), finished work is a journal entry (`log-work`), an exploration is a brief (`propose-brief`).
Generated files under `bionic/` (indexes, `adrs/summaries`, `adrs/doctrine`, `adrs/lineage.md`, `code/`, `arch/`)
are regenerated, never edited by hand.

## Visual regression tests

`pnpm test:visual` compares 10 captures of the Native App stories (dark and light) with the baselines in
`visual/__screenshots__/`, named per platform (`*-chromium-darwin.png`, `*-chromium-linux.png`). CI runs it on `ubuntu-24.04`
against the `-linux` files.

- macOS baselines: `pnpm test:visual:update`, review the changed PNGs, commit.
- Linux baselines (no Docker needed): on a branch, temporarily replace the `pnpm test:visual` step of
  `.github/workflows/verify.yml` with `pnpm test:visual:update` plus an `actions/upload-artifact@v4` step for
  `visual/__screenshots__/*-linux.png`, open a draft PR, `gh run download <run-id> -n <artifact> -D visual/__screenshots__`,
  commit the PNGs, then restore the plain step.
