import '@testing-library/jest-dom';

import {
  DEFAULT_TRANSFER_LABELS,
  Transfer,
  type TransferItem,
  TransferPrimitive,
  type TransferPrimitiveProps,
} from '@oc-tech/omni-ui-components/Transfer';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  SAMPLE_TEAMS,
  type TeamItem,
  transferPropsFactory,
} from 'factories/omni-ui-components/Transfer/Transfer.factories';
import * as React from 'react';

const source = () => screen.getByRole('listbox', { name: 'Available' });
const target = () => screen.getByRole('listbox', { name: 'Selected' });
const rows = (list: HTMLElement) =>
  within(list)
    .queryAllByRole('option')
    .map((each) => each.querySelector('[data-slot="transfer-option-title"]')?.textContent);
const option = (name: string) => screen.getByRole('option', { name: new RegExp(name) });
const toTarget = () => screen.getByRole('button', { name: 'Move selected to target' });
const toSource = () => screen.getByRole('button', { name: 'Move selected to source' });

/** Controlled harness: the value follows onChange like a real consumer. */
const Harness = ({
  initial = [],
  onChange,
  ...rest
}: Partial<TransferPrimitiveProps<TeamItem>> & { initial?: string[] }) => {
  const [keys, setKeys] = React.useState(initial);
  return (
    <TransferPrimitive<TeamItem>
      id="t"
      dataSource={SAMPLE_TEAMS}
      {...rest}
      targetKeys={keys}
      onChange={(next, moved, direction) => {
        setKeys(next);
        onChange?.(next, moved, direction);
      }}
    />
  );
};

