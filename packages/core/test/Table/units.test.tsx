import '@testing-library/jest-dom';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import type * as React from 'react';
import {
  BUILT_IN_ROW_DATA_TYPES,
  renderCellContent,
  useAppendControls,
  useDragState,
  useLoadingState,
  useResolvedRows,
  useRowDataTypeMap,
} from '../../src/Table/internal';
import { BulkActionsButton } from '../../src/Table/internal/components';
import { SortableHandle, SortableRowHandleCell } from '../../src/Table/internal/dragHandle';
import { AutoFlipDropdown } from '../../src/Table/Table.AutoFlipDropdown';
import {
  AppendControlButton,
  makeEmptyColumn,
  makeEmptyRow,
  resolveExtendable,
} from '../../src/Table/Table.append';
import { getLoadingVariant, resolveLoading } from '../../src/Table/Table.Loading';
import { TableLoadingSkeletonVariant } from '../../src/Table/Table.Loading.Skeleton';
import { TableLoadingSpinnerVariant } from '../../src/Table/Table.Loading.Spinner';
import {
  createTableMatrixColumns,
  createTableMatrixRows,
  nextTableMatrixColumnKey,
  nextTableMatrixRowKey,
  normalizeTableMatrixCount,
  resizeTableMatrixColumns,
  resizeTableMatrixRows,
  syncTableMatrixRowToColumns,
} from '../../src/Table/Table.matrix';
import { createRowDataTypeMap } from '../../src/Table/Table.RowData';
import { RowDataActionsType } from '../../src/Table/Table.RowDataActions';
import { RowDataAvatarType } from '../../src/Table/Table.RowDataAvatar';
import { RowDataDateType } from '../../src/Table/Table.RowDataDate';
import { RowDataFileType } from '../../src/Table/Table.RowDataFile';
import { RowDataIcon, RowDataIconType } from '../../src/Table/Table.RowDataIcon';
import { RowDataLinkType } from '../../src/Table/Table.RowDataLink';
import { RowDataMoneyType } from '../../src/Table/Table.RowDataMoney';
import { RowDataNumberType } from '../../src/Table/Table.RowDataNumber';
import { RowDataTextType } from '../../src/Table/Table.RowDataText';
import { getDefaultTableRegistry } from '../../src/Table/Table.registry';
import { detectTreeMode, TreeExpandToggle } from '../../src/Table/Table.tree';
import type {
  TableCellRenderContext,
  TableColumn,
  TableDataRow,
} from '../../src/Table/Table.types';

type Rec = Record<string, unknown>;

