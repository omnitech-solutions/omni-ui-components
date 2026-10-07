import type { IconButtonProps } from '@oc-tech/omni-ui-components/IconButton';
import { Camera, Mic, MicOff, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { Variant } from '../../internal/support/makeFactory';

/** Build `<IconButton>` props for standalone stories and tests. */
export const iconButtonPropsFactory = (
  overrides: Partial<IconButtonProps> = {},
): IconButtonProps => ({
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
  {
    name: 'Destructive',
    args: { variant: 'destructive', icon: <Trash2 />, 'aria-label': 'Delete' },
  },
  {
    name: 'Disabled',
    args: { variant: 'outline', icon: <X />, 'aria-label': 'Close', disabled: true },
  },
];

/** Ordered size matrix for IconButton. */
export const iconButtonSizeVariants: Variant<IconButtonProps>[] = [
  { name: 'sm', args: { iconSize: 'sm', icon: <Pencil />, 'aria-label': 'Edit (sm)' } },
  {
    name: 'default',
    args: { iconSize: 'default', icon: <Pencil />, 'aria-label': 'Edit (default)' },
  },
  { name: 'md', args: { iconSize: 'md', icon: <Pencil />, 'aria-label': 'Edit (md)' } },
  { name: 'lg', args: { iconSize: 'lg', icon: <Pencil />, 'aria-label': 'Edit (lg)' } },
  {
    name: 'control (36px)',
    args: { iconSize: 'control', icon: <Pencil />, 'aria-label': 'Edit (control)' },
  },
  {
    name: 'control-labelled (52px)',
    args: {
      iconSize: 'control-labelled',
      icon: <Pencil />,
      'aria-label': 'Edit (control-labelled)',
    },
  },
];

/** Tone scale at the 36px control size (tinted surface, tone foreground and border). */
export const iconButtonToneVariants: Variant<IconButtonProps>[] = (
  ['neutral', 'accent', 'success', 'warning', 'danger', 'dim'] as const
).map((tone) => ({
  name: tone,
  args: { iconSize: 'control', tone, icon: <Camera />, 'aria-label': `Capture (${tone})` },
}));

/** Native toolbar states: mic muted / lost, pressed, tooltip, disabled with a reason. */
export const iconButtonStateVariants: Variant<IconButtonProps>[] = [
  {
    name: 'Muted (danger)',
    args: {
      iconSize: 'control',
      tone: 'danger',
      icon: <MicOff />,
      'aria-label': 'Unmute microphone',
    },
  },
  {
    name: 'Lost (warning + badge)',
    args: {
      iconSize: 'control',
      tone: 'warning',
      icon: <Mic />,
      'aria-label': 'Microphone',
      badge: { tone: 'warning', label: '!', description: 'Microphone lost' },
      tooltip: 'Microphone lost. Trying again.',
    },
  },
  {
    name: 'Pressed',
    args: {
      iconSize: 'control',
      variant: 'outline',
      pressed: true,
      icon: <Camera />,
      'aria-label': 'Answer panel',
    },
  },
  {
    name: 'Tooltip',
    args: { iconSize: 'control', icon: <Mic />, 'aria-label': 'Microphone', tooltip: 'Listening' },
  },
  {
    name: 'Disabled with reason',
    args: {
      iconSize: 'control',
      tone: 'dim',
      icon: <Camera />,
      'aria-label': 'Capture',
      disabledReason: 'Resume to capture',
    },
  },
];
