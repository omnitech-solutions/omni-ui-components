import * as React from 'react';
import type { RowSelectionState } from '@tanstack/react-table';
import type { TableKey, TableProps } from '../../Table.types';

export function useSelectionState<TRecord, TRowData>(rowSelection: TableProps<TRecord, TRowData>['rowSelection']) {
  const selectionKeysToState = React.useCallback((keys: TableKey[] | Iterable<TableKey> = []): RowSelectionState => {
    const arr = Array.isArray(keys) ? keys : Array.from(keys ?? []);
    return Object.fromEntries(arr.map((key) => [String(key), true]));
  }, []);

  const [tanStackRowSelection, setTanStackRowSelection] = React.useState<RowSelectionState>(
    selectionKeysToState(rowSelection?.selectedRowKeys ?? rowSelection?.defaultSelectedRowKeys ?? []),
  );
  const preserveSelectedRecordsRef = React.useRef(new Map<string, TRecord>());
  const lastSelectedKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (rowSelection?.selectedRowKeys) setTanStackRowSelection(selectionKeysToState(rowSelection.selectedRowKeys));
  }, [rowSelection?.selectedRowKeys, selectionKeysToState]);

  return {
    tanStackRowSelection,
    setTanStackRowSelection,
    selectionKeysToState,
    preserveSelectedRecordsRef,
    lastSelectedKeyRef,
  };
}
