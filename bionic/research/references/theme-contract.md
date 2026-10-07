---
title: Theme contract (how a host themes a subtree, every --oui token with its light and dark default, and the see-through contract)
category: references
updated: 2026-10-06
---

# Theme contract

The library is themed per subtree. A host puts `data-theme="light"` or `data-theme="dark"` on **any ancestor** of library components (`<html>`, a page region, a floating window) and that subtree, and only that subtree, takes the theme. Dark inside light and light inside dark both work, and so do two sibling containers with different themes in one document. Without a `data-theme` anywhere the page is light.

## The rule that makes it work

`var()` resolves on the element that declares the property. A token declared once on `:root` as `--oui-foreground: var(--color-foreground)` is already resolved (light) when a dark subtree inherits it. So every value that differs between themes, or reads one that does, is **declared on each theme root**: `:root, [data-theme]` (derived), `:root, [data-theme='light']` (light values), `[data-theme='dark']` (dark values). The same holds for the Tailwind `@theme` colour aliases (`--color-foreground`, `--color-card`, ...): `tailwind.css` re-declares them on each theme root (the theme bridge), so `text-foreground` and `bg-card` follow the subtree. `test/Theming/themeContract.test.ts` fails if the bridge drifts from `@theme`.

## Overriding a token

- **Fixed tokens** (first table, and the seeds `--oui-primary`, `--oui-background`, `--oui-background-dark`): set on any ancestor; they are declared on `:root` only, so the nearest ancestor wins.
- **Derived and themed tokens**: set on the element that carries `data-theme`, or on a descendant of it. A rule on a plain ancestor above a `data-theme` element loses to the library's own declaration on that element (an unlayered host rule beats the layered library on the same element, so `section[data-theme] { --oui-panel-bg: ... }` always works). To restyle every theme root at once write `:root, [data-theme] { ... }`.
- **Re-branding a subtree** (a different `--oui-primary`): put `data-theme` on the subtree (the same value as its surroundings is fine) and the seed on the same element, so the palette stops (`--oui-primary-1` to `-10`) and the semantic tokens are derived there.
- Explicit palette stops (`--oui-primary-N`) are derived tokens: set them with `:root, [data-theme]`.

## See-through contract

`--oui-panel-see-through` is a number from `0.22` to `1` (default `1`). Panel, header and dock **backgrounds only** are `color-mix(in srgb, <opaque base> calc(var(--oui-panel-see-through, 1) * 100%), transparent)`. Text, icons and borders stay opaque at every level. `0.22` is the lowest level the design uses (the code does not clamp it). Set it on the container (it is a fixed token: any ancestor).

## Legacy unprefixed names

