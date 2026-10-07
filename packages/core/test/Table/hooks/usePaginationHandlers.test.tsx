import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { usePaginationHandlers } from '../../../src/Table/hooks/usePaginationHandlers';
import { TableProvider, type TableContextShape } from '../../../src/Table/hooks/useTable';
import { useTableHandlers } from '../../../src/Table/hooks/useTableHandlers';
import { useTableInstance } from '../../../src/Table/hooks/useTableInstance';
import { useTableState } from '../../../src/Table/hooks/useTableState';
import type { TableProps } from '../../../src/Table/Table.types';
import { column, people, resolve, type Person } from './support';

// Full wiring: real state + real TanStack table + the pagination hook under test.
const wired = (props: Partial<TableProps<Person>> = {}, rows: Person[] = people) => {
  const cols = [column('name'), column('age')];
  const resolved = resolve(rows);
  const rawProps = { dataSource: rows, columns: cols, ...props } as TableProps<Person>;
  const emitStateChange = vi.fn();
  const scrollTo = vi.fn();
  const view = renderHook(
    (current: TableProps<Person>) => {
      const state = useTableState<Person, unknown>(current, cols);
      // paginationState/scrollToFirstRow need the table, so build a provisional handler set first.
      const scrollRef = { current: { scrollTo } as unknown as HTMLDivElement };
      const holder: { table?: ReturnType<typeof useTableInstance<Person, unknown>>['table'] } = {};
      const paginationState = () => ({
        current: state.paginationStateValue.pageIndex + 1,
        pageSize: state.paginationStateValue.pageSize,
        total:
          typeof current.pagination === 'object' && current.pagination?.total != null
            ? current.pagination.total
            : holder.table!.getFilteredRowModel().rows.length,
      });
      const scrollToFirstRow = () => scrollRef.current.scrollTo?.({ top: 0 });
      const instance = useTableInstance<Person, unknown>({
        rawProps: current,
        columns: cols,
        mergedLeafColumns: cols,
        resolvedRows: resolved,
        dataSource: rows,
        emitStateChange,
        paginationState,
        scrollToFirstRow,
        ...state,
      });
      holder.table = instance.table;
      const pagination = usePaginationHandlers<Person, unknown>({
        pagination: current.pagination,
        paginationStateValue: state.paginationStateValue,
        setPaginationStateValue: state.setPaginationStateValue,
        table: instance.table,
        paginationState,
        scrollToFirstRow,
        onChange: current.onChange,
        columnFilters: state.columnFilters,
        dataSource: rows,
        resolvedRows: resolved,
        allResolvedRows: resolved,
        emitStateChange,
        classMap: { 'pagination.root': 'pg-root' },
        styleMap: { 'pagination.root': { color: 'red' } },
      });
      return { state, table: instance.table, ...pagination };
    },
    { initialProps: rawProps },
  );
  return { ...view, emitStateChange, scrollTo, resolved, rows };
};

// The rendered fragment wraps one Pagination element; read the props the hook passes to it.
const paginationElement = (node: React.ReactNode) =>
  (node as React.ReactElement<{ children: React.ReactElement<Record<string, never>> }>).props
    .children as React.ReactElement<{
    showSizeChanger?: boolean;
    pageSizeOptions?: number[];
    onPageSizeChange: (size: number) => void;
  }>;

const goToPage = (node: React.ReactNode) =>
  (paginationElement(node) as unknown as { props: { onGoToPage: (page: number) => void } }).props
    .onGoToPage;

const shown = (nodes: React.ReactNode[]) => {
  const ctx = { testIdPrefix: 'tbl' } as unknown as TableContextShape;
  return render(<TableProvider value={ctx}>{nodes}</TableProvider>);
};

