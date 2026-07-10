import * as React from 'react';
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ExpandedState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { cellValue, compareComponent, filtersRecord, hasControlledSorter, sortOrderFromTanStack } from '../internal';
import type { TableColumn, TableProps, TableResolvedRow, TableSorterResult } from '../Table.types';

export interface UseTableInstanceInput<TRecord, TRowData> {
  rawProps: TableProps<TRecord, TRowData>;
  columns: TableColumn<TRecord, TRowData>[];
  mergedLeafColumns: TableColumn<TRecord, TRowData>[];
  resolvedRows: TableResolvedRow<TRecord, TRowData>[];
  dataSource: TRecord[];
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  expanded: ExpandedState;
  paginationStateValue: PaginationState;
  tanStackRowSelection: RowSelectionState;
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
  columnSizing: ColumnSizingState;
  columnPinning: ColumnPinningState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  setExpanded: React.Dispatch<React.SetStateAction<ExpandedState>>;
  setPaginationStateValue: React.Dispatch<React.SetStateAction<PaginationState>>;
  setTanStackRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  setColumnOrder: React.Dispatch<React.SetStateAction<ColumnOrderState>>;
  setColumnSizing: React.Dispatch<React.SetStateAction<ColumnSizingState>>;
  setColumnPinning: React.Dispatch<React.SetStateAction<ColumnPinningState>>;
  emitStateChange: (partial: Partial<NonNullable<TableProps<TRecord, TRowData>['state']>>) => void;
  paginationState: () => import('../Table.types').TablePaginationState;
  scrollToFirstRow: () => void;
}

