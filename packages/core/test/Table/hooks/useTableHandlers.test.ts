import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  useTableHandlers,
  type UseTableHandlersInput,
} from '../../../src/Table/hooks/useTableHandlers';
import type { TableProps } from '../../../src/Table/Table.types';
import { column, people, resolve, type Person } from './support';

const cols = [
  column('name', { onFilter: (value, record) => record.name === value }),
  column('age'),
];

const setup = (overrides: Partial<UseTableHandlersInput<Person, unknown>> = {}) => {
  const rows = resolve(people);
  const spies = {
    setColumnFilters: vi.fn(),
    setPaginationStateValue: vi.fn(),
    setExpanded: vi.fn(),
    emitStateChange: vi.fn(),
    onStateChange: vi.fn(),
    onChange: vi.fn(),
  };
  const input: UseTableHandlersInput<Person, unknown> = {
    columnFilters: [],
    paginationStateValue: { pageIndex: 3, pageSize: 5 },
    expanded: {},
    sorting: [{ id: 'age', desc: false }],
    tanStackRowSelection: { a: true },
    allResolvedRows: rows,
    resolvedRows: rows,
    mergedLeafColumns: cols,
    table: { getFilteredRowModel: () => ({ rows: rows.slice(0, 3) }) } as never,
    pagination: undefined,
    expandable: undefined,
    scroll: undefined,
    scrollRef: { current: null },
    ...spies,
    ...overrides,
  };
  const { result } = renderHook(() => useTableHandlers<Person, unknown>(input));
  return { result, rows, ...spies, input };
};

describe('useTableHandlers pagination state', () => {
  it('reports a one-based page, the page size and the filtered row count as total', () => {
    const { result } = setup();
    expect(result.current.paginationState()).toEqual({ current: 4, pageSize: 5, total: 3 });
  });

  it('prefers the externally provided total', () => {
    const { result } = setup({ pagination: { total: 250 } });
    expect(result.current.paginationState().total).toBe(250);
  });

  it('ignores a pagination object with no total', () => {
    const { result } = setup({ pagination: { pageSize: 5 } });
    expect(result.current.paginationState().total).toBe(3);
  });
});