The stylesheet still defines the legacy theme names on the theme roots: `--primary`, `--danger`, `--black`, `--white`, `--grey-*`, `--bg-*`, `--text-*`, `--border-*`, `--color-*`, `--radius-*`, `--font-*`, `--shadow-*`. The semantic ones (`--bg-*`, `--text-*`, `--border-*`, `--color-*`) are per-theme; the palette ones (`--black`, `--white`, `--grey-*`, `--font-*`) are fixed on `:root`. They are not renamed in this unit (the Tailwind `--color-*`/`--radius-*`/`--font-*` families are Tailwind's own namespace and the rest are read by about 200 call sites), so the collision rule in `css-delivery.md` stands: a host should not reuse these names.

## Tokens

Light and dark defaults below are the values in `packages/core/src/styles/tokens.css`. "Reads" values are resolved per theme root from the semantic tokens in `theme-tokens.css`.

### Fixed (same in light and dark; set on any ancestor)

| Token | Default | Meaning |
|---|---|---|
| `--oui-radius-field` | `var(--radius-md, 6px)` | Form field size and corner |
| `--oui-field-height-sm` | `1.5rem` | Form field size and corner |
| `--oui-field-height-md` | `2rem` | Form field size and corner |
| `--oui-field-height-lg` | `2.5rem` | Form field size and corner |
| `--oui-field-height-xl` | `3rem` | Form field size and corner |
| `--oui-field-padding-x` | `0.6875rem` | Form field size and corner |
| `--oui-label-width` | `7.5rem` | 120px — matches sidebar property row |
| `--oui-transition-duration` | `var(--transition-normal, 200ms)` | Motion timing (0ms under prefers-reduced-motion) |
| `--oui-transition-easing` | `cubic-bezier(0.645, 0.045, 0.355, 1)` | Motion timing (0ms under prefers-reduced-motion) |
| `--oui-control-height` | `36px` | Compact control height |
| `--oui-control-height-labelled` | `52px` | Compact control height |
| `--oui-control-radius` | `10px` | Control corner radius |
| `--oui-control-gap` | `6px` | Gap between controls |
| `--oui-control-separator` | `20px` | vertical divider height between control groups |
| `--oui-control-hit` | `40px` | minimum pointer target: a ::before grows a 36px control to this without moving layout |
| `--oui-control-icon` | `20px` | Control row dimension |
| `--oui-control-caret` | `20px` | width of a split button's caret segment |
| `--oui-control-label-max` | `260px` | default ellipsis width for a truncating label |
| `--oui-tone-dim-solid-bg` | `transparent` | Status badge on a control (the amber "!"). The ring cuts it out of the surface behind. |
| `--oui-badge-size` | `16px` | Status badge geometry |
| `--oui-badge-offset` | `-6px` | Status badge geometry |
| `--oui-panel-header-height` | `40px` | Panel geometry |
| `--oui-panel-radius` | `14px` | Panel geometry |
| `--oui-panel-pad-x` | `14px` | Panel geometry |
| `--oui-panel-see-through` | `1` | 1 = opaque surfaces, 0.22 = see-through |
| `--oui-panel-fade` | `28px` | top fade mask height of a scrolling body |
| `--oui-panel-scrollbar-size` | `6px` | Panel geometry |
| `--oui-font-sans` | `var(--font-sans, 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)` | Library font stack |

### Derived (recomputed on every theme root from the theme's semantic tokens)

| Token | Reads | Meaning |
|---|---|---|
| `--oui-surface-field` | `var(--color-input)` | Form field background |
| `--oui-surface-field-disabled` | `var(--color-input-disabled)` | The theme defines --border-field (light and dark); --color-border-input is a shadcn alias the theme never sets, which left outlines on currentColor. |
| `--oui-border-field` | `var(--color-border-input, var(--border-field))` | Field border (rest, focus, invalid) |
| `--oui-border-interactive` | `var(--color-primary)` | Field border (rest, focus, invalid) |
| `--oui-border-invalid` | `var(--color-destructive)` | Field border (rest, focus, invalid) |
| `--oui-foreground` | `var(--color-foreground)` | Text colour |
| `--oui-foreground-muted` | `var(--color-muted-foreground)` | Text colour |
| `--oui-foreground-placeholder` | `color-mix(in srgb, var(--color-foreground) 32%, transparent)` | Text colour |
| `--oui-foreground-required` | `var(--color-destructive)` | Text colour |
| `--oui-tone-neutral-fg` | `var(--text-default)` | Tone text colour |
| `--oui-tone-neutral-bg` | `var(--bg-grey-f5)` | Tone background |
| `--oui-tone-neutral-border` | `var(--border-field)` | Tone border |
| `--oui-tone-neutral-solid-bg` | `var(--bg-grey-f5)` | Tone background |
| `--oui-tone-neutral-solid-fg` | `var(--text-default)` | Tone text colour |
| `--oui-badge-ring` | `var(--bg-content)` | Ring colour that cuts the badge out of the surface |

### Themed (a light and a dark value)

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `--oui-tone-accent-fg` | `#2447b8` | `#a9c1ff` | Tone text colour |
| `--oui-tone-accent-bg` | `rgba(91, 140, 255, 0.14)` | `rgba(91, 140, 255, 0.18)` | Tone background |
| `--oui-tone-accent-border` | `#9db8f5` | `#3b5f9e` | Tone border |
| `--oui-tone-accent-solid-bg` | `#3b6fe0` | `#2f6fe4` | Tone background |
| `--oui-tone-accent-solid-fg` | `#ffffff` | `#ffffff` | Tone text colour |
| `--oui-tone-success-fg` | `#1b7a3e` | `#6ddc93` | Tone text colour |
| `--oui-tone-success-bg` | `rgba(47, 158, 85, 0.12)` | `rgba(109, 220, 147, 0.12)` | Tone background |
| `--oui-tone-success-border` | `#8fd0a5` | `#2f9e55` | Tone border |
| `--oui-tone-success-solid-bg` | `#23874a` | `#2f9e55` | Tone background |
| `--oui-tone-success-solid-fg` | `#ffffff` | `#ffffff` | Tone text colour |
| `--oui-tone-warning-fg` | `#8a5a00` | `#f5c86b` | Tone text colour |
| `--oui-tone-warning-bg` | `rgba(240, 180, 41, 0.18)` | `rgba(240, 180, 41, 0.12)` | Tone background |
| `--oui-tone-warning-border` | `#d9a22a` | `#a07a22` | Tone border |
| `--oui-tone-warning-solid-bg` | `#f0b429` | `#f0b429` | Tone background |
| `--oui-tone-warning-solid-fg` | `#1b1400` | `#1b1400` | Tone text colour |
| `--oui-tone-danger-fg` | `#b42318` | `#ff8a85` | Tone text colour |
| `--oui-tone-danger-bg` | `rgba(220, 38, 38, 0.08)` | `rgba(255, 107, 102, 0.1)` | Tone background |
| `--oui-tone-danger-border` | `#f0a3a0` | `#7a3236` | Tone border |
| `--oui-tone-danger-solid-bg` | `#dc2626` | `#d8453f` | Tone background |
| `--oui-tone-danger-solid-fg` | `#ffffff` | `#ffffff` | Tone text colour |
| `--oui-tone-dim-fg` | `#8b909a` | `#5f636c` | Tone text colour |
| `--oui-tone-dim-bg` | `transparent` | `transparent` | Tone background |
| `--oui-tone-dim-border` | `#d9dce2` | `#373b46` | Tone border |
| `--oui-tone-dim-solid-fg` | `#8b909a` | `#5f636c` | ---- Segmented control (active / inactive segment) ---- |
| `--oui-segment-active-bg` | `rgba(59, 111, 224, 0.16)` | `rgba(91, 140, 255, 0.24)` | Segmented control active and inactive segment |
| `--oui-segment-active-fg` | `#2447b8` | `#c3d3ff` | Segmented control active and inactive segment |
| `--oui-segment-inactive-fg` | `#6b7280` | `#8a8e98` | Segmented control active and inactive segment |
| `--oui-panel-bg` | `#ffffff` | `#172033` | Opaque base colour of a panel surface (mixed with the see-through level) |
| `--oui-panel-header-bg` | `transparent` | `transparent` | Opaque base colour of a panel surface (mixed with the see-through level) |
| `--oui-panel-dock-bg` | `#f6f7f9` | `#141c2d` | Opaque base colour of a panel surface (mixed with the see-through level) |
| `--oui-panel-border` | `#e3e6ec` | `#24314a` | Panel border and separators |
| `--oui-panel-divider` | `#e8ebf0` | `#212c42` | 1px separators under the header and over the dock |
| `--oui-panel-meta-fg` | `#6b7280` | `#7d8aa3` | Panel secondary text |
| `--oui-tag-filled-bg` | `#eef0f4` | `#212c42` | Filled Tag colours |
| `--oui-tag-filled-fg` | `#374151` | `#a9b6cf` | Filled Tag colours |
| `--oui-clock-live` | `#b42318` | `#ff8a85` | StatusClock record icon and timer while live |
| `--oui-clock-paused` | `#8a5a00` | `#f5c86b` | StatusClock timer and Paused label |
| `--oui-clock-paused-icon` | `#f0b429` | `#f0b429` | StatusClock pause disc |
| `--oui-session-pause-border` | `var(--oui-tone-neutral-border)` | `#33425f` | SessionBar Pause outline |
| `--oui-code-plain` | `oklch(0.28 0.02 260)` | `oklch(0.9 0.008 260)` | Syntax highlighting colour |
| `--oui-code-keyword` | `oklch(0.5 0.18 300)` | `oklch(0.76 0.14 300)` | Syntax highlighting colour |
| `--oui-code-type` | `oklch(0.5 0.1 210)` | `oklch(0.8 0.1 200)` | Syntax highlighting colour |
| `--oui-code-string` | `oklch(0.48 0.12 145)` | `oklch(0.8 0.13 145)` | Syntax highlighting colour |
| `--oui-code-comment` | `oklch(0.56 0.02 260)` | `oklch(0.62 0.02 260)` | Syntax highlighting colour |
| `--oui-code-number` | `oklch(0.52 0.13 55)` | `oklch(0.8 0.12 65)` | Syntax highlighting colour |
| `--oui-code-function` | `oklch(0.48 0.13 250)` | `oklch(0.82 0.1 240)` | Syntax highlighting colour |
| `--oui-code-gutter` | `oklch(0.62 0.02 260)` | `oklch(0.5 0.02 260)` | Syntax highlighting colour |
| `--oui-code-mark-bg` | `rgba(59, 111, 224, 0.1)` | `rgba(91, 140, 255, 0.14)` | Syntax highlighting colour |
| `--oui-panel-scrollbar-thumb` | `rgba(17, 24, 39, 0.28)` | `rgba(169, 182, 207, 0.32)` | Panel scrollbar thumb |
