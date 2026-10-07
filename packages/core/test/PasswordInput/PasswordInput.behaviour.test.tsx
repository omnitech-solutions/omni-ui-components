import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { PasswordInput } from '@oc-tech/omni-ui-components/PasswordInput';

const field = () => document.querySelector('input') as HTMLInputElement;

describe('omni-ui-components/PasswordInput behaviour', () => {
  it('is masked by default and the toggle reveals then hides the text', async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Password" />);
    expect(field()).toHaveAttribute('type', 'password');
    const show = screen.getByRole('button', { name: 'Show password' });
    expect(show).toHaveAttribute('aria-pressed', 'false');
    await user.click(show);
    expect(field()).toHaveAttribute('type', 'text');
    const hide = screen.getByRole('button', { name: 'Hide password' });
    expect(hide).toHaveAttribute('aria-pressed', 'true');
    await user.click(hide);
    expect(field()).toHaveAttribute('type', 'password');
  });

  it('keeps what was typed (controlled) when toggling visibility', async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [value, setValue] = React.useState('');
      return <PasswordInput label="Password" value={value} onChange={setValue} />;
    };
    render(<Controlled />);
    await user.type(field(), 'hunter2');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(field().value).toBe('hunter2');
  });

  it('keeps the same input element when toggling, so refs and DOM state survive', async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Password" />);
    const before = field();
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(field()).toBe(before);
    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(field()).toBe(before);
  });

  it('omits the toggle when toggleable is false', () => {
    render(<PasswordInput label="Password" toggleable={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(field()).not.toHaveClass('pr-10');
  });

  it('disables the toggle together with the field', () => {
    render(<PasswordInput label="Password" disabled />);
    expect(field()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Show password' })).toBeDisabled();
  });

  it('wires error, description and required aria and uses flex-1 in horizontal layout', () => {
    const { rerender } = render(<PasswordInput label="Password" description="8+ chars" required />);
    expect(screen.getByText('8+ chars')).toBeInTheDocument();
    expect(field()).toHaveAttribute('aria-required', 'true');
    expect(field().getAttribute('aria-describedby')).toBeTruthy();

    rerender(<PasswordInput label="Password" error="Too short" layout="horizontal" />);
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Too short')).toBeInTheDocument();
    expect(field()).toHaveClass('flex-1');
  });

  it('forwards the ref to the input in both modes', async () => {
    const user = userEvent.setup();
    const ref = { current: null as HTMLInputElement | null };
    render(<PasswordInput ref={ref} label="Password" />);
    expect(ref.current).toBe(field());
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(ref.current).toBe(field());
  });
});
