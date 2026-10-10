import '@testing-library/jest-dom';
import { RadioPrimitive } from '@oc-tech/omni-ui-components/Radio';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
];

describe('omni-ui-components/Radio: read-only', () => {
  it('the group is announced read-only; pointer, label and arrow keys do not change the value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <RadioPrimitive
        id="r"
        options={options}
        value="b"
        readOnly
        onChange={onChange}
        aria-label="Letters"
      />,
    );
    const group = screen.getByRole('radiogroup', { name: 'Letters' });
    expect(group).toHaveAttribute('aria-readonly', 'true');
    const [alpha, beta] = screen.getAllByRole('radio');
    expect(alpha).not.toBeDisabled();
    await user.click(alpha);
    await user.click(screen.getByText('Gamma'));
    beta.focus();
    await user.keyboard('{ArrowDown}{ArrowUp}{ArrowUp}');
    expect(beta).toHaveAttribute('aria-checked', 'true');
    expect(alpha).toHaveAttribute('aria-checked', 'false');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disabled wins over read-only', () => {
    render(<RadioPrimitive id="r" options={options} value="b" readOnly disabled />);
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
  });
});

describe('omni-ui-components/Radio: appearance="card"', () => {
  it('draws each option as a card and keeps the radio behaviour', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <RadioPrimitive id="r" options={options} value="a" appearance="card" onChange={onChange} />,
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-appearance', 'card');
    const card = screen.getByText('Beta').closest('label') as HTMLElement;
    expect(card.className).toContain('border-[var(--oui-border-field)]');
    await user.click(card);
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('is plain by default', () => {
    render(<RadioPrimitive id="r" options={options} value="a" />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-appearance', 'plain');
  });
});
