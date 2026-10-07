import { renderHook } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BodyCell } from '../../../src/Table/components/BodyCell';
import { BulkActionsBar } from '../../../src/Table/components/BulkActionsBar';
import { ExpandCell } from '../../../src/Table/components/ExpandCell';
import { ExpandHeader } from '../../../src/Table/components/ExpandHeader';
import { HeaderCell } from '../../../src/Table/components/HeaderCell';
import { HeaderRows } from '../../../src/Table/components/HeaderRows';
import { RowDragCell, RowDragHeader } from '../../../src/Table/components/RowDragCells';
import { SelectionCell } from '../../../src/Table/components/SelectionCell';
import { SelectionHeader } from '../../../src/Table/components/SelectionHeader';
import { TableStructure } from '../../../src/Table/components/TableStructure';
import {
  useTableSlots,
  type UseTableSlotsInput,
} from '../../../src/Table/hooks/useTableSlots';
import type { TableProps } from '../../../src/Table/Table.types';
import { byKey, column, people, resolve, type Person } from './support';

type Input = UseTableSlotsInput<Person, unknown>;
type Selection = NonNullable<TableProps<Person>['rowSelection']>;
type Anything = Record<string, any>;

const rows = resolve(people, (record) => ({ draggable: record.id !== 'd' }));
const cols = [column('name'), column('age')];

const build = (overrides: Partial<Input> = {}) => {
  const spies = {
    applySelectionKeys: vi.fn((keys: string[]) => keys),
    handleSelect: vi.fn(),
    clearSelection: vi.fn(),
    runBulkAction: vi.fn(),
    toggleExpanded: vi.fn(),
    commitFilter: vi.fn(),
  };
  const selectedRecordsForKeys = (keys: string[]) =>
    keys.map((key) => people.find((p) => p.id === key)!).filter(Boolean);
  const input = {
    rowSelection: undefined,
    expandable: undefined,
    onHeaderRow: undefined,
    appearance: {},
    treeMode: false,
    currentRows: rows.map((r) => r.row),
    resolvedRows: rows,
    resolvedExtendable: {},
    handleAppendRow: vi.fn(),
    selectedKeys: [],
    selectedKeySet: new Set<string>(),
    changeableSelectionKeys: ['a', 'b', 'c', 'd'],
    rowByKey: byKey(rows),
    isSelectionDisabled: () => false,
    selectedRecordsForKeys,
    selectionCheckboxPropsFor: () => ({ disabled: false }),
    resolvedSelectionActions: [],
    bulkActionsConfigured: false,
    selectionFixedSide: undefined,
    selectionAlignStyle: {},
    lastSelectedKeyRef: { current: 'a' },
    hasDraggableRows: false,
    committedFilterKeys: () => [],
    initialFilterItemsMap: {},
    mergedLeafColumns: cols,
    expanded: {},
    classMap: {
      'body.cell': 'body-cell',
      'selection.cell': 'sel-cell',
      'expand.cell': 'exp-cell',
    },
    styleMap: { 'body.cell': { color: 'blue' } },
    bodyCellEditableConfig: () => null,
    editableCellTarget: () => null,
    firstEditableCellTarget: () => null,
    beginCellEdit: vi.fn(),
    saveCellEdit: vi.fn(),
    saveRowEdit: vi.fn(),
    cancelCellEdit: vi.fn(),
    cancelRowEdit: vi.fn(),
    setEditableValue: vi.fn(),
    rowInitialEditableValues: () => ({}),
    editableErrorKey: (r: string, c: string) => `${r}:${c}`,
    tableRef: undefined,
    scroll: undefined,
    sticky: undefined,
    showHeader: true,
    beforeTableContent: undefined,
    summary: undefined,
    currentData: people,
    resolvedTableLayout: 'auto',
    onRow: undefined,
    rowClassName: undefined,
    locale: undefined,
    dragSensors: [],
    dragModifiers: [],
    setActiveDragId: vi.fn(),
    handleDragEnd: vi.fn(),
    draggableColumnKeys: [],
    draggableRowKeys: [],
    enableVirtualRows: false,
    virtualItems: [],
    rowVirtualizer: {},
    renderRows: [],
    loadingState: { active: false },
    loadingVariant: 'spinner',
    ...spies,
    ...overrides,
  } as unknown as Input;
  const { result } = renderHook(() => useTableSlots<Person, unknown>(input));
  const structure = result.current.tableContent as React.ReactElement<Anything>;
  const call = (name: string, ...args: unknown[]) =>
    (structure.props[name] as (...a: unknown[]) => React.ReactElement<Anything> | null)(...args);
  return { result, structure, call, input, ...spies };
};

