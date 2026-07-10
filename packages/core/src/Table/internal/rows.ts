import type { ExpandedState } from '@tanstack/react-table';
import type { TableDataRow, TableKey, TableProps, TableResolvedRow } from '../Table.types';
import { EMPTY_RECORD, pathValue, resolveRowKey } from './values';

export const normalizeRows = <TRecord, TRowData>(
  dataSource: TRecord[],
  explicitRows: TableDataRow<TRecord, TRowData>[] | undefined,
  rowDefaults: Partial<TableDataRow<TRecord, TRowData>> | undefined,
  rowKey: TableProps<TRecord, TRowData>['rowKey'],
  childrenColumnName: string,
): TableResolvedRow<TRecord, TRowData>[] => {
  if (explicitRows?.length) {
    return explicitRows
      .filter((row) => !row.hidden)
      .map((row, index) => {
        const record = row.record ?? dataSource[index] ?? EMPTY_RECORD;
        return {
          key: row.key,
          record,
          row: { ...rowDefaults, ...row, record, children: row.children },
          index,
        };
      });
  }

  return dataSource.map((record, index) => {
    const key = resolveRowKey(record, index, rowKey);
    const childRecords = pathValue(record, childrenColumnName) as TRecord[] | undefined;
    const children = Array.isArray(childRecords)
      ? normalizeRows(childRecords, undefined, rowDefaults, rowKey, childrenColumnName).map((item) => item.row)
      : undefined;
    const row: TableDataRow<TRecord, TRowData> = { ...rowDefaults, key, record, children };
    return { key, record, row, index };
  });
};

export const flattenResolvedRows = <TRecord, TRowData>(rows: TableResolvedRow<TRecord, TRowData>[]): TableResolvedRow<TRecord, TRowData>[] => {
  const flattened: TableResolvedRow<TRecord, TRowData>[] = [];
  const walk = (items: TableResolvedRow<TRecord, TRowData>[]) => {
    items.forEach((item) => {
      flattened.push(item);
      if (item.row.children?.length) {
        walk(
          item.row.children.map((child, index) => ({
            key: child.key,
            record: child.record ?? ({} as TRecord),
            row: child,
            index,
          })),
        );
      }
    });
  };
  walk(rows);
  return flattened;
};

export const resolvedRowsLengthHint = <TRecord, TRowData>(props: TableProps<TRecord, TRowData>): number =>
  Math.max(props.rows?.length ?? props.dataSource?.length ?? 1, 1);

export const expandedStateFromKeys = (keys: TableKey[] | Iterable<TableKey> = []): ExpandedState => {
  const arr = Array.isArray(keys) ? keys : Array.from(keys ?? []);
  return Object.fromEntries(arr.map((key) => [String(key), true]));
};

export const expandedRecord = (expanded: ExpandedState): Record<string, boolean> => (expanded === true ? {} : expanded);

export const isExpandedKey = (expanded: ExpandedState, key: TableKey): boolean => expanded === true || Boolean(expandedRecord(expanded)[String(key)]);

export const expandedKeysFromState = <TRecord, TRowData>(expanded: ExpandedState, rows: TableResolvedRow<TRecord, TRowData>[]): string[] => {
  if (expanded === true) return flattenResolvedRows(rows).map((item) => String(item.key));
  return Object.keys(expanded).filter((key) => expanded[key]);
};

export const reorderByKeys = <TRecord, TRowData>(items: TableResolvedRow<TRecord, TRowData>[], order: string[]): TableResolvedRow<TRecord, TRowData>[] => {
  if (!order.length) return items;
  const byKey = new Map(items.map((item) => [String(item.key), item]));
  const ordered = order.map((key) => byKey.get(key)).filter((item): item is TableResolvedRow<TRecord, TRowData> => Boolean(item));
  const orderedKeys = new Set(ordered.map((item) => String(item.key)));
  return [...ordered, ...items.filter((item) => !orderedKeys.has(String(item.key)))];
};
