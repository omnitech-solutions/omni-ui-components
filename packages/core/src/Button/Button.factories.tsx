import type { ButtonProps } from '@omnitech/omni-ui-core/Button';
import type { Variant } from '../../internal/support/makeFactory';

/** Build `<Button>` props for standalone stories and tests. */
export const buttonPropsFactory = (overrides: Partial<ButtonProps> = {}): ButtonProps => ({
  children: 'Save',
  variant: 'default',
  buttonSize: 'default',
  ...overrides,
});

/**
 * Ordered variant matrix consumed by the Components Cheatsheet and any
 * future kitchen-sink / VRT story. Keep the order stable — stories rely on it.
 */
export const buttonVariants: Variant<ButtonProps>[] = [
  { name: 'Default', args: { variant: 'default', children: 'Default' } },
  { name: 'Secondary', args: { variant: 'secondary', children: 'Secondary' } },
  { name: 'Outline', args: { variant: 'outline', children: 'Outline' } },
  { name: 'Destructive', args: { variant: 'destructive', children: 'Destructive' } },
  { name: 'Ghost', args: { variant: 'ghost', children: 'Ghost' } },
  { name: 'Link', args: { variant: 'link', children: 'Link' } },
  { name: 'Disabled', args: { disabled: true, children: 'Disabled' } },
];

export const buttonSizeVariants: Variant<ButtonProps>[] = [
  { name: 'sm', args: { buttonSize: 'sm', children: 'sm' } },
  { name: 'default', args: { buttonSize: 'default', children: 'default' } },
  { name: 'md', args: { buttonSize: 'md', children: 'md' } },
  { name: 'lg', args: { buttonSize: 'lg', children: 'lg' } },
];
