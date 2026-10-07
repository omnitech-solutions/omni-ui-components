import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { ColorPickerPrimitive } from '../../src/ColorPicker/ColorPickerPrimitive';

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const trigger = () => screen.getByTestId('cp');
const popover = () => screen.getByTestId('cp-popover');
const hexInput = () => within(popover()).getByLabelText('Hex') as HTMLInputElement;
const colorInput = () => within(popover()).getByLabelText('Pick a color') as HTMLInputElement;

describe('omni-ui-components/ColorPickerPrimitive', () => {
  it('shows the default colour, or defaultValue, on the trigger', () => {
    const { unmount } = render(<ColorPickerPrimitive id="cp" />);
    expect(trigger()).toHaveTextContent('#3b82f6');
    unmount();
    render(<ColorPickerPrimitive id="cp" defaultValue="#ef4444" />);
    expect(trigger()).toHaveTextContent('#ef4444');
  });

  it('picking a preset commits it, closes the popover and updates the uncontrolled value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPickerPrimitive id="cp" onChange={onChange} />);
    await user.click(trigger());
    await user.click(within(popover()).getByTitle('#22c55e'));
    expect(onChange).toHaveBeenCalledWith('#22c55e');
    expect(screen.queryByTestId('cp-popover')).not.toBeInTheDocument();
    expect(trigger()).toHaveTextContent('#22c55e');
  });

  it('marks the preset equal to the current colour as selected, case-insensitively', async () => {
    const user = userEvent.setup();
    render(<ColorPickerPrimitive id="cp" value="#EF4444" />);
    await user.click(trigger());
    expect(within(popover()).getByTitle('#ef4444')).toHaveAttribute('aria-selected', 'true');
    expect(within(popover()).getByTitle('#22c55e')).toHaveAttribute('aria-selected', 'false');
  });

  it('renders custom presets only', async () => {
    const user = userEvent.setup();
    render(<ColorPickerPrimitive id="cp" presets={['#111111', '#222222']} />);
    await user.click(trigger());
    expect(within(popover()).getAllByRole('option')).toHaveLength(2);
  });

  it('controlled: keeps showing the prop value while reporting the edit', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPickerPrimitive id="cp" value="#000000" onChange={onChange} />);
    await user.click(trigger());
    await user.click(within(popover()).getByTitle('#ef4444'));
    expect(onChange).toHaveBeenCalledWith('#ef4444');
    expect(trigger()).toHaveTextContent('#000000');
  });

  it('normalises typed hex: 6 digits get a # and lower-case, 3 digits get a #, junk passes through', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPickerPrimitive id="cp" value="#000000" onChange={onChange} />);
    await user.click(trigger());
    fireEvent.change(hexInput(), { target: { value: 'ABCDEF' } });
    expect(onChange).toHaveBeenLastCalledWith('#abcdef');
    fireEvent.change(hexInput(), { target: { value: '#FA0' } });
    expect(onChange).toHaveBeenLastCalledWith('#FA0');
    fireEvent.change(hexInput(), { target: { value: 'nope' } });
    expect(onChange).toHaveBeenLastCalledWith('nope');
  });

  it('Enter in the hex field commits and closes without bubbling a form submit', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ColorPickerPrimitive id="cp" defaultValue="#112233" onChange={onChange} />
      </form>,
    );
    await user.click(trigger());
    await user.type(hexInput(), '{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('#112233');
    expect(screen.queryByTestId('cp-popover')).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('native colour input commits every change while dragging and keeps the popover open', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPickerPrimitive id="cp" onChange={onChange} />);
    await user.click(trigger());
    fireEvent.input(colorInput(), { target: { value: '#00ff00' } });
    fireEvent.input(colorInput(), { target: { value: '#0000ff' } });
    expect(onChange.mock.calls.map((c) => c[0])).toEqual(['#00ff00', '#0000ff']);
    expect(screen.getByTestId('cp-popover')).toBeInTheDocument();
    expect(trigger()).toHaveTextContent('#0000ff');
  });

  it('readOnly opens the popover but disables every editing control', async () => {
    const user = userEvent.setup();
    render(<ColorPickerPrimitive id="cp" readOnly />);
    await user.click(trigger());
    expect(hexInput()).toBeDisabled();
    expect(colorInput()).toBeDisabled();
    expect(within(popover()).getByTitle('#ef4444')).toBeDisabled();
  });

  it('disabled never opens', async () => {
    const user = userEvent.setup();
    render(<ColorPickerPrimitive id="cp" disabled />);
    await user.click(trigger());
    expect(screen.queryByTestId('cp-popover')).not.toBeInTheDocument();
    expect(trigger()).toBeDisabled();
  });

  it('forwards aria attributes and the ref, and closes on Escape', async () => {
    const user = userEvent.setup();
    const ref = { current: null as HTMLButtonElement | null };
    render(<ColorPickerPrimitive ref={ref} id="cp" invalid required aria-describedby="hint" />);
    expect(ref.current).toBe(trigger());
    expect(trigger()).toHaveAttribute('aria-invalid', 'true');
    expect(trigger()).toHaveAttribute('aria-required', 'true');
    expect(trigger()).toHaveAttribute('aria-describedby', 'hint');
    await user.click(trigger());
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('cp-popover')).not.toBeInTheDocument();
  });
});
