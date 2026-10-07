import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTableState } from '../../../src/Table/hooks/useTableState';
import type { TableColumn, TableProps } from '../../../src/Table/Table.types';
import { column, type Person, people } from './support';

const render = (props: Partial<TableProps<Person>> = {}, columns?: TableColumn<Person>[]) => {
  const cols = columns ?? [column('name', { sorter: true }), column('age')];
  return renderHook(
    (current: { props: Partial<TableProps<Person>>; columns: TableColumn<Person>[] }) =>
      useTableState<Person, unknown>(
        { dataSource: people, columns: current.columns, ...current.props } as TableProps<Person>,
        current.columns,
      ),
    { initialProps: { props, columns: cols } },
  );
};

describe('useTableState sorting', () => {
  it('starts from props.state.sorting, then column sortOrder, then defaults', () => {
    expect(
      render({ state: { sorting: [{ id: 'age', desc: true }] } }).result.current.sorting,
    ).toEqual([{ id: 'age', desc: true }]);
    const controlled = render({}, [column('name', { sorter: true, sortOrder: 'descend' })]);
    expect(controlled.result.current.sorting).toEqual([{ id: 'name', desc: true }]);
    expect(
      render({ defaultState: { sorting: [{ id: 'age', desc: false }] } }).result.current.sorting,
    ).toEqual([{ id: 'age', desc: false }]);
    const byDefault = render({}, [column('name', { sorter: true, defaultSortOrder: 'ascend' })]);
    expect(byDefault.result.current.sorting).toEqual([{ id: 'name', desc: false }]);
  });

  it('follows a column sortOrder when the column prop changes', () => {
    const view = render({}, [column('name', { sorter: true, sortOrder: 'ascend' })]);
    view.rerender({
      props: {},
      columns: [column('name', { sorter: true, sortOrder: 'descend' })],
    });
    expect(view.result.current.sorting).toEqual([{ id: 'name', desc: true }]);
  });

  it('does not override explicitly controlled props.state.sorting', () => {
    const state = { sorting: [{ id: 'age', desc: false }] };
    const view = render({ state }, [column('name', { sorter: true, sortOrder: 'ascend' })]);
    view.rerender({
      props: { state },
      columns: [column('name', { sorter: true, sortOrder: 'descend' })],
    });
    expect(view.result.current.sorting).toEqual([{ id: 'age', desc: false }]);
  });

  it('syncs props.state.sorting changes, including clearing it', () => {
    const view = render({ state: { sorting: [{ id: 'age', desc: false }] } });
    view.rerender({
      props: { state: { sorting: [{ id: 'name', desc: true }] } },
      columns: [column('name', { sorter: true }), column('age')],
    });
    expect(view.result.current.sorting).toEqual([{ id: 'name', desc: true }]);
    view.rerender({
      props: { state: { sorting: undefined } },
      columns: [column('name', { sorter: true }), column('age')],
    });
    expect(view.result.current.sorting).toEqual([]);
  });
});

describe('useTableState filters', () => {
  it('seeds filters from defaultState, then from column default filtered values', () => {
    expect(
      render({ defaultState: { filters: [{ id: 'name', value: ['Ada'] }] } }).result.current
        .columnFilters,
    ).toEqual([{ id: 'name', value: ['Ada'] }]);
    const cols = [column('name', { defaultFilteredValue: ['Bob'] }), column('age')];
    expect(render({}, cols).result.current.columnFilters).toEqual([{ id: 'name', value: ['Bob'] }]);
  });

  it('freezes the initial filter items per column', () => {
    const items = [{ text: 'Ada', value: 'Ada' }];
    const view = render({}, [column('name', { filters: items }), column('age')]);
    expect(view.result.current.initialFilterItemsRef.current).toEqual({ name: items });
    view.rerender({ props: {}, columns: [column('name', { filters: [] }), column('age')] });
    expect(view.result.current.initialFilterItemsRef.current).toEqual({ name: items });
  });

  it('applies a controlled filteredValue over local filters of other columns', () => {
    const view = render({}, [column('name', { filteredValue: ['Ada'] }), column('age')]);
    act(() => view.result.current.setColumnFilters([{ id: 'age', value: [1] }]));
    view.rerender({
      props: {},
      columns: [column('name', { filteredValue: ['Bob'] }), column('age')],
    });
    expect(view.result.current.columnFilters).toEqual([
      { id: 'age', value: [1] },
      { id: 'name', value: ['Bob'] },
    ]);
  });

  it('treats a null filteredValue as an empty controlled filter', () => {
    const view = render({}, [column('name', { filteredValue: null as never }), column('age')]);
    expect(view.result.current.columnFilters).toEqual([{ id: 'name', value: [] }]);
  });
});

