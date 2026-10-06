---
title: Native App control variations (Button, IconButton, Progress ring, Segmented, Empty tile, Steps checklist, Tag, Divider, tokens)
category: references
updated: 2026-10-06
---

# Native App control variations

Reference for the configuration-driven variations the Native App (live-session toolbar, panels and footer) needs from `Button`, `IconButton`, `Progress`, `Segmented`, `Empty`, `Steps`, `Tag` and `Divider`, and the tokens behind them. Code: `packages/core/src/Button`, `packages/core/src/IconButton`, shared tone classes in `packages/core/src/internal/support/controlTone.ts`, tokens in `packages/core/src/styles/tokens.css`. Stories: `omni-ui-components/<Component>` for each, and their rows of Getting Started / Component Overview (each variation is a factory `Variant[]` entry, so the overview matrix and Show code pick it up).

## Tokens (`--oui-*`, light and dark)

- Control scale: `--oui-control-height` 36px, `--oui-control-height-labelled` 52px, `--oui-control-radius` 10px, `--oui-control-gap` 6px, `--oui-control-separator` 20px, `--oui-control-icon` 20px, `--oui-control-label-max` 260px.
- Tone scale for `neutral | accent | success | warning | danger | dim`: `--oui-tone-<tone>-{fg,bg,border,solid-bg,solid-fg}`. `fg/bg/border` is the soft tint, `solid-*` the filled form. Neutral maps onto the theme tokens `--text-default`, `--bg-grey-f5`, `--border-field`; the others have explicit light values and dark values taken from the designer gallery "Native Panel Cleanup".
- Segment: `--oui-segment-active-bg`, `--oui-segment-active-fg`, `--oui-segment-inactive-fg` (light and dark; dark values from the designer).
- Badge: `--oui-badge-size` 16px, `--oui-badge-offset` -6px, `--oui-badge-ring`.
- Note: `--oui-border-field` and `--oui-foreground` point at `@theme` variables that Tailwind only emits when a utility uses them, so they can resolve empty in the browser; the tone tokens therefore use the raw theme tokens.

## Button

- `buttonSize` gains `control` (36px) and `control-labelled` (52px). Existing sizes and the prop name are unchanged.
- `tone` (filled) with `soft` (outlined, transparent until hovered); `fillIcon`; `shortcut: string[]` shown after the label as one plain 11px mono text run at 70% opacity (no box, keys joined, `aria-hidden`, mirrored into `aria-keyshortcuts`); `loading` (native `disabled`, `aria-busy`, spinner replaces the leading icon); `pressed` (`aria-pressed` and the accent look); `labelMaxWidth` (ellipsis; the full label becomes `title` only while truncated); `asChild` now renders the single child through Radix Slot and never reaches the DOM (disabled or loading becomes `aria-disabled` and `tabIndex=-1`).

## IconButton

- `iconSize` gains `control` (36px square) and `control-labelled` (52px square, no caption).
- `tone` (tinted surface; sits on the `secondary` variant unless a `variant` is given), `pressed`, `badge: { tone, label?, description? }` (top-right; `description` is wired through `aria-describedby`), `tooltip` (library Tooltip on hover and focus; replaces the native title), `disabledReason` (`aria-disabled`, still hoverable and focusable, click swallowed, the reason is the tooltip).
- Callbacks stay ordinary props (`onClick`).

## Progress ring

- `shape="ring"` (default `line`, unchanged). `value` 0-100 is determinate (`role=progressbar`, `aria-valuenow`, arc proportional, clamped); no `value` is indeterminate (`aria-busy`, no `aria-valuenow`, spinning). `tone` from the shared `ControlTone` scale (default `accent`, colours via `--oui-tone-<tone>-fg`, track at 25% opacity); `size` px, default 20 = `--oui-control-icon`, so it replaces an icon in a 36px control. Accessible name defaults to "Progress" / "Loading" (`aria-label` overrides). `aria-hidden` makes it decorative (no role), which Steps uses.
- Factories: `progressVariants`, `progressRingVariants`.

## Segmented

