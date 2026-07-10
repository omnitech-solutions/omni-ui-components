import * as React from 'react';
import type { SortingState } from '@tanstack/react-table';
import { hasControlledSorter, initialSortingState, sortingFromColumnSortOrders } from '../../internal';
import type { TableColumn, TableProps } from '../../Table.types';

export function useSortingState<TRecord, TRowData>(
  columns: TableColumn<TRecord, TRowData>[],
  propsState: TableProps<TRecord, TRowData>['state'],
  defaultStateSorting: SortingState | undefined,
) {
  const [sorting, setSorting] = React.useState<SortingState>(() => initialSortingState(columns, propsState?.sorting, defaultStateSorting));

  React.useEffect(() => {
    if (propsState && Object.prototype.hasOwnProperty.call(propsState, 'sorting')) return;
    if (!hasControlledSorter(columns)) return;
    setSorting(sortingFromColumnSortOrders(columns, 'controlled'));
  }, [columns, propsState]);

  return { sorting, setSorting };
}
