import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ApprovalCard, type ApprovalCardProps, type ApprovalStatus } from '@oc-tech/omni-ui-components/ApprovalCard';
import { approvalCardPropsFactory } from 'factories/omni-ui-components/ApprovalCard/ApprovalCard.factories';

/** Resolves its own request so the buttons give way to the outcome. */
const Demo: React.FC<ApprovalCardProps> = (props) => {
  const [status, setStatus] = React.useState<ApprovalStatus>(props.status ?? 'pending');
  React.useEffect(() => setStatus(props.status ?? 'pending'), [props.status]);
  return (
    <div className="max-w-[560px]">
      <ApprovalCard
        {...props}
        status={status}
        onDecide={(decision, approval) => {
          props.onDecide?.(decision, approval);
          setStatus(decision === 'deny' ? 'denied' : decision);
        }}
      />
    </div>
  );
};

const meta: Meta<ApprovalCardProps> = {
  title: 'omni-ui-components/ApprovalCard',
  component: Demo as unknown as React.ComponentType<ApprovalCardProps>,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The model asks to do something that needs permission. A badge, title, description and tags (the first is monospace), then while <primary>pending</primary> Deny, a standing permission and Allow once, each calling <primary>onDecide(decision)</primary> (`once | always | deny`). Answered, the buttons give way to one resolved line (`once`, `always`, `denied`). A labelled `section`; <primary>busy</primary> disables the buttons. Icons are nodes in `icons`; strings in `labels`.\n\n**Callbacks**\n\n| Callback | Fires | Arguments |\n|---|---|---|\n| `onDecide` | a decision button is chosen (buttons drawn only with it) | `(decision: once, always or deny, approval: T)` |',
      },
    },
  },
  args: { ...approvalCardPropsFactory(), onDecide: fn() },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['pending', 'once', 'always', 'denied'],
      description: 'Where the request is.',
    },
    busy: {
      control: 'boolean',
      description: 'Disables the buttons while the decision is sent.',
    },
    tags: { control: 'object' },
    tool: {
      control: 'text',
      description: 'Tool name used in the always-allowed line.',
    },
    onDecide: { action: 'decide' },
  },
};
export default meta;
type Story = StoryObj<ApprovalCardProps>;

export const Pending: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Allow once' }));
    await expect(args.onDecide).toHaveBeenCalledWith('once', expect.objectContaining({ title: 'Run the solution against your tests?' }));
    await expect(canvas.getByText('Allowed once')).toBeVisible();
  },
};
export const Busy: Story = { args: { busy: true } };
export const AllowedOnce: Story = { args: { status: 'once' } };
export const AlwaysAllowed: Story = { args: { status: 'always' } };
export const Denied: Story = { args: { status: 'denied' } };
