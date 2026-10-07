import '@testing-library/jest-dom';
import { act, render, renderHook } from '@testing-library/react';

import {
  alignStyle,
  allResponsiveScreens,
  appearanceStyle,
  componentTitle,
  currentResponsiveScreens,
  DefaultSortIcon,
  editableColumnConfig,
  editableRenderer,
  editableRowConfig,
  filterVisibleColumns,
  isEllipsisEnabled,
  isResponsiveColumnVisible,
  leafColumns,
  leafCount,
  normalizeEditableInputValue,
  px,
  resolveClassNames,
  resolvedCellEditableConfig,
  resolveStyles,
  sameFilterValues,
  shouldShowEllipsisTitle,
  sortDescFromOrder,
  sorterPriority,
  sortOrderFromTanStack,
  tableEditableConfig,
  useResponsiveScreens,
  visibleLeafColumns,
} from '../../src/Table/internal';
import { getDefaultTableRegistry } from '../../src/Table/Table.registry';
import type { TableColumn, TableProps } from '../../src/Table/Table.types';

type Rec = Record<string, unknown>;
const col = (key: string, extra: Partial<TableColumn<Rec>> = {}): TableColumn<Rec> => ({
  key,
  ...extra,
});

describe('column helpers', () => {
  const grouped: TableColumn<Rec>[] = [
    col('a'),
    { key: 'g', children: [col('b'), { key: 'g2', children: [col('c')] }] },
  ];

  it('flattens nested columns to leaves and counts leaves per column', () => {
    expect(leafColumns(grouped).map((c) => c.key)).toEqual(['a', 'b', 'c']);
    expect(leafCount(grouped[1])).toBe(2);
    expect(leafCount(grouped[0])).toBe(1);
  });

  it('sameFilterValues compares order-sensitively and treats undefined as empty', () => {
    expect(sameFilterValues(['a', 1], ['a', 1])).toBe(true);
    expect(sameFilterValues(['a', 'b'], ['b', 'a'])).toBe(false);
    expect(sameFilterValues(undefined, [])).toBe(true);
    expect(sameFilterValues(['a'], [])).toBe(false);
  });

  it('hides columns by hidden flag, visibility map and responsive breakpoints, then applies order', () => {
    const columns = [
      col('a'),
      col('b', { hidden: true }),
      col('c'),
      col('d', { responsive: ['lg'] }),
      col('e'),
    ];
    const screens = { sm: true, md: true, lg: false, xl: false };
    expect(visibleLeafColumns(columns, {}, [], screens).map((c) => c.key)).toEqual(['a', 'c', 'e']);
    expect(visibleLeafColumns(columns, { c: false }, [], screens).map((c) => c.key)).toEqual([
      'a',
      'e',
    ]);
    expect(
      visibleLeafColumns(columns, {}, ['e', 'ghost', 'a'], { ...screens, lg: true }).map(
        (c) => c.key,
      ),
    ).toEqual(['e', 'a', 'c', 'd']);
  });

  it('filterVisibleColumns prunes groups whose children are all hidden', () => {
    const columns: TableColumn<Rec>[] = [
      { key: 'g1', children: [col('x', { hidden: true }), col('y', { hidden: true })] },
      { key: 'g2', children: [col('z'), col('w', { hidden: true })] },
      col('solo'),
    ];
    const visible = filterVisibleColumns(columns, {}, allResponsiveScreens());
    expect(visible.map((c) => c.key)).toEqual(['g2', 'solo']);
    expect(visible[0].children?.map((c) => c.key)).toEqual(['z']);
  });

  it('ellipsis helpers: enabled by truthy value, title unless showTitle is false', () => {
    expect(isEllipsisEnabled(col('a'))).toBe(false);
    expect(isEllipsisEnabled(col('a', { ellipsis: true }))).toBe(true);
    expect(shouldShowEllipsisTitle(col('a', { ellipsis: true }))).toBe(true);
    expect(shouldShowEllipsisTitle(col('a', { ellipsis: {} }))).toBe(true);
    expect(shouldShowEllipsisTitle(col('a', { ellipsis: { showTitle: false } }))).toBe(false);
    expect(shouldShowEllipsisTitle(col('a'))).toBe(false);
    expect(componentTitle('t')).toBe('t');
    expect(componentTitle(5)).toBe('5');
    expect(componentTitle(<b />)).toBeUndefined();
  });

  it('sorter helpers translate between TanStack and antd orders', () => {
    expect(sortOrderFromTanStack(undefined)).toBeNull();
    expect(sortOrderFromTanStack(true)).toBe('descend');
    expect(sortOrderFromTanStack(false)).toBe('ascend');
    expect(sortDescFromOrder('ascend')).toBe(false);
    expect(sortDescFromOrder('descend')).toBe(true);
    expect(sortDescFromOrder(null)).toBeUndefined();
    expect(sorterPriority(col('a', { sorter: { multiple: 2 } }))).toBe(2);
    expect(sorterPriority(col('a', { sorter: true }))).toBe(false);
    expect(sorterPriority(col('a', { sorter: { compare: () => 0 } }))).toBe(false);
    expect(sorterPriority(undefined)).toBe(false);
  });
});