describe('useTableState expanded', () => {
  it('resolves the initial state in priority order', () => {
    expect(render({ state: { expanded: { a: true } } }).result.current.expanded).toEqual({
      a: true,
    });
    expect(render({ expandable: { expandedRowKeys: ['b'] } }).result.current.expanded).toEqual({
      b: true,
    });
    expect(render({ defaultState: { expanded: { c: true } } }).result.current.expanded).toEqual({
      c: true,
    });
    expect(render({ expandable: { defaultExpandAllRows: true } }).result.current.expanded).toBe(
      true,
    );
    expect(
      render({ expandable: { defaultExpandedRowKeys: ['d'] } }).result.current.expanded,
    ).toEqual({ d: true });
    expect(render({}).result.current.expanded).toEqual({});
  });

  it('follows expandedRowKeys changes from the owner', () => {
    const view = render({ expandable: { expandedRowKeys: ['a'] } });
    view.rerender({
      props: { expandable: { expandedRowKeys: ['b', 'c'] } },
      columns: [column('name')],
    });
    expect(view.result.current.expanded).toEqual({ b: true, c: true });
  });
});

describe('useTableState column layout, pagination and selection', () => {
  it('seeds column layout from defaultState', () => {
    const { result } = render({
      defaultState: {
        columnVisibility: { age: false },
        columnOrder: ['age'],
        columnSizing: { age: 9 },
        columnPinning: { left: ['age'] },
      },
    });
    expect(result.current.columnVisibility).toEqual({ age: false });
    expect(result.current.columnOrder).toEqual(['age']);
    expect(result.current.columnSizing).toEqual({ age: 9 });
    expect(result.current.columnPinning).toEqual({ left: ['age'] });
  });

  it('lets a provided props.state win over defaultState once synced', () => {
    const { result } = render({
      defaultState: { columnVisibility: { age: false } },
      state: { columnVisibility: { name: false } },
    });
    expect(result.current.columnVisibility).toEqual({ name: false });
  });

  it('defaults column layout to empty values', () => {
    const { result } = render({});
    expect(result.current.columnVisibility).toEqual({});
    expect(result.current.columnOrder).toEqual([]);
    expect(result.current.columnSizing).toEqual({});
    expect(result.current.columnPinning).toEqual({});
  });

  it('derives the initial page from pagination config or data length', () => {
    expect(render({}).result.current.paginationStateValue).toEqual({ pageIndex: 0, pageSize: 4 });
    expect(
      render({ pagination: { current: 3, pageSize: 2 } }).result.current.paginationStateValue,
    ).toEqual({ pageIndex: 2, pageSize: 2 });
    expect(
      render({ pagination: { defaultCurrent: 2, defaultPageSize: 3 } }).result.current
        .paginationStateValue,
    ).toEqual({ pageIndex: 1, pageSize: 3 });
    expect(render({ dataSource: [] }).result.current.paginationStateValue.pageSize).toBe(1);
  });

  it('syncs the controlled page and size but keeps the rest when partially controlled', () => {
    const view = render({ pagination: { current: 1, pageSize: 2 } });
    view.rerender({
      props: { pagination: { current: 2, pageSize: 2 } },
      columns: [column('name')],
    });
    expect(view.result.current.paginationStateValue).toEqual({ pageIndex: 1, pageSize: 2 });
    act(() => view.result.current.setPaginationStateValue({ pageIndex: 5, pageSize: 7 }));
    view.rerender({ props: { pagination: { total: 40 } }, columns: [column('name')] });
    expect(view.result.current.paginationStateValue).toEqual({ pageIndex: 5, pageSize: 7 });
  });

  it('seeds selection from selectedRowKeys over defaults and follows controlled changes', () => {
    const view = render({
      rowSelection: { selectedRowKeys: ['a'], defaultSelectedRowKeys: ['b'] },
    });
    expect(view.result.current.tanStackRowSelection).toEqual({ a: true });
    view.rerender({
      props: { rowSelection: { selectedRowKeys: ['c', 'd'] } },
      columns: [column('name')],
    });
    expect(view.result.current.tanStackRowSelection).toEqual({ c: true, d: true });
    expect(
      render({ rowSelection: { defaultSelectedRowKeys: ['b'] } }).result.current
        .tanStackRowSelection,
    ).toEqual({ b: true });
  });

  it('turns keys or iterables into a selection map', () => {
    const { result } = render({});
    expect(result.current.selectionKeysToState(new Set(['x', 'y']))).toEqual({ x: true, y: true });
    expect(result.current.selectionKeysToState()).toEqual({});
    expect(result.current.selectionKeysToState(null as never)).toEqual({});
  });
});

