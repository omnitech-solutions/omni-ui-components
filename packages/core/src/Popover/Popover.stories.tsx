import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@oc-tech/omni-ui-components/Button';
import { Popover, PopoverPanel, PopoverTrigger } from '@oc-tech/omni-ui-components/Popover';

const meta: Meta<typeof Popover> = {
  title: 'omni-ui-components/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Floating <primary>content surface</primary> anchored to a trigger. Useful for <primary>lightweight contextual details, inline actions, and assistive overlays</primary>.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverPanel>
        <div className="space-y-1">
          <div className="text-sm font-medium">Share link</div>
          <div className="text-sm text-muted-foreground">Anyone with access can open this record.</div>
        </div>
      </PopoverPanel>
    </Popover>
  ),
};

export const WiderContent: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open details</Button>
      </PopoverTrigger>
      <PopoverPanel className="w-96">
        <div className="space-y-2">
          <div className="text-sm font-medium">Share settings</div>
          <div className="text-sm text-muted-foreground">Workspace members can view, comment, or edit based on the selected permission level.</div>
        </div>
      </PopoverPanel>
    </Popover>
  ),
};
