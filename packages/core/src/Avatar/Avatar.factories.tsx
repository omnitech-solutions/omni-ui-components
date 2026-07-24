import type { AvatarProps } from '@oc-tech/omni-ui-components/Avatar';

export const avatarPropsFactory = (overrides: Partial<AvatarProps> = {}): AvatarProps => ({
  fallback: 'OU',
  alt: 'Omni User',
  ...overrides,
});
