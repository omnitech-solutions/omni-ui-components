import * as React from 'react';
import type { ColumnOrderState, ColumnPinningState, ColumnSizingState, VisibilityState } from '@tanstack/react-table';
import type { TableProps } from '../../Table.types';

export function useColumnLayoutState<TRecord, TRowData>(
  propsState: TableProps<TRecord, TRowData>['state'],
  defaultState: TableProps<TRecord, TRowData>['defaultState'],
) {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(defaultState?.columnVisibility ?? propsState?.columnVisibility ?? {});
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(defaultState?.columnOrder ?? propsState?.columnOrder ?? []);
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>(defaultState?.columnSizing ?? propsState?.columnSizing ?? {});
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>(defaultState?.columnPinning ?? propsState?.columnPinning ?? {});

  return {
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
    columnSizing,
    setColumnSizing,
    columnPinning,
    setColumnPinning,
  };
}
