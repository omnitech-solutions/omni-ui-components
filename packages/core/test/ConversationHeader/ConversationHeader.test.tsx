import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ConversationHeader } from '@oc-tech/omni-ui-components/ConversationHeader';
import {
  ConversationHeaderDemo,
  conversationHeaderPropsFactory,
  conversationHeaderVariants,
  conversationMenuItems,
} from 'factories/omni-ui-components/ConversationHeader/ConversationHeader.factories';

const openRename = async () => {
  await userEvent.click(screen.getByRole('button', { name: /Two Sum with a hash map/ }));
  await userEvent.click(await screen.findByRole('menuitem', { name: 'Rename' }));
};

describe('omni-ui-components/ConversationHeader', () => {
  it('renders a named toolbar with the title as a menu button and the actions', () => {
    render(<ConversationHeader {...conversationHeaderPropsFactory()} />);
    expect(screen.getByRole('toolbar', { name: 'Conversation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Two Sum with a hash map/ })).toHaveAttribute('aria-haspopup', 'menu');
    expect(screen.getByRole('button', { name: 'Conversations' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute('title', 'Close (⌘ J)');
  });

  it('opens the conversation menu with danger and separated rows from menuItems', async () => {
    const onClick = jest.fn();
    render(<ConversationHeader {...conversationHeaderPropsFactory({ menuItems: conversationMenuItems(onClick) })} />);
    await userEvent.click(screen.getByRole('button', { name: /Two Sum with a hash map/ }));
    const menu = await screen.findByRole('menu', { name: 'Conversation menu' });
    expect(within(menu).getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
      'Rename',
      'Pin',
      'Share read-only link',
      'Export as Markdown',
      'Export as PDF',
      'Archive',
      'Delete',
    ]);
    expect(document.querySelectorAll('[data-slot="action-menu-divider"]').length).toBe(3);
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Delete' }));
    expect(onClick).toHaveBeenCalledWith('delete');
  });

  it('is plain text without menu rows or without a title', () => {
    const { rerender } = render(<ConversationHeader {...conversationHeaderPropsFactory({ menuItems: [] })} />);
    expect(screen.queryByRole('button', { name: /Two Sum/ })).not.toBeInTheDocument();
    expect(screen.getByText('Two Sum with a hash map')).toBeInTheDocument();
    rerender(<ConversationHeader {...conversationHeaderPropsFactory({ conversation: undefined })} />);
    expect(screen.getByText('New conversation')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /New conversation/ })).not.toBeInTheDocument();
  });

  it('the Rename row opens the field with the title selected; Enter commits a trimmed new title', async () => {
    const onRename = jest.fn();
    render(<ConversationHeader {...conversationHeaderPropsFactory({ onRename })} />);
    await openRename();
    const field = (await screen.findByRole('textbox', { name: 'Conversation title' })) as HTMLInputElement;
    expect(field).toHaveAttribute('maxlength', '256');
    await waitFor(() => expect(field).toHaveFocus());
    expect(field.value).toBe('Two Sum with a hash map');
    expect(field.selectionStart).toBe(0);
    expect(field.selectionEnd).toBe(field.value.length);
    await userEvent.keyboard('  Three Sum  {Enter}');
    expect(onRename).toHaveBeenCalledTimes(1);
    expect(onRename).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }), 'Three Sum');
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
  });

  it('Escape cancels without renaming, and the blur that follows does not commit', async () => {
    const onRename = jest.fn();
    render(<ConversationHeader {...conversationHeaderPropsFactory({ onRename })} />);
    await openRename();
    await screen.findByRole('textbox', { name: 'Conversation title' });
    await userEvent.keyboard('Changed{Escape}');
    expect(onRename).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('blur commits; an unchanged or empty title commits nothing', async () => {
    const onRename = jest.fn();
    render(<ConversationHeader {...conversationHeaderPropsFactory({ onRename })} />);
    await openRename();
    await screen.findByRole('textbox', { name: 'Conversation title' });
    await userEvent.keyboard('{Enter}');
    expect(onRename).not.toHaveBeenCalled();
    await openRename();
    await screen.findByRole('textbox', { name: 'Conversation title' });
    await userEvent.keyboard('{Backspace}');
    await userEvent.tab();
    expect(onRename).not.toHaveBeenCalled();
  });

  it('blur commits once the field has settled; an early stray blur (the closing menu) keeps the field', async () => {
    const onRename = jest.fn();
    render(<ConversationHeader {...conversationHeaderPropsFactory({ onRename })} />);
    await openRename();
    const field = (await screen.findByRole('textbox', { name: 'Conversation title' })) as HTMLInputElement;
    await userEvent.keyboard('Renamed');
    // A blur right after opening is the menu returning focus: the field stays and takes focus back.
    field.blur();
    expect(screen.getByRole('textbox', { name: 'Conversation title' })).toBeInTheDocument();
    expect(onRename).not.toHaveBeenCalled();
    // Later, a real blur commits.
    const now = performance.now();
    const spy = jest.spyOn(performance, 'now').mockReturnValue(now + 5000);
    (screen.getByRole('textbox', { name: 'Conversation title' }) as HTMLInputElement).blur();
    expect(onRename).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }), 'Renamed');
    spy.mockRestore();
  });

  it('renaming can be controlled and honours maxLength', () => {
    const { rerender } = render(<ConversationHeader {...conversationHeaderPropsFactory({ renaming: true, maxLength: 10 })} />);
    expect(screen.getByRole('textbox', { name: 'Conversation title' })).toHaveAttribute('maxlength', '10');
    rerender(<ConversationHeader {...conversationHeaderPropsFactory({ renaming: false })} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('actions respect visible and call their handlers; the model control and trailing slots render', async () => {
    const onClick = jest.fn();
    render(
      <ConversationHeader
        {...conversationHeaderPropsFactory({
          actions: [
            { key: 'a', label: 'Alpha', onClick },
            { key: 'b', label: 'Beta', onClick: () => undefined, visible: false },
          ],
          modelControl: <span>Model chip</span>,
          trailing: <span>Trailing</span>,
        })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Alpha' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Beta' })).not.toBeInTheDocument();
    expect(screen.getByText('Model chip')).toBeInTheDocument();
    expect(screen.getByText('Trailing')).toBeInTheDocument();
  });

  it('onHistoryToggle fires from the history button; the button is not rendered without it', async () => {
    const onHistoryToggle = jest.fn();
    const { rerender } = render(<ConversationHeader {...conversationHeaderPropsFactory({ onHistoryToggle })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Conversations' }));
    expect(onHistoryToggle).toHaveBeenCalledTimes(1);
    rerender(<ConversationHeader {...conversationHeaderPropsFactory({ onHistoryToggle: undefined })} />);
    expect(screen.queryByRole('button', { name: 'Conversations' })).not.toBeInTheDocument();
  });

  it('onRenameStart and onRenameCancel fire with the conversation', async () => {
    const onRenameStart = jest.fn();
    const onRenameCancel = jest.fn();
    render(<ConversationHeader {...conversationHeaderPropsFactory({ onRenameStart, onRenameCancel })} />);
    await openRename();
    expect(onRenameStart).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }));
    await screen.findByRole('textbox', { name: 'Conversation title' });
    await userEvent.keyboard('{Escape}');
    expect(onRenameCancel).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }));
  });

  it('every string is translatable through labels', () => {
    render(<ConversationHeader {...conversationHeaderPropsFactory({ conversation: undefined, menuItems: [], labels: { toolbar: 'Conversación', untitled: 'Nueva conversación' } })} />);
    expect(screen.getByRole('toolbar', { name: 'Conversación' })).toBeInTheDocument();
    expect(screen.getByText('Nueva conversación')).toBeInTheDocument();
  });

  it('renders every factory variant and the demo renames', async () => {
    conversationHeaderVariants.forEach((variant) => {
      const { unmount } = render(<ConversationHeader {...conversationHeaderPropsFactory(variant.args)} />);
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
      unmount();
    });
    render(<ConversationHeaderDemo />);
    await openRename();
    await screen.findByRole('textbox', { name: 'Conversation title' });
    await userEvent.keyboard('Renamed{Enter}');
    expect(await screen.findByRole('button', { name: /Renamed/ })).toBeInTheDocument();
  });

  it('keeps a gap between the model control and the trailing buttons', () => {
    render(<ConversationHeader {...conversationHeaderPropsFactory({ modelControl: <span>Model chip</span> })} />);
    expect(screen.getByText('Model chip').closest('[data-slot="conversation-model"]')).toHaveClass('mr-2');
  });
});
