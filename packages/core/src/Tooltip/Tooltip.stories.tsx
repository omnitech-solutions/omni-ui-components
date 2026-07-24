import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@oc-tech/omni-ui-components/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@oc-tech/omni-ui-components/Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'omni-ui-components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Small <primary>hover/focus hint surface</primary> for <primary>concise explanations, labels, and affordance help</primary>.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Additional context</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const WithIconTrigger: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="rounded border px-2 py-1 text-sm">?</button>
        </TooltipTrigger>
        <TooltipContent>Helpful explanation</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
