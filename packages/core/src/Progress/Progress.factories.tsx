import type { ProgressProps } from '@oc-tech/omni-ui-components/Progress';
import type { Variant } from '../../internal/support/makeFactory';

/** Build `<Progress>` props for standalone stories and tests. */
export const progressPropsFactory = (overrides: Partial<ProgressProps> = {}): ProgressProps => ({
  percent: 64,
  ...overrides,
});

/** Linear bar variations. */
export const progressVariants: Variant<ProgressProps>[] = [
  { name: 'Default', args: { percent: 64 } },
  { name: 'Success', args: { percent: 100, status: 'success' } },
  { name: 'Active', args: { percent: 48, status: 'active' } },
];

/** Ring variations: indeterminate, determinate, tones and sizes. */
export const progressRingVariants: Variant<ProgressProps>[] = [
  { name: 'Ring indeterminate', args: { shape: 'ring' } },
  { name: 'Ring 25%', args: { shape: 'ring', value: 25 } },
  { name: 'Ring 70%', args: { shape: 'ring', value: 70 } },
  { name: 'Ring success', args: { shape: 'ring', value: 100, tone: 'success' } },
  { name: 'Ring warning', args: { shape: 'ring', tone: 'warning' } },
  { name: 'Ring danger', args: { shape: 'ring', value: 40, tone: 'danger' } },
  { name: 'Ring 36px', args: { shape: 'ring', size: 36, value: 60 } },
];
