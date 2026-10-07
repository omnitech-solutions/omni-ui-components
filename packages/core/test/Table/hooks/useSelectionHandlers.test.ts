import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSelectionHandlers } from '../../../src/Table/hooks/useSelectionHandlers';
import { useSelectionState } from '../../../src/Table/hooks/useTableState/useSelectionState';
import type { TableDataRow, TableProps } from '../../../src/Table/Table.types';
import { byKey, people, resolve, type Person } from './support';

type Selection = NonNullable<TableProps<Person>['rowSelection']>;

const harness = (
  rowSelection: Selection | undefined,
  rowFor: (record: Person) => Partial<TableDataRow<Person>> = () => ({}),
  locale?: TableProps<Person>['locale'],
) => {
  const rows = resolve(people, rowFor);
  const emitStateChange = vi.fn();
  const view = renderHook(
    (props: { rowSelection: Selection | undefined }) => {
      const state = useSelectionState<Person, unknown>(props.rowSelection);
      const handlers = useSelectionHandlers<Person, unknown>({
        rowSelection: props.rowSelection,
        locale,
        allResolvedRows: rows,
        resolvedRows: rows,
        rowByKey: byKey(rows),
        emitStateChange,
        ...state,
      });
      return { state, ...handlers };
    },
    { initialProps: { rowSelection } },
  );
  return { ...view, rows, emitStateChange };
};

const click = (shiftKey = false) => new MouseEvent('click', { shiftKey });

describe('useSelectionHandlers basics', () => {
  it('starts from defaultSelectedRowKeys and exposes them as keys and a set', () => {
    const { result } = harness({ defaultSelectedRowKeys: ['a', 'c'] });
    expect(result.current.selectedKeys).toEqual(['a', 'c']);
    expect(result.current.selectedKeySet.has('c')).toBe(true);
    expect(result.current.selectionControlled).toBe(false);
  });

  it('flags selection as controlled when selectedRowKeys is provided', () => {
    const { result } = harness({ selectedRowKeys: ['b'] });
    expect(result.current.selectionControlled).toBe(true);
    expect(result.current.selectedKeys).toEqual(['b']);
  });

  it('resolves the fixed side and the alignment style', () => {
    expect(harness({ fixed: true }).result.current.selectionFixedSide).toBe('left');
    const right = harness({ fixed: 'right', align: 'center' }).result.current;
    expect(right.selectionFixedSide).toBe('right');
    expect(right.selectionAlignStyle).toEqual(expect.objectContaining({ textAlign: 'center' }));
    expect(harness(undefined).result.current.selectionFixedSide).toBeUndefined();
  });

  it('turns keys into a state map and ignores a missing key list', () => {
    const { result } = harness({});
    expect(result.current.selectionStateForKeys(['a', 2 as never])).toEqual({ a: true, 2: true });
    expect(result.current.selectionStateForKeys()).toEqual({});
  });

  it('maps keys to records and skips unknown keys', () => {
    const { result } = harness({});
    expect(result.current.selectedRecordsForKeys(['b', 'zzz', 'd'])).toEqual([
      people[1],
      people[3],
    ]);
  });

  it('merges getCheckboxProps and treats disabled rows as unselectable', () => {
    const getCheckboxProps = vi.fn((record: Person) => ({ disabled: record.id === 'b' }));
    const { result, rows } = harness({ getCheckboxProps });
    expect(result.current.isSelectionDisabled(rows[1])).toBe(true);
    expect(result.current.isSelectionDisabled(rows[0])).toBe(false);
    expect(getCheckboxProps).toHaveBeenCalledWith(people[1], rows[1].row);
    expect(result.current.changeableSelectionKeys).toEqual(['a', 'c', 'd']);
  });

  it('returns empty checkbox props when none are configured', () => {
    const { result, rows } = harness({});
    expect(result.current.selectionCheckboxPropsFor(rows[0])).toEqual({});
  });
});

