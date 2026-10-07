import {
  cellValue,
  compareComponent,
  expandedKeysFromState,
  expandedStateFromKeys,
  filterItemMatchesSearch,
  filtersRecord,
  filtersRecordForColumn,
  flattenResolvedRows,
  hasControlledSorter,
  initialColumnFilters,
  initialSortingState,
  isExpandedKey,
  nextSortOrder,
  normalizeRows,
  normalizedCellValue,
  parseSortableDate,
  parseSortableNumber,
  pathValue,
  rawCellValue,
  reorderByKeys,
  resolveRowKey,
  rowsForFilters,
  sortingFromColumnSortOrders,
  textSortableValue,
} from '../../src/Table/internal';
import type { TableColumn, TableDataRow, TableResolvedRow } from '../../src/Table/Table.types';

type Rec = { id?: number; key?: string; name?: string; n?: unknown; nested?: { deep?: number }; children?: Rec[] };

const col = (key: string, extra: Partial<TableColumn<Rec>> = {}): TableColumn<Rec> => ({ key, dataIndex: key, ...extra });
const resolve = (record: Rec, index = 0, row: Partial<TableDataRow<Rec>> = {}): TableResolvedRow<Rec> => ({
  key: record.id ?? index,
  record,
  row: { key: record.id ?? index, record, ...row },
  index,
});

describe('pathValue / resolveRowKey', () => {
  it('walks dotted strings and array paths and stops at non-objects', () => {
    const source = { a: { b: { c: 5 } }, s: 'text' };
    expect(pathValue(source, 'a.b.c')).toBe(5);
    expect(pathValue(source, ['a', 'b'])).toEqual({ c: 5 });
    expect(pathValue(source, 's.length')).toBeUndefined();
    expect(pathValue(source, 'a.x.c')).toBeUndefined();
    expect(pathValue(null, 'a')).toBeUndefined();
    expect(pathValue(source, undefined)).toBeUndefined();
  });

  it('resolves a row key from a function, a named field, key, id, then the index', () => {
    expect(resolveRowKey({ id: 1 }, 3, (_r, i) => `fn-${i}`)).toBe('fn-3');
    expect(resolveRowKey({ sku: 'A' }, 0, 'sku')).toBe('A');
    expect(resolveRowKey({ key: 'k', id: 9 }, 0)).toBe('k');
    expect(resolveRowKey({ id: 9 }, 0)).toBe(9);
    expect(resolveRowKey({}, 4)).toBe(4);
    expect(resolveRowKey({}, 2, 'missing')).toBe(2);
  });
});

