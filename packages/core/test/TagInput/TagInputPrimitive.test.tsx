import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { TagInputPrimitive } from '../../src/TagInput/TagInputPrimitive';

describe('omni-ui-components/TagInputPrimitive', () => {
  it('uncontrolled: seeds from defaultValue and keeps its own chips', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInputPrimitive defaultValue={['a']} onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'b{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b']);
    expect(screen.getByText('b')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Remove a'));
    expect(onChange).toHaveBeenLastCalledWith(['b']);
    expect(screen.queryByText('a')).not.toBeInTheDocument();
  });

  it('controlled: reports the new list without changing what it shows', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInputPrimitive value={['a']} onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'b{Enter}');
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
    expect(screen.queryByText('b')).not.toBeInTheDocument();
  });

  it('trims input, ignores empty drafts and clears the draft after a commit', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInputPrimitive onChange={onChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, '   {Enter}');
    expect(onChange).not.toHaveBeenCalled();
    await user.type(input, '  spaced  {Enter}');
    expect(onChange).toHaveBeenCalledWith(['spaced']);
    expect(input.value).toBe('');
  });

  it('rejects entries that fail the pattern but still clears the draft', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInputPrimitive pattern={/^[a-z]+$/} onChange={onChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'ABC{Enter}');
    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('');
    await user.type(input, 'abc{Enter}');
    expect(onChange).toHaveBeenCalledWith(['abc']);
  });

  it('commitOnSpace commits on space, but a leading space with no draft does nothing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInputPrimitive commitOnSpace onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.type(input, ' ');
    expect(onChange).not.toHaveBeenCalled();
    await user.type(input, 'one two ');
    expect(onChange.mock.calls.map((c) => c[0])).toEqual([['one'], ['one', 'two']]);
  });

  it('a space is part of the tag when commitOnSpace is off', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInputPrimitive onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'two words{Enter}');
    expect(onChange).toHaveBeenCalledWith(['two words']);
  });

  it('Backspace on an empty draft removes the last chip; with a draft it edits text', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInputPrimitive defaultValue={['a', 'b']} onChange={onChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'xy');
    await user.keyboard('{Backspace}');
    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('x');
    await user.keyboard('{Backspace}{Backspace}');
    expect(onChange).toHaveBeenCalledWith(['a']);
  });

  it('Backspace with no chips does nothing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInputPrimitive onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), '{Backspace}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('commits the pending draft on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInputPrimitive onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'pending');
    await user.tab();
    expect(onChange).toHaveBeenCalledWith(['pending']);
  });

  it('blur with an empty draft emits nothing', () => {
    const onChange = vi.fn();
    render(<TagInputPrimitive onChange={onChange} />);
    fireEvent.blur(screen.getByRole('textbox'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('hides the placeholder once there are chips', () => {
    const empty = render(<TagInputPrimitive placeholder="Add…" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Add…');
    empty.unmount();
    render(<TagInputPrimitive placeholder="Add…" defaultValue={['x']} />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('placeholder', 'Add…');
  });

  it('disabled and readOnly hide the remove buttons; disabled disables the input', () => {
    const { rerender } = render(<TagInputPrimitive defaultValue={['x']} disabled />);
    expect(screen.queryByLabelText('Remove x')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeDisabled();
    rerender(<TagInputPrimitive defaultValue={['x']} readOnly />);
    expect(screen.queryByLabelText('Remove x')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('clicking the container focuses the input when it has an id', async () => {
    const user = userEvent.setup();
    render(<TagInputPrimitive id="tags" defaultValue={['x']} />);
    await user.click(screen.getByTestId('tags'));
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('forwards aria attributes, name and the ref', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<TagInputPrimitive ref={ref} id="tags" name="labels" invalid required aria-describedby="hint" />);
    const input = screen.getByRole('textbox');
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('name', 'labels');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'hint');
    expect(input).toBeRequired();
    expect(screen.getByTestId('tags')).toHaveAttribute('aria-invalid', 'true');
  });
});
