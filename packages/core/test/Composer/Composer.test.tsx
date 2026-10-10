import '@testing-library/jest-dom';

import {
  Composer,
  ComposerNotice,
  PlusMenu,
  sendStateOf,
} from '@oc-tech/omni-ui-components/Composer';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ComposerDemo,
  composerPropsFactory,
} from 'factories/omni-ui-components/Composer/Composer.factories';
import * as React from 'react';

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
    const { rerender } = render(
      <Composer {...composerPropsFactory({ onSubmit: undefined, value: 'x' })} />,
    );
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

  describe('history recall (the edge rule)', () => {
    const past = ['first', 'second', 'third'];
    const History: React.FC<
      Partial<React.ComponentProps<typeof Composer>> & { start?: string }
    > = ({ start = '', ...props }) => {
      const at = React.useRef<number | null>(null);
      return (
        <Controlled
          value={start}
          onRecallPrevious={() => {
            at.current = at.current === null ? past.length - 1 : Math.max(0, at.current - 1);
            return past[at.current];
          }}
          onRecallNext={() => {
            if (at.current === null || at.current >= past.length - 1) {
              at.current = null;
              return undefined;
            }
            at.current += 1;
            return past[at.current];
          }}
          {...props}
        />
      );
    };
    const box = () => screen.getByRole('textbox') as HTMLTextAreaElement;

    it('ArrowUp on an empty draft recalls with the caret at the end; Up again goes further back', async () => {
      render(<History />);
      await userEvent.type(box(), '{ArrowUp}');
      expect(box()).toHaveValue('third');
      expect(box().selectionStart).toBe(5);
      await userEvent.keyboard('{ArrowUp}');
      expect(box()).toHaveValue('second');
    });

    it('ArrowUp recalls on the first line even with text, but not from a later line', async () => {
      render(<History />);
      await userEvent.type(box(), 'a{Shift>}{Enter}{/Shift}b{ArrowUp}');
      // The caret was on line 2: the arrow only moved it up inside the text.
      expect(box()).toHaveValue('a\nb');
      // (No layout engine here: put the caret on line 1 the way the native Up would.)
      box().setSelectionRange(1, 1);
      await userEvent.keyboard('{ArrowUp}');
      expect(box()).toHaveValue('third');
    });

    it('ArrowUp does not recall while the caret is not on the first line or a range is selected', async () => {
      render(<History start={'one\ntwo'} />);
      box().focus();
      box().setSelectionRange(7, 7);
      await userEvent.keyboard('{ArrowUp}');
      expect(box()).toHaveValue('one\ntwo');
      box().setSelectionRange(0, 3);
      await userEvent.keyboard('{ArrowUp}');
      expect(box()).toHaveValue('one\ntwo');
    });

    it('Cmd+ArrowUp and Ctrl+ArrowUp recall from anywhere in a multi-line draft', async () => {
      render(<History start={'one\ntwo'} />);
      box().focus();
      box().setSelectionRange(7, 7);
      await userEvent.keyboard('{Meta>}{ArrowUp}{/Meta}');
      expect(box()).toHaveValue('third');
      await userEvent.keyboard('{Control>}{ArrowUp}{/Control}');
      expect(box()).toHaveValue('second');
    });

    it('ArrowDown on the last line walks forward and past the newest restores the draft that was typed', async () => {
      render(<History />);
      await userEvent.type(box(), 'draft{ArrowUp}');
      expect(box()).toHaveValue('third');
      await userEvent.keyboard('{ArrowUp}{ArrowDown}');
      expect(box()).toHaveValue('third');
      await userEvent.keyboard('{ArrowDown}');
      expect(box()).toHaveValue('draft');
      await userEvent.keyboard('{ArrowDown}');
      expect(box()).toHaveValue('draft');
    });

    it('Cmd+ArrowDown works from the first line of a multi-line recalled prompt', async () => {
      render(<History />);
      await userEvent.type(box(), '{ArrowUp}{ArrowUp}');
      expect(box()).toHaveValue('second');
      await userEvent.keyboard('{Meta>}{ArrowDown}{/Meta}');
      expect(box()).toHaveValue('third');
    });

    it('typing over a recalled prompt makes it a new draft: Down no longer restores the old one', async () => {
      render(<History start="old" />);
      await userEvent.type(box(), '{ArrowUp}');
      await userEvent.type(box(), '!');
      expect(box()).toHaveValue('third!');
      await userEvent.keyboard('{ArrowDown}');
      expect(box()).toHaveValue('third!');
    });

    it('Shift+ArrowUp keeps its native meaning, and nothing recalls without onRecallPrevious', async () => {
      render(<History />);
      await userEvent.type(box(), 'x{Shift>}{ArrowUp}{/Shift}');
      expect(box()).toHaveValue('x');
      render(<Controlled start="" />);
      const plain = screen.getAllByRole('textbox')[1] as HTMLTextAreaElement;
      await userEvent.type(plain, '{ArrowUp}');
      expect(plain).toHaveValue('');
    });
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
    rerender(
      <Composer {...composerPropsFactory({ attachmentItems: [{ id: 'a', name: 'a.md' }] })} />,
    );
    expect(document.querySelector('[data-slot="send-button"]')).toHaveAttribute(
      'data-state',
      'ready',
    );
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
      <Composer
        {...composerPropsFactory({
          above: <i>above</i>,
          attachments: <i>atts</i>,
          popover: <i>pop</i>,
          hint: 'hint',
          leading: <i>lead</i>,
          toolbar: <i>tool</i>,
          trailing: <i>trail</i>,
        })}
      />,
    );
    for (const text of ['above', 'atts', 'pop', 'hint', 'lead', 'tool', 'trail'])
      expect(screen.getByText(text)).toBeInTheDocument();
    expect(document.querySelector('[data-slot="composer-toolbar"]')).not.toBeNull();
    rerender(<Composer {...composerPropsFactory({ variant: 'pill' })} />);
    expect(document.querySelector('[data-slot="composer-toolbar"]')).toBeNull();
  });

  it('dictation replaces the field and the actions', () => {
    render(
      <Composer {...composerPropsFactory({ dictation: <div>bar</div>, trailing: <i>trail</i> })} />,
    );
    expect(screen.getByText('bar')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByText('trail')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Send (Enter)' })).toBeNull();
  });

  it('strings come from labels', () => {
    render(
      <Composer {...composerPropsFactory({ labels: { message: 'Mensaje', send: 'Enviar' } })} />,
    );
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
      render(
        <ComposerNotice message="Haiku can’t see images." action={{ label: 'Switch', onClick }} />,
      );
      expect(screen.getByRole('status')).toHaveTextContent('Haiku can’t see images.');
      await userEvent.click(screen.getByRole('button', { name: 'Switch' }));
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('ComposerDemo (whole composer)', () => {
    it('queues while streaming and attaches a dropped file', async () => {
      const onAction = vi.fn();
      render(<ComposerDemo streaming onAction={onAction} />);
      await userEvent.type(screen.getByRole('textbox', { name: 'Message' }), 'later{Enter}');
      expect(onAction).toHaveBeenCalledWith('queue', 'later');
      expect(screen.getByRole('list', { name: 'Queued messages' })).toBeInTheDocument();
    });
  });
});
