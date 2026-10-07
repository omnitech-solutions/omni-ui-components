import { Button, type ButtonProps } from '@oc-tech/omni-ui-components/Button';
import type { Meta, StoryObj } from '@storybook/react';
import {
  buttonActionVariants,
  buttonPropsFactory,
  buttonToneVariants,
} from 'factories/omni-ui-components/Button/Button.factories';
import { ArrowRight, Camera, Play, Plus, Trash2 } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'omni-ui-components/Button',
  component: Button,
  tags: ['autodocs'],
  args: buttonPropsFactory(),
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    buttonSize: {
      control: 'inline-radio',
      options: ['sm', 'default', 'md', 'lg', 'icon', 'control', 'control-labelled'],
    },
    tone: {
      control: 'inline-radio',
      options: [undefined, 'neutral', 'accent', 'success', 'warning', 'danger', 'dim'],
    },
    soft: { control: 'boolean', description: 'With `tone`: outlined instead of filled.' },
    fillIcon: { control: 'boolean', description: 'Render the leading icon filled.' },
    loading: {
      control: 'boolean',
      description: 'Native disabled + aria-busy + spinner in place of the leading icon.',
    },
    pressed: { control: 'boolean', description: 'Toggle state: aria-pressed + pressed look.' },
    shortcut: {
      control: 'object',
      description: 'Shortcut after the label as plain mono text, e.g. ["⌘", "⇧", "S"].',
    },
    labelMaxWidth: {
      control: 'text',
      description:
        'Label ellipsis width (px number or CSS length); full label becomes the title when cut.',
    },
    asChild: { control: 'boolean', description: 'Render the single child element as the button.' },
    onClick: { action: 'clicked' },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};
export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete', icon: <Trash2 /> },
};
export const Outline: Story = { args: { variant: 'outline' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Link: Story = { args: { variant: 'link', children: 'Learn more' } };
export const WithLeadingIcon: Story = { args: { icon: <Plus />, children: 'Add item' } };
export const WithTrailingIcon: Story = {
  args: { iconAfter: <ArrowRight />, children: 'Continue' },
};
export const Disabled: Story = { args: { disabled: true } };

export const SizesMatrix: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {(['sm', 'default', 'md', 'lg'] as const).map((s) => (
        <Button key={s} {...(args as ButtonProps)} buttonSize={s}>
          {`size=${s}`}
        </Button>
      ))}
    </div>
  ),
};

export const Tone: Story = { args: { buttonSize: 'control', tone: 'accent', children: 'Accent' } };
export const ToneSoft: Story = {
  args: { buttonSize: 'control', tone: 'danger', soft: true, children: 'End session' },
};
export const ControlSize: Story = {
  args: { buttonSize: 'control', tone: 'neutral', children: 'Control 36px' },
};
export const ControlLabelledSize: Story = {
  args: { buttonSize: 'control-labelled', tone: 'neutral', children: 'Labelled 52px' },
};
export const FillIcon: Story = {
  args: {
    buttonSize: 'control',
    tone: 'success',
    fillIcon: true,
    icon: <Play />,
    children: 'Resume session',
  },
};
export const WithShortcut: Story = {
  args: {
    buttonSize: 'control',
    tone: 'neutral',
    icon: <Camera />,
    shortcut: ['⌘', '⇧', 'S'],
    children: 'Capture',
  },
};
export const Loading: Story = {
  args: {
    buttonSize: 'control',
    tone: 'accent',
    loading: true,
    icon: <Camera />,
    children: 'Analysing',
  },
};
export const Pressed: Story = {
  args: { buttonSize: 'control', variant: 'outline', pressed: true, children: 'Answer' },
};
export const LabelMaxWidth: Story = {
  args: {
    buttonSize: 'control',
    tone: 'neutral',
    labelMaxWidth: 140,
    children: 'Data Structures & Algorithms',
  },
};
export const AsChildLink: Story = {
  args: {
    variant: 'outline',
    asChild: true,
    children: <a href="https://example.com">Open docs</a>,
  },
};
export const AsChildDisabled: Story = {
  args: {
    variant: 'outline',
    asChild: true,
    disabled: true,
    children: <a href="https://example.com">Disabled link</a>,
  },
};

export const ToneMatrix: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-3" style={{ width: 'fit-content' }}>
      {buttonToneVariants.map((variant) => (
        <Button key={variant.name} {...(args as ButtonProps)} {...variant.args} />
      ))}
    </div>
  ),
};

export const SessionFooter: Story = {
  name: 'Native footer actions',
  render: (args) => (
    <div className="flex items-center gap-[var(--oui-control-gap)]">
      {buttonActionVariants.map((variant) => (
        <Button key={variant.name} {...(args as ButtonProps)} {...variant.args} />
      ))}
    </div>
  ),
};
