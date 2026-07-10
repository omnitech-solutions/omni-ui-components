import * as React from 'react';
import type { Table as TanStackTable, ColumnPinningState, ColumnSizingState, ExpandedState, SortingState } from '@tanstack/react-table';
import type { RowDataType } from '../Table.RowData';
import type { TableColumn, TableEditableConfig, TableProps, TableRegistry, TableResolvedRow, TableSemanticDOM, TableSorterResult } from '../Table.types';

// Every derived Table state + plumbing published in one shape. Child
// components read via `useTable()` instead of drilling props. The value
// is memoized in `TableImpl` on the same inputs that already trigger
// its render, so context churn ≡ parent-render churn — no extra renders.
export interface TableContextShape<TRecord = unknown, TRowData = unknown> {
  table: TanStackTable<TableResolvedRow<TRecord, TRowData>>;
  props: TableProps<TRecord, TRowData>;
  registry: TableRegistry<TRecord, TRowData>;
  testIdPrefix: string;
  // Derived column/row snapshots
  mergedColumns: TableColumn<TRecord, TRowData>[];
  mergedLeafColumns: TableColumn<TRecord, TRowData>[];
  renderedLeafColumns: TableColumn<TRecord, TRowData>[];
  resolvedRows: TableResolvedRow<TRecord, TRowData>[];
  rowByKey: Map<string, TableResolvedRow<TRecord, TRowData>>;
  rowDataTypeMap: Record<string, RowDataType>;
  // Style maps resolved from props.classNames / props.styles
  classMap: Partial<Record<TableSemanticDOM, string>>;
  styleMap: Partial<Record<TableSemanticDOM, React.CSSProperties>>;
  // Editable configuration
  rootEditableConfig: TableEditableConfig<TRecord, TRowData> | null;
  expanded: ExpandedState;
  // Editing state (from useTableState.useEditingState)
  editingCell: { rowKey: string; columnKey: string } | null;
  editingRowKey: string | null;
  editValues: Record<string, Record<string, unknown>>;
  editErrors: Record<string, string | null>;
  internalCellValues: Record<string, Record<string, unknown>>;
  // Column layout state needed by HeaderCell / BodyCell
  sorting: SortingState;
  columnSizing: ColumnSizingState;
  columnPinning: ColumnPinningState;
  tableSortDirections: readonly TableSorterResult<unknown>['order'][];
  applySortingChange: (next: SortingState, changedColumn?: TableColumn<TRecord, TRowData>, changedOrder?: TableSorterResult<TRecord>['order']) => void;
  moveColumnByKeyboard: (columnKey: string, direction: -1 | 1) => void;
  moveRowByKeyboard: (rowKey: string, direction: -1 | 1) => void;
}

const TableContext = React.createContext<TableContextShape | null>(null);

export const TableProvider = TableContext.Provider;

export function useTable<TRecord = unknown, TRowData = unknown>(): TableContextShape<TRecord, TRowData> {
  const ctx = React.useContext(TableContext);
  if (!ctx) throw new Error('useTable must be called from inside a <Table> render tree');
  return ctx as TableContextShape<TRecord, TRowData>;
}
