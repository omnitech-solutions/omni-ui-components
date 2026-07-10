import * as React from 'react';
import type { Row } from '@tanstack/react-table';
import { cellValue, editableRowConfig, rawCellValue, resolvedCellEditableConfig, type ResolvedCellEditable } from '../internal';

export type EditableTarget<TRecord, TRowData> = {
  resolved: TableResolvedRow<TRecord, TRowData>;
  column: TableColumn<TRecord, TRowData>;
  rowConfig: TableEditableRowConfig<TRecord, TRowData> | null;
  editableConfig: ResolvedCellEditable<TRecord, TRowData>;
  value: unknown;
};
import type {
  TableCellOverride,
  TableCellRenderContext,
  TableColumn,
  TableEditableConfig,
  TableEditableRowConfig,
  TableProps,
  TableRegistry,
  TableResolvedRow,
} from '../Table.types';

export interface UseEditableHandlersInput<TRecord, TRowData> {
  registry: TableRegistry<TRecord, TRowData>;
  renderedLeafColumns: TableColumn<TRecord, TRowData>[];
  renderRows: Row<TableResolvedRow<TRecord, TRowData>>[];
  rootEditableConfig: TableEditableConfig<TRecord, TRowData> | null;
  editValues: Record<string, Record<string, unknown>>;
  setEditValues: React.Dispatch<React.SetStateAction<Record<string, Record<string, unknown>>>>;
  setEditErrors: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  setEditingCell: React.Dispatch<React.SetStateAction<{ rowKey: string; columnKey: string } | null>>;
  setEditingRowKey: React.Dispatch<React.SetStateAction<string | null>>;
  setInternalCellValues: React.Dispatch<React.SetStateAction<Record<string, Record<string, unknown>>>>;
  onEdit: TableProps<TRecord, TRowData>['onEdit'];
}

