import '@testing-library/jest-dom';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen } from '@testing-library/react';

import { Composer, ComposerNotice, PlusMenu, sendStateOf } from '@oc-tech/omni-ui-components/Composer';
import { ComposerDemo, composerPropsFactory } from 'factories/omni-ui-components/Composer/Composer.factories';

const Controlled: React.FC<Partial<React.ComponentProps<typeof Composer>>> = (props) => {
  const [value, setValue] = React.useState(props.value ?? '');
  return <Composer {...composerPropsFactory({ ...props, value, onChange: setValue })} />;
};

describe('omni-ui-components/Composer', () => {
  it('sendStateOf decides the four states', () => {
    expect(sendStateOf({ streaming: false, hasDraft: false })).toBe('idle');
    expect(sendStateOf({ streaming: false, hasDraft: true })).toBe('ready');
    expect(sendStateOf({ streaming: true, hasDraft: false })).toBe('streaming');
    expect(sendStateOf({ streaming: true, hasDraft: true })).toBe('queue');
    expect(sendStateOf({ streaming: true, hasDraft: true, canQueue: false })).toBe('ready');
  });

  it('Enter sends, Shift+Enter is a newline, empty never sends', async () => {
    const onSubmit = vi.fn();
    render(<Controlled onSubmit={onSubmit} />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    await userEvent.type(box, '{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(box, 'a{Shift>}{Enter}{/Shift}b');
    expect(box).toHaveValue('a\nb');
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledWith({ value: 'a\nb', attachments: [] });
  });

  it('absent callbacks render no control: no onSubmit means no send button, no onStop means no Stop, and Enter does nothing', async () => {
    const { rerender } = render(<Composer {...composerPropsFactory({ onSubmit: undefined, value: 'x' })} />);
    expect(screen.queryByRole('button', { name: 'Send (Enter)' })).toBeNull();
    await userEvent.type(screen.getByRole('textbox'), '{Enter}');
    rerender(<Composer {...composerPropsFactory({ streaming: true, onStop: undefined })} />);
    expect(screen.queryByRole('button', { name: 'Stop (Esc)' })).toBeNull();
  });

  it('the host owns the draft: submitting does not clear it', async () => {
    const onSubmit = vi.fn();
    render(<Controlled value="keep" onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send (Enter)' }));
    expect(onSubmit).toHaveBeenCalledWith({ value: 'keep', attachments: [] });
    expect(screen.getByRole('textbox')).toHaveValue('keep');
  });

  it('does not send while IME composition is active', () => {
    const onSubmit = vi.fn();
    render(<Composer {...composerPropsFactory({ value: 'こんにちは', onSubmit })} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', isComposing: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('sendOnEnter off: Enter is a newline and only the button sends', async () => {
    const onSubmit = vi.fn();
    render(<Controlled sendOnEnter={false} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole('textbox'), 'x{Enter}y');
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Send (Enter)' }));
    expect(onSubmit).toHaveBeenCalledWith({ value: 'x\ny', attachments: [] });
  });

  it('ArrowUp on an empty draft recalls the last prompt with the caret at the end; not when there is text', async () => {
    render(<Controlled onRecallPrevious={() => 'last prompt'} />);
    const box = screen.getByRole('textbox') as HTMLTextAreaElement;
    await userEvent.type(box, '{ArrowUp}');
    expect(box).toHaveValue('last prompt');
    expect(box.selectionStart).toBe('last prompt'.length);
    await userEvent.type(box, '!{ArrowUp}');
    expect(box).toHaveValue('last prompt!');
  });

  it('streaming: empty draft shows Stop (button and Escape call onStop); with text it queues', async () => {
    const onStop = vi.fn();
    const onSubmit = vi.fn();
    const onQueue = vi.fn();
    render(<Controlled streaming onStop={onStop} onSubmit={onSubmit} onQueue={onQueue} />);
    await userEvent.click(screen.getByRole('button', { name: 'Stop (Esc)' }));
    expect(onStop).toHaveBeenCalledTimes(1);
    const box = screen.getByRole('textbox');
    await userEvent.type(box, '{Escape}');
    expect(onStop).toHaveBeenCalledTimes(2);
    await userEvent.type(box, 'next');
    expect(screen.getByRole('button', { name: 'Queue message' })).toBeEnabled();
    await userEvent.keyboard('{Enter}');
    expect(onQueue).toHaveBeenCalledWith({ value: 'next', attachments: [] });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('idle send is disabled until text; attachments alone make it ready', () => {
    const { rerender } = render(<Composer {...composerPropsFactory()} />);
    expect(screen.getByRole('button', { name: 'Send (Enter)' })).toBeDisabled();
    rerender(<Composer {...composerPropsFactory({ attachmentItems: [{ id: 'a', name: 'a.md' }] })} />);
    expect(document.querySelector('[data-slot="send-button"]')).toHaveAttribute('data-state', 'ready');
  });

  it('lets a popover take the key first through onBeforeKeyDown', async () => {
    const onSubmit = vi.fn();
    render(<Controlled onSubmit={onSubmit} onBeforeKeyDown={() => true} />);
    await userEvent.type(screen.getByRole('textbox'), 'a{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('grows with its content up to maxHeight', () => {
    const { rerender } = render(<Composer {...composerPropsFactory({ value: 'a' })} />);
    const box = screen.getByRole('textbox') as HTMLTextAreaElement;
    Object.defineProperty(box, 'scrollHeight', { configurable: true, value: 500 });
    rerender(<Composer {...composerPropsFactory({ value: 'a\nb\nc', maxHeight: 120 })} />);
    expect(box.style.height).toBe('120px');
    expect(box.style.overflowY).toBe('auto');
  });

  it('renders slots: above, attachments, popover, hint, leading, toolbar, trailing; stacked vs pill', () => {
    const { rerender } = render(
      <Composer {...composerPropsFactory({ above: <i>above</i>, attachments: <i>atts</i>, popover: <i>pop</i>, hint: 'hint', leading: <i>lead</i>, toolbar: <i>tool</i>, trailing: <i>trail</i> })} />,
    );
    for (const text of ['above', 'atts', 'pop', 'hint', 'lead', 'tool', 'trail']) expect(screen.getByText(text)).toBeInTheDocument();
    expect(document.querySelector('[data-slot="composer-toolbar"]')).not.toBeNull();
    rerender(<Composer {...composerPropsFactory({ variant: 'pill' })} />);
    expect(document.querySelector('[data-slot="composer-toolbar"]')).toBeNull();
  });

  it('dictation replaces the field and the actions', () => {
    render(<Composer {...composerPropsFactory({ dictation: <div>bar</div>, trailing: <i>trail</i> })} />);
    expect(screen.getByText('bar')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByText('trail')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Send (Enter)' })).toBeNull();
  });

  it('strings come from labels', () => {
    render(<Composer {...composerPropsFactory({ labels: { message: 'Mensaje', send: 'Enviar' } })} />);
    expect(screen.getByRole('textbox', { name: 'Mensaje' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });

  describe('PlusMenu', () => {
    it('opens an ActionMenu of the items, runs onClick, and separated starts a new section', async () => {
      const onClick = vi.fn();
      render(
        <PlusMenu
          items={[
            { id: 'a', label: 'Upload a file', description: 'Text', onClick },
            { id: 'b', label: 'Saved prompts', onClick: () => undefined, separated: true },
          ]}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Add files, images or context' }));
      expect(await screen.findByText('Text')).toBeInTheDocument();
      expect(screen.getAllByRole('group').length).toBeGreaterThanOrEqual(2);
      await userEvent.click(screen.getByRole('menuitem', { name: /Upload a file/ }));
      expect(onClick).toHaveBeenCalled();
    });
    it('renders nothing without items', () => {
      render(<PlusMenu items={[]} />);
      expect(screen.queryByRole('button')).toBeNull();
    });
  });

  describe('ComposerNotice', () => {
    it('is an output with the message and an action', async () => {
      const onClick = vi.fn();
      render(<ComposerNotice message="Haiku can’t see images." action={{ label: 'Switch', onClick }} />);
      expect(screen.getByRole('status')).toHaveTextContent('Haiku can’t see images.');
      await userEvent.click(screen.getByRole('button', { name: 'Switch' }));
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('ComposerDemo (whole composer)', () => {
    it('queues while streaming and attaches a dropped file', async () => {
      const onAction = vi.fn();
      render(<ComposerDemo streaming onAction={onAction} />);
      await userEvent.type(screen.getByRole('combobox', { name: 'Message' }), 'later{Enter}');
      expect(onAction).toHaveBeenCalledWith('queue', 'later');
      expect(screen.getByRole('list', { name: 'Queued messages' })).toBeInTheDocument();
    });
  });
});
