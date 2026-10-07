import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useReorderHandlers } from '../../../src/Table/hooks/useReorderHandlers';
import { column, people, resolve, type Person } from './support';

const setup = (
  rowFor: Parameters<typeof resolve<Person>>[1] = () => ({ draggable: true }),
  columns = [column('name', { draggable: true }), column('age', { draggable: true }), column('id')],
) => {
  const rows = resolve(people, rowFor);
  const spies = {
    setRowOrder: vi.fn(),
    setColumnOrder: vi.fn(),
    emitStateChange: vi.fn(),
    onRowOrderChange: vi.fn(),
    onColumnOrderChange: vi.fn(),
  };
  const hook = renderHook(() =>
    useReorderHandlers<Person, unknown>({
      resolvedRows: rows,
      mergedLeafColumns: columns,
      ...spies,
    }),
  );
  return { rows, spies, result: hook.result };
};

const dragEnd = (active: string, over: string | null | undefined) =>
  ({
    active: { id: active },
    over: over === undefined ? undefined : over && { id: over },
  }) as never;

describe('useReorderHandlers derived keys', () => {
  it('exposes only rows that are draggable and not disabled, with prefixed keys', () => {
    const { result } = setup((record) => ({
      draggable: record.id !== 'a',
      disabled: record.id === 'b',
    }));
    expect(result.current.draggableRows.map((item) => item.key)).toEqual(['c', 'd']);
    expect(result.current.draggableRowKeys).toEqual(['row:c', 'row:d']);
    expect(result.current.hasDraggableRows).toBe(true);
  });

  it('reports no draggable rows when none qualify', () => {
    const { result } = setup(() => ({}));
    expect(result.current.hasDraggableRows).toBe(false);
    expect(result.current.draggableRowKeys).toEqual([]);
  });

  it('prefixes draggable column keys', () => {
    const { result } = setup();
    expect(result.current.draggableColumnKeys).toEqual(['column:name', 'column:age']);
  });
});

describe('useReorderHandlers row reordering', () => {
  it('moves a row to the over position and reports keys, rows and records', () => {
    const { result, spies, rows } = setup();
    result.current.handleDragEnd(dragEnd('row:a', 'row:c'));
    expect(spies.setRowOrder).toHaveBeenCalledWith(['b', 'c', 'a', 'd']);
    const [keys, dataRows, records] = spies.onRowOrderChange.mock.calls[0];
    expect(keys).toEqual(['b', 'c', 'a', 'd']);
    expect(dataRows[2]).toBe(rows[0].row);
    expect(records[2]).toBe(people[0]);
  });

  it('works without an onRowOrderChange callback', () => {
    const rows = resolve(people, () => ({ draggable: true }));
    const setRowOrder = vi.fn();
    const { result } = renderHook(() =>
      useReorderHandlers<Person, unknown>({
        resolvedRows: rows,
        mergedLeafColumns: [],
        setRowOrder,
        setColumnOrder: vi.fn(),
        emitStateChange: vi.fn(),
        onRowOrderChange: undefined,
        onColumnOrderChange: undefined,
      }),
    );
    result.current.handleDragEnd(dragEnd('row:d', 'row:a'));
    expect(setRowOrder).toHaveBeenCalledWith(['d', 'a', 'b', 'c']);
  });

  it('ignores a drop onto a non-draggable row', () => {
    const { result, spies } = setup((record) => ({ draggable: record.id !== 'c' }));
    result.current.handleDragEnd(dragEnd('row:a', 'row:c'));
    expect(spies.setRowOrder).not.toHaveBeenCalled();
  });

  it('ignores a drag of a disabled row', () => {
    const { result, spies } = setup((record) => ({
      draggable: true,
      disabled: record.id === 'a',
    }));
    result.current.handleDragEnd(dragEnd('row:a', 'row:b'));
    expect(spies.onRowOrderChange).not.toHaveBeenCalled();
  });

  it('ignores unknown keys', () => {
    const { result, spies } = setup();
    result.current.handleDragEnd(dragEnd('row:zzz', 'row:a'));
    result.current.handleDragEnd(dragEnd('row:a', 'row:zzz'));
    expect(spies.setRowOrder).not.toHaveBeenCalled();
  });

  it('ignores drops outside any target or onto itself', () => {
    const { result, spies } = setup();
    result.current.handleDragEnd(dragEnd('row:a', null));
    result.current.handleDragEnd(dragEnd('row:a', undefined));
    result.current.handleDragEnd(dragEnd('row:a', 'row:a'));
    expect(spies.setRowOrder).not.toHaveBeenCalled();
  });

  it('does not mix a row drag with a column target', () => {
    const { result, spies } = setup();
    result.current.handleDragEnd(dragEnd('row:a', 'column:name'));
    result.current.handleDragEnd(dragEnd('column:name', 'row:a'));
    expect(spies.setRowOrder).not.toHaveBeenCalled();
    expect(spies.setColumnOrder).not.toHaveBeenCalled();
  });

  it('moves a row by keyboard among draggable rows only, skipping non-draggable ones', () => {
    const { result, spies } = setup((record) => ({ draggable: record.id !== 'b' }));
    result.current.moveRowByKeyboard('a', 1);
    // b is not draggable, so a swaps with c (the next draggable row).
    expect(spies.setRowOrder).toHaveBeenLastCalledWith(['b', 'c', 'a', 'd']);
  });

  it('moves a row up by keyboard', () => {
    const { result, spies } = setup();
    result.current.moveRowByKeyboard('c', -1);
    expect(spies.setRowOrder).toHaveBeenLastCalledWith(['a', 'c', 'b', 'd']);
  });

  it('does nothing at the edges or for unknown rows', () => {
    const { result, spies } = setup();
    result.current.moveRowByKeyboard('a', -1);
    result.current.moveRowByKeyboard('d', 1);
    result.current.moveRowByKeyboard('nope', 1);
    expect(spies.setRowOrder).not.toHaveBeenCalled();
  });
});

