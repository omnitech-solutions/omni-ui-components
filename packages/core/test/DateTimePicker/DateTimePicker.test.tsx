import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { DateTimePicker } from '@oc-tech/omni-ui-components/DateTimePicker';
import { DateTimePickerPrimitive } from '../../src/DateTimePicker/DateTimePickerPrimitive';

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const dateTrigger = () => screen.getByTestId('dt-date');
const timeInput = () => screen.getByTestId('dt-time') as HTMLInputElement;
const day = (n: number) => within(screen.getByTestId('dt-date-popover')).getAllByRole('button', { name: new RegExp(`\\b${n}(st|nd|rd|th)?,`) })[0];

describe('omni-ui-components/DateTimePicker', () => {
  it('splits an ISO value into a date label and a time input', () => {
    render(<DateTimePickerPrimitive id="dt" value="2026-07-15T09:30" />);
    expect(dateTrigger().textContent).toMatch(/2026/);
    expect(timeInput().value).toBe('09:30');
    expect(screen.getByTestId('dt')).toHaveAttribute('data-slot', 'date-time-picker');
  });

  it('keeps seconds out of the time field beyond HH:MM:SS and disables time without a date', () => {
    const { rerender } = render(<DateTimePickerPrimitive id="dt" value="2026-07-15T09:30:15.123Z" />);
    expect(timeInput().value).toBe('09:30:15');

    rerender(<DateTimePickerPrimitive id="dt" value="" />);
    expect(timeInput()).toBeDisabled();
    expect(timeInput().value).toBe('');
    expect(dateTrigger()).toHaveTextContent('Pick a date');
  });

  it('treats an unparseable value as no date', () => {
    render(<DateTimePickerPrimitive id="dt" value="garbage" />);
    expect(dateTrigger()).toHaveTextContent('Pick a date');
  });

  it('picking a date keeps the current time', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateTimePickerPrimitive id="dt" value="2026-07-15T09:30" onChange={onChange} />);
    await user.click(dateTrigger());
    await user.click(day(20));
    expect(onChange).toHaveBeenCalledWith('2026-07-20T09:30');
  });

  it('picking a date with no time defaults to midnight, with zero-padded parts', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateTimePickerPrimitive id="dt" value="2026-07-15" onChange={onChange} />);
    await user.click(dateTrigger());
    await user.click(day(5));
    expect(onChange).toHaveBeenCalledWith('2026-07-05T00:00');
  });

  it('changing the time keeps the date; clearing the time falls back to midnight', () => {
    const onChange = vi.fn();
    render(<DateTimePickerPrimitive id="dt" value="2026-07-15T09:30" onChange={onChange} />);
    fireEvent.change(timeInput(), { target: { value: '13:45' } });
    expect(onChange).toHaveBeenLastCalledWith('2026-07-15T13:45');
    fireEvent.change(timeInput(), { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith('2026-07-15T00:00');
  });

  it('clearing the date emits an empty string', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateTimePickerPrimitive id="dt" value="2026-07-15T09:30" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('honours min and max on the calendar', async () => {
    const user = userEvent.setup();
    render(<DateTimePickerPrimitive id="dt" value="2026-07-15T09:30" min={new Date(2026, 6, 10)} max={new Date(2026, 6, 20)} />);
    await user.click(dateTrigger());
    expect(day(5)).toBeDisabled();
    expect(day(25)).toBeDisabled();
    expect(day(12)).toBeEnabled();
  });

  it('disabled locks both parts; readOnly locks the time input', () => {
    const { rerender } = render(<DateTimePickerPrimitive id="dt" value="2026-07-15T09:30" disabled />);
    expect(dateTrigger()).toBeDisabled();
    expect(timeInput()).toBeDisabled();
    rerender(<DateTimePickerPrimitive id="dt" value="2026-07-15T09:30" readOnly />);
    expect(timeInput()).toHaveAttribute('readonly');
  });

  it('works without an onChange handler and without an id', async () => {
    const user = userEvent.setup();
    render(<DateTimePickerPrimitive data-testid="x" value="2026-07-15T09:30" />);
    fireEvent.change(document.querySelector('input[type="time"]')!, { target: { value: '10:00' } });
    await user.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(screen.getByTestId('x')).toBeInTheDocument();
  });

  it('DateTimePicker adds chrome, forwards the ref and flags errors', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<DateTimePicker ref={ref} id="dt" label="Starts" description="Local time" value="2026-07-15T09:30" />);
    expect(screen.getByText('Starts')).toBeInTheDocument();
    expect(screen.getByText('Local time')).toBeInTheDocument();
    expect(ref.current).toBe(screen.getByTestId('dt'));
    expect(dateTrigger().getAttribute('aria-describedby')).toBeNull();
  });

  it('DateTimePicker with an error marks both parts invalid', () => {
    render(<DateTimePicker id="dt" label="Starts" error="Required" required />);
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(dateTrigger()).toHaveAttribute('aria-invalid', 'true');
    expect(timeInput()).toHaveAttribute('aria-invalid', 'true');
  });
});
