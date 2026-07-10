import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TimePicker } from '@omnitech/omni-ui-core/TimePicker';

describe('omni-ui-components/TimePicker', () => {
  it('renders with label + time input', () => {
    render(<TimePicker data-testid="t" label="Start time" value="09:30" onChange={() => undefined} />);
    expect(screen.getByText('Start time')).toBeInTheDocument();
    const input = screen.getByTestId('t') as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'time');
    expect(input).toHaveValue('09:30');
  });

  it('emits HH:MM on change', async () => {
    const handle = jest.fn();
    const user = userEvent.setup();
    render(<TimePicker data-testid="t" label="t" value="" onChange={handle} />);
    const input = screen.getByTestId('t') as HTMLInputElement;
    fireChange(input, '14:30');
    expect(handle).toHaveBeenCalledWith('14:30');
    void user;
  });

  it('flags aria-invalid on error', () => {
    render(<TimePicker data-testid="t" label="t" error="bad" onChange={() => undefined} />);
    expect(screen.getByTestId('t')).toHaveAttribute('aria-invalid', 'true');
  });
});

function fireChange(el: HTMLInputElement, value: string) {
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  nativeSetter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
