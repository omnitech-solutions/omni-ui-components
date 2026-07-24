import type { InputOTPProps } from '@oc-tech/omni-ui-components/InputOTP';
import type { Variant } from '../../internal/support/makeFactory';

export const inputOTPPropsFactory = (overrides: Partial<InputOTPProps> = {}): InputOTPProps => ({
  id: 'demo-otp',
  label: '2FA code',
  length: 6,
  value: '',
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

export const inputOTPVariants: Variant<InputOTPProps>[] = [
  { name: 'Default', args: { label: 'Default', value: '' } },
  { name: 'Prefilled', args: { label: 'Prefilled', value: '123456' } },
  { name: 'With separator', args: { label: 'With separator', value: '123', separatorIndex: 2 } },
  { name: '4 digits', args: { label: '4 digits', length: 4, value: '99' } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: '424242' } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Code is incorrect', value: '000000' } },
];
