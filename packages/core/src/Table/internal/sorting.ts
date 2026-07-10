import type { SortingState } from '@tanstack/react-table';
import type { TableColumn, TableSorterResult } from '../Table.types';
import { leafColumns } from './columns';

export const DEFAULT_SORT_DIRECTIONS = ['ascend', 'descend'] as const;

export const sortOrderFromTanStack = (desc: boolean | undefined): TableSorterResult<unknown>['order'] => {
  if (desc == null) return null;
  return desc ? 'descend' : 'ascend';
};

export const sortDescFromOrder = (order: TableSorterResult<unknown>['order']): boolean | undefined => {
  if (order === 'ascend') return false;
  if (order === 'descend') return true;
  return undefined;
};

export const sorterPriority = <TRecord, TRowData>(column?: TableColumn<TRecord, TRowData>): number | false => {
  const sorter = column?.sorter;
  return sorter && typeof sorter === 'object' && typeof sorter.multiple === 'number' ? sorter.multiple : false;
};

export const hasControlledSorter = <TRecord, TRowData>(columns: TableColumn<TRecord, TRowData>[]): boolean =>
  leafColumns(columns).some((column) => column.sortOrder !== undefined);

export const sortingFromColumnSortOrders = <TRecord, TRowData>(columns: TableColumn<TRecord, TRowData>[], source: 'controlled' | 'default'): SortingState => {
  return leafColumns(columns)
    .map((column, index) => {
      const order = source === 'controlled' ? column.sortOrder : column.defaultSortOrder;
      const desc = sortDescFromOrder(order ?? null);
      return desc == null ? null : { id: column.key, desc, priority: sorterPriority(column), index };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const left = a?.priority;
      const right = b?.priority;
      if (typeof left === 'number' && typeof right === 'number' && left !== right) return right - left;
      return (a?.index ?? 0) - (b?.index ?? 0);
    })
    .map((item) => ({ id: item!.id, desc: item!.desc }));
};

export const initialSortingState = <TRecord, TRowData>(
  columns: TableColumn<TRecord, TRowData>[],
  stateSorting?: SortingState,
  defaultStateSorting?: SortingState,
): SortingState => {
  if (stateSorting) return stateSorting;
  const controlled = sortingFromColumnSortOrders(columns, 'controlled');
  if (controlled.length) return controlled;
  if (defaultStateSorting) return defaultStateSorting;
  return sortingFromColumnSortOrders(columns, 'default');
};

export const nextSortOrder = (
  current: TableSorterResult<unknown>['order'],
  directions: readonly TableSorterResult<unknown>['order'][],
): TableSorterResult<unknown>['order'] => {
  if (!current) return directions[0] ?? null;
  const next = directions[directions.indexOf(current) + 1];
  return next ?? null;
};

export const compareComponent = (left: unknown, right: unknown): number => {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  if (left instanceof Date && right instanceof Date) return left.getTime() - right.getTime();
  return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
};
