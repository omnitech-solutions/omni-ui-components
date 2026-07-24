import type { NumberInputProps } from '@oc-tech/omni-ui-components/NumberInput';
import type { Variant } from '../../internal/support/makeFactory';

export const numberInputPropsFactory = (overrides: Partial<NumberInputProps> = {}): NumberInputProps => ({
  id: 'demo-number',
  label: 'Quantity',
  value: 100,
  thousandSeparator: true,
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

/** Ordered variant matrix used by the cheatsheet + kitchen-sink stories. */
export const numberInputVariants: Variant<NumberInputProps>[] = [
  { name: 'Default', args: { label: 'Default', value: 100 } },
  { name: 'Decimals', args: { label: 'Decimals', value: 12.5, decimalScale: 2 } },
  { name: 'Required', args: { label: 'Required', required: true, value: null as unknown as number } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: 42 } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Must be greater than zero', value: 0 } },
];
