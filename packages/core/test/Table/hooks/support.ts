import type { TableColumn, TableDataRow, TableResolvedRow } from '../../../src/Table/Table.types';

export type Person = { id: string; name: string; age: number };

export const people: Person[] = [
  { id: 'a', name: 'Ada', age: 36 },
  { id: 'b', name: 'Bob', age: 41 },
  { id: 'c', name: 'Cy', age: 29 },
  { id: 'd', name: 'Di', age: 52 },
];

export const resolve = <T extends { id: string }>(
  records: T[],
  rowFor: (record: T) => Partial<TableDataRow<T>> = () => ({}),
): TableResolvedRow<T>[] =>
  records.map((record, index) => ({
    key: record.id,
    record,
    index,
    row: { key: record.id, record, ...rowFor(record) },
  }));

export const byKey = <T>(rows: TableResolvedRow<T>[]) =>
  new Map(rows.map((item) => [String(item.key), item]));

export const column = (
  key: string,
  extra: Partial<TableColumn<Person>> = {},
): TableColumn<Person> => ({ key, title: key, dataIndex: key, ...extra }) as TableColumn<Person>;