describe('useTableState props.state sync', () => {
  it('writes each provided slice from props.state and leaves the others alone', () => {
    const view = render({});
    const columns = [column('name')];
    view.rerender({
      props: {
        state: {
          filters: [{ id: 'name', value: ['Ada'] }],
          expanded: { a: true },
          pagination: { pageIndex: 2, pageSize: 3 },
          rowSelection: { b: true },
          columnVisibility: { age: false },
          columnOrder: ['age', 'name'],
          columnSizing: { name: 120 },
          columnPinning: { right: ['age'] },
        },
      },
      columns,
    });
    const r = view.result.current;
    expect(r.columnFilters).toEqual([{ id: 'name', value: ['Ada'] }]);
    expect(r.expanded).toEqual({ a: true });
    expect(r.paginationStateValue).toEqual({ pageIndex: 2, pageSize: 3 });
    expect(r.tanStackRowSelection).toEqual({ b: true });
    expect(r.columnVisibility).toEqual({ age: false });
    expect(r.columnOrder).toEqual(['age', 'name']);
    expect(r.columnSizing).toEqual({ name: 120 });
    expect(r.columnPinning).toEqual({ right: ['age'] });
  });

  it('leaves slices uncontrolled when props.state omits them', () => {
    const view = render({});
    act(() => view.result.current.setColumnOrder(['age']));
    view.rerender({ props: { state: { expanded: { a: true } } }, columns: [column('name')] });
    expect(view.result.current.columnOrder).toEqual(['age']);
  });
});

describe('useTableState editing and row order', () => {
  it('starts with nothing being edited and updates each editing slice independently', () => {
    const { result } = render({});
    expect(result.current.editingCell).toBeNull();
    expect(result.current.editingRowKey).toBeNull();
    expect(result.current.editValues).toEqual({});
    expect(result.current.editErrors).toEqual({});
    expect(result.current.internalCellValues).toEqual({});
    act(() => result.current.setEditingCell({ rowKey: 'a', columnKey: 'name' }));
    expect(result.current.editingCell).toEqual({ rowKey: 'a', columnKey: 'name' });
    expect(result.current.editingRowKey).toBeNull();
  });

  it('keeps a row order', () => {
    const { result } = render({});
    expect(result.current.rowOrder).toEqual([]);
    act(() => result.current.setRowOrder(['b', 'a']));
    expect(result.current.rowOrder).toEqual(['b', 'a']);
  });
});
