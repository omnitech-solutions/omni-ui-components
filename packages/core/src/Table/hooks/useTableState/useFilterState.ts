import * as React from 'react';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { initialColumnFilters, leafColumns } from '../../internal';
import type { TableColumn, TableFilterItem } from '../../Table.types';

export function useFilterState<TRecord, TRowData>(columns: TableColumn<TRecord, TRowData>[], initial: ColumnFiltersState | undefined) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(() => initialColumnFilters(columns, initial));

  // Freeze the initial filter-item list per column so filter dropdowns keep
  // showing every option even after the current filter narrows the dataset.
  const initialFilterItemsRef = React.useRef<Record<string, TableFilterItem[]>>(
    Object.fromEntries(
      leafColumns(columns)
        .filter((col) => col.filters?.length)
        .map((col) => [String(col.key), col.filters ?? []]),
    ),
  );

  React.useEffect(() => {
    const controlledFilters = leafColumns(columns)
      .filter((col) => col.filteredValue !== undefined)
      .map((col) => ({ id: col.key, value: col.filteredValue ?? [] }));
    if (controlledFilters.length) {
      setColumnFilters((current) => {
        const uncontrolled = current.filter((filter) => !controlledFilters.some((item) => item.id === filter.id));
        return [...uncontrolled, ...controlledFilters];
      });
    }
  }, [columns]);

  return { columnFilters, setColumnFilters, initialFilterItemsRef };
}
