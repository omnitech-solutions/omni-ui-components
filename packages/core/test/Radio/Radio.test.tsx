import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

beforeAll(() => {
  if (!('hasPointerCapture' in Element.prototype)) {
    Element.prototype.hasPointerCapture = jest.fn().mockReturnValue(false);
    Element.prototype.setPointerCapture = jest.fn();
    Element.prototype.releasePointerCapture = jest.fn();
  }
});

import { Radio, type RadioProps } from '@omnitech/omni-ui-core/Radio';

const baseOptions = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
];

const renderRadio = (overrides: Partial<RadioProps> = {}) => render(<Radio data-testid="r" options={baseOptions} {...overrides} />);

describe('omni-ui-components/Radio', () => {
  describe('shape', () => {
    it('renders one radio item per option', () => {
      renderRadio();
      baseOptions.forEach((opt) => {
        expect(screen.getByTestId(`r-option-${opt.value}`)).toBeInTheDocument();
      });
    });

    it('renders the option labels', () => {
      renderRadio();
      ['Free', 'Pro', 'Team'].forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('renders per-option descriptions when provided', () => {
      renderRadio({
        options: [
          { value: 'free', label: 'Free', description: 'No card required' },
          { value: 'pro', label: 'Pro' },
        ],
      });
      expect(screen.getByText('No card required')).toBeInTheDocument();
    });
  });

  describe('orientation', () => {
    it('defaults to vertical', () => {
      renderRadio();
      expect(screen.getByTestId('r')).toHaveAttribute('data-orientation', 'vertical');
    });

    it('renders horizontal when orientation=horizontal', () => {
      renderRadio({ orientation: 'horizontal' });
      expect(screen.getByTestId('r')).toHaveAttribute('data-orientation', 'horizontal');
    });
  });

  describe('label / description / error chrome', () => {
    it('renders the label when provided', () => {
      renderRadio({ label: 'Plan' });
      expect(screen.getByText('Plan')).toBeInTheDocument();
    });

    it('shows description when no error is present', () => {
      renderRadio({ description: 'Pick one' });
      expect(screen.getByText('Pick one')).toBeInTheDocument();
    });

    it('suppresses description when an error is shown', () => {
      renderRadio({ description: 'helper', error: 'required' });
      expect(screen.queryByText('helper')).not.toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('required');
    });

    it('groups options under aria-labelledby when label is provided', () => {
      renderRadio({ label: 'Plan', id: 'plan' });
      const group = screen.getByRole('group');
      expect(group).toHaveAttribute('aria-labelledby', 'plan-label');
      expect(screen.getByText('Plan').id).toBe('plan-label');
    });
  });

  describe('selection', () => {
    it('calls onChange with the picked value', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      renderRadio({ onChange: handleChange });
      await user.click(screen.getByTestId('r-option-pro'));
      expect(handleChange).toHaveBeenCalledWith('pro');
    });

    it('marks the currently-selected option as checked', () => {
      renderRadio({ value: 'pro' });
      expect(screen.getByTestId('r-option-pro')).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByTestId('r-option-free')).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('disabled state', () => {
    it('disables every item when disabled is set on the group', () => {
      renderRadio({ disabled: true });
      baseOptions.forEach((opt) => {
        expect(screen.getByTestId(`r-option-${opt.value}`)).toBeDisabled();
      });
    });

    it('disables only the option flagged as disabled', () => {
      renderRadio({
        options: [
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro', disabled: true },
        ],
      });
      expect(screen.getByTestId('r-option-pro')).toBeDisabled();
      expect(screen.getByTestId('r-option-free')).not.toBeDisabled();
    });
  });

  describe('a11y attributes', () => {
    it('flags aria-invalid when error is present', () => {
      renderRadio({ error: 'required' });
      expect(screen.getByTestId('r')).toHaveAttribute('aria-invalid', 'true');
    });

    it('exposes the error in role=alert', () => {
      renderRadio({ error: 'Pick one' });
      expect(within(screen.getByRole('alert'))).toBeTruthy();
    });
  });
});
