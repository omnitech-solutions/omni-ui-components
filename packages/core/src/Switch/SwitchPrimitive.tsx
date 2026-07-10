import * as React from 'react';
import { Switch as ShadcnSwitch } from 'components/ui/switch';

import { cn } from 'lib/utils';
import type { SwitchPrimitiveProps } from './Switch.types';

/**
 * Raw Omni Switch primitive (Radix `@radix-ui/react-switch` via the
 * shadcn `components/ui/switch` wrapper). Use {@link Switch} for the
 * chrome-wrapped variant with label / description / error.
 */
const SwitchPrimitiveInner = React.forwardRef<HTMLButtonElement, SwitchPrimitiveProps>(
  (
    {
      id,
      name,
      className,
      checked,
      defaultChecked,
      onChange,
      disabled,
      required,
      invalid,
      'aria-describedby': ariaDescribedBy,
      'aria-label': ariaLabel,
      ...rest
    },
    ref,
  ) => {
    const restAny = rest as Record<string, unknown>;
    const testId = typeof restAny['data-testid'] === 'string' && restAny['data-testid'].length > 0 ? (restAny['data-testid'] as string) : id;
    return (
      <ShadcnSwitch
        ref={ref}
        id={id}
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(c) => onChange?.(c === true)}
        disabled={disabled}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        data-testid={testId}
        data-slot="switch"
        className={cn(className)}
      />
    );
  },
);
SwitchPrimitiveInner.displayName = 'SwitchPrimitive';

export const SwitchPrimitive = React.memo(SwitchPrimitiveInner) as typeof SwitchPrimitiveInner;
