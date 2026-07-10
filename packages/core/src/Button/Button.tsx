import * as React from 'react';

import { cn } from 'lib/utils';
import { buttonVariants } from './Button.variants';
import type { ButtonProps } from './Button.types';

/**
 * Omni Button — namespaced wrapper over the shadcn Button shape, with
 * Omni field-height tokens + design-system palette. Use this in place
 * of `components/ui/button` for any new omni-ui-components feature
 * surface so the look stays consistent with Input / Select / Slider.
 *
 * @example
 * <Button variant="default" buttonSize="default" onClick={save}>Save</Button>
 * <Button variant="destructive" icon={<Trash2 />}>Delete</Button>
 */
const ButtonInner = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, buttonSize, icon, iconAfter, type = 'button', children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        data-slot="button"
        data-variant={variant ?? 'default'}
        data-button-size={buttonSize ?? 'default'}
        className={cn(buttonVariants({ variant, buttonSize }), className)}
        {...rest}
      >
        {icon}
        {children}
        {iconAfter}
      </button>
    );
  },
);
ButtonInner.displayName = 'Button';

export const Button = React.memo(ButtonInner) as typeof ButtonInner;
