import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDerivedColumns } from '../../../src/Table/hooks/useDerivedColumns';
import type { TableColumn } from '../../../src/Table/Table.types';
import { column, type Person, people } from './support';

type Input = Parameters<typeof useDerivedColumns<Person, unknown>>[0];

const run = (overrides: Partial<Input> = {}) =>
  renderHook((input: Input) => useDerivedColumns<Person, unknown>(input), {
    initialProps: {
      columns: [column('name'), column('age')],
      column: undefined,
      appendedColumns: [],
      dataSource: people,
      expandable: undefined,
      columnVisibility: {},
      columnOrder: [],
      ...overrides,
    } as Input,
  });

const keys = (cols: TableColumn<Person>[]) => cols.map((col) => col.key);

describe('useDerivedColumns columns', () => {
  it('returns all columns as leaves in declared order', () => {
    const { result } = run();
    expect(keys(result.current.mergedColumns)).toEqual(['name', 'age']);
    expect(keys(result.current.mergedLeafColumns)).toEqual(['name', 'age']);
  });

  it('appends extra columns after the declared ones', () => {
    const { result } = run({ appendedColumns: [column('extra')] });
    expect(keys(result.current.mergedLeafColumns)).toEqual(['name', 'age', 'extra']);
  });

  it('merges the shared column defaults under each column', () => {
    const { result } = run({
      column: { align: 'right', ellipsis: true },
      columns: [column('name', { align: 'left' }), column('age')],
    });
    const [name, age] = result.current.mergedLeafColumns;
    expect(name.align).toBe('left');
    expect(age.align).toBe('right');
    expect(age.ellipsis).toBe(true);
  });

  it('hides hidden or invisible columns', () => {
    const { result } = run({
      columns: [column('name'), column('age', { hidden: true }), column('id')],
      columnVisibility: { id: false },
    });
    expect(keys(result.current.mergedLeafColumns)).toEqual(['name']);
  });

  it('applies the column order, keeping unlisted columns afterwards', () => {
    const { result } = run({
      columns: [column('name'), column('age'), column('id')],
      columnOrder: ['id', 'ghost', 'name'],
    });
    expect(keys(result.current.mergedLeafColumns)).toEqual(['id', 'name', 'age']);
  });

  it('flattens grouped columns into leaves and drops empty groups', () => {
    const group = column('group', {
      children: [column('name'), column('age')],
    } as Partial<TableColumn<Person>>);
    const emptied = column('empty', { children: [column('id', { hidden: true })] } as Partial<
      TableColumn<Person>
    >);
    const { result } = run({ columns: [group, emptied] });
    expect(keys(result.current.mergedColumns)).toEqual(['group']);
    expect(keys(result.current.mergedLeafColumns)).toEqual(['name', 'age']);
  });

  it('recomputes when visibility changes', () => {
    const view = run();
    view.rerender({
      columns: [column('name'), column('age')],
      column: undefined,
      appendedColumns: [],
      dataSource: people,
      expandable: undefined,
      columnVisibility: { age: false },
      columnOrder: [],
    });
    expect(keys(view.result.current.mergedLeafColumns)).toEqual(['name']);
  });
});

describe('useDerivedColumns tree mode', () => {
  const tree = [{ id: 't', name: 'T', age: 1, children: [{ id: 'c', name: 'C', age: 2 }] }];

  it('uses the children column name, defaulting to children', () => {
    expect(run().result.current.childrenColumnName).toBe('children');
    expect(
      run({ expandable: { childrenColumnName: 'kids' } }).result.current.childrenColumnName,
    ).toBe('kids');
  });

  it('detects nested data as tree mode', () => {
    expect(run({ dataSource: tree }).result.current.treeMode).toBe(true);
    expect(run().result.current.treeMode).toBe(false);
  });

  it('honours a custom children field name', () => {
    const kids = [{ id: 'k', name: 'K', age: 1, kids: [{ id: 'c', name: 'C', age: 2 }] }];
    expect(run({ dataSource: kids }).result.current.treeMode).toBe(false);
    expect(
      run({ dataSource: kids, expandable: { childrenColumnName: 'kids' } }).result.current.treeMode,
    ).toBe(true);
  });

  it('is not tree mode when a custom expanded row render or explicit expand column is used', () => {
    expect(
      run({ dataSource: tree, expandable: { expandedRowRender: () => null } }).result.current
        .treeMode,
    ).toBe(false);
    expect(
      run({ dataSource: tree, expandable: { showExpandColumn: true } }).result.current.treeMode,
    ).toBe(false);
  });
});

describe('useDerivedColumns responsive columns', () => {
  const original = window.matchMedia;
  afterEach(() => {
    window.matchMedia = original;
  });

  it('hides a column whose breakpoint does not match', () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes('640px'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as never;
    const { result } = run({
      columns: [
        column('name'),
        column('age', { responsive: ['lg'] }),
        column('id', { responsive: ['sm', 'lg'] }),
      ],
    });
    expect(result.current.responsiveScreens).toMatchObject({ sm: true, lg: false });
    expect(keys(result.current.mergedLeafColumns)).toEqual(['name', 'id']);
  });

  it('shows every responsive column when matchMedia is unavailable', () => {
    window.matchMedia = undefined as never;
    const { result } = run({ columns: [column('name', { responsive: ['xl'] })] });
    expect(keys(result.current.mergedLeafColumns)).toEqual(['name']);
  });
});
