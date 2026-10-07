import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { DatePickerPrimitive } from '../../src/DatePicker/DatePickerPrimitive';

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const trigger = () => screen.getByTestId('dp');
const popover = () => screen.getByTestId('dp-popover');
const day = (n: number) => within(popover()).getAllByRole('button', { name: new RegExp(`\\b${n}(st|nd|rd|th)?,`) })[0];

describe('omni-ui-components/DatePickerPrimitive', () => {
  it('shows the placeholder, then the formatted date, and respects formatOptions', () => {
    const { rerender } = render(<DatePickerPrimitive id="dp" placeholder="When?" />);
    expect(trigger()).toHaveTextContent('When?');
    expect(trigger()).toHaveAttribute('data-state', 'idle');
    expect(screen.queryByRole('button', { name: 'Clear date' })).not.toBeInTheDocument();

    rerender(<DatePickerPrimitive id="dp" value={new Date(2026, 6, 15)} formatOptions={{ year: 'numeric', month: '2-digit', day: '2-digit' }} />);
    expect(trigger().textContent).toMatch(/07.15.2026|15.07.2026/);
    expect(screen.getByRole('button', { name: 'Clear date' })).toBeInTheDocument();
  });

  it('reflects disabled and invalid in data-state', () => {
    const { rerender } = render(<DatePickerPrimitive id="dp" invalid />);
    expect(trigger()).toHaveAttribute('data-state', 'invalid');
    rerender(<DatePickerPrimitive id="dp" invalid disabled value={new Date(2026, 6, 15)} />);
    expect(trigger()).toHaveAttribute('data-state', 'disabled');
    expect(screen.queryByRole('button', { name: 'Clear date' })).not.toBeInTheDocument();
  });

  it('single mode: picking a day emits the Date and closes the popover', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePickerPrimitive id="dp" defaultValue={new Date(2026, 6, 1)} onChange={onChange} />);
    await user.click(trigger());
    await user.click(day(20));
    const emitted = onChange.mock.calls[0][0] as Date;
    expect(emitted).toBeInstanceOf(Date);
    expect([emitted.getFullYear(), emitted.getMonth(), emitted.getDate()]).toEqual([2026, 6, 20]);
    expect(screen.queryByTestId('dp-popover')).not.toBeInTheDocument();
    // Uncontrolled: shows the new value.
    expect(trigger().textContent).toMatch(/20/);
  });

  it('controlled: shows the prop value, not its own selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePickerPrimitive id="dp" value={new Date(2026, 6, 1)} onChange={onChange} />);
    await user.click(trigger());
    await user.click(day(20));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(trigger().textContent).toMatch(/Jul 1, 2026|1 Jul 2026/);
  });

  it('disables days outside min/max', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePickerPrimitive id="dp" value={new Date(2026, 6, 15)} min={new Date(2026, 6, 10)} max={new Date(2026, 6, 20)} onChange={onChange} />);
    await user.click(trigger());
    expect(day(5)).toBeDisabled();
    expect(day(25)).toBeDisabled();
    expect(day(12)).toBeEnabled();
    await user.click(day(5));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clear button emits null without opening the popover (click, Enter and Space)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePickerPrimitive id="dp" value={new Date(2026, 6, 15)} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.queryByTestId('dp-popover')).not.toBeInTheDocument();

    const clear = screen.getByRole('button', { name: 'Clear date' });
    fireEvent.keyDown(clear, { key: 'Enter' });
    fireEvent.keyDown(clear, { key: ' ' });
    expect(onChange).toHaveBeenCalledTimes(3);
    fireEvent.keyDown(clear, { key: 'a' });
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('clearing an uncontrolled picker returns it to the placeholder', async () => {
    const user = userEvent.setup();
    render(<DatePickerPrimitive id="dp" defaultValue={new Date(2026, 6, 15)} placeholder="Pick" />);
    await user.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(trigger()).toHaveTextContent('Pick');
    expect(trigger()).toHaveAttribute('data-placeholder', 'true');
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    render(<DatePickerPrimitive id="dp" disabled />);
    await user.click(trigger());
    expect(screen.queryByTestId('dp-popover')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<DatePickerPrimitive id="dp" />);
    await user.click(trigger());
    expect(popover()).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('dp-popover')).not.toBeInTheDocument();
  });

  describe('range mode', () => {
    it('formats a full range, a start-only range and an empty range', () => {
      const { rerender } = render(<DatePickerPrimitive id="dp" mode="range" placeholder="Range" value={{ from: new Date(2026, 6, 1), to: new Date(2026, 6, 15) }} />);
      expect(trigger().textContent).toContain('–');

      rerender(<DatePickerPrimitive id="dp" mode="range" placeholder="Range" value={{ from: new Date(2026, 6, 1), to: undefined }} />);
      expect(trigger().textContent).not.toContain('–');
      expect(trigger().textContent).toMatch(/2026/);

      rerender(<DatePickerPrimitive id="dp" mode="range" placeholder="Range" value={{ from: undefined, to: undefined }} />);
      expect(trigger()).toHaveTextContent('Range');
      expect(trigger()).toHaveAttribute('data-placeholder', 'true');
    });

    it('picks a range across two clicks, keeps the popover open and Done closes it', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DatePickerPrimitive id="dp" mode="range" defaultValue={{ from: new Date(2026, 6, 1), to: undefined }} onChange={onChange} />);
      await user.click(trigger());
      await user.click(day(10));
      const range = onChange.mock.calls.at(-1)![0] as { from: Date; to: Date };
      expect(range.from.getDate()).toBe(1);
      expect(range.to.getDate()).toBe(10);
      expect(popover()).toBeInTheDocument();

      await user.click(within(popover()).getByRole('button', { name: 'Done' }));
      expect(screen.queryByTestId('dp-popover')).not.toBeInTheDocument();
    });

    it('Clear in the popover emits null', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DatePickerPrimitive id="dp" mode="range" value={{ from: new Date(2026, 6, 1), to: new Date(2026, 6, 5) }} onChange={onChange} />);
      await user.click(trigger());
      await user.click(within(popover()).getByRole('button', { name: 'Clear' }));
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('applies min/max to range days', async () => {
      const user = userEvent.setup();
      render(<DatePickerPrimitive id="dp" mode="range" value={{ from: new Date(2026, 6, 12), to: undefined }} min={new Date(2026, 6, 10)} max={new Date(2026, 6, 20)} />);
      await user.click(trigger());
      expect(day(5)).toBeDisabled();
      expect(day(25)).toBeDisabled();
    });
  });
});
