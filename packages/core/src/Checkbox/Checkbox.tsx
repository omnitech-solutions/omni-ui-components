import * as React from 'react';

import { cn } from 'lib/utils';
import { useStableId } from '../lib';
import { fieldGroupVariants } from '../Input/Input.variants';
import { CheckboxPrimitive } from './CheckboxPrimitive';
import type { CheckboxProps } from './Checkbox.types';

/**
 * Chrome-wrapped single Omni Checkbox. Composes {@link CheckboxPrimitive}
 * with an inline label + optional description; the whole row is a
 * `<label>` so clicking anywhere toggles the checkbox.
 *
 * @example
 * <Checkbox
 *   label="Subscribe to product updates"
 *   description="Once a week, no spam."
 *   checked={subscribed}
 *   onChange={setSubscribed}
 * />
 */
const CheckboxInner = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    { id: idProp, wrapperClassName, labelClassName, layout = 'vertical', label, description, error, required, invalid, className, disabled, ...primitiveProps },
    ref,
  ) => {
    const fallbackId = useStableId('oui-checkbox');
    const id = idProp ?? fallbackId;
    const isInvalid = Boolean(error) || Boolean(invalid);
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

    const errorNode = error ? (
      <p id={errorId} role="alert" className="font-[family-name:var(--oui-font-sans)] text-xs text-[var(--oui-border-invalid)]">
        {error}
      </p>
    ) : null;

    return (
      <div className={cn(fieldGroupVariants({ layout }), wrapperClassName)} data-layout={layout}>
        <label
          htmlFor={id}
          className={cn(
            'flex items-start gap-3 rounded-md p-2 -m-2',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted/40',
            labelClassName,
          )}
        >
          <CheckboxPrimitive
            ref={ref}
            id={id}
            invalid={isInvalid}
            required={required}
            disabled={disabled}
            aria-describedby={describedBy}
            className={cn('mt-0.5', className)}
            {...primitiveProps}
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            {label ? (
              <span className="font-[family-name:var(--oui-font-sans)] text-sm font-semibold leading-tight text-[var(--oui-foreground)]">
                {label}
                {required ? (
                  <span className="ml-0.5 text-[var(--oui-foreground-required)]" aria-hidden="true">
                    *
                  </span>
                ) : null}
              </span>
            ) : null}
            {description && !error ? (
              <span id={descriptionId} className="font-[family-name:var(--oui-font-sans)] text-xs text-[var(--oui-foreground-muted)]">
                {description}
              </span>
            ) : null}
          </div>
        </label>
        {errorNode}
      </div>
    );
  },
);
CheckboxInner.displayName = 'Checkbox';

export const Checkbox = React.memo(CheckboxInner) as typeof CheckboxInner;