describe('AutoFlipDropdown', () => {
  const rect = (r: Partial<DOMRect>): DOMRect =>
    ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      toJSON: () => ({}),
      ...r,
    }) as DOMRect;

  const mount = (
    trigger: DOMRect,
    dropdown: DOMRect,
    viewport = { w: 1000, h: 800 },
    boundary?: DOMRect,
  ) => {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: viewport.w,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      configurable: true,
      value: viewport.h,
    });
    const spy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      if (this.getAttribute('data-role') === 'trigger') return trigger;
      if (this.getAttribute('data-role') === 'boundary') return boundary ?? rect({});
      return dropdown;
    });
    const view = render(
      <div
        data-role={boundary ? 'boundary' : undefined}
        data-dropdown-boundary={boundary ? '' : undefined}
      >
        <span data-role="trigger">
          <AutoFlipDropdown data-testid="menu" className="menu">
            <p>content</p>
          </AutoFlipDropdown>
        </span>
      </div>,
    );
    return { spy, view, menu: screen.getByTestId('menu') };
  };

  afterEach(() => vi.restoreAllMocks());

  it('portals the content into body, hidden until measured, then visible and anchored under the trigger', () => {
    const { menu, view } = mount(
      rect({ top: 100, bottom: 120, left: 50, right: 90, width: 40, height: 20 }),
      rect({ width: 200, height: 150 }),
    );
    expect(menu.parentElement).toBe(document.body);
    expect(view.container).not.toContainElement(menu);
    expect(menu).toHaveClass('menu');
    expect(menu).toHaveAttribute('data-align-x', 'left');
    expect(menu).toHaveAttribute('data-align-y', 'bottom');
    expect(menu).toHaveStyle({
      position: 'fixed',
      top: '120px',
      left: '50px',
      visibility: 'visible',
    });
  });

  it('flips to the right edge when it would overflow the viewport horizontally', () => {
    const { menu } = mount(
      rect({ top: 10, bottom: 30, left: 900, right: 960, width: 60, height: 20 }),
      rect({ width: 200, height: 100 }),
    );
    expect(menu).toHaveAttribute('data-align-x', 'right');
    // right-aligned: dropdown right edge meets trigger right edge (960 - 200)
    expect(menu).toHaveStyle({ left: '760px' });
  });

  it('flips above the trigger when there is no room below but more above', () => {
    const { menu } = mount(
      rect({ top: 700, bottom: 720, left: 10, right: 50, width: 40, height: 20 }),
      rect({ width: 100, height: 300 }),
    );
    expect(menu).toHaveAttribute('data-align-y', 'top');
    expect(menu).toHaveStyle({ top: '400px' });
  });

  it('stays below when neither side has room but below has more', () => {
    const { menu } = mount(
      rect({ top: 100, bottom: 120, left: 10, right: 50, width: 40, height: 20 }),
      rect({ width: 100, height: 900 }),
      { w: 1000, h: 800 },
    );
    expect(menu).toHaveAttribute('data-align-y', 'bottom');
  });

  it('respects a [data-dropdown-boundary] ancestor instead of the viewport', () => {
    const { menu } = mount(
      rect({ top: 20, bottom: 40, left: 180, right: 220, width: 40, height: 20 }),
      rect({ width: 100, height: 50 }),
      { w: 1000, h: 800 },
      rect({ top: 0, left: 0, right: 250, bottom: 300, width: 250, height: 300 }),
    );
    expect(menu).toHaveAttribute('data-align-x', 'right');
  });

  it('re-measures on window resize and scroll, and stops listening on unmount', () => {
    const { spy, view } = mount(
      rect({ top: 10, bottom: 30, left: 10, right: 50, width: 40, height: 20 }),
      rect({ width: 100, height: 100 }),
    );
    const before = spy.mock.calls.length;
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(spy.mock.calls.length).toBeGreaterThan(before);
    const afterResize = spy.mock.calls.length;
    view.unmount();
    window.dispatchEvent(new Event('resize'));
    expect(spy.mock.calls.length).toBe(afterResize);
  });

  it('merges a caller style over the computed position', () => {
    render(
      <span>
        <AutoFlipDropdown data-testid="styled" style={{ zIndex: 7 }}>
          x
        </AutoFlipDropdown>
      </span>,
    );
    expect(screen.getByTestId('styled')).toHaveStyle({ zIndex: '7', position: 'fixed' });
  });
});

