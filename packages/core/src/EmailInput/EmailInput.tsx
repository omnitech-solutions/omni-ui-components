import * as React from 'react';

import { cn } from 'lib/utils';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { EmailInputPrimitive } from './EmailInputPrimitive';
import type { InputProps } from '../Input/Input.types';

export type EmailInputProps = Omit<InputProps, 'type' | 'inputMode'>;

/**
 * Omni EmailInput — chrome-wrapped {@link EmailInputPrimitive}.
 *
 * @example
 * <EmailInput label="Email" value={email} onChange={setEmail} />
 */
const EmailInputInner = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ id: idProp, wrapperClassName, labelClassName, layout = 'vertical', label, description, error, required, invalid, className, ...primitiveProps }, ref) => {
    const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
      id: idProp,
      label,
      description,
      error,
      invalid,
      prefix: 'oui-email',
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
        <EmailInputPrimitive
          ref={ref}
          id={id}
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
EmailInputInner.displayName = 'EmailInput';

export const EmailInput = React.memo(EmailInputInner) as typeof EmailInputInner;
