import type * as React from 'react';
import type { ControlTone } from '../internal/support/controlTone';
import type { RootProps } from '../lib';

export type IconButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';
export type IconButtonSize = 'sm' | 'default' | 'md' | 'lg' | 'control' | 'control-labelled';
export type IconButtonTone = ControlTone;

/** Small status badge at the button's top-right (e.g. the amber "!" for a lost microphone). */
export interface IconButtonBadge {
  tone: IconButtonTone;
  /** Short visible glyph or count, e.g. `'!'`. Omit for a plain dot. */
  label?: string;
  /** Spoken description (wired through `aria-describedby`), e.g. "Microphone lost". */
  description?: string;
}

/**
 * Props for the Omni IconButton — a square, icon-only button used in
 * array / object toolbars (RJSF copy / move / remove) and other compact
 * affordances.
 *
 * @example
 * <IconButton aria-label="Remove" icon={<Trash2 />} onClick={() => …} />
 */
export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    RootProps {
  /** The icon node. Sized by the size variant; receives `pointer-events-none`. */
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  iconSize?: IconButtonSize;
  /** Convenient render-time alias for `aria-label`. Either is required for a11y. */
  label?: string;
  /** Native tooltip text. Falls back to `aria-label`. Ignored when `tooltip` or `disabledReason` is set. */
  title?: string;
  /** Tinted tone from the `--oui-tone-*` scale. Unset keeps the `variant` look; set, it overrides the variant colours. */
  tone?: IconButtonTone;
  /** Toggle state: sets `aria-pressed` and the pressed look. Leave unset for a plain button. */
  pressed?: boolean;
  /** Badge at the top-right corner. */
  badge?: IconButtonBadge;
  /** Rich tooltip shown on hover and keyboard focus (replaces the native `title`). */
  tooltip?: React.ReactNode;
  /**
   * Why the button cannot be used. Renders `aria-disabled` (not the native
   * `disabled`) so it stays hoverable and focusable: the reason shows as the
   * tooltip. Clicks are swallowed. Takes precedence over `disabled`.
   */
  disabledReason?: string;
}
