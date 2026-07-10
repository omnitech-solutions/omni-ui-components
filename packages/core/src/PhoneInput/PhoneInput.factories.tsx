import type { PhoneInputProps } from '@omnitech/omni-ui-core/PhoneInput';
import type { Variant } from '../../internal/support/makeFactory';

export const phoneInputPropsFactory = (overrides: Partial<PhoneInputProps> = {}): PhoneInputProps => ({
  id: 'demo-phone',
  label: 'Phone',
  value: '',
  placeholder: '+1 555 0100',
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

/** Ordered variant matrix used by the cheatsheet + kitchen-sink stories. */
export const phoneInputVariants: Variant<PhoneInputProps>[] = [
  { name: 'Default', args: { label: 'Default', value: '' } },
  { name: 'Prefilled', args: { label: 'Prefilled', value: '+1 555 0100' } },
  { name: 'Required', args: { label: 'Required', required: true } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: '+44 20 7946 0958' } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Enter a valid phone number', value: '555' } },
];
