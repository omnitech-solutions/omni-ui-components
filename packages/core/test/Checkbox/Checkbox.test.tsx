import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Checkbox, type CheckboxProps } from '@omnitech/omni-ui-core/Checkbox';

const renderCheckbox = (overrides: Partial<CheckboxProps> = {}) => render(<Checkbox data-testid="c" label="Subscribe" {...overrides} />);

describe('omni-ui-components/Checkbox', () => {
  describe('shape', () => {
    it('renders the checkbox + label', () => {
      renderCheckbox();
      expect(screen.getByTestId('c')).toBeInTheDocument();
      expect(screen.getByText('Subscribe')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      renderCheckbox({ description: 'Once a week' });
      expect(screen.getByText('Once a week')).toBeInTheDocument();
    });

    it('suppresses description when an error is shown', () => {
      renderCheckbox({ description: 'helper', error: 'required' });
      expect(screen.queryByText('helper')).not.toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('required');
    });

    it('renders a required asterisk on the label when required', () => {
      renderCheckbox({ required: true, label: 'Agree' });
      expect(screen.getByText('Agree').parentElement?.textContent).toContain('*');
    });
  });

  describe('state + interaction', () => {
    it('starts unchecked by default', () => {
      renderCheckbox();
      expect(screen.getByTestId('c')).toHaveAttribute('aria-checked', 'false');
    });

    it('reflects controlled checked=true', () => {
      renderCheckbox({ checked: true });
      expect(screen.getByTestId('c')).toHaveAttribute('aria-checked', 'true');
    });

    it('fires onChange(true) when clicked', async () => {
      const handle = jest.fn();
      const user = userEvent.setup();
      renderCheckbox({ onChange: handle });
      await user.click(screen.getByTestId('c'));
      expect(handle).toHaveBeenCalledWith(true);
    });

    it('toggles when the label row is clicked', async () => {
      const handle = jest.fn();
      const user = userEvent.setup();
      renderCheckbox({ onChange: handle });
      await user.click(screen.getByText('Subscribe'));
      expect(handle).toHaveBeenCalledWith(true);
    });
  });

  describe('disabled', () => {
    it('renders disabled when disabled=true', () => {
      renderCheckbox({ disabled: true });
      expect(screen.getByTestId('c')).toBeDisabled();
    });
  });

  describe('a11y', () => {
    it('flags aria-invalid when error is present', () => {
      renderCheckbox({ error: 'required' });
      expect(screen.getByTestId('c')).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
