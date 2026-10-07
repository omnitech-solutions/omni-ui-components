import {
  ConversationList,
  type ConversationListProps,
} from '@oc-tech/omni-ui-components/ConversationList';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ConversationListDemo,
  conversationListPropsFactory,
  conversationListVariants,
  type SampleConversation,
} from 'factories/omni-ui-components/ConversationList/ConversationList.factories';
import type * as React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

type Args = ConversationListProps<SampleConversation>;

const Frame: React.FC<React.PropsWithChildren<{ height?: number }>> = ({
  height = 520,
  children,
}) => (
  <div className="p-6">
    <div className="w-[280px]" style={{ height }}>
      {children}
    </div>
  </div>
);

const meta: Meta<Args> = {
  title: 'omni-ui-components/ConversationList',
  component: ConversationList as unknown as React.ComponentType<Args>,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The <primary>sidebar of an assistant</primary>: headed groups of conversations (build them with the <primary>groupByRecency</primary> util), a <primary>search field with a key hint</primary>, <primary>hover actions per row</primary> (`rowActions`: pin, delete, restore), an <primary>archived view</primary>, empty states and a <primary>footer slot</primary>. The open row has `aria-current`. Every callback, string (`labels`) and icon (`icons`) is a prop; the caller debounces `onSearchChange`.\n\n<primary>Callbacks</primary> (every callback is optional; a control that exists only for a callback is not rendered when it is absent):\n\n| Callback | Fires when | Payload |\n| --- | --- | --- |\n| `onOpen` | a row title is chosen | `(conversation: C)` |\n| `rowActions[].onClick` | a hover action is chosen | `(conversation: C)` |\n| `onSearchChange` | every keystroke in the search field (controlled or not) | `(query: string)` |\n| `onNewChat` | New chat is chosen | `()` |\n| `onShowArchived` | the Archived button is chosen | `()` |\n| `onBack` | Back is chosen in the archived view | `()` |\n| `onClose` | Close is chosen (overlay mode) | `()` |\n| `ConversationListFooter onOpenSettings` | the settings gear is chosen | `()` |',
      },
    },
  },
  args: {
    ...conversationListPropsFactory(),
    onOpen: fn(),
    onSearchChange: fn(),
    onNewChat: fn(),
    onShowArchived: fn(),
  },
  argTypes: {
    groups: {
      control: 'object',
      description:
        'Headed groups `{ key, label, items }`, in display order. Empty groups are skipped.',
    },
    activeId: {
      control: 'text',
      description: 'The open conversation: its row gets `aria-current`.',
    },
    docked: {
      control: 'boolean',
      description: '`true` sits beside the conversation; `false` floats over it (side-panel mode).',
    },
    archived: {
      control: 'boolean',
      description:
        'Archived view: heading says Archived, Back replaces New chat, search and the archived button hide.',
    },
    archivedCount: {
      control: 'number',
      description: 'Count on the `Archived · N` button (shown when `onShowArchived` is set).',
    },
    query: {
      control: 'text',
      description: 'Search value (controlled). Omit for an uncontrolled field.',
    },
    searchShortcut: { control: 'text', description: 'Key hint at the right of the search field.' },
    newChatShortcut: { control: 'text', description: 'Shortcut in the New chat tooltip.' },
    labels: {
      control: 'object',
      description: 'Every string; `noMatch` and `archivedButton` are functions.',
    },
    onOpen: { action: 'open', description: 'A row was chosen.' },
    onSearchChange: { action: 'search', description: 'Every keystroke: the caller debounces.' },
    onNewChat: { action: 'new chat' },
    onShowArchived: { action: 'show archived' },
  },
  decorators: [
    (Story) => (
      <Frame>
        <Story />
      </Frame>
    ),
  ],
};
export default meta;

type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('navigation', { name: 'Conversations' })).toBeInTheDocument();
    expect(canvas.getByText('Pinned')).toBeInTheDocument();
    expect(canvas.getByText('Previous 30 days')).toBeInTheDocument();
    const row = canvas
      .getByText('Two Sum with a hash map')
      .closest('[data-slot="conversation-row"]');
    expect(row).toHaveAttribute('aria-current', 'true');
  },
};

/** A stateful list: type to filter, Pin toggles the filled pin, Delete removes, the archived button swaps the view. */
export const Interactive: Story = {
  render: () => <ConversationListDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Search conversations' }), 'rate');
    expect(canvas.queryByText('Two Sum with a hash map')).not.toBeInTheDocument();
    expect(canvas.getByText('Design a rate limiter')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Unpin' }));
    expect(canvas.getByRole('button', { name: 'Pin' })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.clear(canvas.getByRole('searchbox'));
    await userEvent.click(canvas.getByRole('button', { name: /Archived · 2/ }));
    expect(canvas.getByText('Archived', { selector: 'span' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
    expect(canvas.getByRole('button', { name: /Archived · 2/ })).toBeInTheDocument();
  },
};

export const Overlay: Story = { args: conversationListVariants[1].args };
export const ArchivedView: Story = { args: conversationListVariants[2].args };
export const NoConversations: Story = { args: conversationListVariants[3].args };
export const NoSearchMatch: Story = { args: conversationListVariants[4].args };
export const NoArchived: Story = { args: conversationListVariants[5].args };

export const Translated: Story = {
  args: {
    labels: {
      title: 'Conversaciones',
      newChat: 'Nuevo chat',
      searchPlaceholder: 'Buscar conversaciones',
      archivedButton: (count: number) => `Archivadas · ${count}`,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('navigation', { name: 'Conversaciones' })).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: /Archivadas · 2/ })).toBeInTheDocument();
  },
};
