import * as React from 'react';

import { cn } from 'lib/utils';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { PhoneInputPrimitive } from './PhoneInputPrimitive';
import type { InputProps } from '../Input';

export { formatPhone } from './formatPhone';

export interface PhoneInputProps extends Omit<InputProps, 'type' | 'inputMode' | 'value' | 'onChange'> {
  value?: string;
  onChange?: (next: string) => void;
  /** Default dial code (e.g. `+1`). When set, formats as `+CC XXX XXX XXXX`. */
  defaultDialCode?: string;
}

/**
 * Omni PhoneInput — chrome-wrapped {@link PhoneInputPrimitive}.
 *
 * @example
 * <PhoneInput label="Phone" value={phone} onChange={setPhone} />
 */
const PhoneInputInner = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ id: idProp, wrapperClassName, labelClassName, layout = 'vertical', label, description, error, required, invalid, className, ...primitiveProps }, ref) => {
    const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
      id: idProp,
      label,
      description,
      error,
      invalid,
      prefix: 'oui-phone',
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
        <PhoneInputPrimitive
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
PhoneInputInner.displayName = 'PhoneInput';

export const PhoneInput = React.memo(PhoneInputInner) as typeof PhoneInputInner;
