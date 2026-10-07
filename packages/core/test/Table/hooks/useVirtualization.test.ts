import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { column, type Person } from './support';

type Item = { index: number };
const virtualizers: { options: Record<string, any> }[] = [];
// Items each virtualizer reports, keyed by axis, so they survive re-renders.
const reported: { rows: Item[]; columns: Item[] } = { rows: [], columns: [] };

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: (options: Record<string, any>) => {
    const instance = {
      options,
      getVirtualItems: () => (options.horizontal ? reported.columns : reported.rows),
    };
    virtualizers.push(instance);
    return instance;
  },
}));

const { useVirtualization } = await import('../../../src/Table/hooks/useVirtualization');

type Input = Parameters<typeof useVirtualization<Person, unknown>>[0];

const rows = ['r0', 'r1', 'r2', 'r3'].map((id) => ({ id })) as never[];
const cols = [column('a'), column('b', { fixed: 'left' }), column('c', { width: 200 }), column('d')];

const run = (overrides: Partial<Input> = {}) =>
  renderHook(() =>
    useVirtualization<Person, unknown>({
      virtual: false,
      visibleRows: rows,
      scrollRef: { current: null },
      mergedLeafColumns: cols,
      columnPinning: {},
      ...overrides,
    }),
  );

const lastRow = () => virtualizers[virtualizers.length - 2];
const lastColumn = () => virtualizers[virtualizers.length - 1];

beforeEach(() => {
  virtualizers.length = 0;
  reported.rows = [];
  reported.columns = [];
});

describe('useVirtualization rows', () => {
  it('renders every row and no virtual items when virtualization is off', () => {
    const { result } = run();
    expect(result.current.enableVirtualRows).toBe(false);
    expect(result.current.virtualItems).toEqual([]);
    expect(result.current.renderRows).toBe(rows);
    expect(lastRow().options).toMatchObject({ count: 4, enabled: false, overscan: 5 });
    expect(lastRow().options.estimateSize()).toBe(44);
  });

  it('enables row virtualization from `true` and renders only the virtual items', () => {
    const { result, rerender } = run({ virtual: true });
    expect(result.current.enableVirtualRows).toBe(true);
    reported.rows = [{ index: 1 }, { index: 3 }];
    rerender();
    expect(result.current.virtualItems).toEqual([{ index: 1 }, { index: 3 }]);
    expect(result.current.renderRows).toEqual([rows[1], rows[3]]);
  });

  it('reads row options from the config object', () => {
    run({ virtual: { rows: true, estimateRowHeight: 60, overscan: 2 } });
    expect(lastRow().options).toMatchObject({ enabled: true, overscan: 2 });
    expect(lastRow().options.estimateSize()).toBe(60);
  });

  it('falls back to default sizes for an object config without them', () => {
    run({ virtual: { rows: true } });
    expect(lastRow().options.estimateSize()).toBe(44);
    expect(lastRow().options.overscan).toBe(5);
  });

  it('does not virtualize rows when the object config omits rows', () => {
    const { result } = run({ virtual: { columns: true } });
    expect(result.current.enableVirtualRows).toBeFalsy();
    expect(result.current.renderRows).toBe(rows);
  });

  it('the scroll element getter reads the live ref', () => {
    const el = document.createElement('div');
    run({ virtual: true, scrollRef: { current: el } });
    expect(lastRow().options.getScrollElement()).toBe(el);
  });
});

describe('useVirtualization columns', () => {
  it('renders every column when column virtualization is off', () => {
    const { result } = run();
    expect(result.current.renderedLeafColumns).toBe(cols);
    expect(lastColumn().options).toMatchObject({ horizontal: true, enabled: false });
  });

  it('virtualizes only unpinned columns, sized by width, config estimate or default', () => {
    run({ virtual: { columns: true, estimateColumnWidth: 90 } });
    // b is pinned through `fixed`, so a, c, d remain virtualizable.
    expect(lastColumn().options.count).toBe(3);
    expect(lastColumn().options.enabled).toBe(true);
    expect(lastColumn().options.estimateSize(0)).toBe(90);
    expect(lastColumn().options.estimateSize(1)).toBe(200);
    run({ virtual: { columns: true } });
    expect(lastColumn().options.estimateSize(0)).toBe(120);
  });

  it('keeps pinned columns and the visible window of the rest', () => {
    const { result, rerender } = run({ virtual: { columns: true } });
    reported.columns = [{ index: 2 }];
    rerender();
    // Index 2 among virtualizable columns [a, c, d] is d; b stays because it is pinned.
    expect(result.current.renderedLeafColumns.map((c) => c.key)).toEqual(['b', 'd']);
  });

  it('treats TanStack pinned columns as pinned too', () => {
    const { result, rerender } = run({
      virtual: { columns: true },
      columnPinning: { left: ['a'], right: ['d'] },
    });
    // a and d are pinned through TanStack, b through `fixed`: only c can be virtualized.
    expect(lastColumn().options.count).toBe(1);
    reported.columns = [];
    rerender();
    expect(result.current.renderedLeafColumns.map((c) => c.key)).toEqual(['a', 'b', 'd']);
    reported.columns = [{ index: 0 }];
    rerender();
    expect(result.current.renderedLeafColumns.map((c) => c.key)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('does not virtualize columns for a plain boolean config', () => {
    const { result } = run({ virtual: true });
    expect(result.current.renderedLeafColumns).toBe(cols);
    expect(lastColumn().options.estimateSize(0)).toBe(120);
  });
});