describe('useTableSlots structure', () => {
  it('assembles a TableStructure and passes through the layout and data inputs', () => {
    const { structure } = build({ showHeader: false, currentData: people });
    expect(structure.type).toBe(TableStructure);
    expect(structure.props.showHeader).toBe(false);
    expect(structure.props.currentData).toBe(people);
    expect(structure.props.resolvedTableLayout).toBe('auto');
  });

  it('shows the header rows through a HeaderRows element wired to the render slots', () => {
    const { call } = build({ hasDraggableRows: true });
    const header = call('renderHeaderRows')!;
    expect(header.type).toBe(HeaderRows);
    expect(header.props.hasDraggableRows).toBe(true);
    expect(header.props.treeMode).toBe(false);
    expect(header.props.leafCount(column('x'))).toBe(1);
  });
});

describe('useTableSlots header and body cells', () => {
  it('renders a keyed HeaderCell carrying the filter plumbing', () => {
    const { call, commitFilter } = build();
    const header = call('renderHeaderRows')!;
    const cell = header.props.renderHeaderCell(cols[1], 1, { colSpan: 2 });
    expect(cell.type).toBe(HeaderCell);
    expect(cell.key).toBe('age');
    expect(cell.props).toMatchObject({ col: cols[1], columnIndex: 1, extraProps: { colSpan: 2 } });
    cell.props.onCommitFilter(cols[1], ['x']);
    expect(commitFilter).toHaveBeenCalledWith(cols[1], ['x']);
  });

  it('renders a BodyCell with the editable plumbing and tree state', () => {
    const { call, input } = build({ treeMode: true });
    const cell = call('renderBodyCell', rows[0], cols[0], 0, 0, 24)!;
    expect(cell.type).toBe(BodyCell);
    expect(cell.key).toBe('name');
    expect(cell.props).toMatchObject({
      resolved: rows[0],
      col: cols[0],
      rowIndex: 0,
      columnIndex: 0,
      indent: 24,
      treeMode: true,
      saveCellEdit: input.saveCellEdit,
      cancelRowEdit: input.cancelRowEdit,
    });
  });

  it('defaults the body cell indent to zero', () => {
    const { call } = build();
    expect(call('renderBodyCell', rows[0], cols[0], 0, 0)!.props.indent).toBe(0);
  });
});

describe('useTableSlots row drag cells', () => {
  it('renders no drag cells when no row is draggable', () => {
    const { call } = build();
    const header = call('renderHeaderRows')!;
    expect(header.props.renderRowDragHeader()).toBeNull();
    expect(call('renderRowDragCell', rows[0])).toBeNull();
  });

  it('renders a header and per-row cells that know whether the row can be dragged', () => {
    const disabledRows = resolve(people, (r) => ({ draggable: true, disabled: r.id === 'b' }));
    const { call } = build({ hasDraggableRows: true, resolvedRows: disabledRows });
    const header = call('renderHeaderRows')!;
    const dragHeader = header.props.renderRowDragHeader();
    expect(dragHeader.type).toBe(RowDragHeader);
    expect(dragHeader.props).toMatchObject({ className: 'body-cell', style: { color: 'blue' } });
    const open = call('renderRowDragCell', disabledRows[0])!;
    expect(open.type).toBe(RowDragCell);
    expect(open.props).toMatchObject({ rowKey: 'a', draggable: true });
    expect(call('renderRowDragCell', disabledRows[1])!.props.draggable).toBe(false);
    expect(call('renderRowDragCell', rows[3])!.props.draggable).toBe(false);
  });
});

