import '@testing-library/jest-dom';

import type { AttachmentItem } from '@oc-tech/omni-ui-components/Attachment';
import { MENTION_PATTERN, SLASH_PATTERN } from '@oc-tech/omni-ui-components/CommandPopover';
import { Composer, type ComposerDraft } from '@oc-tech/omni-ui-components/Composer';
import type { QueuedItem } from '@oc-tech/omni-ui-components/QueuedList';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { composerPropsFactory } from 'factories/omni-ui-components/Composer/Composer.factories';
import * as React from 'react';

interface MyAttachment extends AttachmentItem {
  uploadId: string;
}
interface MyQueued extends QueuedItem {
  sentAt: number;
}

const file = (name: string, type = 'text/plain', size = 5) => {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
};

/** Controlled host so typing works. */
const Host: React.FC<Partial<React.ComponentProps<typeof Composer<MyAttachment, MyQueued>>>> = (
  props,
) => {
  const [value, setValue] = React.useState(props.value ?? '');
  const base = composerPropsFactory() as unknown as React.ComponentProps<
    typeof Composer<MyAttachment, MyQueued>
  >;
  return (
    <Composer<MyAttachment, MyQueued> {...base} {...props} value={value} onChange={setValue} />
  );
};

describe('omni-ui-components/Composer callbacks', () => {
  const attachments: MyAttachment[] = [{ id: 'a', name: 'a.pdf', uploadId: 'u-1' }];
  const queued: MyQueued[] = [{ id: 'q', text: 'later', sentAt: 9 }];

  it('onChange fires with the new text in controlled and uncontrolled mode', async () => {
    const onChange = vi.fn();
    const { unmount } = render(
      <Composer {...composerPropsFactory({ value: undefined, onChange })} />,
    );
    await userEvent.type(screen.getByRole('textbox'), 'hi');
    expect(onChange).toHaveBeenLastCalledWith('hi');
    expect(screen.getByRole('textbox')).toHaveValue('hi');
    unmount();
    const controlled = vi.fn();
    render(<Composer {...composerPropsFactory({ value: 'fixed', onChange: controlled })} />);
    await userEvent.type(screen.getByRole('textbox'), '!');
    expect(controlled).toHaveBeenCalledWith('fixed!');
    expect(screen.getByRole('textbox')).toHaveValue('fixed');
  });

  it('onSubmit gets { value, attachments } with the SAME attachment objects, and nothing clears the draft', async () => {
    const seen: string[] = [];
    const onSubmit = vi.fn(
      (draft: ComposerDraft<MyAttachment>): void => void seen.push(draft.attachments[0].uploadId),
    );
    render(<Host value="send me" attachmentItems={attachments} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole('textbox'), '{Enter}');
    expect(onSubmit.mock.calls[0][0].attachments[0]).toBe(attachments[0]);
    expect(seen).toEqual(['u-1']);
    expect(screen.getByRole('textbox')).toHaveValue('send me');
  });

  it('onQueue (submit while streaming) gets the same draft shape', async () => {
    const onQueue = vi.fn();
    render(<Host value="next" streaming attachmentItems={attachments} onQueue={onQueue} />);
    await userEvent.type(screen.getByRole('textbox'), '{Enter}');
    expect(onQueue.mock.calls[0][0].attachments[0]).toBe(attachments[0]);
    expect(onQueue.mock.calls[0][0].value).toBe('next');
  });

  it('onStop, onRecallPrevious, onFocus and onBlur fire', async () => {
    const onStop = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onRecallPrevious = vi.fn(() => 'older');
    render(
      <Host
        streaming
        onStop={onStop}
        onFocus={onFocus}
        onBlur={onBlur}
        onRecallPrevious={onRecallPrevious}
      />,
    );
    const box = screen.getByRole('textbox');
    await userEvent.click(box);
    expect(onFocus).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{ArrowUp}');
    expect(onRecallPrevious).toHaveBeenCalled();
    expect(box).toHaveValue('older');
    await userEvent.clear(box);
    await userEvent.keyboard('{Escape}');
    expect(onStop).toHaveBeenCalled();
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  it('onRemoveAttachment and onAttachmentClick get the same item; absent callbacks draw no buttons', async () => {
    const onRemoveAttachment = vi.fn();
    const onAttachmentClick = vi.fn();
    const { rerender } = render(
      <Host
        attachmentItems={attachments}
        onRemoveAttachment={onRemoveAttachment}
        onAttachmentClick={onAttachmentClick}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remove a.pdf' }));
    await userEvent.click(screen.getByRole('button', { name: /^a\.pdf$/ }));
    expect(onRemoveAttachment.mock.calls[0][0]).toBe(attachments[0]);
    expect(onAttachmentClick.mock.calls[0][0]).toBe(attachments[0]);
    rerender(<Host attachmentItems={attachments} />);
    expect(screen.queryByRole('button', { name: 'Remove a.pdf' })).toBeNull();
  });

  it('onRemoveQueued gets the same queued item', async () => {
    const onRemoveQueued = vi.fn();
    render(<Host queued={queued} onRemoveQueued={onRemoveQueued} />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove from queue' }));
    expect(onRemoveQueued.mock.calls[0][0]).toBe(queued[0]);
  });

  it('onTrigger fires when a trigger starts, its query changes and it ends', async () => {
    const onTrigger = vi.fn();
    render(
      <Host
        triggers={[
          { id: 'slash', pattern: SLASH_PATTERN },
          { id: 'mention', pattern: MENTION_PATTERN },
        ]}
        onTrigger={onTrigger}
      />,
    );
    const box = screen.getByRole('textbox');
    await userEvent.type(box, '/ne');
    expect(onTrigger.mock.calls.map(([event]) => event)).toEqual([
      { trigger: 'slash', query: '' },
      { trigger: 'slash', query: 'n' },
      { trigger: 'slash', query: 'ne' },
    ]);
    await userEvent.type(box, ' x');
    expect(onTrigger).toHaveBeenLastCalledWith({ trigger: null, query: '' });
    await userEvent.type(box, ' @bo');
    expect(onTrigger).toHaveBeenLastCalledWith({ trigger: 'mention', query: 'bo' });
  });

  it('onFiles takes pasted and dropped files; onReject gets the reason; without onFiles there is no drop or picker', () => {
    const onFiles = vi.fn();
    const onReject = vi.fn();
    const { rerender } = render(<Host onFiles={onFiles} onReject={onReject} />);
    const box = screen.getByRole('textbox');
    fireEvent.paste(box, { clipboardData: { files: [file('s.png', 'image/png')] } });
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: 's.png' })]);
    const root = document.querySelector('[data-slot="composer"]') as HTMLElement;
    fireEvent.dragEnter(root, { dataTransfer: { types: ['Files'], files: [] } });
    expect(screen.getByText('Drop files here…')).toBeInTheDocument();
    fireEvent.drop(root, {
      dataTransfer: { types: ['Files'], files: [file('x.zip', 'application/zip')] },
    });
    expect(onReject).toHaveBeenCalledWith(expect.objectContaining({ code: 'type' }));
    rerender(<Host />);
    expect(screen.queryByLabelText('Attach files')).toBeNull();
    fireEvent.dragEnter(root, { dataTransfer: { types: ['Files'], files: [] } });
    expect(screen.queryByText('Drop files here…')).toBeNull();
  });

  it('dictation: the mic needs onDictationStart; Done sends the transcript, Cancel discards; the key starts and finishes', async () => {
    const onDictationStart = vi.fn();
    const onDictationFinish = vi.fn();
    const onDictationCancel = vi.fn();
    const { rerender } = render(
      <Host
        dictationText="walk me"
        onDictationStart={onDictationStart}
        onDictationFinish={onDictationFinish}
        onDictationCancel={onDictationCancel}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dictate' }));
    expect(onDictationStart).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('textbox')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onDictationFinish).toHaveBeenCalledWith('walk me');
    await userEvent.click(screen.getByRole('button', { name: 'Dictate' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onDictationCancel).toHaveBeenCalledTimes(1);
    rerender(
      <Host
        dictationKey="AltRight"
        onDictationStart={onDictationStart}
        onDictationFinish={onDictationFinish}
      />,
    );
    act(() => {
      fireEvent.keyDown(window, { code: 'AltRight' });
      fireEvent.keyUp(window, { code: 'AltRight' });
    });
    expect(onDictationStart).toHaveBeenCalledTimes(3);
    rerender(<Host />);
    expect(screen.queryByRole('button', { name: 'Dictate' })).toBeNull();
  });
});
