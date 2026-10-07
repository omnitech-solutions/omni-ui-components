import { IconButton, type IconButtonProps } from '@oc-tech/omni-ui-components/IconButton';
import type { Meta, StoryObj } from '@storybook/react';
import {
  iconButtonPropsFactory,
  iconButtonToneVariants,
} from 'factories/omni-ui-components/IconButton/IconButton.factories';
import { Camera, ChevronDown, ChevronUp, Copy, Mic, MicOff, Trash2, X } from 'lucide-react';

const meta: Meta<typeof IconButton> = {
  title: 'omni-ui-components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: iconButtonPropsFactory(),
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    iconSize: {
      control: 'inline-radio',
      options: ['sm', 'default', 'md', 'lg', 'control', 'control-labelled'],
    },
    tone: {
      control: 'inline-radio',
      options: [undefined, 'neutral', 'accent', 'success', 'warning', 'danger', 'dim'],
    },
    pressed: { control: 'boolean', description: 'Toggle state: aria-pressed + pressed look.' },
    badge: {
      control: 'object',
      description: '{ tone, label?, description? } status badge at the top-right.',
    },
    tooltip: { control: 'text', description: 'Rich tooltip on hover and focus.' },
    disabledReason: {
      control: 'text',
      description: 'aria-disabled + the reason as the tooltip; stays hoverable.',
    },
    onClick: { action: 'clicked' },
  },
};
export default meta;

type Story = StoryObj<typeof IconButton>;

export const Default: Story = {};

export const Outline: Story = { args: { variant: 'outline', icon: <Copy /> } };

export const Destructive: Story = {
  args: { variant: 'destructive', icon: <Trash2 />, 'aria-label': 'Remove' },
};

export const Ghost: Story = { args: { variant: 'ghost', icon: <X />, 'aria-label': 'Clear' } };

export const Disabled: Story = { args: { disabled: true, icon: <Trash2 /> } };

export const SizesMatrix: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {(['sm', 'default', 'md', 'lg'] as const).map((s) => (
        <IconButton
          key={s}
          {...(args as IconButtonProps)}
          iconSize={s}
          title={`size=${s}`}
          aria-label={`size ${s}`}
        />
      ))}
    </div>
  ),
};

export const ToolbarRow: Story = {
  render: (args) => (
    <div className="inline-flex items-center gap-1 rounded-md border border-[var(--oui-border-field)] p-1">
      <IconButton
        {...(args as IconButtonProps)}
        variant="ghost"
        icon={<ChevronUp />}
        aria-label="Move up"
      />
      <IconButton
        {...(args as IconButtonProps)}
        variant="ghost"
        icon={<ChevronDown />}
        aria-label="Move down"
      />
      <IconButton
        {...(args as IconButtonProps)}
        variant="ghost"
        icon={<Copy />}
        aria-label="Copy"
      />
      <IconButton
        {...(args as IconButtonProps)}
        variant="destructive"
        icon={<Trash2 />}
        aria-label="Remove"
      />
    </div>
  ),
};

export const Tone: Story = {
  args: { iconSize: 'control', tone: 'accent', icon: <Camera />, 'aria-label': 'Capture' },
};
export const ControlSize: Story = {
  args: { iconSize: 'control', icon: <Camera />, 'aria-label': 'Capture' },
};
export const ControlLabelledSize: Story = {
  args: { iconSize: 'control-labelled', icon: <Camera />, 'aria-label': 'Capture' },
};
export const Pressed: Story = {
  args: { iconSize: 'control', pressed: true, icon: <Camera />, 'aria-label': 'Answer panel' },
};
export const MicMuted: Story = {
  args: {
    iconSize: 'control',
    tone: 'danger',
    icon: <MicOff />,
    'aria-label': 'Unmute microphone',
  },
};
export const WithWarningBadge: Story = {
  args: {
    iconSize: 'control',
    tone: 'warning',
    icon: <Mic />,
    'aria-label': 'Microphone',
    badge: { tone: 'warning', label: '!', description: 'Microphone lost' },
    tooltip: 'Microphone lost. Trying again.',
  },
};
export const WithTooltip: Story = {
  args: { iconSize: 'control', icon: <Mic />, 'aria-label': 'Microphone', tooltip: 'Listening' },
};
export const DisabledWithReason: Story = {
  args: {
    iconSize: 'control',
    tone: 'dim',
    icon: <Camera />,
    'aria-label': 'Capture',
    disabledReason: 'Resume to capture',
  },
};

export const ToneMatrix: Story = {
  render: (args) => (
    <div className="flex items-center gap-[var(--oui-control-gap)]">
      {iconButtonToneVariants.map((variant) => (
        <IconButton key={variant.name} {...(args as IconButtonProps)} {...variant.args} />
      ))}
    </div>
  ),
};
