import * as React from 'react';

import { cn } from 'lib/utils';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { CurrencyInputPrimitive } from './CurrencyInputPrimitive';
import type { NumberInputProps } from '../NumberInput';

export interface CurrencyInputProps extends Omit<NumberInputProps, 'prefix' | 'thousandSeparator'> {
  /** ISO 4217 code (e.g. `USD`, `EUR`). Default `USD`. */
  currency?: string;
  /** Locale. */
  locale?: string;
  /** Decimal places. Default 2. */
  decimals?: number;
}

/**
 * Omni CurrencyInput — chrome-wrapped {@link CurrencyInputPrimitive}.
 *
 * @example
 * <CurrencyInput label="Amount" currency="USD" value={amount} onChange={setAmount} />
 */
const CurrencyInputInner = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ id: idProp, wrapperClassName, labelClassName, layout = 'vertical', label, description, error, required, invalid, className, ...primitiveProps }, ref) => {
    const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
      id: idProp,
      label,
      description,
      error,
      invalid,
      prefix: 'oui-currency',
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
        <CurrencyInputPrimitive
          ref={ref}
          id={id}
          invalid={isInvalid}
          required={required}
          aria-describedby={describedBy}
          className={cn(className)}
          {...primitiveProps}
        />
      </FieldShell>
    );
  },
);
CurrencyInputInner.displayName = 'CurrencyInput';

export const CurrencyInput = React.memo(CurrencyInputInner) as typeof CurrencyInputInner;
