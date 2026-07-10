import type { ColumnOrderState, VisibilityState } from '@tanstack/react-table';
import type { TableColumn, TableKey } from '../Table.types';
import { isResponsiveColumnVisible } from './responsive';

export const leafColumns = <TRecord, TRowData>(columns: TableColumn<TRecord, TRowData>[]): TableColumn<TRecord, TRowData>[] =>
  columns.flatMap((column) => (column.children?.length ? leafColumns(column.children) : [column]));

export const sameFilterValues = (left: TableKey[] = [], right: TableKey[] = []): boolean =>
  left.length === right.length && left.every((item, index) => item === right[index]);

export const leafCount = <TRecord, TRowData>(column: TableColumn<TRecord, TRowData>): number =>
  column.children?.length ? column.children.reduce((count, child) => count + leafCount(child), 0) : 1;

export const visibleLeafColumns = <TRecord, TRowData>(
  columns: TableColumn<TRecord, TRowData>[],
  visibility: VisibilityState,
  order: ColumnOrderState,
  screens: Record<string, boolean>,
): TableColumn<TRecord, TRowData>[] => {
  const visible = leafColumns(columns).filter((col) => !col.hidden && visibility[col.key] !== false && isResponsiveColumnVisible(col, screens));
  if (!order.length) return visible;
  const byKey = new Map(visible.map((col) => [col.key, col]));
  const ordered = order.map((key) => byKey.get(key)).filter(Boolean) as TableColumn<TRecord, TRowData>[];
  return [...ordered, ...visible.filter((col) => !order.includes(col.key))];
};

export const filterVisibleColumns = <TRecord, TRowData>(
  columns: TableColumn<TRecord, TRowData>[],
  visibility: VisibilityState,
  screens: Record<string, boolean>,
): TableColumn<TRecord, TRowData>[] =>
  columns
    .filter((column) => !column.hidden && visibility[column.key] !== false && isResponsiveColumnVisible(column, screens))
    .map((column) => ({
      ...column,
      children: column.children ? filterVisibleColumns(column.children, visibility, screens) : undefined,
    }))
    .filter((column) => !column.children || column.children.length > 0);

export const isEllipsisEnabled = <TRecord, TRowData>(column: TableColumn<TRecord, TRowData>): boolean => Boolean(column.ellipsis);

export const shouldShowEllipsisTitle = <TRecord, TRowData>(column: TableColumn<TRecord, TRowData>): boolean =>
  column.ellipsis === true || (typeof column.ellipsis === 'object' && column.ellipsis.showTitle !== false);

export const componentTitle = (value: unknown): string | undefined => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return undefined;
};