describe('useSelectionHandlers single selection', () => {
  it('selects a row, updates state and reports the change', () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    const { result, rows, emitStateChange } = harness({ onChange, onSelect });
    const event = click();
    act(() => result.current.handleSelect(rows[0], true, event));
    expect(result.current.selectedKeys).toEqual(['a']);
    expect(onChange).toHaveBeenCalledWith(['a'], [people[0]], { type: 'single' });
    expect(onSelect).toHaveBeenCalledWith(people[0], true, [people[0]], event, rows[0].row);
    expect(emitStateChange).toHaveBeenCalledWith({ rowSelection: { a: true } });
  });

  it('deselects a row', () => {
    const onSelect = vi.fn();
    const { result, rows } = harness({ defaultSelectedRowKeys: ['a', 'b'], onSelect });
    act(() => result.current.handleSelect(rows[0], false, click()));
    expect(result.current.selectedKeys).toEqual(['b']);
    expect(onSelect.mock.calls[0][1]).toBe(false);
    expect(onSelect.mock.calls[0][2]).toEqual([people[1]]);
  });

  it('does not duplicate a key that is already selected', () => {
    const { result, rows } = harness({ defaultSelectedRowKeys: ['a'] });
    act(() => result.current.handleSelect(rows[0], true, click()));
    expect(result.current.selectedKeys).toEqual(['a']);
  });

  it('keeps controlled selection untouched but still notifies', () => {
    const onChange = vi.fn();
    const { result, rows } = harness({ selectedRowKeys: ['a'], onChange });
    act(() => result.current.handleSelect(rows[1], true, click()));
    expect(result.current.selectedKeys).toEqual(['a']);
    expect(onChange).toHaveBeenCalledWith(['a', 'b'], [people[0], people[1]], { type: 'single' });
  });

  it('radio selection replaces the previous choice and can clear', () => {
    const onChange = vi.fn();
    const { result, rows } = harness({ type: 'radio', defaultSelectedRowKeys: ['a'], onChange });
    act(() => result.current.handleSelect(rows[2], true, click()));
    expect(result.current.selectedKeys).toEqual(['c']);
    act(() => result.current.handleSelect(rows[2], false, click()));
    expect(result.current.selectedKeys).toEqual([]);
    expect(onChange).toHaveBeenLastCalledWith([], [], { type: 'single' });
  });

  it('drops keys that are not in the table unless preserveSelectedRowKeys is set', () => {
    const plain = harness({ defaultSelectedRowKeys: ['ghost'] });
    act(() => plain.result.current.applySelectionKeys(['a', 'ghost', 'a'], 'multiple'));
    expect(plain.result.current.selectedKeys).toEqual(['a']);

    const preserving = harness({ preserveSelectedRowKeys: true });
    act(() => preserving.result.current.applySelectionKeys(['a', 'ghost', 'a'], 'multiple'));
    expect(preserving.result.current.selectedKeys).toEqual(['a', 'ghost']);
  });

  it('remembers records of selected rows that later leave the data when preserving', () => {
    const onChange = vi.fn();
    const { result, rerender, rows } = harness({ preserveSelectedRowKeys: true, onChange });
    act(() => result.current.applySelectionKeys(['a'], 'single'));
    expect(onChange).toHaveBeenLastCalledWith(['a'], [people[0]], { type: 'single' });
    // A new selection set keeps resolving the earlier record from the preserved map.
    rerender({ rowSelection: { preserveSelectedRowKeys: true, onChange } });
    expect(result.current.selectedRecordsForKeys(['a'])).toEqual([people[0]]);
    expect(rows).toHaveLength(4);
  });
});