describe('omni-ui-components/Transfer', () => {
  describe('primitive: value', () => {
    it('stays compatible with the bare controlled usage', async () => {
      const user = userEvent.setup();
      const Bare = () => {
        const [targetKeys, setTargetKeys] = React.useState<string[]>([]);
        return (
          <Transfer
            dataSource={[
              { key: 'finance', title: 'Finance' },
              { key: 'ops', title: 'Operations' },
            ]}
            targetKeys={targetKeys}
            onChange={setTargetKeys}
          />
        );
      };
      render(<Bare />);
      await user.click(option('Finance'));
      await user.click(toTarget());
      expect(rows(source())).toEqual(['Operations']);
      expect(rows(target())).toEqual(['Finance']);
    });

    it('controlled: asks for the change and shows only what it is given', async () => {
      const user = userEvent.setup();
      const handle = jest.fn();
      render(
        <TransferPrimitive dataSource={SAMPLE_TEAMS} targetKeys={['finance']} onChange={handle} />,
      );
      await user.click(option('Support'));
      await user.click(toTarget());
      expect(handle).toHaveBeenCalledWith(['finance', 'support'], [SAMPLE_TEAMS[5]], 'right');
      expect(rows(target())).toEqual(['Finance']);
    });

    it('uncontrolled: starts from defaultTargetKeys and keeps its own value', async () => {
      const user = userEvent.setup();
      const handle = jest.fn();
      render(
        <TransferPrimitive
          dataSource={SAMPLE_TEAMS}
          defaultTargetKeys={['support', 'finance', 'unknown']}
          onChange={handle}
        />,
      );
      expect(rows(target())).toEqual(['Support', 'Finance']);
      await user.click(option('Support'));
      await user.click(toSource());
      expect(handle).toHaveBeenCalledWith(['finance', 'unknown'], [SAMPLE_TEAMS[5]], 'left');
      expect(rows(target())).toEqual(['Finance']);
      expect(rows(source())).toContain('Support');
    });

    it('hands the moved items over by reference, in the order they were moved', async () => {
      const user = userEvent.setup();
      const handle = jest.fn();
      render(<Harness onChange={handle} />);
      await user.click(option('Operations'));
      await user.click(option('Finance'));
      await user.click(toTarget());
      const [next, moved, direction] = handle.mock.calls[0];
      expect(next).toEqual(['finance', 'operations']);
      expect(moved[0]).toBe(SAMPLE_TEAMS[0]);
      expect(moved[1]).toBe(SAMPLE_TEAMS[2]);
      expect(moved[0].headcount).toBe(12);
      expect(direction).toBe('right');
      await user.click(option('Marketing'));
      await user.click(toTarget());
      expect(rows(target())).toEqual(['Finance', 'Operations', 'Marketing']);
    });

    it('clears the selection of the origin list after a move', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.click(option('Finance'));
      expect(screen.getByText('1 of 6 selected')).toBeInTheDocument();
      await user.click(option('Finance'));
      expect(screen.getByText('0 of 6 selected')).toBeInTheDocument();
      await user.click(option('Finance'));
      await user.click(toTarget());
      expect(screen.getByText('0 of 5 selected')).toBeInTheDocument();
      expect(screen.getByText('0 of 1 selected')).toBeInTheDocument();
      expect(toTarget()).toBeDisabled();
      expect(toSource()).toBeDisabled();
    });

    it('writes each target key to a hidden input when named', () => {
      const { container } = render(<Harness name="teams" initial={['finance', 'support']} />);
      const inputs = container.querySelectorAll<HTMLInputElement>(
        'input[type="hidden"][name="teams"]',
      );
      expect([...inputs].map((each) => each.value)).toEqual(['finance', 'support']);
    });
  });

  describe('primitive: roles and names', () => {
    it('is a named group of two labelled multi-select listboxes with slots and test ids', () => {
      render(<Harness aria-label="Teams" className="extra" initial={['finance']} />);
      const group = screen.getByRole('group', { name: 'Teams' });
      expect(group).toHaveAttribute('data-slot', 'transfer');
      expect(group).toHaveClass('extra');
      expect(group).toHaveAttribute('data-testid', 't-root');
      expect(source()).toHaveAttribute('id', 't');
      expect(source()).toHaveAttribute('aria-multiselectable', 'true');
      expect(source()).toHaveAttribute('data-testid', 't-source');
      expect(target()).toHaveAttribute('data-testid', 't-target');
      expect(option('Engineering')).toHaveAttribute('aria-selected', 'false');
      expect(option('Engineering')).toHaveTextContent('Product and platform');
      expect(option('Legal')).toHaveAttribute('aria-disabled', 'true');
    });

    it('takes every word from labels', async () => {
      render(
        <Harness
          searchable
          initial={SAMPLE_TEAMS.map((item) => item.key)}
          labels={{
            sourceTitle: 'Alle',
            targetTitle: 'Gewählt',
            selectedCount: (selected, total) => `${selected}/${total}`,
            empty: 'Leer',
            moveToTarget: 'Hin',
            moveToSource: 'Zurück',
            searchSource: 'Alle filtern',
            searchTarget: 'Gewählte filtern',
            searchPlaceholder: 'Suche',
          }}
        />,
      );
      expect(screen.getByRole('listbox', { name: 'Alle' })).toBeInTheDocument();
      expect(screen.getByRole('listbox', { name: 'Gewählt' })).toBeInTheDocument();
      expect(screen.getByText('0/0')).toBeInTheDocument();
      expect(screen.getByText('Leer')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Hin' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Zurück' })).toBeInTheDocument();
      expect(screen.getByRole('searchbox', { name: 'Alle filtern' })).toHaveAttribute(
        'placeholder',
        'Suche',
      );
      expect(screen.getByRole('searchbox', { name: 'Gewählte filtern' })).toBeInTheDocument();
      expect(DEFAULT_TRANSFER_LABELS.itemCount(1)).toBe('1 item');
      expect(DEFAULT_TRANSFER_LABELS.remove({ key: 'k', title: <b>Node</b> })).toBe('Remove k');
    });

    it('renders custom move icons', () => {
      render(
        <Harness
          moveToTargetIcon={<span data-testid="go" />}
          moveToSourceIcon={<span data-testid="back" />}
        />,
      );
      expect(within(toTarget()).getByTestId('go')).toBeInTheDocument();
      expect(within(toSource()).getByTestId('back')).toBeInTheDocument();
    });

    it('forwards its ref and id to the source listbox, with describedby, invalid and required', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <>
          <span id="name">Teams</span>
          <span id="help">Help</span>
          <TransferPrimitive
            ref={ref}
            id="teams"
            dataSource={SAMPLE_TEAMS}
            aria-labelledby="name"
            aria-describedby="help"
            invalid
            required
          />
        </>,
      );
      expect(screen.getByRole('group', { name: 'Teams' })).toHaveAttribute('data-state', 'invalid');
      expect(ref.current).toBe(document.getElementById('teams'));
      document.getElementById('teams')?.focus();
      expect(source()).toHaveFocus();
      expect(source()).toHaveAccessibleDescription('Help');
      expect(source()).toHaveAttribute('aria-invalid', 'true');
      expect(source()).toHaveAttribute('aria-required', 'true');
      expect(target()).toHaveAttribute('aria-invalid', 'true');
      expect(target()).not.toHaveAttribute('aria-required');
    });

    it('needs no id: the lists still get ids of their own', () => {
      render(<TransferPrimitive dataSource={SAMPLE_TEAMS} />);
      expect(source().id).not.toBe('');
      expect(target().id).toBe(`${source().id}-target`);
      expect(source()).not.toHaveAttribute('data-testid');
    });
  });

  describe('primitive: keyboard', () => {
    it('each list is one tab stop and the move buttons are reachable by Tab', async () => {
      const user = userEvent.setup();
      render(<Harness initial={['finance']} />);
      await user.tab();
      expect(source()).toHaveFocus();
      await user.keyboard(' ');
      await user.tab();
      expect(toTarget()).toHaveFocus();
      await user.tab();
      expect(target()).toHaveFocus();
      await user.keyboard(' ');
      await user.tab({ shift: true });
      expect(toSource()).toHaveFocus();
    });

    it('arrows, Home and End move the active option, skipping disabled rows', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      const active = () => source().getAttribute('aria-activedescendant');
      await user.tab();
      expect(active()).toBe('t-option-finance');
      await user.keyboard('{ArrowUp}');
      expect(active()).toBe('t-option-finance');
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
      expect(active()).toBe('t-option-marketing');
      expect(option('Marketing')).toHaveAttribute('data-active', 'true');
      await user.keyboard('{ArrowUp}');
      expect(active()).toBe('t-option-operations');
      await user.keyboard('{End}{ArrowDown}');
      expect(active()).toBe('t-option-support');
      await user.keyboard('{Home}');
      expect(active()).toBe('t-option-finance');
      await user.keyboard('x');
      expect(active()).toBe('t-option-finance');
    });

    it('Space toggles, Ctrl or Cmd + A selects all, Enter moves the selection across', async () => {
      const user = userEvent.setup();
      const handle = jest.fn();
      render(<Harness onChange={handle} />);
      await user.tab();
      await user.keyboard(' ');
      expect(option('Finance')).toHaveAttribute('aria-selected', 'true');
      await user.keyboard(' ');
      expect(option('Finance')).toHaveAttribute('aria-selected', 'false');
      await user.keyboard('{Enter}');
      expect(handle).not.toHaveBeenCalled();
      await user.keyboard('{ArrowDown} {Enter}');
      expect(handle).toHaveBeenLastCalledWith(['engineering'], [SAMPLE_TEAMS[1]], 'right');
      await user.keyboard('{Control>}a{/Control}');
      expect(screen.getByText('4 of 5 selected')).toBeInTheDocument();
      await user.keyboard('{Enter}');
      expect(rows(source())).toEqual(['Legal']);
      expect(source()).not.toHaveAttribute('aria-activedescendant');
      target().focus();
      await user.keyboard('{Meta>}A{/Meta}{Enter}');
      expect(handle).toHaveBeenLastCalledWith([], expect.any(Array), 'left');
      expect(rows(target())).toEqual([]);
    });
  });

  describe('primitive: search', () => {
    it('filters each list on title, description and key, and says when nothing matches', async () => {
      const user = userEvent.setup();
      render(<Harness searchable initial={['finance']} />);
      const box = screen.getByRole('searchbox', { name: 'Filter source' });
      await user.type(box, 'CAMP');
      expect(rows(source())).toEqual(['Marketing']);
      await user.clear(box);
      await user.type(box, 'zzz');
      expect(rows(source())).toEqual([]);
      expect(screen.getByText('No matches')).toBeInTheDocument();
      await user.type(screen.getByRole('searchbox', { name: 'Filter target' }), 'fin');
      expect(rows(target())).toEqual(['Finance']);
    });

    it('takes a custom filterOption, which gets the original item', async () => {
      const user = userEvent.setup();
      const filterOption = jest.fn(
        (query: string, item: TeamItem) => item.headcount > Number(query),
      );
      render(<Harness searchable filterOption={filterOption} />);
      await user.type(screen.getByRole('searchbox', { name: 'Filter source' }), '20');
      expect(rows(source())).toEqual(['Engineering', 'Support']);
      expect(filterOption.mock.calls.some(([, item]) => item === SAMPLE_TEAMS[0])).toBe(true);
    });

    it('matches an item whose title is not text by its key', async () => {
      const user = userEvent.setup();
      const items: TransferItem[] = [
        { key: 'alpha', title: <b>First</b> },
        { key: 'beta', title: 7 },
      ];
      render(<TransferPrimitive searchable dataSource={items} />);
      await user.type(screen.getByRole('searchbox', { name: 'Filter source' }), 'alp');
      expect(within(source()).getAllByRole('option')).toHaveLength(1);
      expect(screen.getByText('First')).toBeInTheDocument();
    });
  });

  describe('primitive: one way', () => {
    it('has no move-back button; target rows are removed by their button', async () => {
      const user = userEvent.setup();
      const handle = jest.fn();
      render(
        <Harness oneWay initial={['finance', 'legal']} onChange={handle} removeIcon={<i>x</i>} />,
      );
      expect(screen.queryByRole('button', { name: 'Move selected to source' })).toBeNull();
      expect(target()).not.toHaveAttribute('aria-multiselectable');
      expect(option('Finance')).not.toHaveAttribute('aria-selected');
      expect(screen.getByText('2 items')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove Legal' })).toBeDisabled();
      await user.click(option('Finance'));
      expect(handle).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Remove Finance' }));
      expect(handle).toHaveBeenCalledWith(['legal'], [SAMPLE_TEAMS[0]], 'left');
      expect(rows(target())).toEqual(['Legal']);
    });

    it('Delete or Backspace removes the active target row; Space, Ctrl+A and Enter do nothing there', async () => {
      const user = userEvent.setup();
      const handle = jest.fn();
      render(<Harness oneWay initial={['finance', 'support']} onChange={handle} />);
      target().focus();
      await user.keyboard(' {Control>}a{/Control}{Enter}');
      expect(handle).not.toHaveBeenCalled();
      await user.keyboard('{ArrowDown}{Delete}');
      expect(handle).toHaveBeenLastCalledWith(['finance'], [SAMPLE_TEAMS[5]], 'left');
      await user.keyboard('{Backspace}');
      expect(rows(target())).toEqual([]);
      expect(screen.getByText('No items')).toBeInTheDocument();
      await user.keyboard('{Delete}');
      expect(handle).toHaveBeenCalledTimes(2);
      source().focus();
      await user.keyboard('{Delete}');
      expect(handle).toHaveBeenCalledTimes(2);
    });
  });

  describe('primitive: disabled and read-only', () => {
    it('disabled: lists leave the tab order and nothing can be selected or moved', async () => {
      const user = userEvent.setup();
      const handle = jest.fn();
      render(
        <Harness disabled searchable oneWay name="teams" initial={['finance']} onChange={handle} />,
      );
      expect(screen.getByRole('group')).toHaveAttribute('data-state', 'disabled');
      expect(source()).toHaveAttribute('aria-disabled', 'true');
      expect(source()).toHaveAttribute('tabindex', '0');
      expect(source()).not.toHaveAttribute('aria-activedescendant');
      expect(screen.getByRole('searchbox', { name: 'Filter source' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Remove Finance' })).toBeDisabled();
      await user.click(option('Engineering'));
      expect(option('Engineering')).toHaveAttribute('aria-selected', 'false');
      source().focus();
      await user.keyboard('{ArrowDown} {Enter}');
      expect(toTarget()).toBeDisabled();
      expect(handle).not.toHaveBeenCalled();
    });

    it('read-only: lists are focusable and announced, the active row moves, nothing else does', async () => {
      const user = userEvent.setup();
      const handle = jest.fn();
      const { rerender } = render(<Harness readOnly initial={['finance']} onChange={handle} />);
      expect(screen.getByRole('group')).toHaveAttribute('data-state', 'readonly');
      expect(source()).toHaveAttribute('aria-readonly', 'true');
      expect(target()).toHaveAttribute('aria-readonly', 'true');
      await user.tab();
      expect(source()).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      expect(source()).toHaveAttribute('aria-activedescendant', 't-option-operations');
      await user.keyboard(' {Control>}a{/Control}{Enter}');
      await user.click(option('Engineering'));
      expect(option('Engineering')).toHaveAttribute('aria-selected', 'false');
      expect(toTarget()).toBeDisabled();
      expect(toSource()).toBeDisabled();
      expect(handle).not.toHaveBeenCalled();
      rerender(<Harness readOnly oneWay initial={['finance']} onChange={handle} />);
      expect(screen.queryByRole('button', { name: 'Remove Finance' })).toBeNull();
      target().focus();
      await user.keyboard('{Delete}');
      expect(handle).not.toHaveBeenCalled();
    });

    it('a disabled item can be neither selected nor moved', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.click(option('Legal'));
      expect(option('Legal')).toHaveAttribute('aria-selected', 'false');
      expect(toTarget()).toBeDisabled();
    });
  });

  describe('chrome layer', () => {
    it('names the group by its label and describes the source list by the description', () => {
      render(<Transfer<TeamItem> {...transferPropsFactory({ required: true, listHeight: 120 })} />);
      expect(screen.getByRole('group', { name: /Teams with access/ })).toBeInTheDocument();
      const list = screen.getByRole('listbox', { name: 'All teams' });
      expect(list).toHaveAttribute('id', 'demo-transfer');
      expect(list).toHaveAccessibleDescription('Move a team to the right to give it access.');
      expect(list).toHaveAttribute('aria-required', 'true');
      expect(list).not.toHaveAttribute('aria-invalid');
      expect(list.parentElement).toHaveStyle({ height: '120px' });
      expect(rows(screen.getByRole('listbox', { name: 'With access' }))).toEqual(['Engineering']);
    });

    it('shows the error as an alert, marks the lists invalid and describes the source by it', () => {
      render(
        <Transfer<TeamItem>
          {...transferPropsFactory({ error: 'Pick one', layout: 'horizontal' })}
        />,
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Pick one');
      const list = screen.getByRole('listbox', { name: 'All teams' });
      expect(list).toHaveAttribute('aria-invalid', 'true');
      expect(list).toHaveAccessibleDescription('Pick one');
    });

    it('merges a caller describedby and labelledby, and forwards its ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <>
          <span id="more">More</span>
          <span id="extra">Extra</span>
          <Transfer<TeamItem>
            {...transferPropsFactory({ invalid: true })}
            ref={ref}
            aria-describedby="more"
            aria-labelledby="extra"
          />
        </>,
      );
      expect(screen.getByRole('group', { name: 'Teams with access Extra' })).toBeInTheDocument();
      expect(ref.current).toBe(document.getElementById('demo-transfer'));
      expect(ref.current).toHaveAccessibleDescription(
        'More Move a team to the right to give it access.',
      );
      expect(ref.current).toHaveAttribute('aria-invalid', 'true');
    });

    it('works without a label or an id', () => {
      render(<Transfer dataSource={[{ key: 'a', title: 'Alpha' }]} />);
      expect(screen.getByRole('group')).not.toHaveAttribute('aria-labelledby');
      expect(rows(source())).toEqual(['Alpha']);
    });
  });
});
