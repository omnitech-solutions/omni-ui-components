import * as React from 'react';
import { Trash2, Pencil, Plus, X } from 'lucide-react';

import type { IconButtonProps } from '@omnitech/omni-ui-core/IconButton';
import type { Variant } from '../../internal/support/makeFactory';

/** Build `<IconButton>` props for standalone stories and tests. */
export const iconButtonPropsFactory = (overrides: Partial<IconButtonProps> = {}): IconButtonProps => ({
  'aria-label': 'Remove',
  icon: <Trash2 />,
  variant: 'outline',
  iconSize: 'default',
  ...overrides,
});

/** Ordered variant matrix used by the cheatsheet + kitchen-sink stories. */
export const iconButtonVariants: Variant<IconButtonProps>[] = [
  { name: 'Outline', args: { variant: 'outline', icon: <Pencil />, 'aria-label': 'Edit' } },
  { name: 'Ghost', args: { variant: 'ghost', icon: <Plus />, 'aria-label': 'Add' } },
  { name: 'Destructive', args: { variant: 'destructive', icon: <Trash2 />, 'aria-label': 'Delete' } },
  { name: 'Disabled', args: { variant: 'outline', icon: <X />, 'aria-label': 'Close', disabled: true } },
];

/** Ordered size matrix for IconButton. */
export const iconButtonSizeVariants: Variant<IconButtonProps>[] = [
  { name: 'sm', args: { iconSize: 'sm', icon: <Pencil />, 'aria-label': 'Edit (sm)' } },
  { name: 'default', args: { iconSize: 'default', icon: <Pencil />, 'aria-label': 'Edit (default)' } },
  { name: 'md', args: { iconSize: 'md', icon: <Pencil />, 'aria-label': 'Edit (md)' } },
  { name: 'lg', args: { iconSize: 'lg', icon: <Pencil />, 'aria-label': 'Edit (lg)' } },
];
