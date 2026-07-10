import * as React from 'react';

import { NumberInputPrimitive } from '../NumberInput/NumberInputPrimitive';
import type { NumberInputPrimitiveProps } from '../NumberInput/NumberInput.types';

export interface CurrencyInputPrimitiveProps extends Omit<NumberInputPrimitiveProps, 'prefix' | 'thousandSeparator'> {
  /** ISO 4217 code (e.g. `USD`, `EUR`). Default `USD`. */
  currency?: string;
  /** Locale for symbol + thousand separator. */
  locale?: string;
  /** Decimal places. Default 2. */
  decimals?: number;
}

const symbolFor = (currency: string, locale?: string): string => {
  try {
    const parts = new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
    return parts.find((p) => p.type === 'currency')?.value ?? '$';
  } catch {
    return '$';
  }
};

// Bare currency input primitive. NumberInputPrimitive preconfigured for money.
const CurrencyInputPrimitiveInner = React.forwardRef<HTMLInputElement, CurrencyInputPrimitiveProps>(
  ({ currency = 'USD', locale, decimals = 2, min = 0, ...rest }, ref) => (
    <NumberInputPrimitive ref={ref} prefix={symbolFor(currency, locale)} thousandSeparator locale={locale} decimals={decimals} min={min} {...rest} />
  ),
);
CurrencyInputPrimitiveInner.displayName = 'CurrencyInputPrimitive';

export const CurrencyInputPrimitive = React.memo(CurrencyInputPrimitiveInner) as typeof CurrencyInputPrimitiveInner;
