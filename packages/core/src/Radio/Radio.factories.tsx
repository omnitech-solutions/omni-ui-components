import type { RadioOption, RadioProps } from '@oc-tech/omni-ui-components/Radio';
import type { Variant } from '../../internal/support/makeFactory';

export const SAMPLE_PLANS: RadioOption[] = [
  { value: 'free', label: 'Free', description: 'Up to 3 projects.' },
  { value: 'pro', label: 'Pro', description: '$15 / month. Unlimited projects.' },
  { value: 'team', label: 'Team', description: '$30 / month. Seats + permissions.' },
];

/**
 * Build `<Radio>` props for standalone (non-RJSF) stories and tests.
 *
 * @example
 * render(<Radio {...radioPropsFactory({ value: 'pro' })} />);
 */
export const radioPropsFactory = (overrides: Partial<RadioProps> = {}): RadioProps => ({
  id: 'demo-radio',
  label: 'Billing plan',
  options: SAMPLE_PLANS,
  value: '',
  orientation: 'vertical',
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

/** Ordered variant matrix used by the cheatsheet + kitchen-sink stories. */
export const radioVariants: Variant<RadioProps>[] = [
  { name: 'Default', args: { label: 'Default', value: '' } },
  { name: 'Selected', args: { label: 'Selected', value: 'pro' } },
  { name: 'Horizontal', args: { label: 'Horizontal', orientation: 'horizontal', value: 'free' } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: 'team' } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Please pick a plan', required: true, value: '' } },
];
