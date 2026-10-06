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

Give teams at Omni Technology Solutions building React applications one dependable component library, covering common controls, data display, feedback and schema-driven forms, so they ship consistent, accessible screens without rebuilding UI primitives. It does this well when a team adopts the package, themes it once, and rarely reaches for another UI library.

## Goals

### OBJ-1 — Cover the screens teams actually build
- **kind:** utility
- **statement:** A developer assembling a typical business-app screen (forms, tables, navigation, overlays, feedback) finds every component they need in this library.
- **measure:** unmeasured. The library ships 85 components today, but no inventory of consuming-app screens exists to say what is still missing.
- **status:** active

### OBJ-2 — Generate forms from a schema
- **kind:** utility
- **statement:** A developer can render and validate a complete form from a JSON Schema through the `dynamic-form` entry point, using the same field components as a hand-built form.
- **measure:** The `dynamic-form` test suite and stories pass for every registered widget and field. Use by a real consuming app is unmeasured.
- **status:** active

### OBJ-3 — Usable with a keyboard and a screen reader
- **kind:** ux
- **statement:** A keyboard-only or screen-reader user can operate every component, and an accessibility regression cannot land unnoticed.
- **measure:** The Storybook a11y addon runs at `test: 'error'` over every component's stories (`.storybook/preview.tsx`). That check is not yet enforced by CI, and manual keyboard and screen-reader audits are unmeasured.
- **status:** active

### OBJ-4 — Install, import, and it looks right
- **kind:** ease-of-use
- **statement:** A consumer adds one package to a React 18.3 or 19 app, imports a component, and sees it correctly styled with no extra build or CSS configuration.
- **measure:** unmeasured. The README quick start has never been exercised in a clean React 18 and React 19 consumer app.
- **status:** active

### OBJ-5 — Theme once, everything follows
- **kind:** ux
- **statement:** A consumer can switch between light and dark and apply brand tokens through `ConfigProvider`, and every component honours it with no unthemed surfaces.
- **measure:** unmeasured. `ConfigProvider` supports `mode` and tokens, but there is no visual-regression or per-component theme check, and recent history includes a fix for unthemed surfaces ("normalize collapse and theme surfaces").
- **status:** active

### OBJ-6 — Learn a component without reading its source
- **kind:** ease-of-use
- **statement:** A developer can learn how to use any component, including its props and states, from its documentation alone.
- **measure:** Every one of the 85 components has Storybook stories; 71 have test directories and 14 do not (for example Alert, Drawer, Dropdown, Popover, RichText). Whether the docs answer real questions is unmeasured.
- **status:** active

### OBJ-7 — Only verified versions are published
- **kind:** delivery
- **statement:** Every version published to npm has passed lint, typecheck, tests and build, and consumers can see what changed between versions.
- **measure:** `pnpm verify` runs all four checks, but publishing is manual and `prepublishOnly` runs only typecheck and build. There is no CI and no changelog, so enforcement is unmeasured.
- **status:** active

## Shifts

_Newest first. Append a row whenever the mission or a goal changes; never rewrite history above._

| date | shifted | from | to | why |
|------|---------|------|----|-----|
