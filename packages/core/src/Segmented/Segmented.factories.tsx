import type { SegmentedOption, SegmentedProps } from '@omnitech/omni-ui-core/Segmented';
import type { Variant } from '../../internal/support/makeFactory';

export const SAMPLE_TONES: SegmentedOption[] = [
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
];

/** Build `<Segmented>` props for standalone (non-RJSF) stories and tests. */
export const segmentedPropsFactory = (overrides: Partial<SegmentedProps> = {}): SegmentedProps => ({
  id: 'demo-segmented',
  label: 'Tone',
  description: 'Pick the tone of the generated doc.',
  options: SAMPLE_TONES,
  value: 'friendly',
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

/** Ordered variant matrix used by the cheatsheet + kitchen-sink stories. */
export const segmentedVariants: Variant<SegmentedProps>[] = [
  { name: 'Default', args: { label: 'Default', value: 'friendly' } },
  { name: 'Empty', args: { label: 'Empty', value: '' } },
  { name: 'Required', args: { label: 'Required', required: true, value: '' } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: 'casual' } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Pick a tone before continuing', required: true, value: '' } },
];
