import * as React from 'react';
import type { TableColumn, TableProps } from '../../Table.types';
import { useColumnLayoutState } from './useColumnLayoutState';
import { useEditingState } from './useEditingState';
import { useExpandedState } from './useExpandedState';
import { useFilterState } from './useFilterState';
import { usePaginationState } from './usePaginationState';
import { useRowOrderState } from './useRowOrderState';
import { useSelectionState } from './useSelectionState';
import { useSortingState } from './useSortingState';

// Owns every piece of Table state and its prop-sync effects. Returned as
// a flat bag so TableImpl destructures without threading the slice hooks
// through every callback.
export function useTableState<TRecord, TRowData>(rawProps: TableProps<TRecord, TRowData>, columns: TableColumn<TRecord, TRowData>[]) {
  const sortingSlice = useSortingState(columns, rawProps.state, rawProps.defaultState?.sorting);
  const filterSlice = useFilterState(columns, rawProps.defaultState?.filters ?? rawProps.state?.filters);
  const expandedSlice = useExpandedState(rawProps.state, rawProps.defaultState?.expanded, rawProps.expandable);
  const columnLayoutSlice = useColumnLayoutState(rawProps.state, rawProps.defaultState);
  const paginationSlice = usePaginationState(rawProps);
  const selectionSlice = useSelectionState(rawProps.rowSelection);
  const editingSlice = useEditingState();
  const rowOrderSlice = useRowOrderState();

  // Sync props.state (controlled) → local state whenever the controlled
  // prop identity changes. Each key is written independently so a partial
  // controlled state leaves the rest uncontrolled.
  const { setSorting } = sortingSlice;
  const { setColumnFilters } = filterSlice;
  const { setExpanded } = expandedSlice;
  const { setPaginationStateValue } = paginationSlice;
  const { setTanStackRowSelection } = selectionSlice;
  const { setColumnVisibility, setColumnOrder, setColumnSizing, setColumnPinning } = columnLayoutSlice;
  const propsState = rawProps.state;

  React.useEffect(() => {
    if (propsState && Object.prototype.hasOwnProperty.call(propsState, 'sorting')) setSorting(propsState.sorting ?? []);
    if (propsState?.filters) setColumnFilters(propsState.filters);
    if (propsState?.expanded) setExpanded(propsState.expanded);
    if (propsState?.pagination) setPaginationStateValue(propsState.pagination);
    if (propsState?.rowSelection) setTanStackRowSelection(propsState.rowSelection);
    if (propsState?.columnVisibility) setColumnVisibility(propsState.columnVisibility);
    if (propsState?.columnOrder) setColumnOrder(propsState.columnOrder);
    if (propsState?.columnSizing) setColumnSizing(propsState.columnSizing);
    if (propsState?.columnPinning) setColumnPinning(propsState.columnPinning);
    // Setters are stable and every read of `propsState` covers every slice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsState]);

  return {
    ...sortingSlice,
    ...filterSlice,
    ...expandedSlice,
    ...columnLayoutSlice,
    ...paginationSlice,
    ...selectionSlice,
    ...editingSlice,
    ...rowOrderSlice,
  };
}
