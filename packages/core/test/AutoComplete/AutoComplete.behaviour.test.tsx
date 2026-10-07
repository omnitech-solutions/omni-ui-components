import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import { AutoComplete } from '@oc-tech/omni-ui-components/AutoComplete';

const options = [
  { value: 'alex', label: 'Alex Rivera' },
  { value: 'jamie' },
  { value: 'jordan', label: <em>Jordan Lee</em> },
];

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  Element.prototype.scrollIntoView ??= () => undefined;
});

const Harness = ({ initial = '', onChange }: { initial?: string; onChange?: (v: string) => void }) => {
  const [value, setValue] = React.useState(initial);
  return (
    <AutoComplete
      label="User"
      value={value}
      options={options}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
};

const box = () => screen.getByRole('combobox');
const listbox = () => document.querySelector('[id$="-listbox"]') as HTMLElement;

describe('omni-ui-components/AutoComplete behaviour', () => {
  it('opens the suggestion list on focus and wires combobox aria', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(box()).toHaveAttribute('aria-expanded', 'false');
    expect(box()).toHaveAttribute('aria-autocomplete', 'list');
    await user.click(box());
    expect(box()).toHaveAttribute('aria-expanded', 'true');
    expect(box().getAttribute('aria-controls')).toBe(listbox().id);
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('filters by value or label text, case-insensitively, as the user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.type(box(), 'RIV');
    expect(onChange).toHaveBeenLastCalledWith('RIV');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();

    await user.clear(box());
    await user.type(box(), 'jam');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('jamie');
  });

  it('closes the list when nothing matches', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(box(), 'zzz');
    expect(listbox()).toBeNull();
    expect(box()).toHaveAttribute('aria-expanded', 'false');
  });

  it('commits an option on mousedown, closes the list and refocuses the input', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.focus(box());
    fireEvent.mouseDown(screen.getByText('Alex Rivera'));
    expect(onChange).toHaveBeenCalledWith('alex');
    expect(listbox()).toBeNull();
    expect(box()).toHaveValue('alex');
    await waitFor(() => expect(box()).toHaveFocus());
  });

  it('navigates with ArrowDown/ArrowUp (clamped) and selects with Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.click(box());
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('jordan');

    await user.clear(box());
    await user.keyboard('{ArrowDown}{ArrowUp}{ArrowUp}{ArrowUp}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('alex');
  });

  it('Enter picks the first match by default', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.type(box(), 'j');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('jamie');
  });

  it('ArrowDown reopens a closed list and Escape closes it', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(box());
    await user.keyboard('{Escape}');
    expect(listbox()).toBeNull();
    await user.keyboard('{ArrowDown}');
    expect(listbox()).toBeInTheDocument();
    await user.keyboard('{ArrowUp}');
    expect(listbox()).toBeInTheDocument();
  });

  it('Enter does nothing while the list is closed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.click(box());
    await user.keyboard('{Escape}{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores navigation keys when there are no options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AutoComplete label="User" value="" options={[]} onChange={onChange} />);
    await user.click(box());
    await user.keyboard('{ArrowDown}{Enter}{Escape}');
    expect(onChange).not.toHaveBeenCalled();
    expect(listbox()).toBeNull();
  });

  it('closes when pointer goes down outside, stays open for pointer inside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button type="button">outside</button>
        <Harness />
      </div>,
    );
    await user.click(box());
    expect(listbox()).toBeInTheDocument();
    fireEvent.mouseDown(box());
    expect(listbox()).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('button', { name: 'outside' }));
    expect(listbox()).toBeNull();
  });

  it('marks the selected option with a visible check and calls focus/blur handlers', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<AutoComplete label="User" value="alex" options={options} onFocus={onFocus} onBlur={onBlur} onChange={() => undefined} />);
    await user.click(box());
    expect(onFocus).toHaveBeenCalledTimes(1);
    const selected = screen.getByText('Alex Rivera').closest('[cmdk-item]') as HTMLElement;
    expect(selected.querySelector('svg')).toHaveClass('opacity-100');
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    render(<AutoComplete label="User" value="" options={options} disabled onChange={() => undefined} />);
    await user.click(box());
    expect(box()).toBeDisabled();
    expect(listbox()).toBeNull();
  });

  it('uses a custom placeholder and shows field chrome errors', () => {
    render(<AutoComplete label="User" placeholder="Find a user" error="Required" required options={options} />);
    expect(box()).toHaveAttribute('placeholder', 'Find a user');
    expect(box()).toHaveAttribute('aria-invalid', 'true');
    expect(box()).toHaveAttribute('aria-required', 'true');
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('works without an onChange handler', async () => {
    const user = userEvent.setup();
    render(<AutoComplete label="User" value="" options={options} />);
    await user.type(box(), 'a');
    await user.keyboard('{Enter}');
    expect(box()).toHaveValue('');
  });
});
