import '@testing-library/jest-dom';
import { SwitchPrimitive } from '@oc-tech/omni-ui-components/Switch';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('omni-ui-components/Switch: read-only', () => {
  it('stays focusable, is announced, and cannot be toggled by pointer or keyboard', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<SwitchPrimitive id="s" checked readOnly onChange={onChange} aria-label="Notify" />);
    const control = screen.getByRole('switch');
    expect(control).not.toBeDisabled();
    expect(control).toHaveAttribute('aria-readonly', 'true');
    expect(control).toHaveAttribute('data-readonly');
    await user.click(control);
    control.focus();
    await user.keyboard(' ');
    await user.keyboard('{Enter}');
    expect(control).toHaveAttribute('aria-checked', 'true');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('uncontrolled read-only does not move either, and disabled wins', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <SwitchPrimitive id="s" defaultChecked={false} readOnly aria-label="Notify" />,
    );
    await user.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    rerender(<SwitchPrimitive id="s" readOnly disabled aria-label="Notify" />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});
