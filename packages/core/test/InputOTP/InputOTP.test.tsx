import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { InputOTP, type InputOTPProps } from '@oc-tech/omni-ui-components/InputOTP';

const renderOTP = (overrides: Partial<InputOTPProps> = {}) => render(<InputOTP data-testid="otp" label="Code" length={6} {...overrides} />);

describe('omni-ui-components/InputOTP', () => {
  it('renders the otp container + label', () => {
    renderOTP();
    expect(document.querySelector('[data-slot="input-otp"]')).toBeInTheDocument();
    expect(screen.getByText('Code')).toBeInTheDocument();
  });

  it('renders within the otp data-slot container', () => {
    renderOTP({ length: 4 });
    /* input-otp is a black-box; just confirm the wrapper rendered. */
    expect(document.querySelector('[data-slot="input-otp"]')).toBeInTheDocument();
  });

  it('flags aria-invalid when error is present', () => {
    renderOTP({ error: 'Code is incorrect' });
    expect(document.querySelector('[data-slot="input-otp"]')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Code is incorrect');
  });
});