describe('useTableSlots selection', () => {
  const selection = (extra: Selection = {}): Selection => ({ ...extra });
  const selectionHeader = (call: ReturnType<typeof build>['call']) =>
    call('renderHeaderRows')!.props.renderSelectionHeader() as React.ReactElement<Anything> | null;

  it('renders nothing without row selection', () => {
    const { call } = build();
    expect(selectionHeader(call)).toBeNull();
    expect(call('renderSelectionCell', rows[0], 0)).toBeNull();
  });

  it('renders a bare utility cell when select-all is hidden', () => {
    const { call } = build({ rowSelection: selection({ hideSelectAll: true }) });
    const header = selectionHeader(call)!;
    expect(header.type).toBe('th');
    expect(header.props['data-bui-utility-cell']).toBe('true');
  });

  it('computes none, some and all selected among changeable rows only', () => {
    const state = (keys: string[], changeable = ['a', 'b', 'c']) => {
      const { call } = build({
        rowSelection: selection(),
        selectedKeys: keys,
        selectedKeySet: new Set(keys),
        changeableSelectionKeys: changeable,
      });
      return selectionHeader(call)!.props as Anything;
    };
    expect(state([])).toMatchObject({ allChangeableSelected: false, someChangeableSelected: false, hasChangeableKeys: true });
    expect(state(['a'])).toMatchObject({ allChangeableSelected: false, someChangeableSelected: true });
    expect(state(['a', 'b', 'c'])).toMatchObject({ allChangeableSelected: true, someChangeableSelected: false });
    // A selected-but-disabled row (d) does not count towards "all changeable selected".
    expect(state(['a', 'd'], ['a'])).toMatchObject({ allChangeableSelected: true });
    expect(state([], [])).toMatchObject({ allChangeableSelected: false, hasChangeableKeys: false });
  });

  it('select-all adds every changeable row, reports newly added rows and resets the anchor', () => {
    const onSelectAll = vi.fn();
    const { call, applySelectionKeys, input } = build({
      rowSelection: selection({ onSelectAll }),
      selectedKeys: ['a'],
      selectedKeySet: new Set(['a']),
      changeableSelectionKeys: ['a', 'b', 'c'],
    });
    selectionHeader(call)!.props.onSelectAll(true);
    expect(applySelectionKeys).toHaveBeenCalledWith(['a', 'b', 'c'], 'all');
    expect(onSelectAll).toHaveBeenCalledWith(true, [people[0], people[1], people[2]], [people[1], people[2]]);
    expect(input.lastSelectedKeyRef.current).toBeNull();
  });

  it('deselect-all keeps disabled selected rows and reports the removed ones', () => {
    const onSelectAll = vi.fn();
    const { call, applySelectionKeys } = build({
      rowSelection: selection({ onSelectAll }),
      selectedKeys: ['a', 'b', 'd'],
      selectedKeySet: new Set(['a', 'b', 'd']),
      changeableSelectionKeys: ['a', 'b', 'c'],
      isSelectionDisabled: (resolved) => resolved.key === 'd',
    });
    selectionHeader(call)!.props.onSelectAll(false);
    expect(applySelectionKeys).toHaveBeenCalledWith(['d'], 'all');
    expect(onSelectAll).toHaveBeenCalledWith(false, [people[3]], [people[0], people[1]]);
  });

  it('select-all tolerates a missing onSelectAll and unknown selected keys', () => {
    const { call, applySelectionKeys } = build({
      rowSelection: selection(),
      selectedKeys: ['ghost'],
      selectedKeySet: new Set(['ghost']),
    });
    expect(() => selectionHeader(call)!.props.onSelectAll(false)).not.toThrow();
    expect(applySelectionKeys).toHaveBeenCalledWith([], 'all');
  });

  it('hides header actions when bulk actions are configured, and passes title checkbox props', () => {
    const actions = [{ key: 'x', text: 'X', onSelect: vi.fn() }];
    const withBulk = build({
      rowSelection: selection({ getTitleCheckboxProps: () => ({ disabled: true }) }),
      bulkActionsConfigured: true,
      resolvedSelectionActions: actions,
    });
    const props = selectionHeader(withBulk.call)!.props as Anything;
    expect(props.actions).toEqual([]);
    expect(props.titleCheckboxProps).toEqual({ disabled: true });
    expect(props.className).toBe('sel-cell');
    const plain = build({ rowSelection: selection(), resolvedSelectionActions: actions });
    const plainProps = selectionHeader(plain.call)!.props as Anything;
    expect(plainProps.actions).toBe(actions);
    expect(plainProps.titleCheckboxProps).toEqual({});
    expect(selectionHeader(plain.call)!.type).toBe(SelectionHeader);
  });

  it('running a header action hands it the changeable keys', () => {
    const onSelect = vi.fn();
    const { call } = build({ rowSelection: selection(), changeableSelectionKeys: ['a', 'c'] });
    selectionHeader(call)!.props.onRunAction({ key: 'x', text: 'X', onSelect });
    expect(onSelect).toHaveBeenCalledWith(['a', 'c']);
  });

  it('renders a selection cell with its checked state and fixed side', () => {
    const { call, handleSelect } = build({
      rowSelection: selection(),
      selectedKeySet: new Set(['b']),
      selectionFixedSide: 'left',
      selectionAlignStyle: { textAlign: 'center' },
    });
    const checked = call('renderSelectionCell', rows[1], 1)!;
    expect(checked.type).toBe(SelectionCell);
    expect(checked.props).toMatchObject({
      checked: true,
      rowIndex: 1,
      fixedSide: 'left',
      alignStyle: { textAlign: 'center' },
      className: 'sel-cell',
      column: cols[0],
    });
    expect(call('renderSelectionCell', rows[0], 0)!.props.checked).toBe(false);
    expect(checked.props.onSelect).toBe(handleSelect);
  });
});

