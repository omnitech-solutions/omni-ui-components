import * as React from 'react';

import type { RootProps } from '../lib';

export type IconButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type IconButtonSize = 'sm' | 'default' | 'md' | 'lg';

/**
 * Props for the Omni IconButton — a square, icon-only button used in
 * array / object toolbars (RJSF copy / move / remove) and other compact
 * affordances.
 *
 * @example
 * <IconButton aria-label="Remove" icon={<Trash2 />} onClick={() => …} />
 */
export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>, RootProps {
  /** The icon node. Sized by the size variant; receives `pointer-events-none`. */
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  iconSize?: IconButtonSize;
  /** Convenient render-time alias for `aria-label`. Either is required for a11y. */
  label?: string;
  /** Tooltip text. Falls back to `title` if not supplied. */
  title?: string;
}
