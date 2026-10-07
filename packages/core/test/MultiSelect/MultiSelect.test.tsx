import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { MultiSelect } from '@oc-tech/omni-ui-components/MultiSelect';
import { MultiSelectPrimitive } from '../../src/MultiSelect/MultiSelectPrimitive';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma', disabled: true },
];

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  Element.prototype.scrollIntoView ??= () => undefined;
});

describe('omni-ui-components/MultiSelect', () => {
  it('shows the placeholder when nothing is selected', () => {
    render(<MultiSelectPrimitive id="ms" options={options} placeholder="Pick some" />);
    expect(screen.getByTestId('ms')).toHaveTextContent('Pick some');
  });

  it('renders chips for the selected options and removes one without opening the popover', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultiSelectPrimitive id="ms" options={options} value={['a', 'b']} onChange={onChange} />);
    expect(screen.getByTestId('ms')).toHaveTextContent('Alpha');
    expect(screen.getByTestId('ms')).toHaveTextContent('Beta');

    await user.click(screen.getByRole('button', { name: 'Remove Alpha' }));
    expect(onChange).toHaveBeenCalledWith(['b']);
    expect(screen.queryByTestId('ms-popover')).not.toBeInTheDocument();
  });

  it('labels the remove button with the value when the option label is not a string', () => {
    render(<MultiSelectPrimitive id="ms" options={[{ value: 'x', label: <b>Bold</b> }]} value={['x']} />);
    expect(screen.getByRole('button', { name: 'Remove x' })).toBeInTheDocument();
  });

  it('opens the list, toggles options on and off and flags the current ones', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<MultiSelectPrimitive id="ms" options={options} value={[]} onChange={onChange} />);
    await user.click(screen.getByTestId('ms'));
    expect(screen.getByTestId('ms')).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByTestId('ms-option-a'));
    expect(onChange).toHaveBeenLastCalledWith(['a']);

    rerender(<MultiSelectPrimitive id="ms" options={options} value={['a']} onChange={onChange} />);
    expect(screen.getByTestId('ms-option-a')).toHaveAttribute('data-current', 'true');
    expect(screen.getByTestId('ms-option-b')).not.toHaveAttribute('data-current');
    await user.click(screen.getByTestId('ms-option-a'));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('does not select disabled options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultiSelectPrimitive id="ms" options={options} onChange={onChange} />);
    await user.click(screen.getByTestId('ms'));
    await user.click(screen.getByTestId('ms-option-c'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('refuses to add beyond maxItems but still allows removal', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MultiSelectPrimitive id="ms" options={options} value={['a']} maxItems={1} onChange={onChange} />);
    await user.click(screen.getByTestId('ms'));
    await user.click(screen.getByTestId('ms-option-b'));
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByTestId('ms-option-a'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('offers a search box only when searchable and filters the options', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<MultiSelectPrimitive id="ms" options={options} />);
    await user.click(screen.getByTestId('ms'));
    expect(screen.queryByPlaceholderText('Search…')).not.toBeInTheDocument();
    unmount();

    render(<MultiSelectPrimitive id="ms" options={options} searchable />);
    await user.click(screen.getByTestId('ms'));
    await user.type(screen.getByPlaceholderText('Search…'), 'bet');
    const popover = screen.getByTestId('ms-popover');
    expect(within(popover).getByText('Beta')).toBeInTheDocument();
    expect(within(popover).queryByText('Alpha')).not.toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText('Search…'));
    await user.type(screen.getByPlaceholderText('Search…'), 'zzz');
    expect(within(popover).getByText('No results.')).toBeInTheDocument();
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    render(<MultiSelectPrimitive id="ms" options={options} disabled />);
    await user.click(screen.getByTestId('ms'));
    expect(screen.queryByTestId('ms-popover')).not.toBeInTheDocument();
    expect(screen.getByTestId('ms')).toBeDisabled();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<MultiSelectPrimitive id="ms" options={options} />);
    await user.click(screen.getByTestId('ms'));
    expect(screen.getByTestId('ms-popover')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('ms-popover')).not.toBeInTheDocument();
  });

  it('wraps the primitive in field chrome with label, error and aria wiring', () => {
    render(<MultiSelect label="Teams" options={options} error="Pick one" required />);
    const trigger = screen.getByRole('button', { name: /Select/ });
    expect(screen.getByText('Teams')).toBeInTheDocument();
    expect(screen.getByText('Pick one')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('aria-required', 'true');
    expect(trigger.getAttribute('aria-describedby')).toBeTruthy();
  });
});