describe('useSelectionHandlers range selection', () => {
  it('selects the range between the previous and current row on shift-click', () => {
    const onSelectMultiple = vi.fn();
    const onChange = vi.fn();
    const { result, rows } = harness({ onSelectMultiple, onChange });
    act(() => result.current.handleSelect(rows[0], true, click()));
    act(() => result.current.handleSelect(rows[2], true, click(true)));
    expect(result.current.selectedKeys).toEqual(['a', 'b', 'c']);
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b', 'c'], expect.any(Array), {
      type: 'multiple',
    });
    const [checked, selectedRows, changed] = onSelectMultiple.mock.calls[0];
    expect(checked).toBe(true);
    expect(selectedRows).toEqual([people[0], people[1], people[2]]);
    // The anchor row was already selected, so only b and c changed.
    expect(changed).toEqual([people[1], people[2]]);
  });

  it('handles a backwards range and deselects a range', () => {
    const { result, rows } = harness({ defaultSelectedRowKeys: ['a', 'b', 'c', 'd'] });
    act(() => result.current.handleSelect(rows[3], true, click()));
    act(() => result.current.handleSelect(rows[1], false, click(true)));
    // Shift-deselect removes the whole b..d range, leaving only a.
    expect(result.current.selectedKeys).toEqual(['a']);
  });

  it('skips disabled rows inside a range', () => {
    const { result, rows } = harness({ getCheckboxProps: (r) => ({ disabled: r.id === 'b' }) });
    act(() => result.current.handleSelect(rows[0], true, click()));
    act(() => result.current.handleSelect(rows[2], true, click(true)));
    expect(result.current.selectedKeys).toEqual(['a', 'c']);
  });

  it('falls back to a plain toggle when the anchor is not changeable', () => {
    const { result, rows } = harness({ getCheckboxProps: (r) => ({ disabled: r.id === 'a' }) });
    act(() => {
      result.current.state.lastSelectedKeyRef.current = 'a';
    });
    act(() => result.current.handleSelect(rows[2], true, click(true)));
    expect(result.current.selectedKeys).toEqual(['c']);
    act(() => {
      result.current.state.lastSelectedKeyRef.current = 'a';
    });
    act(() => result.current.handleSelect(rows[2], false, click(true)));
    expect(result.current.selectedKeys).toEqual([]);
  });

  it('ignores shift when there is no anchor, and resets the anchor after a deselect', () => {
    const { result, rows } = harness({});
    act(() => result.current.handleSelect(rows[2], true, click(true)));
    expect(result.current.selectedKeys).toEqual(['c']);
    expect(result.current.state.lastSelectedKeyRef.current).toBe('c');
    act(() => result.current.handleSelect(rows[2], false, click()));
    expect(result.current.state.lastSelectedKeyRef.current).toBeNull();
  });
});