describe('responsive screens', () => {
  const originalMatchMedia = window.matchMedia;
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  const installMatchMedia = (minWidth: number) => {
    const listeners = new Set<() => void>();
    let width = minWidth;
    window.matchMedia = ((query: string) => {
      const need = Number(/min-width: (\d+)px/.exec(query)?.[1]);
      return {
        get matches() {
          return width >= need;
        },
        media: query,
        addEventListener: (_: string, fn: () => void) => listeners.add(fn),
        removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
      } as unknown as MediaQueryList;
    }) as typeof window.matchMedia;
    return {
      listeners,
      resize: (next: number) => {
        width = next;
        listeners.forEach((fn) => fn());
      },
    };
  };

  it('reports every breakpoint as active when matchMedia is unavailable', () => {
    // @ts-expect-error simulate an environment without matchMedia
    window.matchMedia = undefined;
    expect(currentResponsiveScreens()).toEqual({ sm: true, md: true, lg: true, xl: true });
  });

  it('evaluates each min-width query and keeps the hook in sync with media changes, unsubscribing on unmount', () => {
    const media = installMatchMedia(800);
    expect(currentResponsiveScreens()).toEqual({ sm: true, md: true, lg: false, xl: false });
    const { result, unmount } = renderHook(() => useResponsiveScreens());
    expect(result.current).toEqual({ sm: true, md: true, lg: false, xl: false });
    expect(media.listeners.size).toBeGreaterThan(0);
    act(() => media.resize(1300));
    expect(result.current).toEqual({ sm: true, md: true, lg: true, xl: true });
    unmount();
    expect(media.listeners.size).toBe(0);
  });

  it('a column with no responsive list is always visible; otherwise any matching breakpoint shows it', () => {
    const screens = { sm: true, md: false };
    expect(isResponsiveColumnVisible(col('a'), screens)).toBe(true);
    expect(isResponsiveColumnVisible(col('a', { responsive: [] }), screens)).toBe(true);
    expect(isResponsiveColumnVisible(col('a', { responsive: ['md', 'sm'] }), screens)).toBe(true);
    expect(isResponsiveColumnVisible(col('a', { responsive: ['md'] }), screens)).toBe(false);
  });
});

describe('appearance helpers', () => {
  it('px/alignStyle only emit values that were given', () => {
    expect(px(4)).toBe('4px');
    expect(px(0)).toBe('0px');
    expect(px()).toBeUndefined();
    expect(alignStyle('right')).toEqual({ textAlign: 'right' });
    expect(alignStyle()).toEqual({});
  });

  it('maps appearance options to css variables and box spacing', () => {
    expect(appearanceStyle()).toEqual({});
    const style = appearanceStyle({
      headerFill: '#eee',
      borderColor: '#111',
      textSize: 13,
      background: '#fff',
      blockBorder: { radius: 6 },
      padding: { top: 1, left: 2 },
      margin: { bottom: 3 },
    }) as Record<string, unknown>;
    expect(style['--bui-table-header-bg']).toBe('#eee');
    expect(style['--bui-table-border']).toBe('#111');
    expect(style['--bui-table-cell-font-size-md']).toBe('13px');
    expect(style['--bui-table-bg']).toBe('#fff');
    expect(style['--bui-table-row-striped-bg']).toBe('color-mix(in srgb, #fff 92%, black 8%)');
    expect(style['--bui-table-radius']).toBe('6px');
    expect(style.paddingTop).toBe('1px');
    expect(style.paddingLeft).toBe('2px');
    expect(style.paddingRight).toBeUndefined();
    expect(style.marginBottom).toBe('3px');
  });

  it('resolves classNames and styles from objects or from a function of the props', () => {
    const base = { columns: [] } as TableProps<Rec>;
    expect(resolveClassNames(base)).toEqual({});
    expect(resolveClassNames({ ...base, classNames: { root: 'r' } })).toEqual({ root: 'r' });
    const fn = vi.fn(({ props }: { props: TableProps<Rec> }) => ({
      title: props.bordered ? 'bordered' : 'plain',
    }));
    expect(resolveClassNames({ ...base, bordered: true, classNames: fn })).toEqual({
      title: 'bordered',
    });
    expect(resolveStyles({ ...base, styles: { root: { color: 'red' } } })).toEqual({
      root: { color: 'red' },
    });
    expect(resolveStyles({ ...base, styles: () => ({ footer: { margin: 1 } }) })).toEqual({
      footer: { margin: 1 },
    });
    expect(resolveStyles(base)).toEqual({});
  });

  it('DefaultSortIcon exposes the order and draws one arrow when sorted, a pair when not', () => {
    const { container, rerender } = render(<DefaultSortIcon order={null} />);
    expect(container.querySelector('svg')).toHaveAttribute('data-sort-order', 'none');
    expect(container.querySelectorAll('path')).toHaveLength(2);
    rerender(<DefaultSortIcon order="ascend" />);
    expect(container.querySelector('svg')).toHaveAttribute('data-sort-order', 'ascend');
    expect(container.querySelectorAll('path')).toHaveLength(1);
    const up = container.querySelector('path')?.getAttribute('d');
    rerender(<DefaultSortIcon order="descend" />);
    expect(container.querySelectorAll('path')).toHaveLength(1);
    expect(container.querySelector('path')?.getAttribute('d')).not.toBe(up);
  });
});

