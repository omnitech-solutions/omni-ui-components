import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileText } from 'lucide-react';

import { Stepper, type StepperProps } from '@omnitech/omni-ui-core/Stepper';

const renderStepper = (overrides: Partial<StepperProps> = {}) =>
  render(<Stepper data-testid="s" label="Number of pages" icon={<FileText />} unit="page" min={1} max={50} value={7} {...overrides} />);

describe('omni-ui-components/Stepper', () => {
  describe('shape', () => {
    it('renders the pill row + label', () => {
      renderStepper();
      expect(screen.getByTestId('s')).toBeInTheDocument();
      expect(screen.getByText(/number of pages/i)).toBeInTheDocument();
    });

    it('renders the current value with the singular unit', () => {
      renderStepper({ value: 1 });
      expect(screen.getByText('1 page')).toBeInTheDocument();
    });

    it('renders the plural unit for values != 1', () => {
      renderStepper({ value: 7 });
      expect(screen.getByText('7 pages')).toBeInTheDocument();
    });

    it('honors a custom unitPlural', () => {
      renderStepper({ value: 3, unit: 'person', unitPlural: 'people' });
      expect(screen.getByText('3 people')).toBeInTheDocument();
    });

    it('honors a formatValue override', () => {
      renderStepper({ value: 12, formatValue: (n) => `Pages: ${n}` });
      expect(screen.getByText('Pages: 12')).toBeInTheDocument();
    });

    it('renders the increment + decrement buttons', () => {
      renderStepper();
      expect(screen.getByTestId('s-decrement')).toBeInTheDocument();
      expect(screen.getByTestId('s-increment')).toBeInTheDocument();
    });
  });

  describe('bounds', () => {
    it('disables decrement at the minimum', () => {
      renderStepper({ value: 1, min: 1 });
      expect(screen.getByTestId('s-decrement')).toBeDisabled();
      expect(screen.getByTestId('s-increment')).not.toBeDisabled();
    });

    it('disables increment at the maximum', () => {
      renderStepper({ value: 50, min: 1, max: 50 });
      expect(screen.getByTestId('s-decrement')).not.toBeDisabled();
      expect(screen.getByTestId('s-increment')).toBeDisabled();
    });
  });

  describe('interaction', () => {
    it('fires onChange with value + step on increment', async () => {
      const handle = jest.fn();
      const user = userEvent.setup();
      renderStepper({ value: 7, onChange: handle });
      await user.click(screen.getByTestId('s-increment'));
      expect(handle).toHaveBeenCalledWith(8);
    });

    it('fires onChange with value - step on decrement', async () => {
      const handle = jest.fn();
      const user = userEvent.setup();
      renderStepper({ value: 7, onChange: handle });
      await user.click(screen.getByTestId('s-decrement'));
      expect(handle).toHaveBeenCalledWith(6);
    });

    it('respects a custom step', async () => {
      const handle = jest.fn();
      const user = userEvent.setup();
      renderStepper({ value: 10, step: 5, onChange: handle });
      await user.click(screen.getByTestId('s-increment'));
      expect(handle).toHaveBeenCalledWith(15);
    });

    it('clamps to max', async () => {
      const handle = jest.fn();
      const user = userEvent.setup();
      renderStepper({ value: 49, step: 5, max: 50, onChange: handle });
      await user.click(screen.getByTestId('s-increment'));
      expect(handle).toHaveBeenCalledWith(50);
    });
  });

  describe('disabled', () => {
    it('disables both buttons when disabled=true', () => {
      renderStepper({ disabled: true });
      expect(screen.getByTestId('s-decrement')).toBeDisabled();
      expect(screen.getByTestId('s-increment')).toBeDisabled();
    });
  });

  describe('a11y', () => {
    it('flags aria-invalid when error is present', () => {
      renderStepper({ error: 'required' });
      expect(screen.getByTestId('s')).toHaveAttribute('aria-invalid', 'true');
    });

    it('exposes the error in role=alert', () => {
      renderStepper({ error: 'Pick a value' });
      expect(screen.getByRole('alert')).toHaveTextContent('Pick a value');
    });
  });
});