describe('useSelectionHandlers tree selection', () => {
  const treeRows = (strict: boolean) => {
    const parent = { id: 'p', name: 'Parent', age: 0 };
    const kids = [
      { id: 'k1', name: 'Kid1', age: 1 },
      { id: 'k2', name: 'Kid2', age: 2 },
      { id: 'k3', name: 'Kid3', age: 3 },
    ];
    const records = [parent];
    const rows = resolve(records, () => ({
      children: kids.map((kid) => ({
        key: kid.id,
        record: kid,
        disabled: undefined,
      })),
    }));
    // Children are only reachable through the tree; register them in rowByKey as the Table does.
    const all = [...rows, ...resolve(kids)];
    const emitStateChange = vi.fn();
    const onChange = vi.fn();
    const rowSelection: Selection = {
      checkStrictly: strict,
      onChange,
      getCheckboxProps: (record) => ({ disabled: record.id === 'k3' }),
    };
    const view = renderHook(() => {
      const state = useSelectionState<Person, unknown>(rowSelection);
      return useSelectionHandlers<Person, unknown>({
        rowSelection,
        locale: undefined,
        allResolvedRows: all,
        resolvedRows: rows,
        rowByKey: byKey(all),
        emitStateChange,
        ...state,
      });
    });
    return { ...view, all, onChange };
  };

  it('selects the parent without children when checkStrictly is true', () => {
    const { result, all } = treeRows(true);
    act(() => result.current.handleSelect(all[0], true, click()));
    expect(result.current.selectedKeys).toEqual(['p']);
  });

  it('cascades down to changeable descendants and ignores disabled children', () => {
    const { result, all } = treeRows(false);
    act(() => result.current.handleSelect(all[0], true, click()));
    expect(result.current.selectedKeys.sort()).toEqual(['k1', 'k2', 'p']);
  });

  it('treats children without a record as empty records and ignores keys outside the tree', () => {
    const rows = resolve([{ id: 'p', name: 'P', age: 0 }], () => ({
      children: [{ key: 'k1' }, { key: 'k2' }],
    }));
    const loose = resolve([{ id: 'loose', name: 'L', age: 9 }]);
    const all = [...rows, ...loose];
    const rowSelection: Selection = { checkStrictly: false };
    const view = renderHook(() => {
      const state = useSelectionState<Person, unknown>(rowSelection);
      return useSelectionHandlers<Person, unknown>({
        rowSelection,
        locale: undefined,
        allResolvedRows: all,
        resolvedRows: rows,
        rowByKey: byKey(all),
        emitStateChange: vi.fn(),
        ...state,
      });
    });
    // `loose` is selectable but absent from the tree, so no keys cascade and nothing is selected.
    act(() => view.result.current.handleSelect(loose[0], true, click()));
    expect(view.result.current.selectedKeys).toEqual([]);
  });

  it('does not derive a parent state from children that are all disabled', () => {
    const parent = { id: 'p', name: 'P', age: 0 };
    const kid = { id: 'k', name: 'K', age: 1 };
    const rows = resolve([parent], () => ({ children: [{ key: 'k', record: kid }] }));
    const all = [...rows, ...resolve([kid])];
    const rowSelection: Selection = {
      checkStrictly: false,
      getCheckboxProps: (record) => ({ disabled: record.id === 'k' }),
    };
    const view = renderHook(() => {
      const state = useSelectionState<Person, unknown>(rowSelection);
      return useSelectionHandlers<Person, unknown>({
        rowSelection,
        locale: undefined,
        allResolvedRows: all,
        resolvedRows: rows,
        rowByKey: byKey(all),
        emitStateChange: vi.fn(),
        ...state,
      });
    });
    act(() => view.result.current.handleSelect(all[0], true, click()));
    expect(view.result.current.selectedKeys).toEqual(['p']);
  });

  it('un-checks the parent when a child is deselected and re-checks it when all return', () => {
    const { result, all } = treeRows(false);
    act(() => result.current.handleSelect(all[0], true, click()));
    act(() => result.current.handleSelect(all[1], false, click()));
    expect(result.current.selectedKeys.sort()).toEqual(['k2']);
    act(() => result.current.handleSelect(all[1], true, click()));
    expect(result.current.selectedKeys.sort()).toEqual(['k1', 'k2', 'p']);
  });
});

