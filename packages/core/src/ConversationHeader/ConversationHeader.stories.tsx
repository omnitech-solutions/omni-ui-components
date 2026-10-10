import {
  ConversationHeader,
  type ConversationHeaderProps,
} from '@oc-tech/omni-ui-components/ConversationHeader';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ConversationHeaderDemo,
  conversationHeaderPropsFactory,
  conversationHeaderVariants,
} from 'factories/omni-ui-components/ConversationHeader/ConversationHeader.factories';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { exampleDocs } from 'storybook-helpers/internal/support/exampleDocs';
import exampleSource from './ConversationHeader.factories.tsx?raw';

const meta: Meta<ConversationHeaderProps> = {
  title: 'omni-ui-components/ConversationHeader',
  component: ConversationHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The bar above a conversation. <primary>Leading buttons</primary> (history), the <primary>title as a menu button</primary> (the library ActionMenu; rows from `menuItems` with `danger` and `separated`), <primary>inline rename</primary> (max 256, select-all on open, Enter or blur commits, Escape cancels), the <primary>model control</primary> slot and the trailing <primary>icon buttons</primary> (new chat, expand, settings, close with its shortcut in the tooltip). Everything is a prop; icons are caller nodes.\n\n<primary>Callbacks</primary> (every callback is optional; a control that exists only for a callback is not rendered when it is absent):\n\n| Callback | Fires when | Payload |\n| --- | --- | --- |\n| `onRename` | a rename is committed with Enter or blur | `(conversation: C, title: string)` |\n| `onRenameStart` | the rename field opens | `(conversation: C)` |\n| `onRenameCancel` | the rename is cancelled with Escape | `(conversation: C)` |\n| `menuItems[].onClick` | a menu row is chosen | `(item: M)` |\n| `actions[].onClick` | a header button is chosen | `(action: A)` |\n| `onHistoryToggle` | the history button is chosen | `()` |',
      },
    },
  },
  args: { ...conversationHeaderPropsFactory(), onRename: fn() },
  argTypes: {
    conversation: {
      control: 'object',
      description:
        'The open conversation item `{ id, title, ... }`. Its title is shown; without one `labels.untitled` shows and the menu is off.',
    },
    menuItems: {
      control: 'object',
      description:
        'Rows `{ id, label, icon, onClick, danger, separated, startsRename, disabled }`. No rows: the title is plain text.',
    },
    maxLength: { control: 'number', description: 'Max length of the rename field. Default 256.' },
    renaming: {
      control: 'boolean',
      description:
        'Controlled rename mode. Omit for the uncontrolled field opened by the Rename row.',
    },
    onHistoryToggle: {
      action: 'history toggle',
      description: 'The history button; not rendered without it.',
    },
    onRenameStart: { action: 'rename start', description: 'Rename field opened (conversation).' },
    onRenameCancel: {
      action: 'rename cancel',
      description: 'Rename cancelled with Escape (conversation).',
    },
    actions: { control: 'object', description: 'Buttons after the model control (same shape).' },
    labels: { control: 'object', description: '`toolbar`, `untitled`, `renameField`, `menu`.' },
    onRename: {
      action: 'rename',
      description: '(conversation, title): the trimmed new title; only when non-empty and changed.',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[520px] p-6">
        <div className="rounded-xl border">
          <Story />
        </div>
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<ConversationHeaderProps>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('toolbar', { name: 'Conversation' })).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: 'Close' })).toHaveAttribute('title', 'Close (⌘ J)');
  },
};

/** The Rename row opens the inline field: text selected, Enter commits the new title. */
export const RenameFromMenu: Story = {
  render: () => <ConversationHeaderDemo />,
  parameters: exampleDocs(exampleSource, 'ConversationHeaderDemo'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Two Sum with a hash map/ }));
    await userEvent.click(await within(document.body).findByRole('menuitem', { name: 'Rename' }));
    const field = await canvas.findByRole('textbox', { name: 'Conversation title' });
    await waitFor(() => expect(field).toHaveFocus());
    expect((field as HTMLInputElement).selectionEnd).toBe('Two Sum with a hash map'.length);
    await userEvent.keyboard('Three Sum{Enter}');
    expect(await canvas.findByRole('button', { name: /Three Sum/ })).toBeInTheDocument();
  },
};

export const RenameCancelsOnEscape: Story = {
  render: () => <ConversationHeaderDemo />,
  parameters: exampleDocs(exampleSource, 'ConversationHeaderDemo'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Two Sum with a hash map/ }));
    await userEvent.click(await within(document.body).findByRole('menuitem', { name: 'Rename' }));
    await canvas.findByRole('textbox', { name: 'Conversation title' });
    await userEvent.keyboard('Nope{Escape}');
    expect(
      await canvas.findByRole('button', { name: /Two Sum with a hash map/ }),
    ).toBeInTheDocument();
  },
};

export const NewConversation: Story = { args: conversationHeaderVariants[1].args };
export const PlainTitle: Story = { args: conversationHeaderVariants[2].args };
export const Renaming: Story = { args: conversationHeaderVariants[3].args };
export const FullPage: Story = { args: conversationHeaderVariants[4].args };
export const WithModelControl: Story = { args: conversationHeaderVariants[5].args };
