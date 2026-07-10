import * as React from 'react';
import { RadioGroup, RadioGroupItem } from 'components/ui/radio-group';

import { cn } from 'lib/utils';
import type { RadioPrimitiveProps } from './Radio.types';

/**
 * Raw Omni Radio primitive — composes the shadcn RadioGroup +
 * RadioGroupItem with per-option label + optional description rows.
 *
 * Defaults to `vertical` orientation (stacked) like the shadcn primitive;
 * pass `orientation="horizontal"` to lay options inline (mirrors RJSF's
 * `ui:options.inline=true`).
 *
 * Wrapped in `React.memo` so RJSF parent re-renders only touch fields
 * whose props actually changed.
 */
const RadioPrimitiveInner = React.forwardRef<HTMLDivElement, RadioPrimitiveProps>(
  (
    {
      id,
      name,
      className,
      options,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      disabled,
      required,
      invalid,
      orientation = 'vertical',
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) => {
    const restAny = rest as Record<string, unknown>;
    const testId = typeof restAny['data-testid'] === 'string' && restAny['data-testid'].length > 0 ? (restAny['data-testid'] as string) : id;

    return (
      <RadioGroup
        ref={ref}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => onChange?.(next)}
        disabled={disabled}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={ariaDescribedBy}
        data-testid={testId}
        data-orientation={orientation}
        orientation={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
        className={cn(orientation === 'horizontal' ? 'flex flex-row flex-wrap items-center gap-x-6 gap-y-3' : 'flex flex-col gap-4', className)}
      >
        {options.map((opt, idx) => {
          const itemId = id ? `${id}-${opt.value}` : `oui-radio-${idx}-${opt.value}`;
          const descriptionId = opt.description ? `${itemId}-description` : undefined;
          const isItemDisabled = disabled || opt.disabled;
          return (
            <label
              key={opt.value}
              htmlFor={itemId}
              className={cn(
                'flex items-start gap-3 rounded-md p-2 -m-2',
                isItemDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-[var(--oui-surface-field-hover,theme(colors.muted/40))]',
              )}
            >
              <RadioGroupItem
                id={itemId}
                value={opt.value}
                disabled={isItemDisabled}
                onBlur={onBlur}
                onFocus={onFocus}
                data-testid={testId ? `${testId}-option-${opt.value}` : undefined}
                aria-describedby={descriptionId}
                className="mt-0.5"
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-[family-name:var(--oui-font-sans)] text-sm font-semibold leading-tight text-[var(--oui-foreground)]">{opt.label}</span>
                {opt.description ? (
                  <span id={descriptionId} className="font-[family-name:var(--oui-font-sans)] text-xs text-[var(--oui-foreground-muted)]">
                    {opt.description}
                  </span>
                ) : null}
              </div>
            </label>
          );
        })}
      </RadioGroup>
    );
  },
);
RadioPrimitiveInner.displayName = 'RadioPrimitive';

export const RadioPrimitive = React.memo(RadioPrimitiveInner) as typeof RadioPrimitiveInner;
