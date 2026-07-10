import type { EmailInputProps } from '@omnitech/omni-ui-core/EmailInput';
import type { Variant } from '../../internal/support/makeFactory';

export const emailInputPropsFactory = (overrides: Partial<EmailInputProps> = {}): EmailInputProps => ({
  id: 'demo-email',
  label: 'Email',
  placeholder: 'name@company.com',
  value: '',
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

export const emailInputVariants: Variant<EmailInputProps>[] = [
  { name: 'Default', args: { label: 'Default', value: '' } },
  { name: 'Prefilled', args: { label: 'Prefilled', value: 'ada@omni.com' } },
  { name: 'Required', args: { label: 'Required', required: true } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: 'locked@omni.com' } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Enter a valid email', value: 'not-an-email' } },
];