describe('loading resolution', () => {
  it('maps the loading prop to {active, variant, props}', () => {
    expect(resolveLoading(undefined)).toEqual({ active: false, variant: 'skeleton' });
    expect(resolveLoading(false)).toEqual({ active: false, variant: 'skeleton' });
    expect(resolveLoading(true)).toEqual({ active: true, variant: 'skeleton' });
    expect(resolveLoading(true, 'spinner')).toEqual({ active: true, variant: 'spinner' });
    expect(resolveLoading('spinner')).toEqual({ active: true, variant: 'spinner' });
    const props = { variant: 'spinner' as const, text: 'Wait' };
    expect(resolveLoading(props)).toEqual({ active: true, variant: 'spinner', props });
    expect(resolveLoading({ spinning: true })).toEqual({
      active: true,
      variant: 'skeleton',
      props: { spinning: true },
    });
  });

  it('picks the matching variant and falls back to skeleton for an unknown name', () => {
    expect(getLoadingVariant('spinner')).toBe(TableLoadingSpinnerVariant);
    expect(getLoadingVariant('skeleton')).toBe(TableLoadingSkeletonVariant);
    expect(getLoadingVariant('nope' as never)).toBe(TableLoadingSkeletonVariant);
    expect(TableLoadingSkeletonVariant.replacesBody).toBe(true);
    expect(TableLoadingSpinnerVariant.replacesBody).toBe(false);
  });

  it('skeleton renders at least two rows and pads extra cells for utility columns', () => {
    const cols = [{ key: 'a' }, { key: 'b' }] as TableColumn<Rec>[];
    const rows = TableLoadingSkeletonVariant.renderRows!({
      rowCount: 0,
      columnCount: 3,
      columns: cols,
      testIdPrefix: 't',
      Spinner: () => null,
    });
    const { container } = render(
      <table>
        <tbody>{rows}</tbody>
      </table>,
    );
    expect(container.querySelectorAll('tr')).toHaveLength(2);
    expect(container.querySelector('tr')!.querySelectorAll('td')).toHaveLength(3);
    const many = TableLoadingSkeletonVariant.renderRows!({
      rowCount: 5,
      columnCount: 2,
      columns: cols,
      testIdPrefix: 't',
      Spinner: () => null,
    });
    expect((many as unknown[]).length).toBe(5);
  });

  it('spinner overlay renders the Spinner with the supplied props', () => {
    const Spinner = vi.fn(({ text }: { text?: React.ReactNode }) => <span>{text}</span>);
    const overlay = TableLoadingSpinnerVariant.renderOverlay!({
      rowCount: 0,
      columnCount: 1,
      columns: [],
      testIdPrefix: 'tt',
      Spinner,
      props: { text: 'Hold on' },
    });
    render(<div>{overlay}</div>);
    expect(screen.getByTestId('tt-loading')).toHaveTextContent('Hold on');
    const bare = TableLoadingSpinnerVariant.renderOverlay!({
      rowCount: 0,
      columnCount: 1,
      columns: [],
      testIdPrefix: 'u',
      Spinner,
    });
    render(<div>{bare}</div>);
    expect(screen.getByTestId('u-loading')).toBeInTheDocument();
  });

  it('useLoadingState is stable while the loading prop is unchanged', () => {
    const { result, rerender } = renderHook(({ loading }) => useLoadingState(loading), {
      initialProps: { loading: 'spinner' as const },
    });
    const first = result.current;
    rerender({ loading: 'spinner' });
    expect(result.current.state).toBe(first.state);
    expect(result.current.variant).toBe(TableLoadingSpinnerVariant);
  });
});

describe('matrix helpers', () => {
  const options = {
    createColumn: ({ index, key }: { index: number; key: string }) =>
      ({ key, title: `C${index}` }) as TableColumn<Rec>,
    createCell: ({ rowIndex, columnIndex }: { rowIndex: number; columnIndex: number }) => ({
      value: `${rowIndex}:${columnIndex}`,
    }),
  };

  it('counts are floored and clamped to a minimum', () => {
    expect(normalizeTableMatrixCount(undefined, 3)).toBe(3);
    expect(normalizeTableMatrixCount(2.9, 5)).toBe(2);
    expect(normalizeTableMatrixCount(0, 5)).toBe(1);
    expect(normalizeTableMatrixCount(-4, 5, 0)).toBe(0);
  });

  it('next keys continue after the highest existing number', () => {
    expect(nextTableMatrixColumnKey([])).toBe('col-1');
    expect(
      nextTableMatrixColumnKey([
        { key: 'col-1' },
        { key: 'col-7' },
        { key: 'custom' },
      ] as TableColumn<Rec>[]),
    ).toBe('col-8');
    expect(
      nextTableMatrixRowKey([{ key: 'row-2' }, { key: 'row-10' }] as TableDataRow<Rec>[]),
    ).toBe('row-11');
  });

  it('creates columns and rows with a cell for every column', () => {
    const columns = createTableMatrixColumns(2, options);
    expect(columns.map((c) => c.key)).toEqual(['col-1', 'col-2']);
    const rows = createTableMatrixRows(2, columns, options);
    expect(rows.map((r) => r.key)).toEqual(['row-1', 'row-2']);
    expect(rows[1].cells).toEqual({ 'col-1': { value: '1:0' }, 'col-2': { value: '1:1' } });
  });

  it('syncing a row keeps existing cells, creates missing ones and drops cells of removed columns', () => {
    const columns = createTableMatrixColumns(2, options);
    const row = {
      key: 'r',
      cells: { 'col-1': { value: 'keep' }, gone: { value: 'x' } },
    } as TableDataRow<Rec>;
    const synced = syncTableMatrixRowToColumns(row, columns, options.createCell, 4);
    expect(synced.cells).toEqual({ 'col-1': { value: 'keep' }, 'col-2': { value: '4:1' } });
    expect(row.cells).toHaveProperty('gone');
  });

  it('growing columns adds generated keys and fills every row; shrinking drops the tail', () => {
    const columns = createTableMatrixColumns(2, options);
    const rows = createTableMatrixRows(2, columns, options);
    const grown = resizeTableMatrixColumns(columns, rows, 4, options);
    expect(grown.columns.map((c) => c.key)).toEqual(['col-1', 'col-2', 'col-3', 'col-4']);
    expect(Object.keys(grown.rows[0].cells!)).toEqual(['col-1', 'col-2', 'col-3', 'col-4']);
    const shrunk = resizeTableMatrixColumns(grown.columns, grown.rows, 1, options);
    expect(shrunk.columns.map((c) => c.key)).toEqual(['col-1']);
    expect(Object.keys(shrunk.rows[1].cells!)).toEqual(['col-1']);
  });

  it('resizing rows appends new keyed rows or slices, resyncing cells', () => {
    const columns = createTableMatrixColumns(2, options);
    const rows = createTableMatrixRows(2, columns, options);
    const grown = resizeTableMatrixRows(rows, columns, 4, options);
    expect(grown.map((r) => r.key)).toEqual(['row-1', 'row-2', 'row-3', 'row-4']);
    expect(grown[3].cells!['col-2']).toEqual({ value: '3:1' });
    expect(resizeTableMatrixRows(grown, columns, 1, options).map((r) => r.key)).toEqual(['row-1']);
    // columns changed under the rows: cells are re-synced to the new set
    const narrower = resizeTableMatrixRows(rows, columns.slice(0, 1), 2, options);
    expect(Object.keys(narrower[0].cells!)).toEqual(['col-1']);
  });
});

