import '@testing-library/jest-dom';
import { StepperPrimitive } from '@oc-tech/omni-ui-components/Stepper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('omni-ui-components/Stepper: read-only and labels', () => {
  it('read-only: the buttons stay focusable, say they are unavailable, and do nothing', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<StepperPrimitive id="s" value={3} readOnly onChange={onChange} aria-label="Pages" />);
    expect(screen.getByRole('group', { name: 'Pages' })).toHaveAttribute('data-readonly');
    const plus = screen.getByRole('button', { name: 'Increase' });
    expect(plus).not.toBeDisabled();
    expect(plus).toHaveAttribute('aria-disabled', 'true');
    await user.click(plus);
    await user.click(screen.getByRole('button', { name: 'Decrease' }));
    plus.focus();
    await user.keyboard('{Enter}');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('names its buttons through labels', () => {
    render(<StepperPrimitive id="s" value={3} labels={{ decrease: 'Moins', increase: 'Plus' }} />);
    expect(screen.getByRole('button', { name: 'Moins' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Plus' })).toBeInTheDocument();
  });
});
