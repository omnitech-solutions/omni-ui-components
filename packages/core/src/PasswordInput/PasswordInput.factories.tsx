import type { PasswordInputProps } from '@oc-tech/omni-ui-components/PasswordInput';
import type { Variant } from '../../internal/support/makeFactory';

export const passwordInputPropsFactory = (overrides: Partial<PasswordInputProps> = {}): PasswordInputProps => ({
  id: 'demo-password',
  label: 'Password',
  placeholder: 'Enter password',
  value: '',
  toggleable: true,
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

export const passwordInputVariants: Variant<PasswordInputProps>[] = [
  { name: 'Default', args: { label: 'Default', value: '' } },
  { name: 'Prefilled', args: { label: 'Prefilled', value: 'hunter2hunter2' } },
  { name: 'No eye toggle', args: { label: 'No eye toggle', value: 'hidden', toggleable: false } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: 'locked' } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Password too short', value: 'abc' } },
];