describe('sortable value parsing', () => {
  it('parses numbers from numbers, formatted strings and payload objects', () => {
    expect(parseSortableNumber(3)).toBe(3);
    expect(parseSortableNumber('$1,200.50')).toBe(1200.5);
    expect(parseSortableNumber('-4')).toBe(-4);
    expect(parseSortableNumber({ amount: '7' })).toBe(7);
    expect(parseSortableNumber({ text: '8' })).toBe(8);
  });

  it('regression: thousands separators are stripped, not left to make Number() return NaN', () => {
    expect(parseSortableNumber('1,234,567.89')).toBe(1234567.89);
    expect(parseSortableNumber('€ 2,000')).toBe(2000);
  });

  it('rejects non-finite and non-numeric input', () => {
    expect(parseSortableNumber(Number.NaN)).toBeNull();
    expect(parseSortableNumber('abc')).toBeNull();
    expect(parseSortableNumber('-')).toBeNull();
    expect(parseSortableNumber('.')).toBeNull();
    expect(parseSortableNumber('-.')).toBeNull();
    expect(parseSortableNumber(true)).toBeNull();
    expect(parseSortableNumber({})).toBeNull();
    expect(parseSortableNumber('1.2.3')).toBeNull();
  });

  it('parses dates from Date, string, timestamp and payload objects', () => {
    const d = new Date(2024, 0, 2);
    expect(parseSortableDate(d)).toBe(d.getTime());
    expect(parseSortableDate('2024-01-02T00:00:00.000Z')).toBe(Date.UTC(2024, 0, 2));
    expect(parseSortableDate(0)).toBe(0);
    expect(parseSortableDate({ date: '2024-01-02T00:00:00.000Z' })).toBe(Date.UTC(2024, 0, 2));
  });

  it('rejects invalid dates and non-date values', () => {
    expect(parseSortableDate(new Date('x'))).toBeNull();
    expect(parseSortableDate('garbage')).toBeNull();
    expect(parseSortableDate(true)).toBeNull();
    expect(parseSortableDate({})).toBeNull();
  });

  it('regression: a Date value is read as a date, not treated as an empty payload object', () => {
    const d = new Date('2024-05-06T07:08:09.000Z');
    expect(parseSortableDate(d)).toBe(d.getTime());
  });

  it('text sorting unwraps text/label/name/title/value and leaves elements, dates and primitives alone', () => {
    expect(textSortableValue({ label: 'L' })).toBe('L');
    expect(textSortableValue({ name: 'N' })).toBe('N');
    const obj = { x: 1 };
    expect(textSortableValue(obj)).toBe(obj);
    expect(textSortableValue(null)).toBeNull();
    expect(textSortableValue('s')).toBe('s');
    const d = new Date();
    expect(textSortableValue(d)).toBe(d);
  });

  it('normalises by valueType: numbers for money/number, dates for date, text for the rest, guessing when unset', () => {
    expect(normalizedCellValue('$5', 'money')).toBe(5);
    expect(normalizedCellValue('n/a', 'number')).toBe('n/a');
    expect(normalizedCellValue('2024-01-02T00:00:00.000Z', 'date')).toBe(Date.UTC(2024, 0, 2));
    expect(normalizedCellValue('x', 'date')).toBe('x');
    expect(normalizedCellValue({ label: 'Hi' }, 'link')).toBe('Hi');
    expect(normalizedCellValue('12', undefined)).toBe(12);
    expect(normalizedCellValue('2024-01-02T00:00:00.000Z', undefined)).toBe(Date.UTC(2024, 0, 2));
    expect(normalizedCellValue('plain')).toBe('plain');
  });
});

describe('rawCellValue / cellValue', () => {
  it('prefers the cell override value (even undefined) over the record path', () => {
    const record: Rec = { name: 'rec', nested: { deep: 3 } };
    const row: TableDataRow<Rec> = { key: 1, cells: { name: { value: 'override' }, nested: { value: undefined } } };
    expect(rawCellValue(record, row, col('name'))).toBe('override');
    expect(rawCellValue(record, row, col('nested'))).toBeUndefined();
    expect(rawCellValue(record, { key: 1 }, { key: 'd', dataIndex: ['nested', 'deep'] })).toBe(3);
  });

  it('normalises using the column valueType, falling back to the cell kind', () => {
    const record: Rec = { n: '$1,000' };
    expect(cellValue(record, { key: 1 }, col('n', { valueType: 'money' }))).toBe(1000);
    expect(cellValue(record, { key: 1, cells: { n: { kind: 'string' } } }, col('n'))).toBe('$1,000');
  });
});

