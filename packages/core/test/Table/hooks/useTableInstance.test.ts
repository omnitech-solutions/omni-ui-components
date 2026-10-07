import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTableInstance } from '../../../src/Table/hooks/useTableInstance';
import { useTableState } from '../../../src/Table/hooks/useTableState';
import type { TableColumn, TableProps } from '../../../src/Table/Table.types';
import { column, type Person, people, resolve } from './support';

type Opts = {
  columns?: TableColumn<Person>[];
  props?: Partial<TableProps<Person>>;
  rows?: Person[];
};

const harness = ({ columns, props = {}, rows = people }: Opts = {}) => {
  const cols = columns ?? [
    column('name', { sorter: true }),
    column('age', { sorter: (a, b) => a.age - b.age }),
  ];
  const resolved = resolve(rows);
  const emitStateChange = vi.fn();
  const scrollToFirstRow = vi.fn();
  const paginationState = vi.fn(() => ({ current: 1, pageSize: 10, total: rows.length }));
  const rawProps = { dataSource: rows, columns: cols, ...props } as TableProps<Person>;
  const view = renderHook(() => {
    const state = useTableState<Person, unknown>(rawProps, cols);
    const instance = useTableInstance<Person, unknown>({
      rawProps,
      columns: cols,
      mergedLeafColumns: cols,
      resolvedRows: resolved,
      dataSource: rows,
      emitStateChange,
      paginationState,
      scrollToFirstRow,
      ...state,
    });
    return { state, ...instance };
  });
  return { ...view, cols, resolved, emitStateChange, scrollToFirstRow, paginationState };
};

const names = (result: { current: ReturnType<typeof harness>['result']['current'] }) =>
  result.current.table.getRowModel().rows.map((row) => row.original.record.name);

describe('useTableInstance row model', () => {
  it('uses the row key as the row id and exposes cell values through accessors', () => {
    const { result } = harness();
    const [first] = result.current.table.getRowModel().rows;
    expect(first.id).toBe('a');
    expect(first.getValue('name')).toBe('Ada');
    expect(first.getValue('age')).toBe(36);
  });

  it('builds sub rows from row children, defaulting a child record to an empty object', () => {
    const parent = { id: 'p', name: 'Parent', age: 1 };
    const view = renderHook(() => {
      const cols = [column('name')];
      const state = useTableState<Person, unknown>({ dataSource: [parent], columns: cols }, cols);
      const rows = [
        {
          key: 'p',
          record: parent,
          index: 0,
          row: {
            key: 'p',
            record: parent,
            children: [{ key: 'c1' }, { key: 'c2', record: { id: 'c2', name: 'Kid', age: 2 } }],
          },
        },
      ];
      return useTableInstance<Person, unknown>({
        rawProps: { dataSource: [parent], columns: cols },
        columns: cols,
        mergedLeafColumns: cols,
        resolvedRows: rows,
        dataSource: [parent],
        emitStateChange: vi.fn(),
        paginationState: vi.fn() as never,
        scrollToFirstRow: vi.fn(),
        ...state,
      });
    });
    const [root] = view.result.current.table.getCoreRowModel().rows;
    expect(root.subRows.map((row) => row.id)).toEqual(['c1', 'c2']);
    expect(root.subRows[0].original.record).toEqual({});
    expect(root.subRows[1].original.record.name).toBe('Kid');
  });

  it('enables row selection only when rowSelection is configured', () => {
    expect(harness().result.current.table.options.enableRowSelection).toBe(false);
    const selectable = harness({ props: { rowSelection: {} } });
    expect(selectable.result.current.table.options.enableRowSelection).toBe(true);
  });
});

