import type { SliderProps } from '@oc-tech/omni-ui-components/Slider';
import type { Variant } from '../../internal/support/makeFactory';

/** Build `<Slider>` props for standalone (non-RJSF) stories and tests. */
export const sliderPropsFactory = (overrides: Partial<SliderProps> = {}): SliderProps => ({
  id: 'demo-slider',
  label: 'Volume',
  description: 'Pick any value between 0 and 100.',
  min: 0,
  max: 100,
  step: 1,
  value: 35,
  layout: 'vertical',
  showValue: true,
  valueSuffix: '%',
  required: false,
  disabled: false,
  ...overrides,
});

/** Ordered variant matrix used by the cheatsheet + kitchen-sink stories. */
export const sliderVariants: Variant<SliderProps>[] = [
  { name: 'Default', args: { label: 'Default', value: 35 } },
  { name: 'Max', args: { label: 'Max', value: 100 } },
  { name: 'Stepped', args: { label: 'Stepped', step: 25, value: 75 } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: 50 } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Must be at least 10%', value: 5 } },
];
