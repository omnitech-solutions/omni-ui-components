import type { ButtonProps } from '@oc-tech/omni-ui-components/Button';
import { Camera, Pause, Play } from 'lucide-react';
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
  { name: 'control (36px)', args: { buttonSize: 'control', children: 'control' } },
  {
    name: 'control-labelled (52px)',
    args: { buttonSize: 'control-labelled', children: 'control-labelled' },
  },
];

/** Tone scale at the 36px control size: filled and soft (outlined). */
export const buttonToneVariants: Variant<ButtonProps>[] = (
  ['neutral', 'accent', 'success', 'warning', 'danger', 'dim'] as const
).flatMap((tone) => [
  { name: `${tone}`, args: { buttonSize: 'control', tone, children: tone } },
  {
    name: `${tone} soft`,
    args: { buttonSize: 'control', tone, soft: true, children: `${tone} soft` },
  },
]);

/** Footer actions of the Native App: filled icon, tone, soft. */
export const buttonActionVariants: Variant<ButtonProps>[] = [
  {
    name: 'Pause session',
    args: {
      buttonSize: 'control',
      tone: 'neutral',
      soft: true,
      fillIcon: true,
      icon: <Pause />,
      children: 'Pause session',
    },
  },
  {
    name: 'Resume session',
    args: {
      buttonSize: 'control',
      tone: 'success',
      fillIcon: true,
      icon: <Play />,
      children: 'Resume session',
    },
  },
  {
    name: 'End session',
    args: { buttonSize: 'control', tone: 'danger', soft: true, children: 'End session' },
  },
];

/** State and content variations: shortcut text, loading, pressed, truncating label, asChild. */
export const buttonStateVariants: Variant<ButtonProps>[] = [
  {
    name: 'Shortcut',
    args: {
      buttonSize: 'control',
      tone: 'neutral',
      icon: <Camera />,
      shortcut: ['⌘', '⇧', 'S'],
      children: 'Capture',
    },
  },
  {
    name: 'Loading',
    args: {
      buttonSize: 'control',
      tone: 'accent',
      loading: true,
      icon: <Camera />,
      children: 'Analysing',
    },
  },
  {
    name: 'Pressed',
    args: { buttonSize: 'control', variant: 'outline', pressed: true, children: 'Answer' },
  },
  {
    name: 'Label max width',
    args: {
      buttonSize: 'control',
      tone: 'neutral',
      labelMaxWidth: 120,
      children: 'Data Structures & Algorithms',
    },
  },
  {
    name: 'As child (link)',
    args: {
      buttonSize: 'control',
      variant: 'outline',
      asChild: true,
      children: <a href="#docs">Open docs</a>,
    },
  },
];
