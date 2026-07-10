import type {
  TableCellOverride,
  TableColumn,
  TableDataRow,
  TableEditableCellConfig,
  TableEditableColumnConfig,
  TableEditableConfig,
  TableEditableRowConfig,
  TableProps,
  TableRegistry,
} from '../Table.types';

export type ResolvedCellEditable<TRecord, TRowData = unknown> = {
  mode: 'cell' | 'row';
  source: 'cell' | 'column';
  columnConfig?: TableEditableColumnConfig<TRecord, TRowData>;
  cellConfig?: TableEditableCellConfig<TRecord, TRowData>;
};

export const editableColumnConfig = <TRecord, TRowData>(
  editable: TableColumn<TRecord, TRowData>['editable'],
): TableEditableColumnConfig<TRecord, TRowData> | null => {
  if (!editable) return null;
  return editable === true ? { mode: 'cell' } : editable;
};

export const editableRowConfig = <TRecord, TRowData>(
  editable: TableDataRow<TRecord, TRowData>['editable'],
): TableEditableRowConfig<TRecord, TRowData> | null => {
  if (!editable) return null;
  return editable === true ? { mode: 'row' } : editable;
};

export const resolvedCellEditableConfig = <TRecord, TRowData>(
  override: TableCellOverride<TRecord, TRowData> | undefined,
  col: TableColumn<TRecord, TRowData>,
): ResolvedCellEditable<TRecord, TRowData> | null => {
  if (override?.editable === false) return null;
  if (override?.editable) {
    return {
      mode: 'cell',
      source: 'cell',
      cellConfig: override.editable === true ? {} : override.editable,
    };
  }

  const columnConfig = editableColumnConfig(col.editable);
  if (!columnConfig) return null;
  return { mode: columnConfig.mode, source: 'column', columnConfig };
};

export const normalizeEditableInputValue = (value: unknown): string => (value == null ? '' : String(value));

export const tableEditableConfig = <TRecord, TRowData>(editable: TableProps<TRecord, TRowData>['editable']): TableEditableConfig<TRecord, TRowData> | null => {
  if (!editable) return null;
  return editable === true
    ? {
        headerColumns: true,
        bodyRows: true,
        appendRowOnTab: true,
        controls: true,
      }
    : editable;
};

export const editableRenderer = <TRecord, TRowData>(
  registry: TableRegistry<TRecord, TRowData>,
  column: TableColumn<TRecord, TRowData>,
  override: TableCellOverride<TRecord, TRowData> | undefined,
  editableConfig: ResolvedCellEditable<TRecord, TRowData>,
) => {
  const editorKey = column.valueType === 'string' ? 'text' : column.valueType;
  return (
    editableConfig.cellConfig?.renderEditor ??
    editableConfig.columnConfig?.renderEditor ??
    (override?.kind ? registry.editors[override.kind] : undefined) ??
    (editorKey ? registry.editors[editorKey] : undefined)
  );
};
