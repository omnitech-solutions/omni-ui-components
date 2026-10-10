import '@testing-library/jest-dom';
import { CalendarField, CalendarPrimitive } from '@oc-tech/omni-ui-components/Calendar';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const day = (d: number) => new Date(2026, 9, d);
const cell = (name: RegExp) => within(screen.getByRole('grid')).getByRole('button', { name });

describe('omni-ui-components/Calendar: the date choice as a typed control', () => {
  it('shows the value and reports a chosen day as a Date', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<CalendarPrimitive id="c" value={day(9)} onChange={onChange} />);
    await user.click(cell(/October 15/));
    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0] as Date;
    expect([next.getFullYear(), next.getMonth(), next.getDate()]).toEqual([2026, 9, 15]);
  });

  it('uncontrolled: keeps its own value and writes it to a hidden input when named', async () => {
    const user = userEvent.setup();
    render(<CalendarPrimitive id="c" name="start" defaultValue={day(9)} />);
    await user.click(cell(/October 20/));
    expect(document.querySelector('input[name="start"]')).toHaveValue('2026-10-20');
  });

  it('clears when the chosen day is chosen again, unless required', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { rerender } = render(<CalendarPrimitive id="c" value={day(9)} onChange={onChange} />);
    await user.click(cell(/October 9/));
    expect(onChange).toHaveBeenLastCalledWith(null);
    onChange.mockClear();
    rerender(<CalendarPrimitive id="c" value={day(9)} required onChange={onChange} />);
    await user.click(cell(/October 9/));
    expect(onChange).not.toHaveBeenCalledWith(null);
  });

  it('refuses days outside min and max', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <CalendarPrimitive id="c" value={day(9)} min={day(5)} max={day(12)} onChange={onChange} />,
    );
    await user.click(cell(/October 20/));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('read-only: the grid stays focusable and the day cannot change; disabled blocks every day', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { rerender } = render(
      <CalendarPrimitive id="c" value={day(9)} readOnly onChange={onChange} />,
    );
    const root = document.getElementById('c') as HTMLElement;
    expect(root).toHaveAttribute('data-readonly');
    expect(root).toHaveAttribute('data-state', 'readonly');
    expect(cell(/October 15/)).not.toBeDisabled();
    await user.click(cell(/October 15/));
    expect(onChange).not.toHaveBeenCalled();
    rerender(<CalendarPrimitive id="c" value={day(9)} disabled readOnly onChange={onChange} />);
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(root).not.toHaveAttribute('data-readonly');
    await user.click(cell(/October 15/));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('carries its name, description and invalid state', () => {
    render(<CalendarPrimitive id="c" aria-label="Start" aria-describedby="help" invalid />);
    const root = screen.getByRole('group', { name: 'Start' });
    expect(root).toHaveAttribute('aria-describedby', 'help');
    expect(root).toHaveAttribute('aria-invalid', 'true');
  });

  it('the field layer names the group by its label and draws description, required hint and error', () => {
    const { rerender } = render(
      <CalendarField
        id="c"
        label="Start date"
        description="Weekdays only"
        required
        value={day(9)}
      />,
    );
    const group = screen.getByRole('group', { name: /Start date/ });
    expect(group).toHaveAccessibleDescription(/Required.*Weekdays only/);
    rerender(<CalendarField id="c" label="Start date" error="Pick a day" value={null} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Pick a day');
    expect(screen.getByRole('group', { name: /Start date/ })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});
