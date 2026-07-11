import type { CardProps } from '@omnitech/omni-ui-core/Card';

export const cardPropsFactory = (overrides: Partial<CardProps> = {}): CardProps => ({
  ...overrides,
});
