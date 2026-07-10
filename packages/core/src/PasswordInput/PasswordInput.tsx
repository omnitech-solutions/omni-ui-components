import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from 'lib/utils';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { InputPrimitive } from '../Input/InputPrimitive';
import { PasswordInputPrimitive } from './PasswordInputPrimitive';
import type { InputProps } from '../Input';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /** Show the eye toggle to reveal/hide the password. Default true. */
  toggleable?: boolean;
}

/**
 * Omni PasswordInput — chrome-wrapped {@link PasswordInputPrimitive} with
 * an optional show/hide eye toggle owned by the wrapper.
 */
const PasswordInputInner = React.forwardRef<HTMLInputElement, PasswordInputProps>(
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
      toggleable = true,
      disabled,
      ...primitiveProps
    },
    ref,
  ) => {
    const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
      id: idProp,
      label,
      description,
      error,
      invalid,
      prefix: 'oui-password',
    });
    const [visible, setVisible] = React.useState(false);
    const Primitive = visible ? InputPrimitive : PasswordInputPrimitive;
    const extraType = visible ? ({ type: 'text' } as const) : ({} as const);

    return (
      <FieldShell
        id={id}
        layout={layout}
        label={label}
        description={description}
        error={error}
        required={required}
        descriptionId={descriptionId}
        errorId={errorId}
        wrapperClassName={wrapperClassName}
        labelClassName={labelClassName}
      >
        <div className="relative flex w-full items-center" data-slot="password-input-wrapper">
          <Primitive
            ref={ref}
            id={id}
            invalid={isInvalid}
            disabled={disabled}
            aria-describedby={describedBy}
            aria-required={required || undefined}
            aria-invalid={isInvalid || undefined}
            className={cn(layout === 'horizontal' && 'flex-1', toggleable && 'pr-10', className)}
            {...extraType}
            {...primitiveProps}
          />
          {toggleable ? (
            <button
              type="button"
              aria-label={visible ? 'Hide password' : 'Show password'}
              aria-pressed={visible}
              onClick={() => setVisible((v) => !v)}
              disabled={disabled}
              className={cn(
                'absolute right-2 inline-flex size-7 items-center justify-center rounded-md text-[var(--oui-foreground-muted)] cursor-pointer',
                'hover:bg-muted/40 hover:text-[var(--oui-foreground)] transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          ) : null}
        </div>
      </FieldShell>
    );
  },
);
PasswordInputInner.displayName = 'PasswordInput';

export const PasswordInput = React.memo(PasswordInputInner) as typeof PasswordInputInner;