describe('sorting helpers', () => {
  it('cycles through the allowed directions and ends on null', () => {
    const dirs = ['ascend', 'descend'] as const;
    expect(nextSortOrder(null, dirs)).toBe('ascend');
    expect(nextSortOrder('ascend', dirs)).toBe('descend');
    expect(nextSortOrder('descend', dirs)).toBeNull();
    expect(nextSortOrder(null, [])).toBeNull();
    // a current order the table does not allow restarts the cycle at its first direction
    expect(nextSortOrder('ascend', ['descend'])).toBe('descend');
  });

  it('compares nullish last, numbers numerically, dates by time and strings naturally', () => {
    expect(compareComponent(null, undefined)).toBe(0);
    expect(compareComponent(null, 1)).toBe(1);
    expect(compareComponent(1, null)).toBe(-1);
    expect(compareComponent(2, 10)).toBeLessThan(0);
    expect(compareComponent(new Date(2020, 0, 1), new Date(2021, 0, 1))).toBeLessThan(0);
    expect(['item10', 'item2', 'Item1'].sort(compareComponent)).toEqual(['Item1', 'item2', 'item10']);
  });

  it('derives sorting state from controlled sortOrder first, then defaults, honouring multiple priority', () => {
    const columns = [
      col('a', { defaultSortOrder: 'ascend', sorter: { multiple: 1 } }),
      col('b', { defaultSortOrder: 'descend', sorter: { multiple: 3 } }),
      col('c', { defaultSortOrder: 'ascend' }),
      col('d'),
    ];
    expect(sortingFromColumnSortOrders(columns, 'default')).toEqual([
      { id: 'b', desc: true },
      { id: 'a', desc: false },
      { id: 'c', desc: false },
    ]);
    const controlled = [col('x', { sortOrder: 'descend' }), col('y', { sortOrder: null })];
    expect(sortingFromColumnSortOrders(controlled, 'controlled')).toEqual([{ id: 'x', desc: true }]);
    expect(hasControlledSorter(controlled)).toBe(true);
    expect(hasControlledSorter(columns)).toBe(false);
  });

  it('initial sorting precedence: state > controlled columns > defaultState > column defaults', () => {
    const columns = [col('a', { sortOrder: 'ascend', defaultSortOrder: 'descend' })];
    expect(initialSortingState(columns, [{ id: 's', desc: true }], [{ id: 'd', desc: false }])).toEqual([{ id: 's', desc: true }]);
    expect(initialSortingState(columns, undefined, [{ id: 'd', desc: false }])).toEqual([{ id: 'a', desc: false }]);
    expect(initialSortingState([col('a', { defaultSortOrder: 'descend' })], undefined, [{ id: 'd', desc: false }])).toEqual([{ id: 'd', desc: false }]);
    expect(initialSortingState([col('a', { defaultSortOrder: 'descend' })])).toEqual([{ id: 'a', desc: true }]);
  });
});

describe('filter helpers', () => {
  it('seeds filters from filteredValue, else defaultFilteredValue, skipping empties and nested leaves count', () => {
    const columns = [
      col('a', { filteredValue: ['x'], defaultFilteredValue: ['y'] }),
      col('b', { defaultFilteredValue: ['y'] }),
      col('c', { filteredValue: [] }),
      col('d'),
      { key: 'group', children: [col('e', { defaultFilteredValue: ['z'] })] } as TableColumn<Rec>,
    ];
    expect(initialColumnFilters(columns)).toEqual([
      { id: 'a', value: ['x'] },
      { id: 'b', value: ['y'] },
      { id: 'e', value: ['z'] },
    ]);
    expect(initialColumnFilters(columns, [{ id: 'q', value: ['1'] }])).toEqual([{ id: 'q', value: ['1'] }]);
  });

  it('serialises filters to a record with null for empty and wraps scalars', () => {
    expect(filtersRecord([{ id: 'a', value: ['x'] }, { id: 'b', value: [] }, { id: 'c', value: null }, { id: 'd', value: 'solo' }])).toEqual({
      a: ['x'],
      b: null,
      c: null,
      d: ['solo'],
    });
    expect(filtersRecordForColumn([{ id: 'a', value: ['x'] }], col('z'))).toEqual({ a: ['x'], z: null });
    expect(filtersRecordForColumn([{ id: 'a', value: ['x'] }], col('a'))).toEqual({ a: ['x'] });
  });

  it('filters rows by string-equal cell value, by onFilter, by OR across values and AND across columns', () => {
    const rows = [resolve({ id: 1, name: 'ann', n: 1 }), resolve({ id: 2, name: 'bob', n: 2 }), resolve({ id: 3, name: 'cy', n: 2 })];
    const columns = [col('name'), col('n'), col('custom', { onFilter: (value, record) => record.name?.startsWith(String(value)) ?? false })];
    expect(rowsForFilters(rows, columns, [])).toBe(rows);
    expect(rowsForFilters(rows, columns, [{ id: 'n', value: [2] }]).map((r) => r.key)).toEqual([2, 3]);
    expect(rowsForFilters(rows, columns, [{ id: 'name', value: ['ann', 'cy'] }]).map((r) => r.key)).toEqual([1, 3]);
    expect(rowsForFilters(rows, columns, [{ id: 'n', value: [2] }, { id: 'name', value: ['bob'] }]).map((r) => r.key)).toEqual([2]);
    expect(rowsForFilters(rows, columns, [{ id: 'custom', value: ['c'] }]).map((r) => r.key)).toEqual([3]);
  });

  it('ignores empty filter values and filters for unknown columns', () => {
    const rows = [resolve({ id: 1, name: 'ann' })];
    expect(rowsForFilters(rows, [col('name')], [{ id: 'name', value: [] }])).toEqual(rows);
    expect(rowsForFilters(rows, [col('name')], [{ id: 'name', value: '' }])).toEqual(rows);
    expect(rowsForFilters(rows, [col('name')], [{ id: 'ghost', value: ['x'] }])).toEqual(rows);
    expect(rowsForFilters(rows, [col('name')], [{ id: 'name', value: 'ann' }])).toEqual(rows);
  });

  it('matches filter search text case-insensitively, via custom functions, and not at all when disabled', () => {
    const item = { text: 'Alpha Beta', value: 'ab' };
    expect(filterItemMatchesSearch(item, '', true)).toBe(true);
    expect(filterItemMatchesSearch(item, 'beta', true)).toBe(true);
    expect(filterItemMatchesSearch(item, 'gamma', true)).toBe(false);
    expect(filterItemMatchesSearch(item, 'gamma', undefined)).toBe(true);
    expect(filterItemMatchesSearch(item, 'zzz', (input, f) => f.value === 'ab' && input === 'zzz')).toBe(true);
    expect(filterItemMatchesSearch({ text: undefined as never, value: 'v' }, 'a', true)).toBe(false);
  });
});