- `mode="multiple"`: Radix toggle group, `value: string[]`, `onChange(next: string[])`, options are `aria-pressed` buttons. Single mode (default, `string`) is untouched. The props are a discriminated union (`SegmentedSingleProps | SegmentedMultipleProps`).
- `appearance="control"` (default `pill`): one bordered group, 36px (`--oui-control-height`), radius `--oui-control-radius`+1px, 2px inset and 2px gaps, 19px icons, active segment = `--oui-segment-active-bg/fg` (dark: rgba(91,140,255,.24) / #c3d3ff), inactive transparent with `--oui-segment-inactive-fg` (dark #8a8e98) at full opacity. Works in single mode too.
- Options: `icon` (node), `label?` (optional; icon-only options need `ariaLabel`, which is also their native title), `disabledReason` (`aria-disabled`, hoverable and focusable, click swallowed, tooltip; unlike `disabled`).
- `minActive` (default 0, multiple mode): at the floor the on-option(s) get `aria-disabled` + `data-locked` and a tooltip (`minActiveReason`, default "Keep at least one on"); `onChange` is never called below the floor. Needs a controlled `value` to know what is on.
- Factories: `SAMPLE_PANELS`, `segmentedControlVariants`.

## Empty tile

- `variant="tile"` (default `dashed`, unchanged): 40px tile (`--oui-control-radius`, no border, `--oui-tone-accent-bg` fill, neutral-fg 20px icon from `icon`, falling back to `image`), optional `title`, one `description` line (max 340px), optional `action: { label, onClick, tone?, icon?, shortcut? }` rendered with the library `Button` (`control` size, tone default `accent`). The tile fills its parent (`flex-1`), so put it in a flex-column panel body.
- Factory: `emptyVariants`.

## Steps checklist

- `variant="checklist"` (default unchanged): read-only `<ol aria-label="Steps">`; items `{ label, state: 'done' | 'current' | 'pending' }` (`label` falls back to `title`, no `state` = pending). done = success-filled check, current = indeterminate Progress ring (accent, decorative), pending = outlined circle; text weight/opacity follows the state. The current item has `aria-current="step"`; every item carries a visually hidden "(done)" / "(in progress)" / "(pending)".
- Factories: `stepsChecklistItems`, `stepsVariants`.

## Tag

- `mono` (monospace face), `tooltip` (library Tooltip on hover and focus), `copyValue` + `onCopy(value)`: the tag becomes a `<button>`, click writes `copyValue` (not the label) to `navigator.clipboard`, shows a check and a polite "Copied" status for 1.5s, then calls `onCopy` after a successful write only (a refusal or a missing clipboard API is a silent no-op). `copyValue` wins over `closable`. The DOM clipboard-event `onCopy` is replaced by this callback (omitted from the extended attributes).
- Factory: `tagVariants`.

## Divider as control separator

- No prop. A vertical Divider with `h-[var(--oui-control-separator)] bg-[color:var(--oui-tone-neutral-border)]` (exported as `CONTROL_SEPARATOR_CLASS` from `Divider.factories.tsx`) is the 20px separator; the class replaces the default `h-full` and `bg-border`. Story: `Divider / Control separator (20px)`.

## Deviations from the proposals (`gap-toolbar.md`, `gap-panels-footer.md`)

- Segmented `control` follows the designer markup (2px inset, 2px gaps, 11px outer radius, 8px segments) rather than "1px dividers": the board shows no dividers between segments. Single/multiple is a `mode` prop with a discriminated-union value type instead of two components.
- Segmented lock reason is a group-level `minActiveReason` (an option's own `disabledReason` means "unusable", not "last one on").
- Empty `action` also accepts `icon` and `shortcut` (the board's "Capture screen ⌘⇧S"); Tag does not render the divider before the build tag (that is a Divider in the footer, not part of Tag); the segmented, tile and shortcut looks were then aligned to boards 1a/1d (see Segmented, Empty tile, Button); Steps reuses `StepItem` (`title` became optional) instead of a new item type.

## Tests

`packages/core/test/Button/Button.variations.test.tsx` and `packages/core/test/IconButton/IconButton.variations.test.tsx`.
`packages/core/test/Progress/Progress.ring.test.tsx`, `Segmented/Segmented.control.test.tsx`, `Empty/Empty.tile.test.tsx`, `Steps/Steps.checklist.test.tsx`, `Tag/Tag.variations.test.tsx`, `Divider/Divider.controlSeparator.test.tsx` (under `packages/core/test/`).
