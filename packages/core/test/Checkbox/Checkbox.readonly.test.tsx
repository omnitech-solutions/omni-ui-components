import '@testing-library/jest-dom';
import { CheckboxGroupPrimitive, CheckboxPrimitive } from '@oc-tech/omni-ui-components/Checkbox';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

describe('omni-ui-components/Checkbox: read-only', () => {
  it('a read-only checkbox stays focusable, is announced and cannot be toggled', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<CheckboxPrimitive id="c" checked readOnly onChange={onChange} aria-labelledby="l" />);
    const box = screen.getByRole('checkbox');
    expect(box).not.toBeDisabled();
    expect(box).toHaveAttribute('aria-readonly', 'true');
    await user.click(box);
    box.focus();
    await user.keyboard(' ');
    expect(box).toHaveAttribute('aria-checked', 'true');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('a read-only group keeps every box focusable and its value fixed; the group can be named', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <CheckboxGroupPrimitive
        id="g"
        options={options}
        value={['a']}
        readOnly
        onChange={onChange}
        aria-label="Letters"
      />,
    );
    expect(screen.getByRole('group', { name: 'Letters' })).toHaveAttribute('data-readonly');
    const [alpha, beta] = screen.getAllByRole('checkbox');
    expect(beta).not.toBeDisabled();
    await user.click(beta);
    await user.click(screen.getByText('Alpha'));
    expect(alpha).toHaveAttribute('aria-checked', 'true');
    expect(beta).toHaveAttribute('aria-checked', 'false');
    expect(onChange).not.toHaveBeenCalled();
  });
});
