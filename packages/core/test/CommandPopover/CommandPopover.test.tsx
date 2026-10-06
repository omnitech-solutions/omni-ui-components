import '@testing-library/jest-dom';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { CommandPopover, type CommandItem, MENTION_PATTERN, mentionTrigger, SLASH_PATTERN, slashTrigger, useCommandTrigger } from '@oc-tech/omni-ui-components/CommandPopover';
import { commandPopoverPropsFactory, slashCommands, surfaceItems } from 'factories/omni-ui-components/CommandPopover/CommandPopover.factories';

describe('omni-ui-components/CommandPopover', () => {
  it('is a labelled listbox with aria-selected options, a hint and hover highlight', async () => {
    const onActiveChange = vi.fn();
    const onSelect = vi.fn();
    render(<CommandPopover {...commandPopoverPropsFactory({ onActiveChange, onSelect, hint: '↑↓ navigate' })} />);
    const list = screen.getByRole('listbox', { name: 'Commands' });
    const options = within(list).getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('↑↓ navigate')).toBeInTheDocument();
    await userEvent.hover(options[2]);
    expect(onActiveChange).toHaveBeenCalledWith(2);
    await userEvent.click(options[1]);
    expect(onSelect).toHaveBeenCalledWith(slashCommands()[1], 1);
  });
  it('shows Nothing matches, or nothing when hideWhenEmpty', () => {
    const { rerender } = render(<CommandPopover {...commandPopoverPropsFactory({ items: [] })} />);
    expect(screen.getByText('Nothing matches')).toBeInTheDocument();
    rerender(<CommandPopover {...commandPopoverPropsFactory({ items: [], hideWhenEmpty: true })} />);
    expect(document.querySelector('[data-slot="command-popover"]')).toBeNull();
  });
  it('trigger patterns are the original ones', () => {
    expect(SLASH_PATTERN.exec('/ne')?.[1]).toBe('ne');
    expect(SLASH_PATTERN.test('hi /ne')).toBe(false);
    expect(MENTION_PATTERN.exec('look at @No')?.[1]).toBe('No');
    expect(MENTION_PATTERN.test('a@b')).toBe(false);
  });

  describe('callbacks', () => {
    interface Mine extends CommandItem {
      hotkey: string;
    }
    const mine: Mine[] = [
      { id: 'a', label: 'a', hotkey: 'A' },
      { id: 'b', label: 'b', hotkey: 'B' },
    ];
    it('onSelect gets the SAME item and its index; onActiveChange fires on hover in controlled and uncontrolled mode', async () => {
      const hotkeys: string[] = [];
      const onSelect = vi.fn((item: Mine, _index: number): void => void hotkeys.push(item.hotkey));
      const onActiveChange = vi.fn();
      const { rerender } = render(<CommandPopover items={mine} label="x" onSelect={onSelect} onActiveChange={onActiveChange} />);
      const options = screen.getAllByRole('option');
      await userEvent.hover(options[1]);
      expect(onActiveChange).toHaveBeenCalledWith(1);
      expect(options[1]).toHaveAttribute('aria-selected', 'true');
      await userEvent.click(options[1]);
      expect(onSelect.mock.calls[0][0]).toBe(mine[1]);
      expect(onSelect.mock.calls[0][1]).toBe(1);
      expect(hotkeys).toEqual(['B']);
      rerender(<CommandPopover items={mine} label="x" activeIndex={0} onSelect={onSelect} onActiveChange={onActiveChange} />);
      await userEvent.hover(screen.getAllByRole('option')[1]);
      expect(onActiveChange).toHaveBeenLastCalledWith(1);
      expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');
    });
    it('onClose fires on a press outside and on Escape inside', async () => {
      const onClose = vi.fn();
      render(
        <div>
          <button>outside</button>
          <CommandPopover items={mine} label="x" onSelect={() => undefined} onClose={onClose} />
        </div>,
      );
      await userEvent.click(screen.getByText('outside'));
      expect(onClose).toHaveBeenCalledTimes(1);
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(2);
    });
    it('useCommandTrigger: onPick gets the same item and onClose fires when Escape closes', async () => {
      const onPick = vi.fn();
      const onClose = vi.fn();
      const Probe = () => {
        const [value, setValue] = React.useState('');
        const command = useCommandTrigger<Mine>({
          value,
          onClose,
          triggers: [slashTrigger<Mine>({ source: mine, onPick, popover: { label: 'c' } })],
        });
        return (
          <div>
            <textarea aria-label="p" value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { command.onKeyDown(e); }} />
            {command.open ? <CommandPopover {...command.popoverProps} /> : null}
          </div>
        );
      };
      render(<Probe />);
      await userEvent.type(screen.getByLabelText('p'), '/');
      await userEvent.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalledTimes(1);
      await userEvent.type(screen.getByLabelText('p'), 'a');
      await userEvent.keyboard('{Enter}');
      expect(onPick.mock.calls[0][0]).toBe(mine[0]);
    });
  });

  describe('useCommandTrigger', () => {
    const onPick = vi.fn();
    const Harness: React.FC<{ asyncMention?: boolean }> = ({ asyncMention }) => {
      const [value, setValue] = React.useState('');
      const command = useCommandTrigger({
        value,
        triggers: [
          slashTrigger({ source: slashCommands(), onPick: (item) => { onPick(item.id); setValue(''); }, popover: { label: 'Commands' } }),
          mentionTrigger({
            source: asyncMention ? async (query) => surfaceItems().filter((item) => item.label.toLowerCase().includes(query.toLowerCase())) : surfaceItems(),
            onPick: (item, { draft }) => { onPick(item.id); setValue(draft.replace(/@[^\s@]*$/, '')); },
            popover: { label: 'Add from Studio' },
          }),
        ],
      });
      return (
        <div>
          <textarea
            aria-label="box"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => { command.onKeyDown(event); }}
            aria-activedescendant={command.activeDescendant}
          />
          {command.open ? <CommandPopover {...command.popoverProps} /> : null}
        </div>
      );
    };
    beforeEach(() => onPick.mockClear());

    it('opens on `/`, filters by prefix, arrows move, Enter picks, focus stays in the textarea', async () => {
      render(<Harness />);
      const box = screen.getByLabelText('box');
      await userEvent.type(box, '/');
      expect(screen.getAllByRole('option')).toHaveLength(4);
      expect(box.getAttribute('aria-activedescendant')).toMatch(/option-0$/);
      await userEvent.keyboard('{ArrowDown}');
      expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true');
      await userEvent.keyboard('{ArrowUp}{ArrowUp}');
      expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');
      await userEvent.type(box, 'c');
      expect(screen.getAllByRole('option')).toHaveLength(1);
      await userEvent.keyboard('{Enter}');
      expect(onPick).toHaveBeenCalledWith('clear');
      expect(screen.queryByRole('listbox')).toBeNull();
      expect(box).toHaveFocus();
    });
    it('Tab picks, Escape closes until the draft changes', async () => {
      render(<Harness />);
      const box = screen.getByLabelText('box');
      await userEvent.type(box, '/n');
      await userEvent.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).toBeNull();
      await userEvent.type(box, 'e');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      await userEvent.keyboard('{Tab}');
      expect(onPick).toHaveBeenCalledWith('new');
    });
    it('slash only matches when the whole draft is /word; no matches hides it', async () => {
      render(<Harness />);
      const box = screen.getByLabelText('box');
      await userEvent.type(box, 'hello /');
      expect(screen.queryByRole('listbox')).toBeNull();
      await userEvent.clear(box);
      await userEvent.type(box, '/zzz');
      expect(screen.queryByRole('listbox')).toBeNull();
    });
    it('@ lists surfaces (sync), removes the query on pick', async () => {
      render(<Harness />);
      const box = screen.getByLabelText('box');
      await userEvent.type(box, 'see @Co');
      expect(screen.getByRole('listbox', { name: 'Add from Studio' })).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(1);
      await userEvent.keyboard('{Enter}');
      expect(onPick).toHaveBeenCalledWith('code');
      expect(box).toHaveValue('see ');
    });
    it('an async source resolves into the list', async () => {
      render(<Harness asyncMention />);
      await userEvent.type(screen.getByLabelText('box'), '@tests');
      await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
      expect(screen.getByText('Tests')).toBeInTheDocument();
    });
    it('shows Nothing matches for @ with no surfaces', async () => {
      render(<Harness />);
      await userEvent.type(screen.getByLabelText('box'), '@qqq');
      expect(screen.getByText('Nothing matches')).toBeInTheDocument();
    });
  });
});
