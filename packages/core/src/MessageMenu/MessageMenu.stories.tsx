import { MessageMenu, type MessageMenuProps } from '@oc-tech/omni-ui-components/MessageMenu';
import type { Meta, StoryObj } from '@storybook/react';
import {
  MessageMenuDemo,
  messageMenuPropsFactory,
  sampleConversation,
} from 'factories/omni-ui-components/MessageMenu/MessageMenu.factories';
import type * as React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const meta: Meta<MessageMenuProps> = {
  title: 'omni-ui-components/MessageMenu',
  component: MessageMenu as unknown as React.ComponentType<MessageMenuProps>,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The per-message menu, built on `ActionMenu`: <primary>copy</primary>, <primary>hide / unhide</primary>, <primary>delete</primary> behind an inline "cannot be undone" confirm, and an optional <primary>download conversation</primary>. A row exists only when its callback is passed. Escape closes the confirm only; a second Escape closes the menu. Callbacks: <code>onCopy(message)</code> <code>onHide(message)</code> <code>onDelete(message)</code> receive the message by reference.',
      },
    },
  },
  args: messageMenuPropsFactory(),
  argTypes: {
    message: { control: 'object' },
    conversation: {
      control: 'object',
      description: 'Adds "Download conversation" (Markdown file).',
    },
    labels: { control: 'object' },
    onCopy: {
      action: 'copy',
      description: '(message) after the text is on the clipboard. Absent: no Copy row.',
    },
    onHide: { action: 'hide', description: '(message) for Hide and Unhide. Absent: no Hide row.' },
    onDelete: {
      action: 'delete',
      description: '(message) after the confirm. Absent: no Delete row.',
    },
    trigger: { control: false },
    icons: { control: false },
  },
  render: (args) => (
    <div className="min-h-[360px] p-6">
      <MessageMenu {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<MessageMenuProps>;

export const Default: Story = { args: { defaultOpen: true } };
export const WithDownload: Story = {
  args: { defaultOpen: true, conversation: sampleConversation },
};
export const HiddenMessage: Story = {
  args: {
    defaultOpen: true,
    message: { id: 'm1', role: 'assistant', text: 'Hidden', hidden: true },
  },
};
export const CopyOnly: Story = {
  args: { defaultOpen: true, onHide: undefined, onDelete: undefined },
};

export const DeleteConfirm: Story = {
  render: () => <MessageMenuDemo />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'More' }));
    await userEvent.click(await body.findByRole('menuitem', { name: 'Delete message' }));
    await expect(await body.findByText('This cannot be undone.')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByText('This cannot be undone.')).toBeNull());
    await expect(body.getByRole('menu')).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};
