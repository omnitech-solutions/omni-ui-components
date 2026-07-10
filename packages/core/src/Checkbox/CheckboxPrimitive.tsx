import * as React from 'react';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

import { cn } from 'lib/utils';
import type { CheckboxPrimitiveProps } from './Checkbox.types';

/**
 * Raw Omni single-checkbox primitive. Composes Radix
 * `@radix-ui/react-checkbox` so the markup is `button[role=checkbox]`
 * (full keyboard / a11y support) while the visual chrome matches the
 * Omni checkbox spec:
 *
 * - **Unchecked**: rounded-square with `border-muted-foreground/60`,
 *   transparent fill; hover darkens the border to the primary color.
 * - **Checked**: solid `bg-primary` with white check icon and primary
 *   border.
 *
 * Wrapped in `React.memo` so RJSF parent re-renders only touch fields
 * whose props actually changed.
 */
const CheckboxPrimitiveInner = React.forwardRef<HTMLButtonElement, CheckboxPrimitiveProps>(
  (
    {
      id,
      name,
      className,
      checked,
      defaultChecked,
      onChange,
      onBlur,
      onFocus,
      disabled,
      required,
      invalid,
      autoFocus,
      'aria-describedby': ariaDescribedBy,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    },
    ref,
  ) => {
    const restAny = rest as Record<string, unknown>;
    const testId = typeof restAny['data-testid'] === 'string' && restAny['data-testid'].length > 0 ? (restAny['data-testid'] as string) : id;

    return (
      <RadixCheckbox.Root
        ref={ref}
        id={id}
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(c) => onChange?.(c === true)}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        aria-invalid={invalid || undefined}
        aria-describedby={ariaDescribedBy}
        aria-labelledby={ariaLabelledBy}
        data-testid={testId}
        data-slot="checkbox"
        className={cn(
          'group inline-flex size-[20px] shrink-0 items-center justify-center cursor-pointer',
          'rounded-md border-2 bg-transparent shadow-xs',
          'border-muted-foreground/60 text-primary',
          'transition-[color,box-shadow,border-color,background-color]',
          'outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'hover:border-primary',
          'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
          'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        <RadixCheckbox.Indicator className="flex items-center justify-center">
          <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
    );
  },
);
CheckboxPrimitiveInner.displayName = 'CheckboxPrimitive';

export const CheckboxPrimitive = React.memo(CheckboxPrimitiveInner) as typeof CheckboxPrimitiveInner;
