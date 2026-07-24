import type { DatePickerProps } from '@oc-tech/omni-ui-components/DatePicker';
import type { Variant } from '../../internal/support/makeFactory';

export const datePickerPropsFactory = (overrides: Partial<DatePickerProps> = {}): DatePickerProps => ({
  id: 'demo-date',
  label: 'Due date',
  mode: 'single',
  placeholder: 'Pick a date',
  value: null,
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

const PREFILLED_DATE = new Date(2026, 5, 29);

/** Ordered variant matrix used by the cheatsheet + kitchen-sink stories. */
export const datePickerVariants: Variant<DatePickerProps>[] = [
  { name: 'Default', args: { label: 'Default', placeholder: 'Pick a date…', value: null } },
  { name: 'Prefilled', args: { label: 'Prefilled', value: PREFILLED_DATE } },
  { name: 'With description', args: { label: 'With description', description: 'Used for billing cycle dates.', placeholder: 'MM/DD/YYYY', value: null } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: PREFILLED_DATE } },
  { name: 'Range mode', args: { label: 'Range mode', mode: 'range', value: { from: PREFILLED_DATE, to: new Date(2026, 6, 5) } } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Please pick a date', required: true, value: null } },
];
