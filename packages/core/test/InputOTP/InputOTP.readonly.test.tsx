import '@testing-library/jest-dom';
import { InputOTPPrimitive } from '@oc-tech/omni-ui-components/InputOTP';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('omni-ui-components/InputOTP: read-only', () => {
  it('stays focusable, is announced, and typing does not change the code', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <InputOTPPrimitive
        id="o"
        value="12"
        length={4}
        readOnly
        onChange={onChange}
        aria-label="Code"
      />,
    );
    const input = document.getElementById('o') as HTMLInputElement;
    expect(input).not.toBeDisabled();
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveAttribute('aria-readonly', 'true');
    input.focus();
    expect(input).toHaveFocus();
    await user.keyboard('9');
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('12');
  });
});
