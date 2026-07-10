import * as React from 'react';
import type { ExpandedState, Table as TanStackTable } from '@tanstack/react-table';
import { expandedKeysFromState, expandedRecord, filtersRecordForColumn, isExpandedKey, rowsForFilters, sameFilterValues } from '../internal';
import type { TableColumn, TableKey, TablePaginationState, TableProps, TableResolvedRow } from '../Table.types';

export interface UseTableHandlersInput<TRecord, TRowData> {
  columnFilters: { id: string; value: unknown }[];
  setColumnFilters: React.Dispatch<React.SetStateAction<{ id: string; value: unknown }[]>>;
  paginationStateValue: { pageIndex: number; pageSize: number };
  setPaginationStateValue: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
  expanded: ExpandedState;
  setExpanded: (next: ExpandedState) => void;
  sorting: unknown;
  tanStackRowSelection: unknown;
  emitStateChange: (partial: Partial<NonNullable<TableProps<TRecord, TRowData>['state']>>) => void;
  onStateChange: TableProps<TRecord, TRowData>['onStateChange'];
  onChange: TableProps<TRecord, TRowData>['onChange'];
  allResolvedRows: TableResolvedRow<TRecord, TRowData>[];
  resolvedRows: TableResolvedRow<TRecord, TRowData>[];
  mergedLeafColumns: TableColumn<TRecord, TRowData>[];
  table: TanStackTable<TableResolvedRow<TRecord, TRowData>>;
  pagination: TableProps<TRecord, TRowData>['pagination'];
  expandable: TableProps<TRecord, TRowData>['expandable'];
  scroll: TableProps<TRecord, TRowData>['scroll'];
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function useTableHandlers<TRecord, TRowData>({
  columnFilters,
  setColumnFilters,
  paginationStateValue,
  setPaginationStateValue,
  expanded,
  setExpanded,
  sorting,
  tanStackRowSelection,
  emitStateChange,
  onStateChange,
  onChange,
  allResolvedRows,
  resolvedRows,
  mergedLeafColumns,
  table,
  pagination,
  expandable,
  scroll,
  scrollRef,
}: UseTableHandlersInput<TRecord, TRowData>) {
  const paginationState = (): TablePaginationState => ({
    current: paginationStateValue.pageIndex + 1,
    pageSize: paginationStateValue.pageSize,
    total: typeof pagination === 'object' && pagination?.total != null ? pagination.total : table.getFilteredRowModel().rows.length,
  });

  function scrollToFirstRow() {
    if (scroll?.scrollToFirstRowOnChange === false) return;
    if (scrollRef.current?.scrollTo) scrollRef.current.scrollTo({ top: 0 });
    else if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }

  const committedFilterKeys = (col: TableColumn<TRecord, TRowData>): TableKey[] =>
    ((columnFilters.find((filter) => filter.id === col.key)?.value as TableKey[] | undefined) ?? []) as TableKey[];

  const commitFilter = React.useCallback(
    (col: TableColumn<TRecord, TRowData>, values: TableKey[]) => {
      const current = ((columnFilters.find((filter) => filter.id === col.key)?.value as TableKey[] | undefined) ?? []) as TableKey[];
      if (sameFilterValues(current, values)) return;
      const next = columnFilters.filter((filter) => filter.id !== col.key);
      if (values.length) next.push({ id: col.key, value: values });
      const nextRows = rowsForFilters(allResolvedRows, mergedLeafColumns, next);
      setColumnFilters(next);
      setPaginationStateValue((prev) => ({ ...prev, pageIndex: 0 }));
      emitStateChange({ filters: next, pagination: { ...paginationStateValue, pageIndex: 0 } });
      scrollToFirstRow();
      onChange?.({ ...paginationState(), current: 1 }, filtersRecordForColumn(next, col), [], {
        currentDataSource: nextRows.map((item) => item.record),
        currentRows: nextRows.map((item) => item.row),
        action: 'filter',
        table,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allResolvedRows, columnFilters, emitStateChange, mergedLeafColumns, onChange, paginationStateValue, setColumnFilters, setPaginationStateValue, table],
  );

  const toggleExpanded = (resolved: TableResolvedRow<TRecord, TRowData>) => {
    const key = String(resolved.key);
    const currentlyExpanded = isExpandedKey(expanded, key);
    const next =
      expanded === true
        ? Object.fromEntries(
            expandedKeysFromState(expanded, resolvedRows)
              .filter((item) => item !== key)
              .map((item) => [item, true]),
          )
        : { ...expandedRecord(expanded), [key]: !currentlyExpanded };
    if (!expandable?.expandedRowKeys) setExpanded(next);
    expandable?.onExpand?.(!currentlyExpanded, resolved.record, resolved.row);
    expandable?.onExpandedRowsChange?.(Object.keys(next).filter((item) => next[item]));
    onStateChange?.({ sorting, filters: columnFilters, expanded: next, pagination: paginationStateValue, rowSelection: tanStackRowSelection } as Parameters<
      NonNullable<typeof onStateChange>
    >[0]);
  };

  return { paginationState, scrollToFirstRow, committedFilterKeys, commitFilter, toggleExpanded };
}
