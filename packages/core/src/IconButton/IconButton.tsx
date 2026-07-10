import * as React from 'react';
import { Trash2 } from 'lucide-react';

import { cn } from 'lib/utils';
import { iconButtonVariants } from './IconButton.variants';
import type { IconButtonProps } from './IconButton.types';

/**
 * Trash2 from lucide-react implies a destructive action — auto-default
 * the variant to `destructive` so callers don't have to repeat themselves.
 */
const isTrashIcon = (icon: React.ReactNode): boolean =>
  React.isValidElement(icon) && (icon.type === Trash2 || (icon.type as { displayName?: string })?.displayName === 'Trash2');

/**
 * Omni IconButton — square, icon-only button used by RJSF array
 * toolbars (copy / move / remove) and other compact affordances. Sizes
 * track the Omni field-height scale so the button sits cleanly next to
 * Input / Select / Textarea rows.
 *
 * Mirrors `@rjsf/shadcn`'s IconButton API (`icon`, `variant`, size). One
 * of `label` / `aria-label` / `title` is required for a11y; the wrapper
 * does not enforce this at the type level so the props stay structurally
 * compatible with RJSF's `IconButtonProps`.
 *
 * @example
 * <IconButton aria-label="Remove" icon={<Trash2 />} variant="destructive" onClick={…} />
 */
const IconButtonInner = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, variant, iconSize, label, title, className, type = 'button', ...rest }, ref) => {
    const restAny = rest as Record<string, unknown>;
    const ariaLabel = label ?? (restAny['aria-label'] as string | undefined);
    const resolvedVariant = variant ?? (isTrashIcon(icon) ? 'destructive' : 'outline');
    return (
      <button
        ref={ref}
        type={type}
        title={title ?? ariaLabel}
        aria-label={ariaLabel}
        data-slot="icon-button"
        data-variant={resolvedVariant}
        data-icon-size={iconSize ?? 'default'}
        className={cn(iconButtonVariants({ variant: resolvedVariant, iconSize }), className)}
        {...rest}
      >
        {icon}
      </button>
    );
  },
);
IconButtonInner.displayName = 'IconButton';

export const IconButton = React.memo(IconButtonInner) as typeof IconButtonInner;