describe('useTableInstance sorting', () => {
  it('sorts by the column sorter function in both directions', () => {
    const { result } = harness();
    act(() => result.current.table.getColumn('age')!.toggleSorting(false));
    expect(names(result)).toEqual(['Cy', 'Ada', 'Bob', 'Di']);
    act(() => result.current.table.getColumn('age')!.toggleSorting(true));
    expect(names(result)).toEqual(['Di', 'Bob', 'Ada', 'Cy']);
  });

  it('sorts a boolean sorter with the default component comparison', () => {
    const { result } = harness({
      rows: [
        { id: 'x', name: 'item10', age: 1 },
        { id: 'y', name: 'item9', age: 2 },
      ],
    });
    act(() => result.current.table.getColumn('name')!.toggleSorting(false));
    // Numeric-aware: item9 sorts before item10.
    expect(names(result)).toEqual(['item9', 'item10']);
  });

  it('passes the current order to an object sorter with compare', () => {
    const compare = vi.fn((a: Person, b: Person) => a.age - b.age);
    const { result } = harness({ columns: [column('age', { sorter: { compare } })] });
    act(() => result.current.table.getColumn('age')!.toggleSorting(true));
    // The row model is computed lazily, so read it to run the sorter.
    expect(names(result)).toEqual(['Di', 'Bob', 'Ada', 'Cy']);
    expect(compare).toHaveBeenCalled();
    expect(compare.mock.calls[0][2]).toBe('descend');
  });

  it('disables sorting for a column that has no sorter', () => {
    const { result } = harness({ columns: [column('age')] });
    expect(result.current.table.getColumn('age')!.getCanSort()).toBe(false);
  });

  it('applies a sorting change: stores it, emits state, scrolls and reports a sort change', () => {
    const onChange = vi.fn();
    const { result, emitStateChange, scrollToFirstRow, resolved } = harness({
      props: { onChange },
    });
    act(() => result.current.applySortingChange([{ id: 'name', desc: true }]));
    expect(result.current.state.sorting).toEqual([{ id: 'name', desc: true }]);
    expect(emitStateChange).toHaveBeenCalledWith({ sorting: [{ id: 'name', desc: true }] });
    expect(scrollToFirstRow).toHaveBeenCalledTimes(1);
    const [pagination, filters, sorter, extra] = onChange.mock.calls[0];
    expect(pagination).toEqual({ current: 1, pageSize: 10, total: 4 });
    expect(filters).toEqual({});
    expect(sorter).toEqual(
      expect.objectContaining({ columnKey: 'name', field: 'name', order: 'descend' }),
    );
    expect(extra).toEqual(
      expect.objectContaining({
        action: 'sort',
        currentDataSource: people,
        currentRows: resolved.map((r) => r.row),
      }),
    );
  });

  it('reports an array of sorters for a multi-column sort', () => {
    const onChange = vi.fn();
    const { result } = harness({ props: { onChange } });
    act(() =>
      result.current.applySortingChange([
        { id: 'name', desc: false },
        { id: 'age', desc: true },
      ]),
    );
    const sorter = onChange.mock.calls[0][2];
    expect(
      sorter.map((item: { columnKey: string; order: string }) => [item.columnKey, item.order]),
    ).toEqual([
      ['name', 'ascend'],
      ['age', 'descend'],
    ]);
  });

  it('reports a cleared sort for the changed column, or an empty list without one', () => {
    const onChange = vi.fn();
    const { result, cols } = harness({ props: { onChange } });
    act(() => result.current.applySortingChange([], cols[0], null));
    expect(onChange.mock.calls[0][2]).toEqual(
      expect.objectContaining({ columnKey: 'name', order: null, field: 'name' }),
    );
    act(() => result.current.applySortingChange([]));
    expect(onChange.mock.calls[1][2]).toEqual([]);
    act(() => result.current.applySortingChange([], cols[1]));
    expect(onChange.mock.calls[2][2]).toEqual(
      expect.objectContaining({ columnKey: 'age', order: null }),
    );
  });

  it('reports a nested dataIndex as a path array and tolerates unknown columns', () => {
    const onChange = vi.fn();
    const nested = column('city', {
      dataIndex: ['address', 'city'],
      sorter: true,
    } as Partial<TableColumn<Person>>);
    const { result } = harness({ columns: [nested], props: { onChange } });
    act(() => result.current.applySortingChange([{ id: 'city', desc: false }]));
    expect(onChange.mock.calls[0][2].field).toEqual(['address', 'city']);
    act(() => result.current.applySortingChange([{ id: 'ghost', desc: false }]));
    expect(onChange.mock.calls[1][2]).toEqual(
      expect.objectContaining({ columnKey: 'ghost', field: undefined, column: undefined }),
    );
  });

  it('leaves sorting state to the owner when sorting is controlled', () => {
    const onChange = vi.fn();
    const controlled = harness({ props: { onChange, state: { sorting: [] } } });
    expect(controlled.result.current.sortingControlled).toBe(true);
    act(() => controlled.result.current.applySortingChange([{ id: 'name', desc: false }]));
    expect(controlled.result.current.state.sorting).toEqual([]);
    expect(controlled.emitStateChange).toHaveBeenCalledWith({
      sorting: [{ id: 'name', desc: false }],
    });

    const bySortOrder = harness({
      columns: [column('name', { sorter: true, sortOrder: 'ascend' })],
    });
    expect(bySortOrder.result.current.sortingControlled).toBe(true);
    expect(harness().result.current.sortingControlled).toBe(false);
  });

  it('works without an onChange prop', () => {
    const { result } = harness();
    expect(() =>
      act(() => result.current.applySortingChange([{ id: 'name', desc: false }])),
    ).not.toThrow();
  });

  it('routes TanStack sorting changes through applySortingChange', () => {
    const onChange = vi.fn();
    const { result, emitStateChange } = harness({ props: { onChange } });
    act(() => result.current.table.getColumn('name')!.toggleSorting(true));
    expect(emitStateChange).toHaveBeenCalledWith({ sorting: [{ id: 'name', desc: true }] });
    expect(onChange.mock.calls[0][3].action).toBe('sort');
  });
});

