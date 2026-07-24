import type { DateTimePickerProps } from '@oc-tech/omni-ui-components/DateTimePicker';
import type { Variant } from '../../internal/support/makeFactory';

export const dateTimePickerPropsFactory = (overrides: Partial<DateTimePickerProps> = {}): DateTimePickerProps => ({
  id: 'demo-datetime',
  label: 'Meeting time',
  value: '',
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

export const dateTimePickerVariants: Variant<DateTimePickerProps>[] = [
  { name: 'Default', args: { label: 'Default', value: '' } },
  { name: 'Prefilled', args: { label: 'Prefilled', value: '2026-06-30T09:30' } },
  { name: 'Bounded', args: { label: 'Bounded', value: '2026-06-30T10:00', min: new Date(2026, 5, 30, 9, 0), max: new Date(2026, 5, 30, 17, 0) } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: '2026-06-30T08:00' } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Pick a future date and time', required: true, value: '' } },
];
