import type { CheckboxGroupProps, CheckboxOption, CheckboxProps } from '@oc-tech/omni-ui-components/Checkbox';
import type { Variant } from '../../internal/support/makeFactory';

export const SAMPLE_CHANNELS: CheckboxOption[] = [
  { value: 'email', label: 'Email', description: 'Daily digest at 9am.' },
  { value: 'sms', label: 'SMS', description: 'Mobile alerts for urgent items.' },
  { value: 'push', label: 'Push notifications', description: 'Browser + desktop.' },
  { value: 'slack', label: 'Slack' },
];

/** Build `<Checkbox>` props for a single-boolean checkbox. */
export const checkboxPropsFactory = (overrides: Partial<CheckboxProps> = {}): CheckboxProps => ({
  id: 'demo-checkbox',
  label: 'Subscribe to product updates',
  description: 'Once a week, no spam.',
  checked: false,
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

/** Ordered variant matrix used by the cheatsheet + kitchen-sink stories. */
export const checkboxVariants: Variant<CheckboxProps>[] = [
  { name: 'Unchecked', args: { label: 'Unchecked', description: 'Default off state.', checked: false } },
  { name: 'Checked', args: { label: 'Checked', description: 'Toggled on.', checked: true } },
  { name: 'Required', args: { label: 'Required', description: 'Must be selected to continue.', required: true, checked: false } },
  { name: 'Invalid', args: { label: 'Invalid', description: 'Shows an error message below.', error: 'Required to continue', checked: false } },
  { name: 'Disabled', args: { label: 'Disabled', description: 'Not interactive.', disabled: true, checked: false } },
  { name: 'Disabled (checked)', args: { label: 'Disabled (checked)', description: 'Locked in the on state.', disabled: true, checked: true } },
];

/** Build `<CheckboxGroup>` props for a multi-checkbox group. */
export const checkboxGroupPropsFactory = (overrides: Partial<CheckboxGroupProps> = {}): CheckboxGroupProps => ({
  id: 'demo-checkbox-group',
  label: 'Notification channels',
  options: SAMPLE_CHANNELS,
  value: [],
  orientation: 'vertical',
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});
