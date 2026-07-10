import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Switch, type SwitchProps } from '@omnitech/omni-ui-core/Switch';

const renderSwitch = (overrides: Partial<SwitchProps> = {}) => render(<Switch data-testid="sw" label="Notify" {...overrides} />);

describe('omni-ui-components/Switch', () => {
  it('renders the switch + label', () => {
    renderSwitch();
    expect(screen.getByTestId('sw')).toBeInTheDocument();
    expect(screen.getByText('Notify')).toBeInTheDocument();
  });

  it('starts unchecked by default', () => {
    renderSwitch();
    expect(screen.getByTestId('sw')).toHaveAttribute('aria-checked', 'false');
  });

  it('reflects controlled checked', () => {
    renderSwitch({ checked: true });
    expect(screen.getByTestId('sw')).toHaveAttribute('aria-checked', 'true');
  });

  it('fires onChange(true) when toggled', async () => {
    const handle = jest.fn();
    const user = userEvent.setup();
    renderSwitch({ onChange: handle });
    await user.click(screen.getByTestId('sw'));
    expect(handle).toHaveBeenCalledWith(true);
  });

  it('toggles when the label row is clicked', async () => {
    const handle = jest.fn();
    const user = userEvent.setup();
    renderSwitch({ onChange: handle });
    await user.click(screen.getByText('Notify'));
    expect(handle).toHaveBeenCalledWith(true);
  });

  it('flags aria-invalid when error is present', () => {
    renderSwitch({ error: 'required' });
    expect(screen.getByTestId('sw')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders disabled when disabled=true', () => {
    renderSwitch({ disabled: true });
    expect(screen.getByTestId('sw')).toBeDisabled();
  });
});
