import * as React from 'react';
import { makeEmptyColumn, makeEmptyRow, resolveExtendable } from '../../Table.append';
import type { TableColumn, TableDataRow, TableProps } from '../../Table.types';

export interface UseAppendControlsInput<TRecord, TRowData> {
  extendable: TableProps<TRecord, TRowData>['extendable'];
  columns: TableColumn<TRecord, TRowData>[];
  rows: TableDataRow<TRecord, TRowData>[] | undefined;
}

// Owns append-affordance state so consumers get the "+" buttons without
// wiring onAppend themselves; falls back to `extendable.onAppend` if set.
export function useAppendControls<TRecord, TRowData>({ extendable, columns, rows }: UseAppendControlsInput<TRecord, TRowData>) {
  const resolvedExtendable = React.useMemo(() => resolveExtendable(extendable), [extendable]);
  const [appendedRows, setAppendedRows] = React.useState<TableDataRow<TRecord, TRowData>[]>([]);
  const [appendedColumns, setAppendedColumns] = React.useState<TableColumn<TRecord, TRowData>[]>([]);
  const appendedRowCounterRef = React.useRef(0);

  const appendRow = React.useCallback(async (): Promise<TableDataRow<TRecord, TRowData>> => {
    const currentColumns = [...columns, ...appendedColumns];
    const currentRows = rows ?? [];
    appendedRowCounterRef.current += 1;
    const nextKey = `row-appended-${appendedRowCounterRef.current}`;
    const custom = resolvedExtendable.rows?.onAppend
      ? await resolvedExtendable.rows.onAppend({ rows: [...currentRows, ...appendedRows], columns: currentColumns })
      : null;
    const appended = (custom ?? makeEmptyRow(currentColumns, nextKey)) as TableDataRow<TRecord, TRowData>;
    setAppendedRows((prev) => [...prev, appended]);
    return appended;
  }, [columns, appendedColumns, rows, resolvedExtendable, appendedRows]);

  const appendColumn = React.useCallback(async () => {
    const currentColumns = [...columns, ...appendedColumns];
    const currentRows = rows ?? [];
    const custom = resolvedExtendable.columns?.onAppend
      ? await resolvedExtendable.columns.onAppend({ rows: [...currentRows, ...appendedRows], columns: currentColumns })
      : null;
    setAppendedColumns((prev) => [...prev, (custom ?? makeEmptyColumn(currentColumns)) as TableColumn<TRecord, TRowData>]);
  }, [columns, appendedColumns, rows, appendedRows, resolvedExtendable]);

  return { resolvedExtendable, appendedRows, appendedColumns, appendRow, appendColumn };
}
