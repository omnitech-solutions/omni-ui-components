import '@testing-library/jest-dom';

import {
  ConversationList,
  ConversationListFooter,
} from '@oc-tech/omni-ui-components/ConversationList';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  archivedRowActions,
  ConversationListDemo,
  conversationListPropsFactory,
  conversationListVariants,
  sampleFooter,
} from 'factories/omni-ui-components/ConversationList/ConversationList.factories';

describe('omni-ui-components/ConversationList', () => {
  it('renders a named navigation with headed groups in order', () => {
    render(<ConversationList {...conversationListPropsFactory()} />);
    const nav = screen.getByRole('navigation', { name: 'Conversations' });
    const groups = within(nav).getAllByRole('group');
    expect(groups.map((g) => g.getAttribute('aria-label'))).toEqual([
      'Pinned',
      'Today',
      'Previous 7 days',
      'Previous 30 days',
      'Older',
    ]);
    expect(within(groups[1]).getAllByRole('button', { name: /Two Sum|closures/i }).length).toBe(2);
  });

  it('marks the open row with aria-current and reports onOpen with the item', async () => {
    const onOpen = jest.fn();
    render(<ConversationList {...conversationListPropsFactory({ onOpen })} />);
    const open = screen.getByRole('button', { name: 'Two Sum with a hash map' });
    expect(open.closest('[data-slot="conversation-row"]')).toHaveAttribute('aria-current', 'true');
    expect(
      screen
        .getByRole('button', { name: 'Debounce vs throttle' })
        .closest('[data-slot="conversation-row"]'),
    ).not.toHaveAttribute('aria-current');
    await userEvent.click(screen.getByRole('button', { name: 'Debounce vs throttle' }));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'c4' }));
  });

  it('resolves row actions per item: Pin or Unpin, filled state in aria-pressed, danger delete', async () => {
    const onPin = jest.fn();
    const onDelete = jest.fn();
    const { conversationRowActions } = await import(
      'factories/omni-ui-components/ConversationList/ConversationList.factories'
    );
    render(
      <ConversationList
        {...conversationListPropsFactory({
          rowActions: conversationRowActions({ onPin, onDelete }),
        })}
      />,
    );
    const pinnedRow = screen
      .getByRole('button', { name: 'Design a rate limiter' })
      .closest('[data-slot="conversation-row"]') as HTMLElement;
    const unpin = within(pinnedRow).getByRole('button', { name: 'Unpin' });
    expect(unpin).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(unpin);
    expect(onPin).toHaveBeenCalledWith(expect.objectContaining({ id: 'c3' }));
    const otherRow = screen
      .getByRole('button', { name: 'Debounce vs throttle' })
      .closest('[data-slot="conversation-row"]') as HTMLElement;
    expect(within(otherRow).getByRole('button', { name: 'Pin' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await userEvent.click(within(otherRow).getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'c4' }));
  });

  it('hides an action where `visible` says so', () => {
    render(
      <ConversationList
        {...conversationListPropsFactory({
          rowActions: [
            {
              key: 'x',
              label: 'Only pinned',
              visible: (item) => Boolean(item.pinned),
              onClick: () => undefined,
            },
          ],
        })}
      />,
    );
    expect(screen.getAllByRole('button', { name: 'Only pinned' })).toHaveLength(1);
  });

  it('search reports each keystroke, shows the shortcut hint, and is hidden without onSearchChange', async () => {
    const onSearchChange = jest.fn();
    const { rerender } = render(
      <ConversationList {...conversationListPropsFactory({ onSearchChange })} />,
    );
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search conversations' }), 'ab');
    expect(onSearchChange).toHaveBeenNthCalledWith(1, 'a');
    expect(onSearchChange).toHaveBeenNthCalledWith(2, 'ab');
    expect(screen.getByText('⌘K')).toBeInTheDocument();
    rerender(<ConversationList {...conversationListPropsFactory({ onSearchChange: undefined })} />);
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('shows the three empty states', () => {
    const { rerender } = render(
      <ConversationList {...conversationListPropsFactory(conversationListVariants[3].args)} />,
    );
    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    rerender(
      <ConversationList {...conversationListPropsFactory(conversationListVariants[4].args)} />,
    );
    expect(screen.getByText('No conversations match “kubernetes”')).toBeInTheDocument();
    rerender(
      <ConversationList {...conversationListPropsFactory(conversationListVariants[5].args)} />,
    );
    expect(screen.getByText('No archived conversations')).toBeInTheDocument();
    rerender(
      <ConversationList
        {...conversationListPropsFactory({ groups: [], empty: <em>Custom empty</em> })}
      />,
    );
    expect(screen.getByText('Custom empty')).toBeInTheDocument();
  });

  it('archived button shows the count; the archived view swaps New chat for Back and hides search', async () => {
    const onShowArchived = jest.fn();
    const onBack = jest.fn();
    const { rerender } = render(
      <ConversationList {...conversationListPropsFactory({ onShowArchived, archivedCount: 3 })} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Archived · 3' }));
    expect(onShowArchived).toHaveBeenCalledTimes(1);
    rerender(
      <ConversationList
        {...conversationListPropsFactory({
          archived: true,
          onBack,
          rowActions: archivedRowActions(),
        })}
      />,
    );
    expect(screen.getByText('Archived', { selector: 'span' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /New chat/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Archived ·/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('New chat carries its shortcut in the tooltip; Close shows only in overlay mode', async () => {
    const onNewChat = jest.fn();
    const onClose = jest.fn();
    const { rerender } = render(
      <ConversationList {...conversationListPropsFactory({ onNewChat, onClose })} />,
    );
    expect(screen.getByRole('button', { name: 'New chat' })).toHaveAttribute(
      'title',
      'New chat (⌘ ⇧ O)',
    );
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'New chat' }));
    expect(onNewChat).toHaveBeenCalledTimes(1);
    rerender(
      <ConversationList {...conversationListPropsFactory({ onNewChat, onClose, docked: false })} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('every string is translatable through labels', () => {
    render(
      <ConversationList
        {...conversationListPropsFactory({
          labels: {
            title: 'Conversaciones',
            archivedButton: (n) => `Archivadas · ${n}`,
            searchPlaceholder: 'Buscar',
          },
        })}
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Conversaciones' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Archivadas · 2' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar' })).toBeInTheDocument();
  });

  it('a missing icon falls back to the first letter of the label', () => {
    render(<ConversationList {...conversationListPropsFactory({ icons: undefined })} />);
    expect(screen.getByRole('button', { name: 'New chat' })).toHaveTextContent('N');
  });

  it('renders every factory variant', () => {
    conversationListVariants.forEach((variant) => {
      const { unmount } = render(
        <ConversationList {...conversationListPropsFactory(variant.args)} />,
      );
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      unmount();
    });
  });

  it('footer shows initials, name, detail and a settings button', async () => {
    const onOpenSettings = jest.fn();
    render(
      <ConversationList
        {...conversationListPropsFactory({ footer: sampleFooter(onOpenSettings) })}
      />,
    );
    expect(screen.getByText('DO')).toBeInTheDocument();
    expect(screen.getByText('Pro plan')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('footer renders nothing without a user or a gear, and honours explicit initials', () => {
    const { container, rerender } = render(<ConversationListFooter />);
    expect(container).toBeEmptyDOMElement();
    rerender(<ConversationListFooter user={{ name: 'Ada Lovelace', initials: 'AL' }} />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('the demo filters, pins and swaps to the archived view', async () => {
    render(<ConversationListDemo />);
    await userEvent.type(screen.getByRole('searchbox'), 'rate');
    expect(screen.queryByText('Two Sum with a hash map')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Unpin' }));
    expect(screen.getByRole('button', { name: 'Pin' })).toBeInTheDocument();
  });
});
