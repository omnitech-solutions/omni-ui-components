import type { RateProps } from '@oc-tech/omni-ui-components/Rate';
import { Heart } from 'lucide-react';
import type { Variant } from '../internal/support/makeFactory';

/** Build `<Rate>` props for stories and tests. */
export const ratePropsFactory = (overrides: Partial<RateProps> = {}): RateProps => ({
  id: 'demo-rate',
  label: 'Answer quality',
  description: 'How well did the answer land?',
  defaultValue: 3,
  ...overrides,
});

/** A custom mark, as a consumer passes one. */
export const SAMPLE_RATE_ICON = <Heart aria-hidden="true" />;

/** German mark names: every spoken string goes through `labels`. */
export const SAMPLE_RATE_LABELS: RateProps['labels'] = {
  mark: (value, count) => `${value} von ${count}`,
};

export const rateSizeVariants: Variant<RateProps>[] = [
  { name: 'Small', args: { id: 'rate-sm', label: 'Small', size: 'sm' } },
  { name: 'Default', args: { id: 'rate-default', label: 'Default', size: 'default' } },
  { name: 'Medium', args: { id: 'rate-md', label: 'Medium', size: 'md' } },
  { name: 'Large', args: { id: 'rate-lg', label: 'Large', size: 'lg' } },
];
