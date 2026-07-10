import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';

import { Button, type ButtonProps } from '@omnitech/omni-ui-core/Button';
import { buttonPropsFactory } from 'factories/omni-ui-components/Button/Button.factories';

const meta: Meta<typeof Button> = {
  title: 'omni-ui-components/Button',
  component: Button,
  tags: ['autodocs'],
  args: buttonPropsFactory(),
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] },
    buttonSize: { control: 'inline-radio', options: ['sm', 'default', 'md', 'lg', 'icon'] },
    onClick: { action: 'clicked' },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};
export const Destructive: Story = { args: { variant: 'destructive', children: 'Delete', icon: <Trash2 /> } };
export const Outline: Story = { args: { variant: 'outline' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Link: Story = { args: { variant: 'link', children: 'Learn more' } };
export const WithLeadingIcon: Story = { args: { icon: <Plus />, children: 'Add item' } };
export const WithTrailingIcon: Story = { args: { iconAfter: <ArrowRight />, children: 'Continue' } };
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