describe('usePaginationHandlers off switch', () => {
  it('is off without a pagination prop and stretches one page over all rows', () => {
    const { result } = wired({ pagination: false });
    expect(result.current.paginationEffectivelyOff).toBe(true);
    expect(result.current.state.paginationStateValue).toEqual({ pageIndex: 0, pageSize: 4 });
    expect(result.current.topPagination).toEqual([]);
    expect(result.current.bottomPagination).toEqual([]);
  });

  it('is off when every placement is none', () => {
    const { result } = wired({ pagination: { placement: ['none'] } });
    expect(result.current.paginationEffectivelyOff).toBe(true);
    expect(result.current.bottomPagination).toEqual([]);
  });

  it('stays on when only some placements are none or the list is empty', () => {
    expect(
      wired({ pagination: { placement: ['none', 'bottomEnd'] } }).result.current
        .paginationEffectivelyOff,
    ).toBe(false);
    expect(wired({ pagination: { placement: [] } }).result.current.paginationEffectivelyOff).toBe(
      false,
    );
    expect(wired({ pagination: { pageSize: 2 } }).result.current.paginationEffectivelyOff).toBe(
      false,
    );
  });

  it('never lets the stretched page size drop below one for an empty table', () => {
    const { result } = wired({ pagination: false }, []);
    expect(result.current.state.paginationStateValue.pageSize).toBe(1);
  });
});

describe('usePaginationHandlers placement', () => {
  it('renders a single bottom pagination by default, without a placement suffix', () => {
    const { result } = wired({ pagination: { pageSize: 2 } });
    expect(result.current.topPagination).toHaveLength(0);
    expect(result.current.bottomPagination).toHaveLength(1);
    shown(result.current.bottomPagination);
    expect(screen.getByTestId('tbl-pagination-root')).toBeTruthy();
  });

  it('treats pagination: true as a bottom-end pager and a lone top placement as unsuffixed', () => {
    const plain = wired({ pagination: true as never });
    expect(plain.result.current.bottomPagination).toHaveLength(1);
    const top = wired({ pagination: { pageSize: 2, placement: ['topCenter'] } });
    expect(top.result.current.topPagination).toHaveLength(1);
    expect(top.result.current.bottomPagination).toHaveLength(0);
    shown(top.result.current.topPagination);
    expect(screen.getByTestId('tbl-pagination-root')).toBeTruthy();
  });

  it('suffixes test ids and splits top and bottom when several placements are configured', () => {
    const { result } = wired({ pagination: { pageSize: 2, placement: ['topStart', 'bottomEnd'] } });
    expect(result.current.topPagination).toHaveLength(1);
    expect(result.current.bottomPagination).toHaveLength(1);
    shown([...result.current.topPagination, ...result.current.bottomPagination]);
    expect(screen.getByTestId('tbl-pagination-root-topStart')).toBeTruthy();
    expect(screen.getByTestId('tbl-pagination-root-bottomEnd')).toBeTruthy();
  });

  it('applies the semantic class and style and the disabled flag', () => {
    const { result } = wired({ pagination: { pageSize: 2, disabled: true } });
    shown(result.current.bottomPagination);
    const root = screen.getByTestId('tbl-pagination-root');
    expect(root.className).toContain('pg-root');
    expect(root.style.color).toBe('red');
    expect((screen.getByTestId('tbl-pagination-next') as HTMLButtonElement).disabled).toBe(true);
  });

  it('hides previous and next buttons when showPrevNext is false', () => {
    const { result } = wired({ pagination: { pageSize: 2, showPrevNext: false } });
    shown(result.current.bottomPagination);
    expect(screen.queryByTestId('tbl-pagination-next')).toBeNull();
    expect(screen.queryByTestId('tbl-pagination-prev')).toBeNull();
  });
});