describe('append helpers', () => {
  it('resolves extendable shorthands per side', () => {
    expect(resolveExtendable(undefined)).toEqual({ rows: null, columns: null, controls: false });
    expect(resolveExtendable(false)).toEqual({ rows: null, columns: null, controls: false });
    expect(resolveExtendable(true)).toEqual({ rows: {}, columns: {}, controls: true });
    const onAppend = vi.fn();
    expect(resolveExtendable({ rows: { onAppend }, columns: false, controls: false })).toEqual({
      rows: { onAppend },
      columns: null,
      controls: false,
    });
    expect(resolveExtendable({ columns: true })).toEqual({
      rows: null,
      columns: {},
      controls: true,
    });
  });

  it('builds an empty row with an empty cell per column and a unique new column key', () => {
    const columns = [{ key: 'a' }, { key: 'b' }] as TableColumn<Rec>[];
    expect(makeEmptyRow(columns, 'n1')).toEqual({
      key: 'n1',
      cells: { a: { value: '' }, b: { value: '' } },
    });
    expect(makeEmptyColumn(columns)).toEqual({
      key: 'column-3',
      title: 'Column 3',
      dataIndex: 'column_3',
    });
    // existing.length + 1 = 3 is already taken, so the next free number is used
    expect(makeEmptyColumn([{ key: 'a' }, { key: 'column-3' }] as TableColumn<Rec>[]).key).toBe(
      'column-4',
    );
  });

  it('AppendControlButton is a labelled button that calls onClick', () => {
    const onClick = vi.fn();
    render(
      <AppendControlButton label="Add thing" onClick={onClick} testId="add" className="extra" />,
    );
    const button = screen.getByRole('button', { name: 'Add thing' });
    expect(button).toHaveClass('bui-table-append-control', 'extra');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    render(<AppendControlButton label="Plain" onClick={onClick} />);
    expect(screen.getByRole('button', { name: 'Plain' })).toBeInTheDocument();
  });
});