describe('useReorderHandlers column reordering', () => {
  it('reorders columns, mirrors the order into table state and notifies', () => {
    const { result, spies } = setup();
    result.current.handleDragEnd(dragEnd('column:name', 'column:age'));
    expect(spies.setColumnOrder).toHaveBeenCalledWith(['age', 'name', 'id']);
    expect(spies.emitStateChange).toHaveBeenCalledWith({ columnOrder: ['age', 'name', 'id'] });
    expect(spies.onColumnOrderChange).toHaveBeenCalledWith(['age', 'name', 'id']);
  });

  it('works without an onColumnOrderChange callback', () => {
    const columns = [column('name', { draggable: true }), column('age', { draggable: true })];
    const setColumnOrder = vi.fn();
    const { result } = renderHook(() =>
      useReorderHandlers<Person, unknown>({
        resolvedRows: [],
        mergedLeafColumns: columns,
        setRowOrder: vi.fn(),
        setColumnOrder,
        emitStateChange: vi.fn(),
        onRowOrderChange: undefined,
        onColumnOrderChange: undefined,
      }),
    );
    result.current.handleDragEnd(dragEnd('column:age', 'column:name'));
    expect(setColumnOrder).toHaveBeenCalledWith(['age', 'name']);
  });

  it('refuses to move a column onto or off a non-draggable column', () => {
    const { result, spies } = setup();
    result.current.handleDragEnd(dragEnd('column:name', 'column:id'));
    result.current.handleDragEnd(dragEnd('column:id', 'column:name'));
    expect(spies.setColumnOrder).not.toHaveBeenCalled();
  });

  it('ignores unknown column keys', () => {
    const { result, spies } = setup();
    result.current.handleDragEnd(dragEnd('column:ghost', 'column:name'));
    result.current.handleDragEnd(dragEnd('column:name', 'column:ghost'));
    expect(spies.setColumnOrder).not.toHaveBeenCalled();
  });

  it('moves columns by keyboard to the neighbouring draggable column', () => {
    const { result, spies } = setup();
    result.current.moveColumnByKeyboard('name', 1);
    expect(spies.setColumnOrder).toHaveBeenLastCalledWith(['age', 'name', 'id']);
    result.current.moveColumnByKeyboard('age', -1);
    expect(spies.setColumnOrder).toHaveBeenLastCalledWith(['age', 'name', 'id']);
  });

  it('does nothing when keyboard-moving past the ends or an unknown column', () => {
    const { result, spies } = setup();
    result.current.moveColumnByKeyboard('name', -1);
    result.current.moveColumnByKeyboard('age', 1);
    result.current.moveColumnByKeyboard('ghost', 1);
    expect(spies.setColumnOrder).not.toHaveBeenCalled();
  });
});
