import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Segmented, type SegmentedProps } from '@omnitech/omni-ui-core/Segmented';

const baseOptions = [
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
];

const renderSegmented = (overrides: Partial<SegmentedProps> = {}) => render(<Segmented data-testid="s" label="Tone" options={baseOptions} {...overrides} />);

describe('omni-ui-components/Segmented', () => {
  describe('shape', () => {
    it('renders one button per option', () => {
      renderSegmented();
      baseOptions.forEach((opt) => {
        expect(screen.getByTestId(`s-option-${opt.value}`)).toBeInTheDocument();
      });
    });

    it('renders the label', () => {
      renderSegmented();
      expect(screen.getByText('Tone')).toBeInTheDocument();
    });

    it('groups options under aria-labelledby when label is provided', () => {
      renderSegmented({ id: 'tone' });
      const group = screen.getAllByRole('group').find((el) => el.getAttribute('aria-labelledby') === 'tone-label');
      expect(group).toBeDefined();
    });
  });

  describe('selection', () => {
    it('marks the controlled value as selected', () => {
      renderSegmented({ value: 'friendly' });
      expect(screen.getByTestId('s-option-friendly')).toHaveAttribute('data-state', 'on');
      expect(screen.getByTestId('s-option-casual')).toHaveAttribute('data-state', 'off');
    });

    it('fires onChange with the picked value', async () => {
      const handle = jest.fn();
      const user = userEvent.setup();
      renderSegmented({ onChange: handle });
      await user.click(screen.getByTestId('s-option-professional'));
      expect(handle).toHaveBeenCalledWith('professional');
    });

    it('does not fire onChange when the active option is clicked again (no deselect)', async () => {
      const handle = jest.fn();
      const user = userEvent.setup();
      renderSegmented({ value: 'friendly', onChange: handle });
      await user.click(screen.getByTestId('s-option-friendly'));
      expect(handle).not.toHaveBeenCalled();
    });
  });

  describe('disabled', () => {
    it('disables every option when the group is disabled', () => {
      renderSegmented({ disabled: true });
      baseOptions.forEach((opt) => expect(screen.getByTestId(`s-option-${opt.value}`)).toBeDisabled());
    });

    it('disables only the per-option flagged item', () => {
      renderSegmented({
        options: [
          { value: 'casual', label: 'Casual' },
          { value: 'pro', label: 'Pro', disabled: true },
        ],
      });
      expect(screen.getByTestId('s-option-pro')).toBeDisabled();
      expect(screen.getByTestId('s-option-casual')).not.toBeDisabled();
    });
  });

  describe('a11y', () => {
    it('flags aria-invalid on the root when error is present', () => {
      renderSegmented({ error: 'required' });
      expect(screen.getByTestId('s')).toHaveAttribute('aria-invalid', 'true');
    });

    it('exposes the error in role=alert', () => {
      renderSegmented({ error: 'Tone is required' });
      expect(screen.getByRole('alert')).toHaveTextContent('Tone is required');
    });
  });
});