describe('useTableHandlers scrolling', () => {
  it('scrolls the container to the top', () => {
    const scrollTo = vi.fn();
    const { result } = setup({ scrollRef: { current: { scrollTo } as never } });
    result.current.scrollToFirstRow();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
  });

  it('falls back to scrollTop when scrollTo is missing', () => {
    const el = { scrollTop: 90 } as HTMLDivElement;
    const { result } = setup({ scrollRef: { current: el } });
    result.current.scrollToFirstRow();
    expect(el.scrollTop).toBe(0);
  });

  it('does not scroll when scrollToFirstRowOnChange is false', () => {
    const scrollTo = vi.fn();
    const { result } = setup({
      scroll: { scrollToFirstRowOnChange: false },
      scrollRef: { current: { scrollTo } as never },
    });
    result.current.scrollToFirstRow();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('is a no-op when there is no scroll container', () => {
    const { result } = setup();
    expect(() => result.current.scrollToFirstRow()).not.toThrow();
  });
});

describe('useTableHandlers filters', () => {
  it('reads the committed keys for a column, empty by default', () => {
    const { result } = setup({ columnFilters: [{ id: 'name', value: ['Ada'] }] });
    expect(result.current.committedFilterKeys(cols[0])).toEqual(['Ada']);
    expect(result.current.committedFilterKeys(cols[1])).toEqual([]);
  });

  it('commits a filter: state, page reset, emission, scroll and onChange rows', () => {
    const scrollTo = vi.fn();
    const { result, setColumnFilters, setPaginationStateValue, emitStateChange, onChange, rows } =
      setup({ scrollRef: { current: { scrollTo } as never } });
    result.current.commitFilter(cols[0], ['Ada', 'Di']);
    expect(setColumnFilters).toHaveBeenCalledWith([{ id: 'name', value: ['Ada', 'Di'] }]);
    const updater = setPaginationStateValue.mock.calls[0][0] as (p: object) => object;
    expect(updater({ pageIndex: 3, pageSize: 5 })).toEqual({ pageIndex: 0, pageSize: 5 });
    expect(emitStateChange).toHaveBeenCalledWith({
      filters: [{ id: 'name', value: ['Ada', 'Di'] }],
      pagination: { pageIndex: 0, pageSize: 5 },
    });
    expect(scrollTo).toHaveBeenCalled();
    const [state, filters, sorter, extra] = onChange.mock.calls[0];
    expect(state).toEqual({ current: 1, pageSize: 5, total: 3 });
    expect(filters).toEqual({ name: ['Ada', 'Di'] });
    expect(sorter).toEqual([]);
    expect(extra.action).toBe('filter');
    expect(extra.currentDataSource).toEqual([people[0], people[3]]);
    expect(extra.currentRows).toEqual([rows[0].row, rows[3].row]);
  });

  it('removes the column filter when committed with no values, keeping others', () => {
    const { result, setColumnFilters, onChange } = setup({
      columnFilters: [
        { id: 'name', value: ['Ada'] },
        { id: 'age', value: [36] },
      ],
    });
    result.current.commitFilter(cols[0], []);
    expect(setColumnFilters).toHaveBeenCalledWith([{ id: 'age', value: [36] }]);
    expect(onChange.mock.calls[0][1]).toEqual({ age: [36], name: null });
  });

  it('does nothing when the values are unchanged', () => {
    const { result, setColumnFilters, onChange } = setup({
      columnFilters: [{ id: 'name', value: ['Ada'] }],
    });
    result.current.commitFilter(cols[0], ['Ada']);
    expect(setColumnFilters).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('works without an onChange prop', () => {
    const { result, setColumnFilters } = setup({ onChange: undefined });
    result.current.commitFilter(cols[1], [36]);
    expect(setColumnFilters).toHaveBeenCalledWith([{ id: 'age', value: [36] }]);
  });
});

describe('useTableHandlers expansion', () => {
  type Expandable = NonNullable<TableProps<Person>['expandable']>;

  it('expands a collapsed row and notifies every listener', () => {
    const onExpand = vi.fn();
    const onExpandedRowsChange = vi.fn();
    const expandable: Expandable = { onExpand, onExpandedRowsChange };
    const { result, rows, setExpanded, onStateChange } = setup({
      expanded: { b: true },
      expandable,
    });
    result.current.toggleExpanded(rows[0]);
    expect(setExpanded).toHaveBeenCalledWith({ b: true, a: true });
    expect(onExpand).toHaveBeenCalledWith(true, people[0], rows[0].row);
    expect(onExpandedRowsChange).toHaveBeenCalledWith(['b', 'a']);
    expect(onStateChange).toHaveBeenCalledWith({
      sorting: [{ id: 'age', desc: false }],
      filters: [],
      expanded: { b: true, a: true },
      pagination: { pageIndex: 3, pageSize: 5 },
      rowSelection: { a: true },
    });
  });

  it('collapses an expanded row and omits it from the expanded list', () => {
    const onExpand = vi.fn();
    const onExpandedRowsChange = vi.fn();
    const { result, rows, setExpanded } = setup({
      expanded: { a: true, b: true },
      expandable: { onExpand, onExpandedRowsChange },
    });
    result.current.toggleExpanded(rows[0]);
    expect(setExpanded).toHaveBeenCalledWith({ a: false, b: true });
    expect(onExpand).toHaveBeenCalledWith(false, people[0], rows[0].row);
    expect(onExpandedRowsChange).toHaveBeenCalledWith(['b']);
  });

  it('collapsing one row while everything is expanded expands the rest explicitly', () => {
    const { result, rows, setExpanded } = setup({ expanded: true });
    result.current.toggleExpanded(rows[1]);
    expect(setExpanded).toHaveBeenCalledWith({ a: true, c: true, d: true });
  });

  it('leaves state to the owner when expandedRowKeys controls it, but still notifies', () => {
    const onExpand = vi.fn();
    const { result, rows, setExpanded, onStateChange } = setup({
      expandable: { expandedRowKeys: [], onExpand },
    });
    result.current.toggleExpanded(rows[2]);
    expect(setExpanded).not.toHaveBeenCalled();
    expect(onExpand).toHaveBeenCalledWith(true, people[2], rows[2].row);
    expect(onStateChange).toHaveBeenCalled();
  });

  it('works with no expandable config or state listener', () => {
    const { result, rows, setExpanded } = setup({ onStateChange: undefined });
    expect(() => result.current.toggleExpanded(rows[0])).not.toThrow();
    expect(setExpanded).toHaveBeenCalledWith({ a: true });
  });
});