describe('tree helpers', () => {
  it('detects tree mode from nested arrays unless expandedRowRender or showExpandColumn opts out', () => {
    const data = [{ id: 1, children: [{ id: 2 }] }, { id: 3 }];
    expect(detectTreeMode(data, 'children', undefined)).toBe(true);
    expect(detectTreeMode(data, 'kids', undefined)).toBe(false);
    expect(detectTreeMode([{ id: 1, children: 'no' }], 'children', undefined)).toBe(false);
    expect(detectTreeMode(undefined, 'children', undefined)).toBe(false);
    expect(detectTreeMode(data, 'children', { expandedRowRender: () => null })).toBe(false);
    expect(detectTreeMode(data, 'children', { showExpandColumn: true })).toBe(false);
    expect(detectTreeMode(data, 'children', { showExpandColumn: false })).toBe(true);
  });

  it('TreeExpandToggle indents by depth, toggles without bubbling and reflects the state', () => {
    const onToggle = vi.fn();
    const onRowClick = vi.fn();
    const { container, rerender } = render(
      <div onClick={onRowClick}>
        <TreeExpandToggle
          indent={2}
          indentSize={10}
          canExpand
          isExpanded={false}
          onToggle={onToggle}
          rowKey="k"
          testId="tg"
        />
      </div>,
    );
    expect(container.querySelector('span')).toHaveStyle({ paddingLeft: '20px' });
    const toggle = screen.getByRole('button', { name: 'Expand row k' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
    rerender(
      <div>
        <TreeExpandToggle indent={0} canExpand isExpanded onToggle={onToggle} rowKey="k" />
      </div>,
    );
    expect(screen.getByRole('button', { name: 'Collapse row k' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('renders a spacer when the row cannot expand, and a caller icon when given', () => {
    const { container, rerender } = render(
      <TreeExpandToggle
        indent={0}
        canExpand={false}
        isExpanded={false}
        onToggle={() => {}}
        rowKey="k"
      />,
    );
    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    const onToggle = vi.fn();
    rerender(
      <TreeExpandToggle
        indent={0}
        canExpand
        isExpanded
        onToggle={onToggle}
        rowKey="k"
        renderIcon={({ expanded, onToggle: toggle }) => (
          <a href="#x" onClick={(event) => toggle(event)}>
            {expanded ? 'open' : 'closed'}
          </a>
        )}
      />,
    );
    fireEvent.click(screen.getByText('open'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

describe('row-data types', () => {
  const ctx = (value: unknown, column: Partial<TableColumn<Rec>> = {}) => ({
    value,
    record: {},
    row: { key: 1 },
    column: { key: 'c', ...column },
    rowIndex: 0,
  });
  const html = (node: React.ReactNode) => render(<div>{node}</div>).container.innerHTML;

  it('createRowDataTypeMap indexes by type and the last duplicate wins', () => {
    const a = { type: 'x', render: () => 'a' };
    const b = { type: 'x', render: () => 'b' };
    expect(createRowDataTypeMap(a, b).x).toBe(b);
    expect(Object.keys(BUILT_IN_ROW_DATA_TYPES).sort()).toEqual([
      'actions',
      'avatar',
      'date',
      'file',
      'icon',
      'link',
      'money',
      'number',
      'text',
    ]);
  });

  it('each descriptor formats the value it is handed, as the matching field renderer would', () => {
    expect(RowDataTextType.render(ctx('hi'))).toBe('hi');
    expect(RowDataNumberType.render(ctx(1234.5))).toBe('1,234.5');
    expect(RowDataMoneyType.render(ctx(5))).toBe('$5.00');
    expect(RowDataDateType.render(ctx('2024-03-05'))).toBe('Mar 5, 2024');
    expect(html(RowDataLinkType.render(ctx({ href: '/x', label: 'X' })))).toContain('href="/x"');
    expect(html(RowDataFileType.render(ctx({ name: 'f.txt', href: '/f' })))).toContain('f.txt');
    expect(html(RowDataAvatarType.render(ctx({ name: 'Ada Lovelace' })))).toContain('AL');
    expect(html(RowDataActionsType.render(ctx([{ key: 'a', label: 'Go' }])))).toContain('Go');
    expect(
      [
        RowDataTextType,
        RowDataNumberType,
        RowDataMoneyType,
        RowDataDateType,
        RowDataLinkType,
        RowDataFileType,
        RowDataAvatarType,
        RowDataActionsType,
        RowDataIconType,
      ].map((t) => t.type),
    ).toEqual(['text', 'number', 'money', 'date', 'link', 'file', 'avatar', 'actions', 'icon']);
  });

  it('icon prefers column.icon over the value, accepts any alias and ignores unknown names', () => {
    expect(html(RowDataIconType.render(ctx('folder', { icon: 'check' } as never)))).toContain(
      'lucide-check',
    );
    expect(html(RowDataIconType.render(ctx('folder-open')))).toContain('lucide-folder-open');
    expect(html(RowDataIconType.render(ctx('checkmark')))).toContain('lucide-check');
    expect(RowDataIconType.render(ctx(undefined))).toBeNull();
    expect(RowDataIconType.render(ctx(42))).toBeNull();
    const { container } = render(<RowDataIcon name={'nope' as never} />);
    expect(container).toBeEmptyDOMElement();
    expect(html(<RowDataIcon name="chevron" size={24} className="c" />)).toContain('width="24"');
  });

  it('useRowDataTypeMap returns the built-ins untouched, or overlays overrides identity-stably', () => {
    const { result, rerender } = renderHook(({ overrides }) => useRowDataTypeMap(overrides), {
      initialProps: {
        overrides: undefined as { type: string; render: () => string }[] | undefined,
      },
    });
    expect(result.current).toBe(BUILT_IN_ROW_DATA_TYPES);
    const custom = [
      { type: 'money', render: () => 'custom-money' },
      { type: 'badge', render: () => 'b' },
    ];
    rerender({ overrides: custom });
    expect(result.current.money.render(ctx(1))).toBe('custom-money');
    expect(result.current.badge).toBeDefined();
    expect(result.current.date).toBe(BUILT_IN_ROW_DATA_TYPES.date);
    const first = result.current;
    rerender({ overrides: custom });
    expect(result.current).toBe(first);
    rerender({ overrides: [] });
    expect(result.current).toBe(BUILT_IN_ROW_DATA_TYPES);
  });
});

describe('renderCellContent precedence', () => {
  const registry = getDefaultTableRegistry<Rec>();
  const base = (
    column: Partial<TableColumn<Rec>>,
    cells?: TableDataRow<Rec>['cells'],
  ): TableCellRenderContext<Rec> => ({
    record: { v: 1 },
    row: { key: 1, cells },
    column: { key: 'v', ...column } as TableColumn<Rec>,
    rowIndex: 3,
    columnIndex: 1,
    registry,
  });

  it('cell kind renderer > cell render > column render > type > plain string', () => {
    const kind = base(
      { render: () => 'col' },
      { v: { kind: 'money', value: 9, render: () => 'cell' } },
    );
    expect(renderCellContent(kind, 9, kind.row.cells!.v)).toBe('$9.00');
    const cell = base(
      { render: () => 'col' },
      { v: { render: (value) => `cell:${String(value)}` } },
    );
    expect(renderCellContent(cell, 2, cell.row.cells!.v)).toBe('cell:2');
    const column = base({
      render: (value, _r, index) => `col:${String(value)}:${index}`,
      type: 'money',
    });
    expect(renderCellContent(column, 2, undefined)).toBe('col:2:3');
    expect(renderCellContent(base({ type: 'money' }), 2, undefined)).toBe('$2.00');
    expect(renderCellContent(base({ valueType: 'string' }), 'plain', undefined)).toBe('plain');
    expect(renderCellContent(base({}), 5, undefined)).toBe('5');
    expect(renderCellContent(base({}), null, undefined)).toBeNull();
    expect(renderCellContent(base({ type: 'unknown-type' }), 'x', undefined)).toBe('x');
  });

  it('an unknown kind falls through to the next rule', () => {
    const ctx = base({}, { v: { kind: 'mystery' } });
    expect(renderCellContent(ctx, 'raw', ctx.row.cells!.v)).toBe('raw');
  });

  it('uses the supplied type map instead of the built-ins', () => {
    const map = createRowDataTypeMap({
      type: 'money',
      render: ({ value }) => `custom ${String(value)}`,
    });
    expect(renderCellContent(base({ type: 'money' }), 4, undefined, map)).toBe('custom 4');
  });
});

describe('drag handles and bulk button', () => {
  it('SortableHandle maps arrows to its axis only and delegates other keys to the drag listeners', () => {
    const onKeyboardMove = vi.fn();
    const listenerKeyDown = vi.fn();
    const props = {
      label: 'grip',
      testId: 'g',
      setActivatorNodeRef: vi.fn(),
      attributes: {},
      isDragging: false,
      onKeyboardMove,
      listeners: { onKeyDown: listenerKeyDown },
    };
    const { rerender } = render(<SortableHandle {...props} axis="vertical" />);
    const handle = screen.getByRole('button', { name: 'grip' });
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(onKeyboardMove.mock.calls).toEqual([[-1], [1]]);
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(onKeyboardMove).toHaveBeenCalledTimes(2);
    expect(listenerKeyDown).toHaveBeenCalledTimes(1);
    rerender(<SortableHandle {...props} axis="horizontal" isDragging />);
    expect(screen.getByRole('button', { name: 'grip' })).toHaveAttribute('data-dragging', 'true');
    fireEvent.keyDown(screen.getByRole('button', { name: 'grip' }), { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getByRole('button', { name: 'grip' }), { key: 'ArrowLeft' });
    expect(onKeyboardMove.mock.calls.slice(2)).toEqual([[1], [-1]]);
  });

  it('SortableRowHandleCell renders nothing outside a sortable row', () => {
    const { container } = render(<SortableRowHandleCell label="x" testId="x" rowKey="1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('BulkActionsButton maps Table variants and sizes onto Button and merges classes', () => {
    const onClick = vi.fn();
    render(
      <>
        <BulkActionsButton onClick={onClick} className="mine" variant="danger" size="lg">
          Delete
        </BulkActionsButton>
        <BulkActionsButton>Default</BulkActionsButton>
      </>,
    );
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveClass('bui-table-bulk-btn', 'mine');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Default' })).toHaveClass('bui-table-bulk-btn');
  });
});

describe('internal hooks', () => {
  it('useResolvedRows: appended rows go after dataSource rows, row order is applied, keys are indexed', () => {
    const data = [{ id: 1 }, { id: 2 }];
    const appended = [{ key: 'a', cells: {} }] as TableDataRow<{ id?: number }>[];
    const { result } = renderHook(() =>
      useResolvedRows({
        dataSource: data,
        rows: undefined,
        row: undefined,
        rowKey: 'id',
        childrenColumnName: 'children',
        appendedRows: appended,
        rowOrder: ['a', '2'],
      }),
    );
    expect(result.current.resolvedRows.map((r) => r.key)).toEqual(['a', 2, 1]);
    expect(result.current.rowByKey.get('2')?.record).toEqual({ id: 2 });
    expect(result.current.allResolvedRows).toHaveLength(3);
  });

  it('useResolvedRows with explicit rows appends after them', () => {
    const rows = [{ key: 'x', record: { id: 1 } }] as TableDataRow<{ id?: number }>[];
    const appended = [{ key: 'y' }] as TableDataRow<{ id?: number }>[];
    const { result } = renderHook(() =>
      useResolvedRows({
        dataSource: [],
        rows,
        row: undefined,
        rowKey: undefined,
        childrenColumnName: 'children',
        appendedRows: appended,
        rowOrder: [],
      }),
    );
    expect(result.current.resolvedRows.map((r) => r.key)).toEqual(['x', 'y']);
    expect(result.current.effectiveRows).toHaveLength(2);
  });

  it('useAppendControls appends rows with sequential keys and columns without clashing keys', async () => {
    const columns = [{ key: 'a' }] as TableColumn<Rec>[];
    const { result } = renderHook(() =>
      useAppendControls<Rec, unknown>({ extendable: true, columns, rows: undefined }),
    );
    let first!: TableDataRow<Rec>;
    await act(async () => {
      first = await result.current.appendRow();
    });
    expect(first.key).toBe('row-appended-1');
    expect(result.current.appendedRows).toHaveLength(1);
    await act(async () => {
      await result.current.appendColumn();
    });
    await act(async () => {
      await result.current.appendColumn();
    });
    expect(result.current.appendedColumns.map((c) => c.key)).toEqual(['column-2', 'column-3']);
    expect(result.current.resolvedExtendable.controls).toBe(true);
  });

  it('useDragState locks the drag axis by the active id prefix', () => {
    const { result } = renderHook(() => useDragState());
    const names = () => result.current.modifiers.map((m) => m.name);
    expect(result.current.modifiers).toHaveLength(1);
    act(() => result.current.setActiveDragId('column:a'));
    expect(result.current.modifiers).toHaveLength(2);
    const columnMods = result.current.modifiers;
    act(() => result.current.setActiveDragId('row:1'));
    expect(result.current.modifiers).toHaveLength(2);
    expect(result.current.modifiers[0]).not.toBe(columnMods[0]);
    act(() => result.current.setActiveDragId('other'));
    expect(result.current.modifiers).toHaveLength(1);
    act(() => result.current.setActiveDragId(null));
    expect(names()).toHaveLength(1);
    expect(result.current.sensors).toHaveLength(2);
  });
});
