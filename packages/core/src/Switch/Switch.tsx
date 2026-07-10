import * as React from 'react';

import { cn } from 'lib/utils';
import { useStableId } from '../lib';
import { fieldGroupVariants } from '../Input/Input.variants';
import { SwitchPrimitive } from './SwitchPrimitive';
import type { SwitchProps } from './Switch.types';

/**
 * Chrome-wrapped Omni Switch. The full row is a `<label>` so clicking
 * anywhere toggles the switch.
 *
 * @example
 * <Switch label="Email notifications" description="Daily digest at 9am." checked={on} onChange={setOn} />
 */
const SwitchInner = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      id: idProp,
      wrapperClassName,
      labelClassName,
      layout = 'vertical',
      label,
      description,
      error,
      required,
      invalid,
      className,
      disabled,
      switchSide = 'right',
      ...primitiveProps
    },
    ref,
  ) => {
    const fallbackId = useStableId('oui-switch');
    const id = idProp ?? fallbackId;
    const isInvalid = Boolean(error) || Boolean(invalid);
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

    const switchNode = (
      <SwitchPrimitive
        ref={ref}
        id={id}
        invalid={isInvalid}
        required={required}
        disabled={disabled}
        aria-describedby={describedBy}
        className={cn(className)}
        {...primitiveProps}
      />
    );

    const textNode = (
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
    );

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
            'flex items-start justify-between gap-4 rounded-md p-2 -m-2',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted/40',
            labelClassName,
          )}
        >
          {switchSide === 'left' ? (
            <>
              {switchNode}
              {textNode}
            </>
          ) : (
            <>
              {textNode}
              {switchNode}
            </>
          )}
        </label>
        {errorNode}
      </div>
    );
  },
);
SwitchInner.displayName = 'Switch';

export const Switch = React.memo(SwitchInner) as typeof SwitchInner;