describe('useTableSlots expansion', () => {
  const expandHeader = (call: ReturnType<typeof build>['call']) =>
    call('renderHeaderRows')!.props.renderExpandHeader() as React.ReactElement<Anything> | null;

  it('renders no expand header in tree mode, without expandable, or when the column is hidden', () => {
    expect(expandHeader(build().call)).toBeNull();
    expect(expandHeader(build({ treeMode: true, expandable: {} }).call)).toBeNull();
    expect(expandHeader(build({ expandable: { showExpandColumn: false } }).call)).toBeNull();
    const shown = expandHeader(build({ expandable: {} }).call)!;
    expect(shown.type).toBe(ExpandHeader);
    expect(shown.props.className).toBe('exp-cell');
  });

  it('renders no expand cell in tree mode, without expandable, or when hidden', () => {
    expect(build().call('renderExpandCell', rows[0], 0)).toBeNull();
    expect(build({ treeMode: true, expandable: {} }).call('renderExpandCell', rows[0], 0)).toBeNull();
    expect(
      build({ expandable: { showExpandColumn: false } }).call('renderExpandCell', rows[0], 0),
    ).toBeNull();
  });

  it('can expand a row that has an expandedRowRender or children, by default', () => {
    const render = build({ expandable: { expandedRowRender: () => 'x' } });
    expect(render.call('renderExpandCell', rows[0], 0)!.props.canExpand).toBe(true);
    const plain = build({ expandable: {} });
    expect(plain.call('renderExpandCell', rows[0], 0)!.props.canExpand).toBe(false);
    const withChildren = resolve(people, () => ({ children: [{ key: 'k' }] }));
    expect(plain.call('renderExpandCell', withChildren[0], 0)!.props.canExpand).toBe(true);
  });

  it('prefers rowExpandable and passes record and row to it', () => {
    const rowExpandable = vi.fn(() => false);
    const { call } = build({ expandable: { expandedRowRender: () => 'x', rowExpandable } });
    expect(call('renderExpandCell', rows[0], 0)!.props.canExpand).toBe(false);
    expect(rowExpandable).toHaveBeenCalledWith(people[0], rows[0].row);
  });

  it('reflects expanded state, indent, fixed side and indent size', () => {
    const { call, toggleExpanded } = build({
      expanded: { b: true },
      expandable: { fixed: true, indentSize: 10 },
    });
    const cell = call('renderExpandCell', rows[1], 1, 3)!;
    expect(cell.type).toBe(ExpandCell);
    expect(cell.props).toMatchObject({
      isExpanded: true,
      indent: 3,
      fixedSide: 'left',
      indentSize: 10,
      className: 'exp-cell',
    });
    expect(call('renderExpandCell', rows[0], 0)!.props).toMatchObject({
      isExpanded: false,
      indent: 0,
      indentSize: 10,
    });
    expect(cell.props.onToggle).toBe(toggleExpanded);
  });

  it('defaults the indent size and keeps an explicit fixed side', () => {
    const { call } = build({ expandable: { fixed: 'right' } });
    expect(call('renderExpandCell', rows[0], 0)!.props).toMatchObject({
      fixedSide: 'right',
      indentSize: 24,
    });
    const none = build({ expandable: {} });
    expect(none.call('renderExpandCell', rows[0], 0)!.props.fixedSide).toBeUndefined();
  });

  it('treats every row as expanded when expansion is "all"', () => {
    const { call } = build({ expanded: true, expandable: {} });
    expect(call('renderExpandCell', rows[2], 2)!.props.isExpanded).toBe(true);
  });
});

describe('useTableSlots bulk actions bar', () => {
  it('has no bar without bulk actions or for radio selection', () => {
    expect(build().result.current.bulkActionsBar).toBeNull();
    expect(build({ rowSelection: {} }).result.current.bulkActionsBar).toBeNull();
    expect(
      build({ rowSelection: { type: 'radio', bulkActions: {} as never } }).result.current.bulkActionsBar,
    ).toBeNull();
  });

  it('builds the bar from the selected rows, skipping keys that left the table', () => {
    const actions = [{ key: 'x', text: 'X', onSelect: vi.fn() }];
    const bulkActions = {} as never;
    const { result, clearSelection, runBulkAction } = build({
      rowSelection: { bulkActions },
      selectedKeys: ['b', 'ghost', 'd'],
      resolvedSelectionActions: actions,
    });
    const bar = result.current.bulkActionsBar as React.ReactElement<Anything>;
    expect(bar.type).toBe(BulkActionsBar);
    expect(bar.props.bulkActions).toBe(bulkActions);
    expect(bar.props.selectedKeys).toEqual(['b', 'ghost', 'd']);
    expect(bar.props.selectedRows).toEqual([people[1], people[3]]);
    expect(bar.props.selectedDataRows).toEqual([rows[1].row, rows[3].row]);
    expect(bar.props.actions).toBe(actions);
    expect(bar.props.onClear).toBe(clearSelection);
    expect(bar.props.onRunAction).toBe(runBulkAction);
  });
});
