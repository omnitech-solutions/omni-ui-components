import type { SwitchProps } from '@omnitech/omni-ui-core/Switch';
import type { Variant } from '../../internal/support/makeFactory';

export const switchPropsFactory = (overrides: Partial<SwitchProps> = {}): SwitchProps => ({
  id: 'demo-switch',
  label: 'Email notifications',
  description: 'Daily digest at 9am.',
  checked: false,
  switchSide: 'right',
  required: false,
  disabled: false,
  ...overrides,
});

/** Ordered variant matrix used by the cheatsheet + kitchen-sink stories. */
export const switchVariants: Variant<SwitchProps>[] = [
  { name: 'Off', args: { label: 'Off', checked: false } },
  { name: 'On', args: { label: 'On', checked: true } },
  { name: 'Label on left', args: { label: 'Label on left', switchSide: 'right', checked: true } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, checked: false } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Please enable notifications', required: true, checked: false } },
];
