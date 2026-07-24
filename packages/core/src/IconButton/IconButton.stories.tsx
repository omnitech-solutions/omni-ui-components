import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDown, ChevronUp, Copy, Trash2, X } from 'lucide-react';

import { IconButton, type IconButtonProps } from '@oc-tech/omni-ui-components/IconButton';
import { iconButtonPropsFactory } from 'factories/omni-ui-components/IconButton/IconButton.factories';

const meta: Meta<typeof IconButton> = {
  title: 'omni-ui-components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: iconButtonPropsFactory(),
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] },
    iconSize: { control: 'inline-radio', options: ['sm', 'default', 'md', 'lg'] },
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
        <IconButton key={s} {...(args as IconButtonProps)} iconSize={s} title={`size=${s}`} aria-label={`size ${s}`} />
      ))}
    </div>
  ),
};

export const ToolbarRow: Story = {
  render: (args) => (
    <div className="inline-flex items-center gap-1 rounded-md border border-[var(--oui-border-field)] p-1">
      <IconButton {...(args as IconButtonProps)} variant="ghost" icon={<ChevronUp />} aria-label="Move up" />
      <IconButton {...(args as IconButtonProps)} variant="ghost" icon={<ChevronDown />} aria-label="Move down" />
      <IconButton {...(args as IconButtonProps)} variant="ghost" icon={<Copy />} aria-label="Copy" />
      <IconButton {...(args as IconButtonProps)} variant="destructive" icon={<Trash2 />} aria-label="Remove" />
    </div>
  ),
};