describe('usePaginationHandlers navigation', () => {
  it('goes to a page: moves the table, scrolls, and reports both callbacks', () => {
    const onPageChange = vi.fn();
    const onChange = vi.fn();
    const { result, scrollTo, rows } = wired({
      pagination: { pageSize: 2, onChange: onPageChange },
      onChange,
    });
    shown(result.current.bottomPagination);
    act(() => {
      fireEvent.click(screen.getByTestId('tbl-pagination-item-2'));
    });
    expect(result.current.state.paginationStateValue).toEqual({ pageIndex: 1, pageSize: 2 });
    expect(result.current.table.getState().pagination.pageIndex).toBe(1);
    expect(result.current.table.getRowModel().rows.map((r) => r.original.record.name)).toEqual([
      'Cy',
      'Di',
    ]);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
    expect(onPageChange).toHaveBeenCalledWith(2, 2);
    const [state, filters, sorter, extra] = onChange.mock.calls[0];
    expect(state).toEqual({ current: 2, pageSize: 2, total: 4 });
    expect(filters).toEqual({});
    expect(sorter).toEqual([]);
    expect(extra.action).toBe('paginate');
    expect(extra.currentDataSource).toBe(rows);
  });

  it('shows the requested page after an update from the next button', () => {
    const { result } = wired({ pagination: { pageSize: 2 } });
    const view = shown(result.current.bottomPagination);
    act(() => {
      fireEvent.click(screen.getByTestId('tbl-pagination-next'));
    });
    expect(result.current.state.paginationStateValue.pageIndex).toBe(1);
    view.unmount();
  });

  it('does nothing when pagination is disabled', () => {
    const onChange = vi.fn();
    const { result, scrollTo } = wired({ pagination: { pageSize: 2, disabled: true }, onChange });
    shown(result.current.bottomPagination);
    fireEvent.click(screen.getByTestId('tbl-pagination-item-2'));
    expect(result.current.state.paginationStateValue.pageIndex).toBe(0);
    expect(onChange).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('ignores a page request made while disabled, even if the control still forwards it', () => {
    const onPageChange = vi.fn();
    const { result } = wired({
      pagination: { pageSize: 2, disabled: true, onChange: onPageChange },
    });
    act(() => goToPage(result.current.bottomPagination[0])(2));
    expect(result.current.state.paginationStateValue.pageIndex).toBe(0);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('clamps out-of-range page requests to the first and last page', () => {
    const onPageChange = vi.fn();
    const { result } = wired({ pagination: { pageSize: 2, onChange: onPageChange } });
    act(() => goToPage(result.current.bottomPagination[0])(99));
    expect(result.current.state.paginationStateValue.pageIndex).toBe(1);
    expect(onPageChange).toHaveBeenLastCalledWith(2, 2);
    act(() => goToPage(result.current.bottomPagination[0])(-4));
    expect(result.current.state.paginationStateValue.pageIndex).toBe(0);
    expect(onPageChange).toHaveBeenLastCalledWith(1, 2);
  });

  it('uses the external total for the page count', () => {
    const onPageChange = vi.fn();
    const { result } = wired({ pagination: { pageSize: 2, total: 100, onChange: onPageChange } });
    shown(result.current.bottomPagination);
    act(() => {
      fireEvent.click(screen.getByTestId('tbl-pagination-item-2'));
    });
    expect(onPageChange).toHaveBeenCalledWith(2, 2);
  });

  it('changes the page size: back to page one, callbacks, state emission', () => {
    const onShowSizeChange = vi.fn();
    const onPageChange = vi.fn();
    const { result, scrollTo, emitStateChange } = wired({
      pagination: {
        pageSize: 2,
        current: 2,
        showSizeChanger: true,
        pageSizeOptions: [2, 4],
        onShowSizeChange,
        onChange: onPageChange,
      },
    });
    const control = paginationElement(result.current.bottomPagination[0]);
    expect(control.props.showSizeChanger).toBe(true);
    expect(control.props.pageSizeOptions).toEqual([2, 4]);
    expect(result.current.state.paginationStateValue.pageIndex).toBe(1);
    act(() => control.props.onPageSizeChange(4));
    expect(result.current.state.paginationStateValue).toEqual({ pageIndex: 0, pageSize: 4 });
    expect(result.current.table.getState().pagination.pageSize).toBe(4);
    expect(scrollTo).toHaveBeenCalled();
    expect(onShowSizeChange).toHaveBeenCalledWith(1, 4);
    expect(onPageChange).toHaveBeenCalledWith(1, 4);
    expect(emitStateChange).toHaveBeenCalledWith({ pagination: { pageIndex: 0, pageSize: 4 } });
  });
});
