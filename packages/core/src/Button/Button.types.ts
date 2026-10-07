import type * as React from 'react';

import type { RootProps } from '../lib';
import type { ButtonTone, ButtonVariantProps } from './Button.variants';

/**
 * Props for the Omni Button. Mirrors the shadcn Button API
 * (`variant`, `size`, `type`) and exposes the full native `<button>`
 * attribute surface.
 *
 * Note: the size variant is `buttonSize` (not `size`) to avoid clashing
 * with the DOM `size` attribute on form controls.
 *
 * @example
 * <Button variant="default" buttonSize="default" onClick={save}>Save</Button>
 */
export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
    RootProps,
    Omit<ButtonVariantProps, 'tone' | 'soft' | 'fillIcon'> {
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  /** Optional trailing icon node. */
  iconAfter?: React.ReactNode;
  /**
   * Render the single child element (e.g. an `<a>` or a router `Link`) as the
   * button, merging classes, ref and handlers onto it. The icon, label and
   * shortcut are rendered inside that child. `disabled` / `loading` then become
   * `aria-disabled` + `tabIndex={-1}` (an anchor has no native disabled).
   */
  asChild?: boolean;
  /** Colour tone from the `--oui-tone-*` scale. Unset keeps the `variant` look. */
  tone?: ButtonTone;
  /** With `tone`: outlined and transparent instead of filled. */
  soft?: boolean;
  /** Render the leading icon filled. */
  fillIcon?: boolean;
  /** Shortcut after the label as small plain mono text (keys joined, e.g. ⌘⇧S), one entry per key: `['⌘', '⇧', 'S']`. */
  shortcut?: string[];
  /**
   * Disables the button (native `disabled`), sets `aria-busy` and swaps the
   * leading icon for a spinner. Ignored click handlers are not called.
   */
  loading?: boolean;
  /** Toggle state: sets `aria-pressed` and the pressed look. Leave unset for a plain button. */
  pressed?: boolean;
  /**
   * Max width of the label before it is cut with an ellipsis (number = px, or any
   * CSS length). When truncated the full label is the button's `title`.
   */
  labelMaxWidth?: number | string;
}

export type { ButtonSize, ButtonTone, ButtonVariant, ButtonVariantProps } from './Button.variants';
