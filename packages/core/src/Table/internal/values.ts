import * as React from 'react';
import type { TableColumn, TableDataRow, TableKey, TableProps, TableRowDataType } from '../Table.types';

export const EMPTY_RECORD = {} as never;

export const pathValue = (source: unknown, path?: string | string[] | number | symbol): unknown => {
  if (!path || source == null) return undefined;
  const parts = Array.isArray(path) ? path : String(path).split('.');
  return parts.reduce<unknown>((cursor, part) => {
    if (cursor == null || typeof cursor !== 'object') return undefined;
    return (cursor as Record<string, unknown>)[String(part)];
  }, source);
};

export const resolveRowKey = <TRecord>(record: TRecord, index: number, rowKey?: TableProps<TRecord>['rowKey']): TableKey => {
  if (typeof rowKey === 'function') return rowKey(record, index);
  if (rowKey) return (pathValue(record, String(rowKey)) as TableKey) ?? index;
  return (pathValue(record, 'key') as TableKey) ?? (pathValue(record, 'id') as TableKey) ?? index;
};

export const isRecordLike = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const firstPresent = (...values: unknown[]): unknown => values.find((value) => value !== null && value !== undefined && value !== '');

export const parseSortableNumber = (value: unknown): number | null => {
  const candidate = isRecordLike(value) ? firstPresent(value.amount, value.number, value.value, value.text) : value;
  if (typeof candidate === 'number') return Number.isFinite(candidate) ? candidate : null;
  if (typeof candidate !== 'string') return null;
  const normalized = candidate.replace(/[^0-9+-.]/g, '');
  if (!normalized || normalized === '-' || normalized === '.' || normalized === '-.') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseSortableDate = (value: unknown): number | null => {
  const candidate = isRecordLike(value) ? firstPresent(value.date, value.value, value.text) : value;
  if (candidate instanceof Date) return Number.isNaN(candidate.getTime()) ? null : candidate.getTime();
  if (typeof candidate !== 'string' && typeof candidate !== 'number') return null;
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
};

export const textSortableValue = (value: unknown): unknown => {
  if (value == null || React.isValidElement(value) || value instanceof Date) return value;
  if (!isRecordLike(value)) return value;
  return firstPresent(value.text, value.label, value.name, value.title, value.value) ?? value;
};

export const normalizedCellValue = (value: unknown, valueType?: TableRowDataType | string): unknown => {
  switch (valueType) {
    case 'money':
    case 'number':
      return parseSortableNumber(value) ?? textSortableValue(value);
    case 'date':
      return parseSortableDate(value) ?? textSortableValue(value);
    case 'string':
    case 'link':
    case 'file':
    case 'avatar':
    case 'actions':
    case 'icon':
      return textSortableValue(value);
    default:
      return parseSortableNumber(value) ?? parseSortableDate(value) ?? textSortableValue(value);
  }
};

export const rawCellValue = <TRecord, TRowData>(record: TRecord, row: TableDataRow<TRecord, TRowData>, column: TableColumn<TRecord, TRowData>): unknown => {
  const override = row.cells?.[column.key];
  if (override && 'value' in override) return override.value;
  return pathValue(record, column.dataIndex as string | string[] | undefined);
};

export const cellValue = <TRecord, TRowData>(record: TRecord, row: TableDataRow<TRecord, TRowData>, column: TableColumn<TRecord, TRowData>): unknown =>
  normalizedCellValue(rawCellValue(record, row, column), column.valueType ?? row.cells?.[column.key]?.kind);
