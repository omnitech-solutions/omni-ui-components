import { renderHook } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TableProvider, useTable, type TableContextShape } from '../../../src/Table/hooks/useTable';
import { useTableContextValue } from '../../../src/Table/hooks/useTableContextValue';

const shape = (overrides: Partial<TableContextShape> = {}): TableContextShape =>
  ({
    table: {},
    props: {},
    registry: {},
    testIdPrefix: 'tbl',
    mergedColumns: [],
    mergedLeafColumns: [],
    renderedLeafColumns: [],
    resolvedRows: [],
    rowByKey: new Map(),
    rowDataTypeMap: {},
    classMap: {},
    styleMap: {},
    rootEditableConfig: null,
    expanded: {},
    editingCell: null,
    editingRowKey: null,
    editValues: {},
    editErrors: {},
    internalCellValues: {},
    sorting: [],
    columnSizing: {},
    columnPinning: {},
    tableSortDirections: ['ascend', 'descend'],
    applySortingChange: vi.fn(),
    moveColumnByKeyboard: vi.fn(),
    moveRowByKeyboard: vi.fn(),
    ...overrides,
  }) as unknown as TableContextShape;

describe('useTable', () => {
  it('throws a clear error outside a Table render tree', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useTable())).toThrow(
      'useTable must be called from inside a <Table> render tree',
    );
    spy.mockRestore();
  });

  it('returns the value published by the provider', () => {
    const value = shape();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TableProvider value={value}>{children}</TableProvider>
    );
    const { result } = renderHook(() => useTable(), { wrapper });
    expect(result.current).toBe(value);
    expect(result.current.testIdPrefix).toBe('tbl');
  });
});

describe('useTableContextValue', () => {
  it('passes every field through unchanged', () => {
    const input = shape({ testIdPrefix: 'x', sorting: [{ id: 'a', desc: true }] });
    const { result } = renderHook(() => useTableContextValue(input));
    expect(result.current).toEqual(input);
    expect(result.current.applySortingChange).toBe(input.applySortingChange);
  });

  it('keeps the same object while inputs are referentially equal', () => {
    const input = shape();
    const { result, rerender } = renderHook(
      (current: TableContextShape) => useTableContextValue(current),
      { initialProps: input },
    );
    const first = result.current;
    rerender({ ...input });
    expect(result.current).toBe(first);
  });

  it('produces a new object when a tracked input changes', () => {
    const input = shape();
    const { result, rerender } = renderHook(
      (current: TableContextShape) => useTableContextValue(current),
      { initialProps: input },
    );
    const first = result.current;
    rerender({ ...input, editingRowKey: 'a' });
    expect(result.current).not.toBe(first);
    expect(result.current.editingRowKey).toBe('a');
  });
});
