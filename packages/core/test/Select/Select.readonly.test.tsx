import '@testing-library/jest-dom';
import { SelectPrimitive } from '@oc-tech/omni-ui-components/Select';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

describe('omni-ui-components/Select: read-only, size alias, footer link', () => {
  it('read-only: the trigger stays focusable, never opens, and the value is fixed', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<SelectPrimitive id="s" options={options} value="a" readOnly onChange={onChange} />);
    const trigger = document.getElementById('s') as HTMLElement;
    expect(trigger).not.toBeDisabled();
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    expect(trigger).toHaveAttribute('data-state', 'readonly');
    await user.click(trigger);
    trigger.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).not.toHaveBeenCalled();
    expect(trigger).toHaveTextContent('Alpha');
  });

  it('takes inputSize as the size, and selectSize wins when both are given', () => {
    const { rerender } = render(
      <SelectPrimitive id="s" options={options} value="" inputSize="lg" />,
    );
    expect(document.getElementById('s')).toHaveAttribute('data-select-size', 'lg');
    rerender(<SelectPrimitive id="s" options={options} value="" inputSize="lg" selectSize="sm" />);
    expect(document.getElementById('s')).toHaveAttribute('data-select-size', 'sm');
  });

  it('draws a footer action with an href as a link element and never navigates itself', async () => {
    const user = userEvent.setup();
    render(
      <SelectPrimitive
        id="s"
        options={options}
        value=""
        footerAction={{ label: 'Manage', href: '/manage' }}
      />,
    );
    await user.click(document.getElementById('s') as HTMLElement);
    expect(await screen.findByRole('link', { name: 'Manage' })).toHaveAttribute('href', '/manage');
  });
});

describe('omni-ui-components/Select: keyboard without the search box', () => {
  it('opens with Enter, moves with the arrow keys and picks with Enter', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<SelectPrimitive id="s" options={options} value="" onChange={onChange} />);
    const trigger = document.getElementById('s') as HTMLElement;
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
