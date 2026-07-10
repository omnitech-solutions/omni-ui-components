import * as React from 'react';

import type { RootProps } from '../lib';
import type { ButtonVariantProps } from './Button.variants';

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
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'>, RootProps, ButtonVariantProps {
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  /** Optional trailing icon node. */
  iconAfter?: React.ReactNode;
  /** Renders as `<a>` when set; pass `href` to forward. */
  asChild?: boolean;
}

export type { ButtonVariant, ButtonSize, ButtonVariantProps } from './Button.variants';
