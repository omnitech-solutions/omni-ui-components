import * as React from 'react';
import type { TableDataRow, TableProps, TableResolvedRow } from '../../Table.types';
import { flattenResolvedRows, normalizeRows, reorderByKeys } from '../rows';

export interface UseResolvedRowsInput<TRecord, TRowData> {
  dataSource: TRecord[];
  rows: TableDataRow<TRecord, TRowData>[] | undefined;
  row: Partial<TableDataRow<TRecord, TRowData>> | undefined;
  rowKey: TableProps<TRecord, TRowData>['rowKey'];
  childrenColumnName: string;
  appendedRows: TableDataRow<TRecord, TRowData>[];
  rowOrder: string[];
}

// Row pipeline: dataSource+rows → normalized → reordered → flattened.
// Exposes intermediate stages so callers avoid recomputing.
export function useResolvedRows<TRecord, TRowData>({
  dataSource,
  rows,
  row,
  rowKey,
  childrenColumnName,
  appendedRows,
  rowOrder,
}: UseResolvedRowsInput<TRecord, TRowData>) {
  const effectiveRows = React.useMemo(() => (rows && appendedRows.length ? [...rows, ...appendedRows] : rows), [rows, appendedRows]);

  const baseResolvedRows = React.useMemo(() => {
    const normalized = normalizeRows(dataSource, effectiveRows, row, rowKey, childrenColumnName);
    // dataSource-only path: append here so normalizeRows's explicit-rows short-circuit doesn't drop base records.
    if (!rows && appendedRows.length) {
      const extras = appendedRows.map((r, index) => ({
        key: r.key,
        record: r.record ?? ({} as TRecord),
        row: { ...(row ?? {}), ...r, record: r.record ?? ({} as TRecord) } as TableDataRow<TRecord, TRowData>,
        index: normalized.length + index,
      }));
      return [...normalized, ...extras];
    }
    return normalized;
  }, [childrenColumnName, dataSource, effectiveRows, row, rowKey, rows, appendedRows]);

  const resolvedRows = React.useMemo(() => reorderByKeys(baseResolvedRows, rowOrder), [baseResolvedRows, rowOrder]);
  const allResolvedRows = React.useMemo<TableResolvedRow<TRecord, TRowData>[]>(() => flattenResolvedRows(resolvedRows), [resolvedRows]);
  const rowByKey = React.useMemo(() => new Map(allResolvedRows.map((item) => [String(item.key), item])), [allResolvedRows]);

  return { effectiveRows, baseResolvedRows, resolvedRows, allResolvedRows, rowByKey };
}
