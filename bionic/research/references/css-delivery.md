---
title: CSS delivery and isolation (how dist/styles.css behaves inside a host that has no Tailwind, the layer order a host should use, and the isolation test)
category: references
updated: 2026-10-06
---

# CSS delivery and isolation

The package ships one stylesheet, `@oc-tech/omni-ui-components/styles.css` (about 217 KB, built from `packages/core/src/styles.css`). The app that consumes the library has no Tailwind and its own hand-written CSS (resets, `--ui-*` token scopes, styled native `button` and `input`). This page records what the stylesheet does so importing it cannot restyle the host, what the host should do, the leaks that remain, and how it is tested.

## What a host does

```html
<!-- first thing in <head>, before any stylesheet: the first @layer statement a page meets fixes the layer order -->
<style>@layer host, omni-ui-components;</style>
```

```css
/* host entry stylesheet */
@import './host.css' layer(host);   /* or wrap your own rules in `@layer host { ... }` */
```

```ts
import '@oc-tech/omni-ui-components/styles.css';
```

- Cascade layers beat selector specificity, and unlayered rules beat every layer. With the host in `@layer host`, below `omni-ui-components`, the host's own element rules (`button { ... }`, `input { ... }`, `* { box-sizing }`, `th, td { ... }`) never restyle a library component, and no library rule touches a host element.
- A host that leaves its rules unlayered still keeps its own look (the host-only page is byte-identical either way), but its unlayered element rules then also win over the library's controls: library buttons and inputs take the host button's border, background and shadow. The fix is on the host side: `@layer host`.
- The order statement must be first. The package's own stylesheet also opens with the statement (the build puts it back at the very top; see below), but if a bundler hoists a shared chunk of the library CSS above the host's, only an inline statement in the HTML guarantees `host` sits below `omni-ui-components`. The fixture's page B hit exactly that when two pages shared a chunk.
- Inherited properties still flow in: `font-family`, `color` and `line-height` set on the host's `body` are inherited by any library text that does not set its own, and `rem` follows the host's `html { font-size }`. A stylesheet cannot stop inheritance. Put the library in a wrapper that sets the font, colour and line-height you want.

## What the stylesheet guarantees

