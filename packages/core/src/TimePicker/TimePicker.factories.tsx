import type { TimePickerProps } from '@oc-tech/omni-ui-components/TimePicker';
import type { Variant } from '../../internal/support/makeFactory';

export const timePickerPropsFactory = (overrides: Partial<TimePickerProps> = {}): TimePickerProps => ({
  id: 'demo-time',
  label: 'Start time',
  value: '',
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

export const timePickerVariants: Variant<TimePickerProps>[] = [
  { name: 'Default', args: { label: 'Default', value: '' } },
  { name: 'Prefilled', args: { label: 'Prefilled', value: '09:30' } },
  { name: 'With step', args: { label: 'With step', value: '12:00', step: 900 } },
  { name: 'Bounded', args: { label: 'Bounded', value: '10:00', min: '09:00', max: '17:00' } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: '08:00' } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Pick a time within business hours', value: '' } },
];
