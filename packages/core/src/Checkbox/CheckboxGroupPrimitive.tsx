import * as React from 'react';

import { cn } from 'lib/utils';
import { CheckboxPrimitive } from './CheckboxPrimitive';
import type { CheckboxGroupPrimitiveProps } from './Checkbox.types';

/**
 * Raw Omni checkbox group primitive — a list of {@link CheckboxPrimitive}
 * items with per-option label/description rows. Whole row is clickable
 * (each item wraps its checkbox in a `<label>`).
 *
 * Defaults to `vertical` orientation; pass `orientation="horizontal"` for
 * inline layout (mirrors RJSF's `ui:options.inline=true`).
 */
const CheckboxGroupPrimitiveInner = React.forwardRef<HTMLDivElement, CheckboxGroupPrimitiveProps>(
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

    const [internal, setInternal] = React.useState<string[]>(defaultValue ?? []);
    const isControlled = value !== undefined;
    const current = isControlled ? value! : internal;

    const toggle = (next: string, checked: boolean) => {
      const updated = checked ? [...current, next] : current.filter((v) => v !== next);
      if (!isControlled) setInternal(updated);
      onChange?.(updated);
    };

    return (
      <div
        ref={ref}
        role="group"
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid || undefined}
        data-testid={testId}
        data-slot="checkbox-group"
        data-orientation={orientation}
        className={cn(orientation === 'horizontal' ? 'flex flex-row flex-wrap items-center gap-x-6 gap-y-3' : 'flex flex-col gap-4', className)}
      >
        {options.map((opt, idx) => {
          const itemId = id ? `${id}-${opt.value}` : `oui-checkbox-${idx}-${opt.value}`;
          const descriptionId = opt.description ? `${itemId}-description` : undefined;
          const isItemDisabled = disabled || opt.disabled;
          const checked = current.includes(opt.value);
          return (
            <label
              key={opt.value}
              htmlFor={itemId}
              className={cn(
                'flex items-start gap-3 rounded-md p-2 -m-2',
                isItemDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted/40',
              )}
            >
              <CheckboxPrimitive
                id={itemId}
                name={name}
                checked={checked}
                disabled={isItemDisabled}
                required={required}
                onChange={(c) => toggle(opt.value, c)}
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
      </div>
    );
  },
);
CheckboxGroupPrimitiveInner.displayName = 'CheckboxGroupPrimitive';

export const CheckboxGroupPrimitive = React.memo(CheckboxGroupPrimitiveInner) as typeof CheckboxGroupPrimitiveInner;