export function useEditableHandlers<TRecord, TRowData>({
  registry,
  renderedLeafColumns,
  renderRows,
  rootEditableConfig,
  editValues,
  setEditValues,
  setEditErrors,
  setEditingCell,
  setEditingRowKey,
  setInternalCellValues,
  onEdit,
}: UseEditableHandlersInput<TRecord, TRowData>) {
  const editableErrorKey = (rowKey: string, columnKey: string) => `${rowKey}:${columnKey}`;

  const rowInitialEditableValues = (
    resolved: TableResolvedRow<TRecord, TRowData>,
    rowConfig: TableEditableRowConfig<TRecord, TRowData> | null,
  ): Record<string, unknown> => {
    const values: Record<string, unknown> = {};
    renderedLeafColumns.forEach((item) => {
      values[item.key] = rawCellValue(resolved.record, resolved.row, item);
    });
    return { ...values, ...(rowConfig?.initialValues?.(resolved.record, resolved.row) ?? {}) };
  };

  const ensureRowEditValues = (rowKey: string, resolved: TableResolvedRow<TRecord, TRowData>, rowConfig: TableEditableRowConfig<TRecord, TRowData> | null) => {
    setEditValues((current) => (current[rowKey] ? current : { ...current, [rowKey]: rowInitialEditableValues(resolved, rowConfig) }));
  };

  const setEditableValue = (rowKey: string, columnKey: string, value: unknown) => {
    setEditValues((current) => ({ ...current, [rowKey]: { ...(current[rowKey] ?? {}), [columnKey]: value } }));
    setEditErrors((current) => ({ ...current, [editableErrorKey(rowKey, columnKey)]: null }));
  };

  const beginCellEdit = (
    resolved: TableResolvedRow<TRecord, TRowData>,
    col: TableColumn<TRecord, TRowData>,
    value: unknown,
    rowConfig: TableEditableRowConfig<TRecord, TRowData> | null,
    editableConfig: ResolvedCellEditable<TRecord, TRowData> | null,
  ) => {
    if (!editableConfig && !rowConfig) return;
    const rowKey = String(resolved.key);
    if (rowConfig) {
      ensureRowEditValues(rowKey, resolved, rowConfig);
      setEditingRowKey(rowKey);
      setEditingCell(null);
      return;
    }
    setEditValues((current) => ({ ...current, [rowKey]: { ...(current[rowKey] ?? {}), [col.key]: value } }));
    setEditingCell({ rowKey, columnKey: col.key });
    setEditingRowKey(null);
    setEditErrors((current) => ({ ...current, [editableErrorKey(rowKey, col.key)]: null }));
  };

  const validateEditableCell = (
    editableConfig: ResolvedCellEditable<TRecord, TRowData>,
    value: unknown,
    ctx: TableCellRenderContext<TRecord, TRowData>,
  ): string | null => {
    if (editableConfig.cellConfig?.validate) return editableConfig.cellConfig.validate(value, ctx);
    if (editableConfig.columnConfig?.validate) return editableConfig.columnConfig.validate(value, ctx.record, ctx.row);
    return null;
  };

  const bodyCellEditableConfig = (
    override: TableCellOverride<TRecord, TRowData> | undefined,
    col: TableColumn<TRecord, TRowData>,
  ): ResolvedCellEditable<TRecord, TRowData> | null => {
    const explicit = resolvedCellEditableConfig(override, col);
    if (explicit) return explicit;
    if (!rootEditableConfig?.bodyRows || override?.editable === false) return null;
    return { mode: 'cell', source: 'column', columnConfig: { mode: 'cell' } };
  };

  const saveCellEdit = async (
    rowKey: string,
    col: TableColumn<TRecord, TRowData>,
    editableConfig: ResolvedCellEditable<TRecord, TRowData>,
    ctx: TableCellRenderContext<TRecord, TRowData>,
    nextValue?: unknown,
  ): Promise<boolean> => {
    const value = nextValue ?? editValues[rowKey]?.[col.key] ?? '';
    const error = validateEditableCell(editableConfig, value, ctx);
    if (error) {
      setEditErrors((current) => ({ ...current, [editableErrorKey(rowKey, col.key)]: error }));
      return false;
    }
    if (editableConfig.cellConfig?.onSave) await editableConfig.cellConfig.onSave(value, ctx);
    else await editableConfig.columnConfig?.onSave?.(value, ctx.record, ctx.row);
    setInternalCellValues((current) => ({ ...current, [rowKey]: { ...(current[rowKey] ?? {}), [col.key]: value } }));
    onEdit?.({ key: col.key, value, record: ctx.record, row: ctx.row, column: col, rowKey });
    setEditingCell((current) => (current?.rowKey === rowKey && current.columnKey === col.key ? null : current));
    setEditErrors((current) => ({ ...current, [editableErrorKey(rowKey, col.key)]: null }));
    return true;
  };

  const editableCellTarget = (currentRowKey: string, currentColumnKey: string, direction: -1 | 1): EditableTarget<TRecord, TRowData> | null => {
    const currentRowIndex = renderRows.findIndex((item) => String(item.original.key) === currentRowKey);
    const currentColumnIndex = renderedLeafColumns.findIndex((item) => item.key === currentColumnKey);
    if (currentRowIndex < 0 || currentColumnIndex < 0 || !renderedLeafColumns.length) return null;

    const totalCells = renderRows.length * renderedLeafColumns.length;
    const startIndex = currentRowIndex * renderedLeafColumns.length + currentColumnIndex;

    for (let index = startIndex + direction; index >= 0 && index < totalCells; index += direction) {
      const row = renderRows[Math.floor(index / renderedLeafColumns.length)]?.original;
      const column = renderedLeafColumns[index % renderedLeafColumns.length];
      if (!row || !column || row.row.disabled) continue;
      const override = row.row.cells?.[column.key];
      const editableConfig = bodyCellEditableConfig(override, column);
      if (!editableConfig || editableConfig.mode !== 'cell') continue;
      return { resolved: row, column, rowConfig: editableRowConfig(row.row.editable), editableConfig, value: cellValue(row.record, row.row, column) };
    }
    return null;
  };

  const firstEditableCellTarget = (resolved: TableResolvedRow<TRecord, TRowData>): EditableTarget<TRecord, TRowData> | null => {
    if (resolved.row.disabled) return null;
    for (const column of renderedLeafColumns) {
      const override = resolved.row.cells?.[column.key];
      const editableConfig = bodyCellEditableConfig(override, column);
      if (!editableConfig || editableConfig.mode !== 'cell') continue;
      return { resolved, column, rowConfig: editableRowConfig(resolved.row.editable), editableConfig, value: cellValue(resolved.record, resolved.row, column) };
    }
    return null;
  };

  const saveRowEdit = async (resolved: TableResolvedRow<TRecord, TRowData>, rowConfig: TableEditableRowConfig<TRecord, TRowData>) => {
    const rowKey = String(resolved.key);
    const values = editValues[rowKey] ?? rowInitialEditableValues(resolved, rowConfig);
    const nextErrors: Record<string, string | null> = {};
    let hasError = false;

    renderedLeafColumns.forEach((col, columnIndex) => {
      const override = resolved.row.cells?.[col.key];
      const editableConfig = resolvedCellEditableConfig(override, col);
      if (!editableConfig || editableConfig.mode !== 'row') return;
      const ctx: TableCellRenderContext<TRecord, TRowData> = {
        record: resolved.record,
        row: resolved.row,
        column: col,
        rowIndex: resolved.index,
        columnIndex,
        registry,
      };
      const error = validateEditableCell(editableConfig, values[col.key], ctx);
      if (error) {
        hasError = true;
        nextErrors[editableErrorKey(rowKey, col.key)] = error;
      }
    });

    if (hasError) {
      setEditErrors((current) => ({ ...current, ...nextErrors }));
      return;
    }
    await rowConfig.onSave?.(values, resolved.record, resolved.row);
    setInternalCellValues((current) => ({ ...current, [rowKey]: { ...(current[rowKey] ?? {}), ...values } }));
    renderedLeafColumns.forEach((col) => {
      if (!(col.key in values)) return;
      onEdit?.({ key: col.key, value: values[col.key], record: resolved.record, row: resolved.row, column: col, rowKey });
    });
    setEditingRowKey((current) => (current === rowKey ? null : current));
  };

  const cancelCellEdit = (rowKey: string, columnKey: string) => {
    setEditingCell((current) => (current?.rowKey === rowKey && current.columnKey === columnKey ? null : current));
    setEditErrors((current) => ({ ...current, [editableErrorKey(rowKey, columnKey)]: null }));
  };

  const cancelRowEdit = (resolved: TableResolvedRow<TRecord, TRowData>, rowConfig: TableEditableRowConfig<TRecord, TRowData>) => {
    const rowKey = String(resolved.key);
    rowConfig.onCancel?.(resolved.record, resolved.row);
    setEditingRowKey((current) => (current === rowKey ? null : current));
    setEditErrors((current) => {
      const next = { ...current };
      renderedLeafColumns.forEach((col) => {
        next[editableErrorKey(rowKey, col.key)] = null;
      });
      return next;
    });
  };

  return {
    editableErrorKey,
    rowInitialEditableValues,
    ensureRowEditValues,
    setEditableValue,
    beginCellEdit,
    validateEditableCell,
    bodyCellEditableConfig,
    saveCellEdit,
    editableCellTarget,
    firstEditableCellTarget,
    saveRowEdit,
    cancelCellEdit,
    cancelRowEdit,
  };
}
