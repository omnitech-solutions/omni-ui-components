import type { AvatarProps } from '@omnitech/omni-ui-core/Avatar';

export const avatarPropsFactory = (overrides: Partial<AvatarProps> = {}): AvatarProps => ({
  fallback: 'OU',
  alt: 'Omni User',
  ...overrides,
});
