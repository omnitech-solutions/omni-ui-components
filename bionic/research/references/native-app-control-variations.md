---
title: Native App control variations (Button, IconButton, tokens)
category: references
updated: 2026-10-06
---

# Native App control variations

Reference for the configuration-driven variations the Native App (live-session toolbar and footer) needs from `Button` and `IconButton`, and the tokens behind them. Code: `packages/core/src/Button`, `packages/core/src/IconButton`, shared tone classes in `packages/core/src/internal/support/controlTone.ts`, tokens in `packages/core/src/styles/tokens.css`. Stories: `omni-ui-components/Button`, `omni-ui-components/IconButton`, and the Button and IconButton rows of Getting Started / Component Overview.

## Tokens (`--oui-*`, light and dark)

- Control scale: `--oui-control-height` 36px, `--oui-control-height-labelled` 52px, `--oui-control-radius` 10px, `--oui-control-gap` 6px, `--oui-control-separator` 20px, `--oui-control-icon` 20px, `--oui-control-label-max` 260px.
- Tone scale for `neutral | accent | success | warning | danger | dim`: `--oui-tone-<tone>-{fg,bg,border,solid-bg,solid-fg}`. `fg/bg/border` is the soft tint, `solid-*` the filled form. Neutral maps onto the theme tokens `--text-default`, `--bg-grey-f5`, `--border-field`; the others have explicit light values and dark values taken from the designer gallery "Native Panel Cleanup".
- Badge: `--oui-badge-size` 16px, `--oui-badge-offset` -6px, `--oui-badge-ring`.
- Note: `--oui-border-field` and `--oui-foreground` point at `@theme` variables that Tailwind only emits when a utility uses them, so they can resolve empty in the browser; the tone tokens therefore use the raw theme tokens.

## Button

- `buttonSize` gains `control` (36px) and `control-labelled` (52px). Existing sizes and the prop name are unchanged.
- `tone` (filled) with `soft` (outlined, transparent until hovered); `fillIcon`; `shortcut: string[]` keycaps after the label (`aria-hidden`, mirrored into `aria-keyshortcuts`); `loading` (native `disabled`, `aria-busy`, spinner replaces the leading icon); `pressed` (`aria-pressed` and the accent look); `labelMaxWidth` (ellipsis; the full label becomes `title` only while truncated); `asChild` now renders the single child through Radix Slot and never reaches the DOM (disabled or loading becomes `aria-disabled` and `tabIndex=-1`).

## IconButton

- `iconSize` gains `control` (36px square) and `control-labelled` (52px square, no caption).
- `tone` (tinted surface; sits on the `secondary` variant unless a `variant` is given), `pressed`, `badge: { tone, label?, description? }` (top-right; `description` is wired through `aria-describedby`), `tooltip` (library Tooltip on hover and focus; replaces the native title), `disabledReason` (`aria-disabled`, still hoverable and focusable, click swallowed, the reason is the tooltip).
- Callbacks stay ordinary props (`onClick`).

## Tests

`packages/core/test/Button/Button.variations.test.tsx` and `packages/core/test/IconButton/IconButton.variations.test.tsx`.
