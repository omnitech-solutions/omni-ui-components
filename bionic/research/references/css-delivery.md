---
title: CSS delivery and isolation (how dist/styles.css behaves inside a host that has no Tailwind, the layer order a host should use, and the isolation test)
category: references
updated: 2026-10-06
---

# CSS delivery and isolation

The package ships one stylesheet, `@oc-tech/omni-ui-components/styles.css` (about 220 KB, built from `packages/core/src/styles.css`). The app that consumes the library has no Tailwind and its own hand-written CSS (resets, `--ui-*` token scopes, styled native `button` and `input`). This page records what the stylesheet does so importing it cannot restyle the host, what the host should do, and how that is tested.

## What a host does

```css
/* host entry stylesheet, before anything else */
@layer host, omni-ui-components;
@import './host.css' layer(host);   /* or wrap your own rules in `@layer host { ... }` */
```

```ts
import '@oc-tech/omni-ui-components/styles.css';
```

- Declare `@layer host, omni-ui-components;` first. Cascade layers beat selector specificity, and unlayered rules beat every layer. So a host that leaves its element rules (`button { ... }`, `input { ... }`) unlayered will win over the library's own utilities on library buttons and inputs (the library `Button` then looks like the host button). Putting the host's rules in `@layer host` below `omni-ui-components` keeps the library components looking as designed, while the host's own elements keep their look because no library rule targets them (see below).
- Host-only pages are unaffected either way: with the library stylesheet imported before or after the host's, or with the host in `@layer host`, the host page is pixel-identical to the page without the import (test below).
- Import order of the two stylesheets does not matter for the host's own elements. It matters only for the library components when the host rules are unlayered (above).

## What the stylesheet guarantees

1. **No preflight.** Tailwind is built from `tailwindcss/theme` and `tailwindcss/utilities` only. There is no reset of margins, headings, lists, links, `img`, `svg` or form controls.
2. **One layer.** Every rule is inside `@layer omni-ui-components` or one of its sublayers, in this order (declared first in `styles.css` and in `base-palette.css`): `properties`, `theme`, `palette`, `base`, `components`, `utilities`, `classes`, then the unnamed rules of `omni-ui-components` itself (the `--oui-*` tokens in `tokens.css`). Tailwind's own `@layer properties` is renamed to `omni-ui-components.properties` at build time (`nestTailwindLayers` in `packages/core/vite.config.ts`). Outside the layer there remain only `@property --tw-*` registrations and `@keyframes` (no layer is possible for them; they only define `--tw-*` custom properties and animation names).
3. **No element selector escapes with real declarations.** The small reset Tailwind utilities need (`border-width: 0; border-style: solid; border-color`, and `background: transparent` on buttons) is scoped to library elements: `:where([data-slot], [data-slot] *)` and `:where(button[data-slot], [data-slot] button)`. Every library component root carries `data-slot`, so a host element outside a library component is never matched. A host element rendered inside a library component (a host child inside a `Panel` body) does get the border reset. The only rules whose subject is an element, `*`, `:root`, `:host` or `html` declare nothing but custom properties.
4. **`color-scheme` is not set on `:root`.** The library sets it on `[data-theme='light']` and `[data-theme='dark']` (the theme switch). A host that sets its own `color-scheme`, or none, keeps it.

## What the host still shares with the library

- **Custom property names** on `:root`: the stylesheet defines `--oui-*` and also unprefixed names from the legacy theme (`--primary`, `--danger`, `--black`, `--white`, `--grey-*`, `--bg-*`, `--text-*`, `--color-*`, `--radius-*`, `--font-*`, `--spacing`, `--shadow-*`). A host that defines the same names in an unlayered rule wins over the library (unlayered beats layered); a host that defines them in `@layer host` loses to the library because `omni-ui-components` is the higher layer. The host in the fixture uses `--ui-*`, which does not collide. Prefixing the unprefixed names with `--oui-` is U04's job (`tokens.css` and `theme-tokens.css` selectors and names); until then, hosts should not reuse those names.
- **`@keyframes` names** (`spin`, `pulse`, `enter`, `exit`, `oui-*`, `bui-*`) and **`@property --tw-*`** are global by language design.
- **Dark mode** is `[data-theme="dark"]` on any ancestor (or `<html>`), not `prefers-color-scheme`.

## Where it is enforced

| Concern | Where |
| --- | --- |
| Tailwind without preflight, library-scoped reset, layer order statement | `packages/core/src/styles/tailwind.css`, `packages/core/src/styles.css` |
| Palette inside `omni-ui-components.palette`, no `:root { color-scheme }` | `packages/core/src/styles/base-palette.css`, `theme-tokens.css` imported with `layer(omni-ui-components.palette)` in `styles.css` |
| Table sheets inside `omni-ui-components.classes` / `.components` | `packages/core/src/Table/Table.*.css` |
| `@layer properties` renamed | `nestTailwindLayers` plugin in `packages/core/vite.config.ts` |
| Fixture host, audit and pixel test | `packages/core/fixtures/host-app/` |

Storybook imports the four style files separately (`.storybook/preview.tsx`), so `theme-tokens.css` stays unlayered there. That is only the dev server; the shipped file is `dist/styles.css`.

## The isolation test

`pnpm --filter @oc-tech/omni-ui-components test:isolation` builds the package and runs `fixtures/host-app/isolation.mjs`:

1. **Static audit** of `dist/styles.css` (no top-level block outside the library layer other than `@property` and `@keyframes`; no unscoped element or universal selector declaring anything but custom properties).
2. **Page A (host only)** is a hand-written page (`host.css`: own `*` reset, body font, styled `button`, `input`, `select`, `table`, `fieldset`, own `--ui-*` tokens). It is screenshotted without the library and with `styles.css` imported before the host sheet, after it, and with the host in `@layer host`. The PNG bytes must be identical and the computed style of every element must match (threshold 0). The reference screenshots are written to `fixtures/host-app/screenshots/`.
3. **Page B** (host plus a library `Panel` and `Button`, host in `@layer host`) renders in light and dark with zero console errors; the library `Button` must not take the host button's look, and the `Panel` header must be 40px.

Playwright needs a Chromium: the script falls back to any `chromium-*` under `PLAYWRIGHT_BROWSERS_PATH` when the revision Playwright expects is not installed.

## Open points

- U04 owns token selectors: if the unprefixed token names are renamed or scoped, update the "still shares" list above.
- A host that cannot use layers (it must stay unlayered) should know that its unlayered `button`/`input` rules then restyle library buttons and inputs; the fix on the host side is `@layer host`.
