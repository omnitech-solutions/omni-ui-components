import '@testing-library/jest-dom';
import * as React from 'react';
import { expectTypeOf } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { MessageMenu, type MessageItem } from '@oc-tech/omni-ui-components/MessageMenu';
import { messageMenuPropsFactory, sampleConversation } from 'factories/omni-ui-components/MessageMenu/MessageMenu.factories';

interface RichMessage extends MessageItem {
  author: string;
}
const rich: RichMessage = { id: 'r1', role: 'assistant', text: 'Hello there', author: 'Ada' };

const setup = async (props: Parameters<typeof messageMenuPropsFactory<RichMessage>>[0] = {}) => {
  const user = userEvent.setup();
  render(<MessageMenu {...messageMenuPropsFactory<RichMessage>({ message: rich, ...props })} />);
  const trigger = screen.getByRole('button', { name: 'More' });
  await user.click(trigger);
  return { user, trigger };
};

describe('omni-ui-components/MessageMenu', () => {
  it('onCopy receives the same extended message and writes its text to the clipboard', async () => {
    const onCopy = vi.fn();
    const { user } = await setup({ onCopy });
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    await user.click(screen.getByRole('menuitem', { name: 'Copy message' }));
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(onCopy.mock.calls[0][0]).toBe(rich);
    expect(writeText).toHaveBeenCalledWith('Hello there');
  });

  it('onHide receives the same extended message; the row reads Unhide for a hidden one', async () => {
    const onHide = vi.fn();
    const { user } = await setup({ onHide });
    await user.click(screen.getByRole('menuitem', { name: 'Hide message' }));
    expect(onHide.mock.calls[0][0]).toBe(rich);
  });

  it('offers Unhide when the message is hidden', async () => {
    await setup({ message: { ...rich, hidden: true } });
    expect(screen.getByRole('menuitem', { name: 'Unhide message' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Hide message' })).toBeNull();
  });

  it('onDelete fires only after the inline confirm, with the same extended message', async () => {
    const onDelete = vi.fn();
    const { user } = await setup({ onDelete });
    await user.click(screen.getByRole('menuitem', { name: 'Delete message' }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Cancel' })).toHaveFocus());
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete.mock.calls[0][0]).toBe(rich);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('Cancel returns to the rows without deleting', async () => {
    const onDelete = vi.fn();
    const { user } = await setup({ onDelete });
    await user.click(screen.getByRole('menuitem', { name: 'Delete message' }));
    await user.click(screen.getByRole('menuitem', { name: 'Cancel' }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByRole('menuitem', { name: 'Delete message' })).toBeInTheDocument();
    expect(screen.queryByText('This cannot be undone.')).toBeNull();
  });

  it('Escape closes the confirm only; a second Escape closes the menu and returns focus to the trigger', async () => {
    const { user, trigger } = await setup();
    await user.click(screen.getByRole('menuitem', { name: 'Delete message' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByText('This cannot be undone.')).toBeNull();
    expect(screen.getByRole('menu', { name: 'Message options' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Delete message' })).toHaveFocus());
    expect(screen.getByRole('menuitem', { name: 'Delete message' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('an absent callback hides its row; with none at all only the trigger renders', async () => {
    await setup({ onHide: undefined, onDelete: undefined });
    expect(screen.getByRole('menuitem', { name: 'Copy message' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Hide message' })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: 'Delete message' })).toBeNull();
  });

  it('renders just the trigger when no callback and no conversation is given', () => {
    render(<MessageMenu {...messageMenuPropsFactory({ onCopy: undefined, onHide: undefined, onDelete: undefined })} />);
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('Download conversation appears with `conversation` and saves a Markdown file', async () => {
    const createObjectURL = vi.fn(() => 'blob:x');
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const { user } = await setup({ conversation: sampleConversation });
    await user.click(screen.getByRole('menuitem', { name: 'Download conversation' }));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = (createObjectURL.mock.calls[0] as unknown as [Blob])[0];
    expect(await blob.text()).toContain('# Plan the launch');
    click.mockRestore();
  });

  it('labels override the defaults and the open change callback fires', async () => {
    const onOpenChange = vi.fn();
    render(<MessageMenu {...messageMenuPropsFactory({ labels: { copy: 'Kopieer' }, onOpenChange })} />);
    await userEvent.click(screen.getByRole('button', { name: 'More' }));
    expect(screen.getByRole('menuitem', { name: 'Kopieer' })).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('is generic over the item: extra fields are visible in the callbacks', () => {
    type Props = React.ComponentProps<typeof MessageMenu<RichMessage>>;
    expectTypeOf<Parameters<NonNullable<Props['onDelete']>>[0]['author']>().toEqualTypeOf<string>();
  });
});
