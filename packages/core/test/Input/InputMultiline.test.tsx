import '@testing-library/jest-dom';

import { Input } from '@oc-tech/omni-ui-components/Input';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

const Harness = ({
  onSubmit,
  sendOnEnter = true,
  maxHeight,
}: {
  onSubmit?: (v: string) => void;
  sendOnEnter?: boolean;
  maxHeight?: number;
}) => {
  const [value, setValue] = React.useState('');
  return (
    <Input
      multiline
      aria-label="Message"
      value={value}
      onChange={setValue}
      onSubmit={onSubmit}
      sendOnEnter={sendOnEnter}
      maxHeight={maxHeight}
    />
  );
};

describe('omni-ui-components/Input multiline', () => {
  it('renders a textarea in the panel look', () => {
    render(<Input multiline variant="panel" aria-label="Message" />);
    const field = screen.getByLabelText('Message');
    expect(field.tagName).toBe('TEXTAREA');
    expect(field).toHaveAttribute('data-variant', 'panel');
    expect(field).toHaveAttribute('data-multiline', 'true');
  });

  it('keeps the single-line input by default', () => {
    render(<Input aria-label="Message" />);
    expect(screen.getByLabelText('Message').tagName).toBe('INPUT');
  });

  it('sends on Enter with the value and keeps Shift+Enter as a newline', async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    const field = screen.getByLabelText('Message');
    await userEvent.type(field, 'one{Shift>}{Enter}{/Shift}two');
    expect(field).toHaveValue('one\ntwo');
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(field, '{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('one\ntwo');
  });

  it('never sends during IME composition', () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Enter', isComposing: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('keeps Enter a newline without sendOnEnter or without onSubmit', async () => {
    const onSubmit = vi.fn();
    const { unmount } = render(<Harness onSubmit={onSubmit} sendOnEnter={false} />);
    await userEvent.type(screen.getByLabelText('Message'), 'a{Enter}b');
    expect(screen.getByLabelText('Message')).toHaveValue('a\nb');
    expect(onSubmit).not.toHaveBeenCalled();
    unmount();
    render(<Harness />);
    await userEvent.type(screen.getByLabelText('Message'), 'a{Enter}b');
    expect(screen.getByLabelText('Message')).toHaveValue('a\nb');
  });

  it('caps the height at maxHeight and scrolls inside', () => {
    render(<Harness maxHeight={80} />);
    const field = screen.getByLabelText('Message') as HTMLTextAreaElement;
    Object.defineProperty(field, 'scrollHeight', { configurable: true, value: 300 });
    fireEvent.change(field, { target: { value: 'a\nb\nc\nd\ne\nf' } });
    expect(field.style.height).toBe('80px');
    expect(field.style.overflowY).toBe('auto');
    Object.defineProperty(field, 'scrollHeight', { configurable: true, value: 40 });
    fireEvent.change(field, { target: { value: 'a' } });
    expect(field.style.height).toBe('40px');
    expect(field.style.overflowY).toBe('hidden');
  });

  it('forwards the ref to the textarea and wires label and error chrome', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input multiline ref={ref} label="Notes" error="Too short" />);
    expect(ref.current?.tagName).toBe('TEXTAREA');
    const field = screen.getByLabelText('Notes');
    expect(field).toHaveAttribute('aria-invalid', 'true');
  });
});
