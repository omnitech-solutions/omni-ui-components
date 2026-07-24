import type { CurrencyInputProps } from '@oc-tech/omni-ui-components/CurrencyInput';
import type { Variant } from '../../internal/support/makeFactory';

export const currencyInputPropsFactory = (overrides: Partial<CurrencyInputProps> = {}): CurrencyInputProps => ({
  id: 'demo-currency',
  label: 'Amount',
  currency: 'USD',
  value: 1234.5,
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

/** Ordered variant matrix used by the cheatsheet + kitchen-sink stories. */
export const currencyInputVariants: Variant<CurrencyInputProps>[] = [
  { name: 'USD', args: { label: 'USD', currency: 'USD', value: 1234.5 } },
  { name: 'EUR', args: { label: 'EUR', currency: 'EUR', value: 950 } },
  { name: 'GBP', args: { label: 'GBP', currency: 'GBP', value: 0 } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: 1234.5 } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Amount must be positive', value: 0 } },
];
