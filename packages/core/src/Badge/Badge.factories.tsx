import type { BadgeProps } from '@omnitech/omni-ui-core/Badge';

export const badgePropsFactory = (overrides: Partial<BadgeProps> = {}): BadgeProps => ({
  children: 'Active',
  variant: 'default',
  ...overrides,
});
