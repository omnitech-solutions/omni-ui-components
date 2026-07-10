import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Wizard, type WizardProps } from '@omnitech/omni-ui-core/Wizard';

const STEPS = [
  { name: 'basic', label: 'Basic', content: <p>basic-content</p> },
  { name: 'payment', label: 'Payment', content: <p>payment-content</p> },
  { name: 'review', label: 'Review', content: <p>review-content</p> },
];

const renderWizard = (overrides: Partial<WizardProps> = {}) => render(<Wizard data-testid="w" steps={STEPS} {...overrides} />);

describe('omni-ui-components/Wizard', () => {
  describe('shape', () => {
    it('renders the step indicator with one trigger per step', () => {
      renderWizard();
      STEPS.forEach((s) => expect(screen.getByTestId(`w-steps-step-${s.name}`)).toBeInTheDocument());
    });

    it('renders the first step content by default', () => {
      renderWizard();
      expect(screen.getByText('basic-content')).toBeInTheDocument();
      expect(screen.queryByText('payment-content')).not.toBeInTheDocument();
    });

    it('respects defaultStep', () => {
      renderWizard({ defaultStep: 'payment' });
      expect(screen.getByText('payment-content')).toBeInTheDocument();
    });

    it('marks the active step with aria-current=step', () => {
      renderWizard({ defaultStep: 'payment' });
      expect(screen.getByTestId('w-steps-step-payment')).toHaveAttribute('aria-current', 'step');
      expect(screen.getByTestId('w-steps-step-basic')).not.toHaveAttribute('aria-current');
    });

    it('marks past steps with data-state=done and future steps with upcoming', () => {
      renderWizard({ defaultStep: 'payment' });
      expect(screen.getByTestId('w-steps-step-basic')).toHaveAttribute('data-state', 'done');
      expect(screen.getByTestId('w-steps-step-payment')).toHaveAttribute('data-state', 'active');
      expect(screen.getByTestId('w-steps-step-review')).toHaveAttribute('data-state', 'upcoming');
    });
  });

  describe('navigation', () => {
    it('Next advances to the following step', async () => {
      const user = userEvent.setup();
      renderWizard();
      await user.click(screen.getByTestId('w-next'));
      expect(screen.getByText('payment-content')).toBeInTheDocument();
    });

    it('Back returns to the previous step', async () => {
      const user = userEvent.setup();
      renderWizard({ defaultStep: 'payment' });
      await user.click(screen.getByTestId('w-back'));
      expect(screen.getByText('basic-content')).toBeInTheDocument();
    });

    it('disables Back on the first step', () => {
      renderWizard();
      expect(screen.getByTestId('w-back')).toBeDisabled();
    });

    it('renders Finish on the last step and fires onComplete when clicked', async () => {
      const onComplete = jest.fn();
      const user = userEvent.setup();
      renderWizard({ defaultStep: 'review', onComplete });
      const action = screen.getByTestId('w-next');
      expect(action).toHaveTextContent('Finish');
      await user.click(action);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('disables Next when canAdvance=false on the active step', () => {
      renderWizard({ steps: [{ ...STEPS[0], canAdvance: false }, STEPS[1]] });
      expect(screen.getByTestId('w-next')).toBeDisabled();
    });

    it('clicking a past step in the indicator goes back to it', async () => {
      const user = userEvent.setup();
      renderWizard({ defaultStep: 'review' });
      await user.click(screen.getByTestId('w-steps-step-basic'));
      expect(screen.getByText('basic-content')).toBeInTheDocument();
    });

    it('blocks clicking future un-reached steps when forceLinearForward (default)', async () => {
      const user = userEvent.setup();
      renderWizard();
      const future = screen.getByTestId('w-steps-step-review');
      expect(future).toBeDisabled();
      await user.click(future);
      expect(screen.getByText('basic-content')).toBeInTheDocument();
    });
  });

  describe('controlled mode', () => {
    it('uses currentStep instead of internal state when provided', () => {
      const { rerender } = renderWizard({ currentStep: 'payment', onStepChange: jest.fn() });
      expect(screen.getByText('payment-content')).toBeInTheDocument();
      rerender(<Wizard data-testid="w" steps={STEPS} currentStep="review" onStepChange={jest.fn()} />);
      expect(screen.getByText('review-content')).toBeInTheDocument();
    });

    it('calls onStepChange when Next is clicked but does NOT update local state', async () => {
      const onStepChange = jest.fn();
      const user = userEvent.setup();
      renderWizard({ currentStep: 'basic', onStepChange });
      await user.click(screen.getByTestId('w-next'));
      expect(onStepChange).toHaveBeenCalledWith('payment');
      expect(screen.getByText('basic-content')).toBeInTheDocument();
    });
  });

  describe('hideActions', () => {
    it('does not render the action row when hideActions=true', () => {
      renderWizard({ hideActions: true });
      expect(screen.queryByTestId('w-next')).not.toBeInTheDocument();
      expect(screen.queryByTestId('w-back')).not.toBeInTheDocument();
    });
  });

  describe('custom labels', () => {
    it('uses custom Back / Next labels', () => {
      renderWizard({ labels: { back: 'Prev', next: 'Continue' } });
      expect(screen.getByTestId('w-back')).toHaveTextContent('Prev');
      expect(screen.getByTestId('w-next')).toHaveTextContent('Continue');
    });

    it('uses custom Finish label on the last step', () => {
      renderWizard({ defaultStep: 'review', labels: { finish: 'Submit' } });
      expect(screen.getByTestId('w-next')).toHaveTextContent('Submit');
    });
  });
});