describe('useTableInstance filtering', () => {
  const filterable = () => [
    column('name', { onFilter: (value, record) => record.name === value }),
    column('age'),
  ];

  it('filters rows with onFilter, matching any of several values', () => {
    const { result, emitStateChange } = harness({ columns: filterable() });
    act(() => result.current.table.getColumn('name')!.setFilterValue(['Ada', 'Di']));
    expect(names(result)).toEqual(['Ada', 'Di']);
    expect(result.current.state.columnFilters).toEqual([{ id: 'name', value: ['Ada', 'Di'] }]);
    expect(emitStateChange).toHaveBeenCalledWith({
      filters: [{ id: 'name', value: ['Ada', 'Di'] }],
    });
  });

  it('accepts a scalar filter value', () => {
    const { result } = harness({ columns: filterable() });
    act(() => result.current.table.getColumn('name')!.setFilterValue('Bob'));
    expect(names(result)).toEqual(['Bob']);
  });

  it('treats an empty list or blank value as no filter', () => {
    const { result } = harness({ columns: filterable() });
    act(() => result.current.table.getColumn('name')!.setFilterValue(['']));
    expect(names(result)).toHaveLength(4);
    act(() => result.current.table.getColumn('name')!.setFilterValue(['Ada']));
    expect(names(result)).toEqual(['Ada']);
  });

  it('does not filter on columns without onFilter beyond TanStack defaults', () => {
    const { result } = harness({ columns: filterable() });
    expect(result.current.table.getColumn('age')!.getCanFilter()).toBe(true);
  });
});

