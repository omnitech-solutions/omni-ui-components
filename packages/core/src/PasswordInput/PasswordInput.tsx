import { cn } from 'lib/utils';
import * as React from 'react';
import type { InputProps } from '../Input';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { PasswordInputPrimitive, type PasswordInputPrimitiveProps } from './PasswordInputPrimitive';

export interface PasswordInputProps
  extends Omit<InputProps, 'type'>,
    Pick<
      PasswordInputPrimitiveProps,
      'revealed' | 'defaultRevealed' | 'onRevealedChange' | 'labels' | 'showIcon' | 'hideIcon'
    > {
  /** Show the eye toggle to reveal/hide the password. Default true. */
  toggleable?: boolean;
}

/**
 * Omni PasswordInput: {@link PasswordInputPrimitive} (which owns the reveal control) inside the shared field
 * chrome.
 *
 * @example
 * <PasswordInput label="Password" required value={password} onChange={setPassword} />
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
      actions: _actions,
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
        <PasswordInputPrimitive
          ref={ref}
          id={id}
          toggleable={toggleable}
          invalid={isInvalid}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          aria-invalid={isInvalid || undefined}
          className={cn(layout === 'horizontal' && 'flex-1', className)}
          {...primitiveProps}
        />
      </FieldShell>
    );
  },
);
PasswordInputInner.displayName = 'PasswordInput';

export const PasswordInput = React.memo(PasswordInputInner) as typeof PasswordInputInner;
