import * as React from 'react';
import type { ColumnOrderState, VisibilityState } from '@tanstack/react-table';
import { filterVisibleColumns, useResponsiveScreens, visibleLeafColumns } from '../internal';
import { detectTreeMode } from '../Table.tree';
import type { TableColumn, TableProps } from '../Table.types';

export interface UseDerivedColumnsInput<TRecord, TRowData> {
  columns: TableColumn<TRecord, TRowData>[];
  column: Partial<TableColumn<TRecord, TRowData>> | undefined;
  appendedColumns: TableColumn<TRecord, TRowData>[];
  dataSource: TRecord[];
  expandable: TableProps<TRecord, TRowData>['expandable'];
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
}

export function useDerivedColumns<TRecord, TRowData>({
  columns,
  column,
  appendedColumns,
  dataSource,
  expandable,
  columnVisibility,
  columnOrder,
}: UseDerivedColumnsInput<TRecord, TRowData>) {
  const responsiveScreens = useResponsiveScreens();
  const childrenColumnName = expandable?.childrenColumnName ?? 'children';
  const treeMode = React.useMemo(
    () => detectTreeMode(dataSource, childrenColumnName, expandable as TableProps<TRecord, unknown>['expandable']),
    [dataSource, childrenColumnName, expandable],
  );
  const effectiveColumns = React.useMemo(() => (appendedColumns.length ? [...columns, ...appendedColumns] : columns), [columns, appendedColumns]);
  const mergedColumns = React.useMemo(
    () =>
      filterVisibleColumns(
        effectiveColumns.map((col) => ({ ...column, ...col })),
        columnVisibility,
        responsiveScreens,
      ),
    [effectiveColumns, column, columnVisibility, responsiveScreens],
  );
  const mergedLeafColumns = React.useMemo(
    () => visibleLeafColumns(mergedColumns, columnVisibility, columnOrder, responsiveScreens),
    [columnOrder, columnVisibility, mergedColumns, responsiveScreens],
  );
  return { responsiveScreens, childrenColumnName, treeMode, mergedColumns, mergedLeafColumns };
}
