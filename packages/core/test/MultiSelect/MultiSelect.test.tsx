import '@testing-library/jest-dom';
import { MultiSelect, MultiSelectPrimitive } from '@oc-tech/omni-ui-components/MultiSelect';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma', disabled: true },
];

describe('omni-ui-components/MultiSelect', () => {
  it('shows the placeholder, then the chosen options as chips', () => {
    const { rerender } = render(
      <MultiSelectPrimitive id="m" options={options} value={[]} placeholder="Pick some" />,
    );
    expect(screen.getByRole('button', { name: /Pick some/ })).toHaveAttribute(
      'data-slot',
      'multi-select',
    );
    rerender(<MultiSelectPrimitive id="m" options={options} value={['a', 'b']} />);
    expect(document.querySelectorAll('[data-slot="multi-select-chip"]')).toHaveLength(2);
    // The trigger still says what is chosen, and no button sits inside it.
    expect(screen.getByRole('button', { name: 'Alpha, Beta' })).toHaveAttribute('id', 'm');
    expect(document.getElementById('m')?.querySelector('button, [role="button"]')).toBeNull();
    expect(screen.getByRole('button', { name: 'Remove Alpha' }).tagName).toBe('BUTTON');
  });

  it('adds and removes a value from the list, by pointer and by keyboard', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<MultiSelectPrimitive id="m" options={options} value={['a']} onChange={onChange} />);
    await user.click(document.getElementById('m') as HTMLElement);
    await user.click(await screen.findByRole('option', { name: /Beta/ }));
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b']);
    await user.click(screen.getByRole('option', { name: /Alpha/ }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('is operated by the keyboard alone, with no search box', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<MultiSelectPrimitive id="m" options={options} value={[]} onChange={onChange} />);
    (document.getElementById('m') as HTMLElement).focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('removes a chip with its remove control, named through labels', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <MultiSelectPrimitive
        id="m"
        options={options}
        value={['a', 'b']}
        onChange={onChange}
        labels={{ remove: (label) => `Retirer ${label}` }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Retirer Alpha' }));
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('does not add past maxItems', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <MultiSelectPrimitive
        id="m"
        options={options}
        value={['a']}
        maxItems={1}
        onChange={onChange}
      />,
    );
    await user.click(document.getElementById('m') as HTMLElement);
    await user.click(await screen.findByRole('option', { name: /Beta/ }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('filters with the search box when searchable', async () => {
    const user = userEvent.setup();
    render(<MultiSelectPrimitive id="m" options={options} value={[]} searchable />);
    await user.click(document.getElementById('m') as HTMLElement);
    await user.type(await screen.findByPlaceholderText('Search…'), 'bet');
    expect(screen.getByRole('option', { name: /Beta/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Alpha/ })).toBeNull();
  });

  it('is disabled when disabled, and never opens', async () => {
    const user = userEvent.setup();
    render(<MultiSelectPrimitive id="m" options={options} value={[]} disabled />);
    const trigger = document.getElementById('m') as HTMLElement;
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('read-only: focusable, not disabled, no remove control, never opens, never changes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <MultiSelectPrimitive id="m" options={options} value={['a']} readOnly onChange={onChange} />,
    );
    const trigger = document.getElementById('m') as HTMLElement;
    expect(trigger).not.toBeDisabled();
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    expect(trigger).toHaveAttribute('data-readonly');
    trigger.focus();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Remove Alpha' })).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('carries invalid, describedby, size and variant on the field', () => {
    render(
      <MultiSelectPrimitive
        id="m"
        options={options}
        value={[]}
        invalid
        aria-describedby="help"
        inputSize="lg"
        variant="ghost"
      />,
    );
    const trigger = document.getElementById('m') as HTMLElement;
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('aria-describedby', 'help');
    expect(trigger).toHaveAttribute('data-input-size', 'lg');
    expect(trigger).toHaveAttribute('data-variant', 'ghost');
    const box = trigger.closest('[data-slot="multi-select-field"]') as HTMLElement;
    expect(box.className).toContain('--oui-field-height-xl');
    expect(box).toHaveAttribute('data-state', 'invalid');
  });

  it('the field layer draws label, description and an error with role="alert"', () => {
    const { rerender } = render(
      <MultiSelect id="m" label="Teams" description="Any number" options={options} value={[]} />,
    );
    expect(screen.getByText('Teams')).toBeInTheDocument();
    expect(screen.getByText('Any number')).toBeInTheDocument();
    rerender(<MultiSelect id="m" label="Teams" error="Pick one" options={options} value={[]} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Pick one');
  });
});
