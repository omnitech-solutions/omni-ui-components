import type { BadgeProps } from '@oc-tech/omni-ui-components/Badge';

export const badgePropsFactory = (overrides: Partial<BadgeProps> = {}): BadgeProps => ({
  children: 'Active',
  variant: 'default',
  ...overrides,
});
