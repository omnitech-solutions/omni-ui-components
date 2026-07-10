/**
 * Row / column extension controls.
 *
 * Owns the small "+" affordances (bottom-center for adding a row, right-edge
 * for adding a column) and the default row/column factories used when the
 * consumer doesn't wire their own `onAppend`.
 */

import * as React from 'react';
import { Plus } from 'lucide-react';

import type { TableColumn, TableDataRow, TableExtendableConfig, TableExtendableSide } from './Table.types';

export interface ResolvedExtendable<TRecord, TRowData> {
  rows: TableExtendableSide<TRecord, TRowData, TableDataRow<TRecord, TRowData>> | null;
  columns: TableExtendableSide<TRecord, TRowData, TableColumn<TRecord, TRowData>> | null;
  controls: boolean;
}

export function resolveExtendable<TRecord, TRowData>(
  extendable: boolean | TableExtendableConfig<TRecord, TRowData> | undefined,
): ResolvedExtendable<TRecord, TRowData> {
  if (!extendable) return { rows: null, columns: null, controls: false };
  if (extendable === true) return { rows: {}, columns: {}, controls: true };
  const sideOrNull = <T,>(side: boolean | T | undefined): T | null => (side === false || side === undefined ? null : side === true ? ({} as T) : side);
  return {
    rows: sideOrNull(extendable.rows),
    columns: sideOrNull(extendable.columns),
    controls: extendable.controls !== false,
  };
}

/** Build an empty appended row using the current column set. */
export function makeEmptyRow<TRecord, TRowData>(columns: TableColumn<TRecord, TRowData>[], nextKey: string): TableDataRow<TRecord, TRowData> {
  const cells: Record<string, { value: unknown }> = {};
  columns.forEach((col) => {
    cells[col.key] = { value: '' };
  });
  return { key: nextKey, cells } as TableDataRow<TRecord, TRowData>;
}

/** Build an empty appended column with an auto-generated key/title. */
export function makeEmptyColumn<TRecord, TRowData>(existing: TableColumn<TRecord, TRowData>[]): TableColumn<TRecord, TRowData> {
  const usedKeys = new Set(existing.map((col) => String(col.key)));
  let index = existing.length + 1;
  while (usedKeys.has(`column-${index}`)) index += 1;
  return {
    key: `column-${index}`,
    title: `Column ${index}`,
    dataIndex: `column_${index}`,
  };
}

interface ControlProps {
  label: string;
  onClick: () => void;
  testId?: string;
  className?: string;
}

export const AppendControlButton: React.FC<ControlProps> = ({ label, onClick, testId, className }) => (
  <button type="button" aria-label={label} className={`bui-table-append-control ${className ?? ''}`} onClick={onClick} data-testid={testId}>
    <Plus size={12} aria-hidden />
  </button>
);
