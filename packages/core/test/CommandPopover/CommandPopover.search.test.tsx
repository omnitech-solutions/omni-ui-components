import '@testing-library/jest-dom';

import { type CommandItem, CommandPopover } from '@oc-tech/omni-ui-components/CommandPopover';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type * as React from 'react';

interface Command extends CommandItem {
  run: string;
}

const commands: Command[] = [
  { id: 'home', label: 'Go to Home', group: 'Navigate', shortcut: ['G', 'H'], run: 'home' },
  { id: 'new', label: 'New record', group: 'Create', run: 'new' },
  { id: 'people', label: 'Go to People', group: 'Navigate', run: 'people' },
  { id: 'theme', label: 'Switch theme', run: 'theme' },
];

describe('omni-ui-components/CommandPopover without the new props', () => {
  it('renders the same surface, list and rows as before the options', () => {
    const { container } = render(
      <CommandPopover
        id="c"
        label="Commands"
        items={[{ id: 'a', label: 'Alpha' }]}
        onSelect={() => undefined}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-placement', 'above');
    expect(root).toHaveClass('absolute', 'bottom-full', 'mb-2');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    const list = screen.getByRole('listbox', { name: 'Commands' });
    const option = screen.getByRole('option');
    expect(list.children).toHaveLength(1);
    expect(option.parentElement).toBe(list);
    expect(option).toHaveAttribute('id', 'c-option-0');
    expect(option.innerHTML).toBe('<span class="min-w-0 truncate">Alpha</span>');
  });
});

describe('omni-ui-components/CommandPopover groups, shortcuts and inline', () => {
  it('draws rows under group headings in first-seen order, keeping each index in items', () => {
    render(<CommandPopover id="c" label="Commands" items={commands} onSelect={() => undefined} />);
    const groups = screen.getAllByRole('group');
    expect(groups.map((group) => group.getAttribute('aria-labelledby'))).toEqual([
      'c-group-0',
      'c-group-1',
    ]);
    const navigate = screen.getByRole('group', { name: 'Navigate' });
    expect(
      within(navigate)
        .getAllByRole('option')
        .map((option) => option.id),
    ).toEqual(['c-option-0', 'c-option-2']);
    expect(screen.getAllByRole('option').map((option) => option.id)).toEqual([
      'c-option-0',
      'c-option-2',
      'c-option-1',
      'c-option-3',
    ]);
  });

  it('draws shortcut keys at the end of a row', () => {
    render(<CommandPopover label="Commands" items={commands} onSelect={() => undefined} />);
    const keys = screen.getByRole('option', { name: /Go to Home/ }).querySelectorAll('kbd');
    expect(Array.from(keys, (key) => key.textContent)).toEqual(['G', 'H']);
    expect(screen.getByRole('option', { name: /New record/ }).querySelector('kbd')).toBeNull();
  });

  it('inline is not positioned', () => {
    const { container } = render(
      <CommandPopover
        placement="inline"
        label="Commands"
        items={commands}
        onSelect={() => undefined}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-placement', 'inline');
    expect(root).toHaveClass('static', 'w-full');
    expect(root).not.toHaveClass('absolute');
  });
});

describe('omni-ui-components/CommandPopover search', () => {
  const setup = (props: Partial<React.ComponentProps<typeof CommandPopover<Command>>> = {}) => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    render(
      <CommandPopover<Command>
        id="c"
        label="Commands"
        search={{ label: 'Search commands', placeholder: 'Type a command' }}
        items={commands}
        onSelect={onSelect}
        onClose={onClose}
        {...props}
      />,
    );
    return { onSelect, onClose, input: screen.getByRole('combobox', { name: 'Search commands' }) };
  };

  it('draws a combobox that controls the listbox and points at the highlighted row', () => {
    const { input } = setup();
    expect(input).toHaveAttribute('aria-controls', 'c');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('placeholder', 'Type a command');
    expect(input).toHaveAttribute('aria-activedescendant', 'c-option-0');
    expect(screen.getByRole('listbox', { name: 'Commands' })).toHaveAttribute('id', 'c');
  });

  it('filters by label whatever the case, and says when nothing matches', () => {
    const { input } = setup({ labels: { empty: 'No command matches' } });
    fireEvent.change(input, { target: { value: 'GO TO' } });
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Go to HomeGH',
      'Go to People',
    ]);
    fireEvent.change(input, { target: { value: 'zzz' } });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('No command matches');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('arrows walk the rows in drawn order and wrap; Home and End jump', () => {
    const { input } = setup();
    const activeId = () => input.getAttribute('aria-activedescendant');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(activeId()).toBe('c-option-2');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(activeId()).toBe('c-option-1');
    fireEvent.keyDown(input, { key: 'End' });
    expect(activeId()).toBe('c-option-3');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(activeId()).toBe('c-option-0');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(activeId()).toBe('c-option-3');
    fireEvent.keyDown(input, { key: 'Home' });
    expect(activeId()).toBe('c-option-0');
    expect(screen.getByRole('option', { name: /Go to Home/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('Enter chooses the highlighted row with the full item, and Escape asks to close', () => {
    const { input, onSelect, onClose } = setup();
    fireEvent.change(input, { target: { value: 'go to' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toBe(commands[2]);
    expect(onSelect.mock.calls[0][1]).toBe(1);
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Enter with nothing to choose does nothing', () => {
    const { input, onSelect } = setup();
    fireEvent.change(input, { target: { value: 'zzz' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('takes a filter of its own, or none', () => {
    const { input } = setup({ filter: (item, query) => item.run.startsWith(query) });
    fireEvent.change(input, { target: { value: 'the' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option')).toHaveTextContent('Switch theme');
  });

  it('filter={false} leaves the rows to the host', () => {
    const { input } = setup({ filter: false });
    fireEvent.change(input, { target: { value: 'zzz' } });
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('the query is uncontrolled with a default, and controlled with a value', () => {
    const onChange = jest.fn();
    const { input } = setup({
      search: { label: 'Search commands', defaultValue: 'new', onChange, icon: <svg /> },
    });
    expect(input).toHaveValue('new');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.change(input, { target: { value: 'switch' } });
    expect(onChange).toHaveBeenCalledWith('switch');
    expect(input).toHaveValue('switch');
  });

  it('controlled: the value decides and the change is reported', () => {
    const onChange = jest.fn();
    const { input } = setup({ search: { label: 'Search commands', value: 'go', onChange } });
    fireEvent.change(input, { target: { value: 'switch' } });
    expect(onChange).toHaveBeenCalledWith('switch');
    expect(input).toHaveValue('go');
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('a click on a row chooses it and keeps the focus in the input', () => {
    const { input, onSelect } = setup();
    input.focus();
    const row = screen.getByRole('option', { name: /Switch theme/ });
    const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    row.dispatchEvent(press);
    expect(press.defaultPrevented).toBe(true);
    fireEvent.click(row);
    expect(onSelect).toHaveBeenCalledWith(commands[3], 3);
    expect(input).toHaveFocus();
  });
});