describe('row helpers', () => {
  const people: Rec[] = [{ id: 1, name: 'a', children: [{ id: 11, name: 'a1', children: [{ id: 111, name: 'a11' }] }] }, { id: 2, name: 'b' }];

  it('builds tree rows from dataSource using the children column name', () => {
    const rows = normalizeRows(people, undefined, { className: 'base' }, 'id', 'children');
    expect(rows.map((r) => r.key)).toEqual([1, 2]);
    expect(rows[0].row.className).toBe('base');
    expect(rows[0].row.children?.[0].key).toBe(11);
    expect(rows[0].row.children?.[0].children?.[0].key).toBe(111);
    expect(rows[1].row.children).toBeUndefined();
    expect(flattenResolvedRows(rows).map((r) => r.key)).toEqual([1, 11, 111, 2]);
  });

  it('uses explicit rows, dropping hidden ones, taking their record or the dataSource entry by position', () => {
    const rows = normalizeRows(
      people,
      [
        { key: 'x', hidden: true },
        { key: 'y', record: { id: 5 } },
        { key: 'z' },
      ],
      { className: 'base' },
      'id',
      'children',
    );
    expect(rows.map((r) => r.key)).toEqual(['y', 'z']);
    expect(rows[0].record).toEqual({ id: 5 });
    // 'z' sits at filtered index 1 so it pairs with dataSource[1]
    expect(rows[1].record).toBe(people[1]);
    expect(rows[1].row.className).toBe('base');
    const orphan = normalizeRows([], [{ key: 'q' }], undefined, undefined, 'children');
    expect(orphan[0].record).toEqual({});
  });

  it('reorders by keys, appending unlisted rows in their original order and dropping unknown keys', () => {
    const rows = [resolve({ id: 1 }), resolve({ id: 2 }), resolve({ id: 3 })];
    expect(reorderByKeys(rows, [])).toBe(rows);
    expect(reorderByKeys(rows, ['3', 'ghost', '1']).map((r) => r.key)).toEqual([3, 1, 2]);
  });

  it('expanded state helpers round-trip keys and treat true as everything', () => {
    const state = expandedStateFromKeys([1, 'b']);
    expect(state).toEqual({ '1': true, b: true });
    expect(isExpandedKey(state, 1)).toBe(true);
    expect(isExpandedKey(state, 'c')).toBe(false);
    expect(isExpandedKey(true, 'anything')).toBe(true);
    expect(expandedStateFromKeys(new Set([4]))).toEqual({ '4': true });
    expect(expandedStateFromKeys()).toEqual({});
    const rows = normalizeRows(people, undefined, undefined, 'id', 'children');
    expect(expandedKeysFromState({ '1': true, '2': false }, rows)).toEqual(['1']);
    expect(expandedKeysFromState(true, rows)).toEqual(['1', '11', '111', '2']);
  });
});
