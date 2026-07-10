import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CheckboxGroup, type CheckboxGroupProps } from '@omnitech/omni-ui-core/Checkbox';

const baseOptions = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
];

const renderGroup = (overrides: Partial<CheckboxGroupProps> = {}) => render(<CheckboxGroup data-testid="g" options={baseOptions} {...overrides} />);

describe('omni-ui-components/CheckboxGroup', () => {
  describe('shape', () => {
    it('renders one checkbox per option', () => {
      renderGroup();
      baseOptions.forEach((opt) => {
        expect(screen.getByTestId(`g-option-${opt.value}`)).toBeInTheDocument();
      });
    });

    it('renders per-option descriptions when provided', () => {
      renderGroup({
        options: [
          { value: 'email', label: 'Email', description: 'Daily' },
          { value: 'sms', label: 'SMS' },
        ],
      });
      expect(screen.getByText('Daily')).toBeInTheDocument();
    });
  });

  describe('orientation', () => {
    it('defaults to vertical', () => {
      renderGroup();
      expect(screen.getByTestId('g')).toHaveAttribute('data-orientation', 'vertical');
    });

    it('renders horizontal when orientation=horizontal', () => {
      renderGroup({ orientation: 'horizontal' });
      expect(screen.getByTestId('g')).toHaveAttribute('data-orientation', 'horizontal');
    });
  });

  describe('selection', () => {
    it('starts with the provided values checked', () => {
      renderGroup({ value: ['sms'] });
      expect(screen.getByTestId('g-option-sms')).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByTestId('g-option-email')).toHaveAttribute('aria-checked', 'false');
    });

    it('calls onChange with the new array when an option is toggled', async () => {
      const handle = jest.fn();
      const user = userEvent.setup();
      renderGroup({ value: ['email'], onChange: handle });
      await user.click(screen.getByTestId('g-option-sms'));
      expect(handle).toHaveBeenCalledWith(['email', 'sms']);
    });

    it('removes the value when an already-checked option is clicked', async () => {
      const handle = jest.fn();
      const user = userEvent.setup();
      renderGroup({ value: ['email', 'sms'], onChange: handle });
      await user.click(screen.getByTestId('g-option-email'));
      expect(handle).toHaveBeenCalledWith(['sms']);
    });
  });

  describe('disabled', () => {
    it('disables every option when group disabled', () => {
      renderGroup({ disabled: true });
      baseOptions.forEach((opt) => expect(screen.getByTestId(`g-option-${opt.value}`)).toBeDisabled());
    });

    it('disables only the per-option flagged item', () => {
      renderGroup({
        options: [
          { value: 'email', label: 'Email' },
          { value: 'sms', label: 'SMS', disabled: true },
        ],
      });
      expect(screen.getByTestId('g-option-sms')).toBeDisabled();
      expect(screen.getByTestId('g-option-email')).not.toBeDisabled();
    });
  });

  describe('a11y', () => {
    it('flags aria-invalid when error is present', () => {
      renderGroup({ error: 'required' });
      expect(screen.getByTestId('g')).toHaveAttribute('aria-invalid', 'true');
    });

    it('groups options under aria-labelledby when label is provided', () => {
      renderGroup({ label: 'Channels', id: 'channels' });
      const group = screen.getAllByRole('group').find((el) => el.getAttribute('aria-labelledby') === 'channels-label');
      expect(group).toBeDefined();
    });
  });
});