1. **No preflight.** Tailwind is built from `tailwindcss/theme` and `tailwindcss/utilities` only: no reset of margins, headings, lists, links, `img`, `svg`.
2. **One layer, fixed order.** Every rule is inside `@layer omni-ui-components` or a sublayer, lowest to highest: `properties`, `theme`, `palette`, `base`, `utilities`, `classes`, then the unnamed rules of `omni-ui-components` (the `--oui-*` tokens in `tokens.css`). The build (`nestTailwindLayers` in `packages/core/vite.config.ts`) renames Tailwind's `@layer properties` into the library layer and writes the order statement as the first rule of `dist/styles.css`; without that the bundler's first layer block (`properties`) fixed the order, and with the old separate reset layer the library's own `base` rules sat above its utilities whenever the host declared nothing. Outside the layer remain only `@property --tw-*` and `@keyframes`, which cannot be layered.
3. **No element selector reaches the host.** Every rule whose subject is `button`, `input`, `select`, `textarea`, `svg`, `table`, `th`, `td` ... is wrapped in a `:where()` list that only matches library elements: `[data-slot]` (the marker every component root carries) and its descendants, `[data-oui-surface]` (portalled menus, popovers, tooltips) and its descendants, `.bui-table`, or Tailwind layout classes no Tailwind-free host uses (`inline-flex`, `flex`, `box-border`). The only unscoped element rules declare custom properties (`*, ::before, ::after { --tw-... }`).
4. **Library controls are immune to the host's element rules.** In `omni-ui-components.base` (above the host layer, below the utilities) library `button`, `input`, `select`, `textarea` and table elements get `all: revert`, then the zero border, transparent background and no shadow that preflight gave them. The result equals the library rendered alone; component classes in `utilities` and `classes` then style them as designed. Library elements also take the browser's own `box-sizing` (a host's `* { box-sizing: border-box }` does not change library box sizes) and library icons keep `vertical-align: baseline`.
5. **`color-scheme` is not set on `:root`.** The library sets it on `[data-theme='light']` (and dark). A host that sets its own, or none, keeps it.
6. Table rules that were `@layer components` (above the utilities) or unlayered now sit in `omni-ui-components.classes`, the highest sublayer, so their order against the utilities is unchanged (`th` weight 600 over the `font-medium` utility, checked).

## What the host still shares, and the known leaks

- **Custom property names** on `:root`: the stylesheet defines `--oui-*` and unprefixed names from the legacy theme (`--primary`, `--danger`, `--black`, `--white`, `--grey-*`, `--bg-*`, `--text-*`, `--color-*`, `--radius-*`, `--font-*`, `--spacing`, `--shadow-*`). A host that defines the same name in an unlayered rule wins over the library; in `@layer host` it loses to the library. The fixture host uses `--ui-*`, which does not collide. U04 did not rename them (see `theme-contract.md`, Legacy unprefixed names): the theme roots now declare them per `data-theme` subtree, and hosts should still not reuse them.
- **`@keyframes` names** (`spin`, `pulse`, `enter`, `exit`, `oui-*`, `bui-*`) and `@property --tw-*` are global by language design.
- **A host element inside a library component** (a host child in a `Panel` body) is matched by `[data-slot] *`: a host `button` there gets `all: revert`.
- **A host control that carries a Tailwind-style class** (`inline-flex`, `flex`, `box-border`) loses its host border, background and shadow when the host is layered. Likewise a host element with a class named exactly `border-solid`, `border-dashed` or `border-dotted` gets `border-width: 0`, and one with a `border`, `border-*` or `rounded-*` class gets the browser's `box-sizing` and, for `border`, `border-color` from `--color-border`. Hosts without Tailwind do not use these names.
- **Library elements that carry no marker and no recognised class** (a bare `div`, a Radix wrapper) still take the host's `* { box-sizing }`. It changes nothing visible unless the element is sized or padded.
- **Dark mode** is `[data-theme="dark"]` on any ancestor (or `<html>`), not `prefers-color-scheme`.

## The isolation test

Fifth check (U04): `d.html` renders one component set in a light host with a dark subtree, a dark host with a light subtree, a container with no `data-theme` and one with token overrides; every nested subtree must compute like the same theme at the top level, the two palettes must differ, and overrides must stay in their container (`library alone` and `host in @layer host`).

`pnpm --filter @oc-tech/omni-ui-components test:isolation` builds the package and runs `fixtures/host-app/isolation.mjs` (Playwright, headless Chromium):

1. **Static audit** of `dist/styles.css`: the order statement is the first rule; no top-level block outside the library layer other than `@property` and `@keyframes`; no unscoped element or universal selector declaring anything but custom properties.
2. **Page A (host only)**: a hand-written page (`host.css`: own `*` reset, body font, styled `button`, `input`, `select`, `table`, `fieldset`, own `--ui-*` tokens) plus elements the host never styles (`dialog`, `iframe`, `progress`, `meter`, `details`, `input type=color|file|range|image`, a host rule that sets a border width only). Screenshotted without the library and with `styles.css` before the host sheet, after it, and with the host in `@layer host`: the PNG bytes must be identical and every computed property of every element must match (threshold 0). Reference screenshots go to `fixtures/host-app/screenshots/`.
3. **Page B** (host plus a library `Panel` and `Button`, host in `@layer host`) in light and dark: zero console errors, the library `Button` must not take the host button's border, shadow or background, the `Panel` header is 40px.
4. **Library regression page** (`c.html`: Button variants, IconButton, Tag, Badge, Input, Checkbox, Select, both Segmented appearances, Alert, Card, Panel, SplitButton, Table, Composer), in light and dark: every computed property of about 90 library elements is identical with no host stylesheet and with the host in `@layer host`. This is the check that found the leaks above; it was also compared once, by hand, against the stylesheet from before this unit (no difference on those elements).

Playwright needs a Chromium: the script falls back to any `chromium-*` under `PLAYWRIGHT_BROWSERS_PATH` when the revision Playwright expects is not installed. Chromium reports the UA default serif as `Times` or `"Times New Roman"` depending on when platform fonts resolve, even with the library sheet disabled again; that single flip is ignored, the pixels are not.

## Open points

- Prefixing the legacy unprefixed token names (`--bg-*`, `--text-*`, `--grey-*`, `--black`, `--white`, `--primary`) with `--oui-` and keeping the old names as aliases is not done; it touches about 200 call sites. Theme selectors are done (U04, `theme-contract.md`).
- The regression page covers about fifteen components, not all of them. A component whose native control has neither a marker nor a recognised class would still pick up host element rules; add `data-slot` to its root.
- Portalled content outside `[data-oui-surface]` (Radix content of components other than the four U05a covers) is matched only through its classes.