describe('useTableInstance other state handlers', () => {
  it('stores and emits expanded changes', () => {
    const { result, emitStateChange } = harness();
    act(() => result.current.table.setExpanded({ a: true }));
    expect(result.current.state.expanded).toEqual({ a: true });
    expect(emitStateChange).toHaveBeenCalledWith({ expanded: { a: true } });
  });

  it('resolves updater functions against the current state', () => {
    const { result, emitStateChange } = harness();
    act(() => result.current.table.setColumnVisibility({ age: false }));
    act(() => result.current.table.setColumnVisibility((old) => ({ ...old, name: false })));
    expect(result.current.state.columnVisibility).toEqual({ age: false, name: false });
    expect(emitStateChange).toHaveBeenLastCalledWith({
      columnVisibility: { age: false, name: false },
    });
  });

  it('stores and emits pagination changes', () => {
    const { result, emitStateChange } = harness();
    act(() => result.current.table.setPagination({ pageIndex: 2, pageSize: 5 }));
    expect(result.current.state.paginationStateValue).toEqual({ pageIndex: 2, pageSize: 5 });
    expect(emitStateChange).toHaveBeenCalledWith({ pagination: { pageIndex: 2, pageSize: 5 } });
  });

  it('stores and emits row selection changes', () => {
    const { result, emitStateChange } = harness({ props: { rowSelection: {} } });
    act(() => result.current.table.setRowSelection({ b: true }));
    expect(result.current.state.tanStackRowSelection).toEqual({ b: true });
    expect(emitStateChange).toHaveBeenCalledWith({ rowSelection: { b: true } });
  });

  it('stores and emits column order, sizing and pinning changes', () => {
    const { result, emitStateChange } = harness();
    act(() => result.current.table.setColumnOrder(['age', 'name']));
    act(() => result.current.table.setColumnSizing({ name: 200 }));
    act(() => result.current.table.setColumnPinning({ left: ['name'] }));
    expect(result.current.state.columnOrder).toEqual(['age', 'name']);
    expect(result.current.state.columnSizing).toEqual({ name: 200 });
    expect(result.current.state.columnPinning).toEqual({ left: ['name'] });
    expect(emitStateChange).toHaveBeenCalledWith({ columnOrder: ['age', 'name'] });
    expect(emitStateChange).toHaveBeenCalledWith({ columnSizing: { name: 200 } });
    expect(emitStateChange).toHaveBeenCalledWith({ columnPinning: { left: ['name'] } });
  });

  it('reorders rendered columns when columnOrder changes', () => {
    const { result } = harness();
    act(() => result.current.table.setColumnOrder(['age', 'name']));
    expect(result.current.table.getVisibleLeafColumns().map((c) => c.id)).toEqual(['age', 'name']);
  });
});

describe('useTableInstance functional updaters', () => {
  it('resolves updater functions against the latest state for every slice', () => {
    const { result, emitStateChange } = harness({ props: { rowSelection: {} } });
    const table = result.current.table;
    act(() => table.setExpanded({ a: true }));
    act(() => table.setExpanded((old) => ({ ...(old as object), b: true })));
    act(() => table.setColumnFilters([{ id: 'name', value: 'x' }]));
    act(() => table.setColumnFilters((old) => old.map((f) => ({ ...f, value: `${f.value}y` }))));
    act(() => table.setPagination({ pageIndex: 1, pageSize: 2 }));
    act(() => table.setPagination((old) => ({ ...old, pageIndex: old.pageIndex + 1 })));
    act(() => table.setRowSelection({ a: true }));
    act(() => table.setRowSelection((old) => ({ ...old, b: true })));
    act(() => table.setColumnOrder(['age']));
    act(() => table.setColumnOrder((old) => [...old, 'name']));
    act(() => table.setColumnSizing({ name: 10 }));
    act(() => table.setColumnSizing((old) => ({ ...old, age: 20 })));
    act(() => table.setColumnPinning({ left: ['name'] }));
    act(() => table.setColumnPinning((old) => ({ ...old, right: ['age'] })));
    act(() => table.setSorting([{ id: 'name', desc: false }]));
    act(() => table.setSorting((old) => [...old, { id: 'age', desc: true }]));
    const s = result.current.state;
    expect(s.expanded).toEqual({ a: true, b: true });
    expect(s.columnFilters).toEqual([{ id: 'name', value: 'xy' }]);
    expect(s.paginationStateValue).toEqual({ pageIndex: 2, pageSize: 2 });
    expect(s.tanStackRowSelection).toEqual({ a: true, b: true });
    expect(s.columnOrder).toEqual(['age', 'name']);
    expect(s.columnSizing).toEqual({ name: 10, age: 20 });
    expect(s.columnPinning).toEqual({ left: ['name'], right: ['age'] });
    expect(s.sorting).toEqual([
      { id: 'name', desc: false },
      { id: 'age', desc: true },
    ]);
    expect(emitStateChange).toHaveBeenCalledWith({
      sorting: [
        { id: 'name', desc: false },
        { id: 'age', desc: true },
      ],
    });
  });
});
