import '@testing-library/jest-dom';
import { DatePickerPrimitive } from '@oc-tech/omni-ui-components/DatePicker';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('omni-ui-components/DatePicker: read-only, size, and the clear control', () => {
  it('read-only: focusable, never opens, no clear control, value fixed', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <DatePickerPrimitive id="d" value={new Date(2026, 9, 9)} readOnly onChange={onChange} />,
    );
    const trigger = document.getElementById('d') as HTMLElement;
    expect(trigger).not.toBeDisabled();
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    expect(trigger).toHaveAttribute('data-state', 'readonly');
    await user.click(trigger);
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Clear date' })).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('the clear control is a button beside the trigger, not inside it, and works by keyboard', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<DatePickerPrimitive id="d" value={new Date(2026, 9, 9)} onChange={onChange} />);
    const clear = screen.getByRole('button', { name: 'Clear date' });
    expect(clear.tagName).toBe('BUTTON');
    expect(document.getElementById('d')?.contains(clear)).toBe(false);
    clear.focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('takes size and variant on the field', () => {
    render(<DatePickerPrimitive id="d" inputSize="sm" variant="ghost" />);
    const trigger = document.getElementById('d') as HTMLElement;
    expect(trigger).toHaveAttribute('data-input-size', 'sm');
    expect(trigger).toHaveAttribute('data-variant', 'ghost');
    expect(trigger.className).toContain('--oui-field-height-sm');
  });
});