export function useTableInstance<TRecord, TRowData>(input: UseTableInstanceInput<TRecord, TRowData>) {
  const {
    rawProps,
    columns,
    mergedLeafColumns,
    resolvedRows,
    dataSource,
    sorting,
    columnFilters,
    expanded,
    paginationStateValue,
    tanStackRowSelection,
    columnVisibility,
    columnOrder,
    columnSizing,
    columnPinning,
    setSorting,
    setColumnFilters,
    setExpanded,
    setPaginationStateValue,
    setTanStackRowSelection,
    setColumnVisibility,
    setColumnOrder,
    setColumnSizing,
    setColumnPinning,
    emitStateChange,
    paginationState,
    scrollToFirstRow,
  } = input;
  const { rowSelection, onChange } = rawProps;

  const tanStackColumns = React.useMemo<ColumnDef<TableResolvedRow<TRecord, TRowData>>[]>(
    () =>
      mergedLeafColumns.map((col) => ({
        id: col.key,
        accessorFn: (resolved) => cellValue(resolved.record, resolved.row, col),
        filterFn: col.onFilter
          ? (rowModel, _columnId, filterValue) => {
              const values = Array.isArray(filterValue) ? filterValue : [filterValue];
              if (!values.length || values[0] == null || values[0] === '') return true;
              return values.some((value) => col.onFilter?.(value, rowModel.original.record));
            }
          : 'auto',
        enableSorting: Boolean(col.sorter),
        sortingFn: (() => {
          const sorter = col.sorter;
          const sortOrder = sortOrderFromTanStack(sorting.find((item) => item.id === col.key)?.desc);
          if (typeof sorter === 'function') return (a, b) => sorter(a.original.record, b.original.record, sortOrder);
          if (sorter && typeof sorter === 'object' && sorter.compare) return (a, b) => sorter.compare!(a.original.record, b.original.record, sortOrder);
          if (sorter) return (a, b) => compareComponent(cellValue(a.original.record, a.original.row, col), cellValue(b.original.record, b.original.row, col));
          return 'auto';
        })(),
      })),
    [mergedLeafColumns, sorting],
  );

  const sortingControlled = Boolean(rawProps.state && Object.prototype.hasOwnProperty.call(rawProps.state, 'sorting')) || hasControlledSorter(columns);

  const sorterResultFor = (item: { id: string; desc: boolean }, orderOverride?: TableSorterResult<TRecord>['order']): TableSorterResult<TRecord> => {
    const col = mergedLeafColumns.find((column) => column.key === item.id);
    return {
      columnKey: item.id,
      field: Array.isArray(col?.dataIndex) ? col?.dataIndex.map(String) : col?.dataIndex ? String(col.dataIndex) : undefined,
      order: orderOverride ?? sortOrderFromTanStack(item.desc),
      column: col as TableColumn<TRecord, unknown> | undefined,
    };
  };

  const sorterResultForColumn = (col: TableColumn<TRecord, TRowData>, order: TableSorterResult<TRecord>['order']): TableSorterResult<TRecord> => ({
    columnKey: col.key,
    field: Array.isArray(col.dataIndex) ? col.dataIndex.map(String) : col.dataIndex ? String(col.dataIndex) : undefined,
    order,
    column: col as TableColumn<TRecord, unknown>,
  });

  const sorterPayload = (
    next: SortingState,
    changedColumn?: TableColumn<TRecord, TRowData>,
    changedOrder?: TableSorterResult<TRecord>['order'],
  ): TableSorterResult<TRecord> | TableSorterResult<TRecord>[] => {
    const active = next.map((item) => sorterResultFor(item)).filter((item) => item.order);
    if (active.length > 1) return active;
    if (active.length === 1) return active[0];
    if (changedColumn) return sorterResultForColumn(changedColumn, changedOrder ?? null);
    return [];
  };

  const table = useReactTable({
    data: resolvedRows,
    columns: tanStackColumns,
    state: {
      sorting,
      columnFilters,
      expanded,
      pagination: paginationStateValue,
      rowSelection: tanStackRowSelection,
      columnVisibility,
      columnOrder,
      columnSizing,
      columnPinning,
    },
    getRowId: (resolved) => String(resolved.key),
    getSubRows: (resolved) => resolved.row.children?.map((child, index) => ({ key: child.key, record: child.record ?? ({} as TRecord), row: child, index })),
    enableRowSelection: Boolean(rowSelection),
    enableColumnResizing: true,
    autoResetPageIndex: false,
    onColumnFiltersChange: (updater) => {
      const next = typeof updater === 'function' ? updater(columnFilters) : updater;
      setColumnFilters(next);
      emitStateChange({ filters: next });
    },
    onExpandedChange: (updater) => {
      const next = typeof updater === 'function' ? updater(expanded) : updater;
      setExpanded(next);
      emitStateChange({ expanded: next });
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(paginationStateValue) : updater;
      setPaginationStateValue(next);
      emitStateChange({ pagination: next });
    },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(tanStackRowSelection) : updater;
      setTanStackRowSelection(next);
      emitStateChange({ rowSelection: next });
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      applySortingChange(next);
    },
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === 'function' ? updater(columnVisibility) : updater;
      setColumnVisibility(next);
      emitStateChange({ columnVisibility: next });
    },
    onColumnOrderChange: (updater) => {
      const next = typeof updater === 'function' ? updater(columnOrder) : updater;
      setColumnOrder(next);
      emitStateChange({ columnOrder: next });
    },
    onColumnSizingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(columnSizing) : updater;
      setColumnSizing(next);
      emitStateChange({ columnSizing: next });
    },
    onColumnPinningChange: (updater) => {
      const next = typeof updater === 'function' ? updater(columnPinning) : updater;
      setColumnPinning(next);
      emitStateChange({ columnPinning: next });
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  function applySortingChange(next: SortingState, changedColumn?: TableColumn<TRecord, TRowData>, changedOrder?: TableSorterResult<TRecord>['order']) {
    if (!sortingControlled) setSorting(next);
    emitStateChange({ sorting: next });
    scrollToFirstRow();
    onChange?.(paginationState(), filtersRecord(columnFilters), sorterPayload(next, changedColumn, changedOrder), {
      currentDataSource: dataSource,
      currentRows: resolvedRows.map((r) => r.row),
      action: 'sort',
      table,
    });
  }

  return { table, applySortingChange, sortingControlled };
}
