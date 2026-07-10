import * as React from 'react';
import type { Row } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { TableColumn, TableProps, TableResolvedRow } from '../Table.types';

export interface UseVirtualizationInput<TRecord, TRowData> {
  virtual: TableProps<TRecord, TRowData>['virtual'];
  visibleRows: Row<TableResolvedRow<TRecord, TRowData>>[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  mergedLeafColumns: TableColumn<TRecord, TRowData>[];
  columnPinning: import('@tanstack/react-table').ColumnPinningState;
}

export function useVirtualization<TRecord, TRowData>({
  virtual,
  visibleRows,
  scrollRef,
  mergedLeafColumns,
  columnPinning,
}: UseVirtualizationInput<TRecord, TRowData>) {
  const enableVirtualRows = typeof virtual === 'object' ? virtual.rows : Boolean(virtual);
  const rowVirtualizer = useVirtualizer({
    count: visibleRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => (typeof virtual === 'object' ? (virtual.estimateRowHeight ?? 44) : 44),
    overscan: typeof virtual === 'object' ? (virtual.overscan ?? 5) : 5,
    enabled: Boolean(enableVirtualRows),
  });
  const virtualItems = enableVirtualRows ? rowVirtualizer.getVirtualItems() : [];
  const renderRows = enableVirtualRows ? virtualItems.map((item) => visibleRows[item.index]) : visibleRows;

  const isPinnedLeafColumn = React.useCallback(
    (col: TableColumn<TRecord, TRowData>) => Boolean(col.fixed || columnPinning.left?.includes(col.key) || columnPinning.right?.includes(col.key)),
    [columnPinning.left, columnPinning.right],
  );
  const enableVirtualColumns = typeof virtual === 'object' && Boolean(virtual.columns);
  const virtualizableLeafColumns = React.useMemo(() => mergedLeafColumns.filter((col) => !isPinnedLeafColumn(col)), [isPinnedLeafColumn, mergedLeafColumns]);
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: virtualizableLeafColumns.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => {
      const width = virtualizableLeafColumns[index]?.width;
      return typeof width === 'number' ? width : typeof virtual === 'object' ? (virtual.estimateColumnWidth ?? 120) : 120;
    },
    overscan: typeof virtual === 'object' ? (virtual.overscan ?? 5) : 5,
    enabled: enableVirtualColumns,
  });
  const virtualColumnItems = enableVirtualColumns ? columnVirtualizer.getVirtualItems() : [];
  const virtualColumnIndexes = new Set(virtualColumnItems.map((item) => item.index));
  const renderedLeafColumns = enableVirtualColumns
    ? mergedLeafColumns.filter((col) => isPinnedLeafColumn(col) || virtualColumnIndexes.has(virtualizableLeafColumns.findIndex((item) => item.key === col.key)))
    : mergedLeafColumns;

  return { enableVirtualRows, rowVirtualizer, virtualItems, renderRows, renderedLeafColumns };
}
