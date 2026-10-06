import { Code, Lightbulb, MessageSquare } from 'lucide-react';

import type { SegmentedOption, SegmentedProps } from '@oc-tech/omni-ui-components/Segmented';
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

/** Panel toggles of the Native App toolbar: icon-only options in the control appearance. */
export const SAMPLE_PANELS: SegmentedOption[] = [
  { value: 'chat', icon: <MessageSquare />, ariaLabel: 'Chat' },
  { value: 'answer', icon: <Lightbulb />, ariaLabel: 'Answer' },
  { value: 'code', icon: <Code />, ariaLabel: 'Code' },
];

/** Multiple mode and the control appearance (icon options, minActive, disabledReason). */
export const segmentedControlVariants: Variant<SegmentedProps>[] = [
  {
    name: 'Control, multiple (all on)',
    args: { label: 'Control, multiple', mode: 'multiple', appearance: 'control', options: SAMPLE_PANELS, value: ['chat', 'answer', 'code'] },
  },
  {
    name: 'Control, last one locked',
    args: {
      label: 'Control, minActive 1',
      mode: 'multiple',
      appearance: 'control',
      minActive: 1,
      minActiveReason: 'At least one panel stays visible',
      options: SAMPLE_PANELS,
      value: ['answer'],
    },
  },
  {
    name: 'Control, labelled options',
    args: {
      label: 'Control, labelled',
      mode: 'multiple',
      appearance: 'control',
      options: SAMPLE_PANELS.map((option) => ({ ...option, label: option.ariaLabel })),
      value: ['chat', 'code'],
    },
  },
  {
    name: 'Control, disabled reason',
    args: {
      label: 'Control, disabledReason',
      mode: 'multiple',
      appearance: 'control',
      options: SAMPLE_PANELS.map((option) => (option.value === 'code' ? { ...option, disabledReason: 'Starts after the approach' } : option)),
      value: ['chat'],
    },
  },
  { name: 'Control, single', args: { label: 'Control, single', appearance: 'control', options: SAMPLE_PANELS, value: 'answer' } },
];
