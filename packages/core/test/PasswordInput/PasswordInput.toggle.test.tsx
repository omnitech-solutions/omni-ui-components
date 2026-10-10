import '@testing-library/jest-dom';
import { PasswordInput, PasswordInputPrimitive } from '@oc-tech/omni-ui-components/PasswordInput';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('omni-ui-components/PasswordInput: the reveal control lives in the primitive', () => {
  it('the bare primitive draws no control', () => {
    render(<PasswordInputPrimitive id="p" value="x" />);
    expect(document.getElementById('p')).toHaveAttribute('type', 'password');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('toggleable: switches the type, says so, keeps focus in the input and reports the change', async () => {
    const user = userEvent.setup();
    const onRevealedChange = jest.fn();
    render(
      <PasswordInputPrimitive
        id="p"
        value="secret"
        toggleable
        onRevealedChange={onRevealedChange}
      />,
    );
    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'p');
    await user.click(toggle);
    expect(document.getElementById('p')).toHaveAttribute('type', 'text');
    expect(document.getElementById('p')).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(onRevealedChange).toHaveBeenCalledWith(true);
  });

  it('is operable by keyboard and takes its words and icons from props', async () => {
    const user = userEvent.setup();
    render(
      <PasswordInputPrimitive
        id="p"
        value="secret"
        toggleable
        labels={{ show: 'Afficher', hide: 'Masquer' }}
        showIcon={<span data-testid="show-icon" />}
        hideIcon={<span data-testid="hide-icon" />}
      />,
    );
    expect(screen.getByTestId('show-icon')).toBeInTheDocument();
    screen.getByRole('button', { name: 'Afficher' }).focus();
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Masquer' })).toBeInTheDocument();
    expect(screen.getByTestId('hide-icon')).toBeInTheDocument();
  });

  it('controlled: follows revealed and does not change by itself', async () => {
    const user = userEvent.setup();
    render(<PasswordInputPrimitive id="p" value="secret" toggleable revealed={false} />);
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(document.getElementById('p')).toHaveAttribute('type', 'password');
  });

  it('disabled disables the control; read-only keeps the value readable', () => {
    const { rerender } = render(
      <PasswordInputPrimitive id="p" value="secret" toggleable disabled />,
    );
    expect(screen.getByRole('button', { name: 'Show password' })).toBeDisabled();
    rerender(<PasswordInputPrimitive id="p" value="secret" toggleable readOnly />);
    expect(document.getElementById('p')).toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'Show password' })).not.toBeDisabled();
  });

  it('the field layer shows the control by default and hides it with toggleable={false}', () => {
    const { rerender } = render(<PasswordInput id="p" label="Password" value="" />);
    expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument();
    rerender(<PasswordInput id="p" label="Password" value="" toggleable={false} />);
    expect(screen.queryByRole('button', { name: 'Show password' })).toBeNull();
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });
});
