import type { ColumnFiltersState } from '@tanstack/react-table';
import type { TableColumn, TableFilterItem, TableKey, TableResolvedRow } from '../Table.types';
import { leafColumns } from './columns';
import { cellValue } from './values';

export type TableFilterSearch = boolean | ((input: string, record: TableFilterItem) => boolean);

export const initialColumnFilters = <TRecord, TRowData>(columns: TableColumn<TRecord, TRowData>[], filters?: ColumnFiltersState): ColumnFiltersState => {
  if (filters) return filters;
  return leafColumns(columns)
    .map((column) => {
      const value = column.filteredValue !== undefined ? column.filteredValue : column.defaultFilteredValue;
      return value && value.length ? { id: column.key, value } : null;
    })
    .filter(Boolean) as ColumnFiltersState;
};

export const filtersRecord = (filters: ColumnFiltersState): Record<string, TableKey[] | null> =>
  Object.fromEntries(
    filters.map((filter) => [
      filter.id,
      Array.isArray(filter.value)
        ? (filter.value as TableKey[]).length
          ? (filter.value as TableKey[])
          : null
        : filter.value == null
          ? null
          : [filter.value as TableKey],
    ]),
  );

export const filtersRecordForColumn = <TRecord, TRowData>(
  filters: ColumnFiltersState,
  col: TableColumn<TRecord, TRowData>,
): Record<string, TableKey[] | null> => ({
  ...filtersRecord(filters),
  [col.key]: (filters.find((filter) => filter.id === col.key)?.value as TableKey[] | undefined) ?? null,
});

export const rowsForFilters = <TRecord, TRowData>(
  rows: TableResolvedRow<TRecord, TRowData>[],
  columns: TableColumn<TRecord, TRowData>[],
  filters: ColumnFiltersState,
): TableResolvedRow<TRecord, TRowData>[] => {
  if (!filters.length) return rows;

  return rows.filter((resolved) =>
    filters.every((filter) => {
      const values = Array.isArray(filter.value) ? (filter.value as TableKey[]) : filter.value == null || filter.value === '' ? [] : [filter.value as TableKey];
      if (!values.length) return true;

      const column = columns.find((item) => item.key === filter.id);
      if (!column) return true;
      if (column.onFilter) return values.some((value) => column.onFilter?.(value, resolved.record));

      const value = cellValue(resolved.record, resolved.row, column);
      return values.some((filterValue) => String(value) === String(filterValue));
    }),
  );
};

export const filterItemMatchesSearch = (filter: TableFilterItem, search: string, filterSearch: TableFilterSearch | undefined): boolean => {
  if (!search || !filterSearch) return true;
  if (typeof filterSearch === 'function') return filterSearch(search, filter);
  return String(filter.text ?? '')
    .toLowerCase()
    .includes(search.toLowerCase());
};
