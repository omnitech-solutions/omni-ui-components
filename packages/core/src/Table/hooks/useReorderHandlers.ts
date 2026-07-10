import * as React from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { ColumnOrderState } from '@tanstack/react-table';
import type { TableColumn, TableProps, TableResolvedRow } from '../Table.types';

export interface UseReorderHandlersInput<TRecord, TRowData> {
  resolvedRows: TableResolvedRow<TRecord, TRowData>[];
  mergedLeafColumns: TableColumn<TRecord, TRowData>[];
  setRowOrder: React.Dispatch<React.SetStateAction<string[]>>;
  setColumnOrder: React.Dispatch<React.SetStateAction<ColumnOrderState>>;
  emitStateChange: (partial: Partial<NonNullable<TableProps<TRecord, TRowData>['state']>>) => void;
  onRowOrderChange: TableProps<TRecord, TRowData>['onRowOrderChange'];
  onColumnOrderChange: TableProps<TRecord, TRowData>['onColumnOrderChange'];
}

export function useReorderHandlers<TRecord, TRowData>({
  resolvedRows,
  mergedLeafColumns,
  setRowOrder,
  setColumnOrder,
  emitStateChange,
  onRowOrderChange,
  onColumnOrderChange,
}: UseReorderHandlersInput<TRecord, TRowData>) {
  const draggableRows = React.useMemo(() => resolvedRows.filter((item) => item.row.draggable && !item.row.disabled), [resolvedRows]);
  const draggableRowKeys = React.useMemo(() => draggableRows.map((item) => `row:${String(item.key)}`), [draggableRows]);
  const hasDraggableRows = draggableRowKeys.length > 0;
  const draggableColumnKeys = React.useMemo(() => mergedLeafColumns.filter((col) => col.draggable).map((col) => `column:${col.key}`), [mergedLeafColumns]);

  const emitRowOrder = (nextRows: TableResolvedRow<TRecord, TRowData>[]) => {
    const nextKeys = nextRows.map((item) => String(item.key));
    setRowOrder(nextKeys);
    onRowOrderChange?.(
      nextKeys,
      nextRows.map((item) => item.row),
      nextRows.map((item) => item.record),
    );
  };

  const reorderRows = (activeKey: string, overKey: string) => {
    if (activeKey === overKey) return;
    const activeIndex = resolvedRows.findIndex((item) => String(item.key) === activeKey);
    const overIndex = resolvedRows.findIndex((item) => String(item.key) === overKey);
    if (activeIndex < 0 || overIndex < 0) return;
    const activeRow = resolvedRows[activeIndex];
    const overRow = resolvedRows[overIndex];
    if (!activeRow?.row.draggable || activeRow.row.disabled || !overRow?.row.draggable || overRow.row.disabled) return;
    emitRowOrder(arrayMove(resolvedRows, activeIndex, overIndex));
  };

  const moveRowByKeyboard = (rowKey: string, direction: -1 | 1) => {
    const currentIndex = draggableRows.findIndex((item) => String(item.key) === rowKey);
    const nextRow = draggableRows[currentIndex + direction];
    if (!nextRow) return;
    reorderRows(rowKey, String(nextRow.key));
  };

  const emitColumnOrder = (nextOrder: string[]) => {
    setColumnOrder(nextOrder);
    emitStateChange({ columnOrder: nextOrder });
    onColumnOrderChange?.(nextOrder);
  };

  const reorderColumns = (activeKey: string, overKey: string) => {
    if (activeKey === overKey) return;
    const currentOrder = mergedLeafColumns.map((col) => col.key);
    const activeIndex = currentOrder.indexOf(activeKey);
    const overIndex = currentOrder.indexOf(overKey);
    if (activeIndex < 0 || overIndex < 0) return;
    const activeColumn = mergedLeafColumns.find((col) => col.key === activeKey);
    const overColumn = mergedLeafColumns.find((col) => col.key === overKey);
    if (!activeColumn?.draggable || !overColumn?.draggable) return;
    emitColumnOrder(arrayMove(currentOrder, activeIndex, overIndex));
  };

  const moveColumnByKeyboard = (columnKey: string, direction: -1 | 1) => {
    const draggableColumns = mergedLeafColumns.filter((col) => col.draggable);
    const currentIndex = draggableColumns.findIndex((col) => col.key === columnKey);
    const nextColumn = draggableColumns[currentIndex + direction];
    if (!nextColumn) return;
    reorderColumns(columnKey, nextColumn.key);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over?.id == null ? null : String(event.over.id);
    if (!overId || activeId === overId) return;
    if (activeId.startsWith('row:') && overId.startsWith('row:')) reorderRows(activeId.slice(4), overId.slice(4));
    if (activeId.startsWith('column:') && overId.startsWith('column:')) reorderColumns(activeId.slice(7), overId.slice(7));
  };

  return { draggableRows, draggableRowKeys, hasDraggableRows, draggableColumnKeys, moveRowByKeyboard, moveColumnByKeyboard, handleDragEnd };
}