describe('editable helpers', () => {
  it('normalises editable shorthands into configs', () => {
    expect(editableColumnConfig(undefined)).toBeNull();
    expect(editableColumnConfig(false)).toBeNull();
    expect(editableColumnConfig(true)).toEqual({ mode: 'cell' });
    expect(editableColumnConfig({ mode: 'row' })).toEqual({ mode: 'row' });
    expect(editableRowConfig(false)).toBeNull();
    expect(editableRowConfig(true)).toEqual({ mode: 'row' });
    const rowCfg = { mode: 'row' as const, onSave: vi.fn() };
    expect(editableRowConfig(rowCfg)).toBe(rowCfg);
    expect(tableEditableConfig(undefined)).toBeNull();
    expect(tableEditableConfig(true)).toEqual({
      headerColumns: true,
      bodyRows: true,
      appendRowOnTab: true,
      controls: true,
    });
    const custom = { bodyRows: false };
    expect(tableEditableConfig(custom)).toBe(custom);
  });

  it('cell override beats column config; editable:false on the cell disables it', () => {
    const editableCol = col('a', { editable: { mode: 'row', validate: () => null } });
    expect(resolvedCellEditableConfig(undefined, col('a'))).toBeNull();
    expect(resolvedCellEditableConfig({ editable: false }, editableCol)).toBeNull();
    expect(resolvedCellEditableConfig({ editable: true }, col('a'))).toEqual({
      mode: 'cell',
      source: 'cell',
      cellConfig: {},
    });
    const cellCfg = { validate: () => 'bad' };
    expect(resolvedCellEditableConfig({ editable: cellCfg }, editableCol)).toMatchObject({
      source: 'cell',
      cellConfig: cellCfg,
    });
    expect(resolvedCellEditableConfig(undefined, editableCol)).toMatchObject({
      mode: 'row',
      source: 'column',
    });
  });

  it('turns null and undefined into an empty input string and stringifies the rest', () => {
    expect(normalizeEditableInputValue(null)).toBe('');
    expect(normalizeEditableInputValue(undefined)).toBe('');
    expect(normalizeEditableInputValue(0)).toBe('0');
    expect(normalizeEditableInputValue('x')).toBe('x');
  });

  it('picks an editor in order: cell renderEditor, column renderEditor, registry by kind, registry by valueType', () => {
    const registry = getDefaultTableRegistry<Rec>();
    const cellEd = vi.fn();
    const colEd = vi.fn();
    const kindEd = vi.fn();
    const typeEd = vi.fn();
    registry.editors = { custom: kindEd, number: typeEd, text: typeEd };
    const column = col('a', { valueType: 'number' });
    const config = (extra: object) => ({
      mode: 'cell' as const,
      source: 'column' as const,
      ...extra,
    });
    expect(
      editableRenderer(
        registry,
        column,
        undefined,
        config({
          cellConfig: { renderEditor: cellEd },
          columnConfig: { mode: 'cell', renderEditor: colEd },
        }),
      ),
    ).toBe(cellEd);
    expect(
      editableRenderer(
        registry,
        column,
        undefined,
        config({ columnConfig: { mode: 'cell', renderEditor: colEd } }),
      ),
    ).toBe(colEd);
    expect(editableRenderer(registry, column, { kind: 'custom' }, config({}))).toBe(kindEd);
    expect(editableRenderer(registry, column, undefined, config({}))).toBe(typeEd);
    expect(
      editableRenderer(registry, col('b', { valueType: 'string' }), undefined, config({})),
    ).toBe(typeEd);
    expect(editableRenderer(registry, col('c'), undefined, config({}))).toBeUndefined();
  });
});
