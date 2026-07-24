import type { CardProps } from '@oc-tech/omni-ui-components/Card';

export const cardPropsFactory = (overrides: Partial<CardProps> = {}): CardProps => ({
  ...overrides,
});
