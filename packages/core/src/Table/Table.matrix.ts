import type { Key } from 'react';

import type { TableCellOverride, TableColumn, TableDataRow } from './Table.types';

export interface TableMatrixColumnFactoryContext {
  index: number;
  key: string;
}

export interface TableMatrixCellFactoryContext {
  rowIndex: number;
  columnIndex: number;
  rowKey: string;
  columnKey: string;
}

export interface CreateTableMatrixOptions<TRecord, TRowData> {
  createColumn: (ctx: TableMatrixColumnFactoryContext) => TableColumn<TRecord, TRowData>;
  createCell: (ctx: TableMatrixCellFactoryContext) => TableCellOverride<TRecord, TRowData>;
}

const indexedKey = (items: Array<{ key: Key }>, prefix: string): string => {
  const used = items.map((item) => Number(String(item.key).replace(`${prefix}-`, ''))).filter((value) => Number.isFinite(value));

  return `${prefix}-${used.length ? Math.max(...used) + 1 : 1}`;
};

export const normalizeTableMatrixCount = (value: number | undefined, fallback: number, min = 1): number => Math.max(min, Math.floor(value ?? fallback));

export const nextTableMatrixColumnKey = <TRecord, TRowData>(columns: TableColumn<TRecord, TRowData>[]): string => indexedKey(columns, 'col');

export const nextTableMatrixRowKey = <TRecord, TRowData>(rows: TableDataRow<TRecord, TRowData>[]): string => indexedKey(rows, 'row');

export const createTableMatrixColumns = <TRecord, TRowData>(
  count: number,
  options: Pick<CreateTableMatrixOptions<TRecord, TRowData>, 'createColumn'>,
): TableColumn<TRecord, TRowData>[] => Array.from({ length: count }, (_, index) => options.createColumn({ index, key: `col-${index + 1}` }));

export const syncTableMatrixRowToColumns = <TRecord, TRowData>(
  row: TableDataRow<TRecord, TRowData>,
  columns: TableColumn<TRecord, TRowData>[],
  createCell: CreateTableMatrixOptions<TRecord, TRowData>['createCell'],
  rowIndex: number,
): TableDataRow<TRecord, TRowData> => ({
  ...row,
  cells: Object.fromEntries(
    columns.map((column, columnIndex) => [
      column.key,
      row.cells?.[column.key] ?? createCell({ rowIndex, columnIndex, rowKey: String(row.key), columnKey: column.key }),
    ]),
  ),
});

export const createTableMatrixRows = <TRecord, TRowData>(
  rowCount: number,
  columns: TableColumn<TRecord, TRowData>[],
  options: Pick<CreateTableMatrixOptions<TRecord, TRowData>, 'createCell'>,
): TableDataRow<TRecord, TRowData>[] =>
  Array.from({ length: rowCount }, (_, rowIndex) => {
    const rowKey = `row-${rowIndex + 1}`;
    return {
      key: rowKey,
      cells: Object.fromEntries(
        columns.map((column, columnIndex) => [column.key, options.createCell({ rowIndex, columnIndex, rowKey, columnKey: column.key })]),
      ),
    };
  });

export const resizeTableMatrixColumns = <TRecord, TRowData>(
  columns: TableColumn<TRecord, TRowData>[],
  rows: TableDataRow<TRecord, TRowData>[],
  count: number,
  options: CreateTableMatrixOptions<TRecord, TRowData>,
): { columns: TableColumn<TRecord, TRowData>[]; rows: TableDataRow<TRecord, TRowData>[] } => {
  let nextColumns = [...columns];

  while (nextColumns.length < count) {
    const key = nextTableMatrixColumnKey(nextColumns);
    nextColumns = [...nextColumns, options.createColumn({ index: nextColumns.length, key })];
  }

  nextColumns = nextColumns.slice(0, count);

  return {
    columns: nextColumns,
    rows: rows.map((row, rowIndex) => syncTableMatrixRowToColumns(row, nextColumns, options.createCell, rowIndex)),
  };
};

export const resizeTableMatrixRows = <TRecord, TRowData>(
  rows: TableDataRow<TRecord, TRowData>[],
  columns: TableColumn<TRecord, TRowData>[],
  count: number,
  options: Pick<CreateTableMatrixOptions<TRecord, TRowData>, 'createCell'>,
): TableDataRow<TRecord, TRowData>[] => {
  let nextRows = [...rows];

  while (nextRows.length < count) {
    const rowKey = nextTableMatrixRowKey(nextRows);
    nextRows = [
      ...nextRows,
      {
        key: rowKey,
        cells: Object.fromEntries(
          columns.map((column, columnIndex) => [column.key, options.createCell({ rowIndex: nextRows.length, columnIndex, rowKey, columnKey: column.key })]),
        ),
      },
    ];
  }

  return nextRows.slice(0, count).map((row, rowIndex) => syncTableMatrixRowToColumns(row, columns, options.createCell, rowIndex));
};