describe('useSelectionHandlers selection actions', () => {
  it('has no actions without a selections config, for radio, or for an explicit list', () => {
    expect(harness({}).result.current.resolvedSelectionActions).toEqual([]);
    expect(harness(undefined).result.current.resolvedSelectionActions).toEqual([]);
    expect(
      harness({ type: 'radio', selections: true }).result.current.resolvedSelectionActions,
    ).toEqual([]);
    const custom = [{ key: 'x', text: 'X', onSelect: vi.fn() }];
    expect(harness({ selections: custom }).result.current.resolvedSelectionActions).toBe(custom);
  });

  it('builds the all/invert/none defaults, using the locale label for all', () => {
    const { result } = harness({ selections: true }, undefined, { selectAll: 'Everything' });
    const actions = result.current.resolvedSelectionActions;
    expect(actions.map((a) => a.key)).toEqual(['all', 'invert', 'none']);
    expect(actions[0].text).toBe('Everything');
    expect(harness({ selections: true }).result.current.resolvedSelectionActions[0].text).toBe(
      'All',
    );
  });

  it('select-all adds every changeable row and reports only the newly added', () => {
    const onSelectAll = vi.fn();
    const { result } = harness({
      selections: true,
      onSelectAll,
      defaultSelectedRowKeys: ['a'],
      getCheckboxProps: (r) => ({ disabled: r.id === 'd' }),
    });
    act(() => result.current.resolvedSelectionActions[0].onSelect([]));
    expect(result.current.selectedKeys.sort()).toEqual(['a', 'b', 'c']);
    expect(onSelectAll).toHaveBeenCalledWith(
      true,
      [people[0], people[1], people[2]],
      [people[1], people[2]],
    );
  });

  it('invert flips changeable rows only', () => {
    const onSelectInvert = vi.fn();
    const { result } = harness({
      selections: true,
      onSelectInvert,
      defaultSelectedRowKeys: ['a', 'd'],
      getCheckboxProps: (r) => ({ disabled: r.id === 'd' }),
    });
    act(() => result.current.resolvedSelectionActions[1].onSelect([]));
    expect(result.current.selectedKeys.sort()).toEqual(['b', 'c', 'd']);
    expect(onSelectInvert).toHaveBeenCalledWith(expect.arrayContaining(['b', 'c', 'd']));
  });

  it('none clears everything except disabled selected rows', () => {
    const onSelectNone = vi.fn();
    const { result } = harness({
      selections: true,
      onSelectNone,
      defaultSelectedRowKeys: ['a', 'd'],
      getCheckboxProps: (r) => ({ disabled: r.id === 'd' }),
    });
    act(() => result.current.resolvedSelectionActions[2].onSelect([]));
    expect(result.current.selectedKeys).toEqual(['d']);
    expect(onSelectNone).toHaveBeenCalledTimes(1);
  });

  it('none keeps selected keys it cannot resolve to a row out of the cleared set', () => {
    const { result } = harness({
      selections: true,
      defaultSelectedRowKeys: ['a', 'ghost'],
      preserveSelectedRowKeys: true,
    });
    act(() => result.current.resolvedSelectionActions[2].onSelect([]));
    expect(result.current.selectedKeys).toEqual([]);
  });

  it('actions work without the optional callbacks', () => {
    const { result } = harness({ selections: true, defaultSelectedRowKeys: ['a'] });
    act(() => result.current.resolvedSelectionActions[0].onSelect([]));
    act(() => result.current.resolvedSelectionActions[1].onSelect([]));
    act(() => result.current.resolvedSelectionActions[2].onSelect([]));
    expect(result.current.selectedKeys).toEqual([]);
  });
});

describe('useSelectionHandlers bulk actions', () => {
  it('detects configured bulk actions', () => {
    expect(harness({ bulkActions: {} as never }).result.current.bulkActionsConfigured).toBe(true);
    expect(harness({}).result.current.bulkActionsConfigured).toBe(false);
  });

  it('clearSelection keeps disabled selected rows and notifies', () => {
    const onChange = vi.fn();
    const onSelectNone = vi.fn();
    const { result } = harness({
      defaultSelectedRowKeys: ['a', 'd', 'ghost'],
      onChange,
      onSelectNone,
      getCheckboxProps: (r) => ({ disabled: r.id === 'd' }),
    });
    act(() => result.current.clearSelection());
    expect(result.current.selectedKeys).toEqual(['d']);
    expect(onChange).toHaveBeenCalledWith(['d'], [people[3]], { type: 'none' });
    expect(onSelectNone).toHaveBeenCalledTimes(1);
  });

  it('clearSelection works without callbacks', () => {
    const { result } = harness(undefined);
    expect(() => act(() => result.current.clearSelection())).not.toThrow();
  });

  it('runBulkAction hands the action every changeable key', () => {
    const { result } = harness({ getCheckboxProps: (r) => ({ disabled: r.id === 'a' }) });
    const onSelect = vi.fn();
    result.current.runBulkAction({ key: 'x', text: 'X', onSelect });
    expect(onSelect).toHaveBeenCalledWith(['b', 'c', 'd']);
  });
});
