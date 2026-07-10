import * as React from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import type { Row } from '@tanstack/react-table';
import type { Virtualizer, VirtualItem } from '@tanstack/react-virtual';
import { BodyCell } from '../components/BodyCell';
import { BulkActionsBar } from '../components/BulkActionsBar';
import { ExpandCell } from '../components/ExpandCell';
import { ExpandHeader } from '../components/ExpandHeader';
import { HeaderCell } from '../components/HeaderCell';
import { HeaderRows } from '../components/HeaderRows';
import { RowDragCell, RowDragHeader } from '../components/RowDragCells';
import { SelectionCell } from '../components/SelectionCell';
import { SelectionHeader } from '../components/SelectionHeader';
import { TableStructure } from '../components/TableStructure';
import type { TableLoadingVariant } from '../Table.Loading';
import { isExpandedKey, leafCount } from '../internal';
import type {
  TableCellRenderContext,
  TableColumn,
  TableDataRow,
  TableEditableRowConfig,
  TableFilterItem,
  TableKey,
  TableProps,
  TableResolvedRow,
  TableSelectionAction,
} from '../Table.types';
import type { ResolvedCellEditable } from '../internal';

export interface UseTableSlotsInput<TRecord, TRowData> {
  // props from TableImpl
  rowSelection: TableProps<TRecord, TRowData>['rowSelection'];
  expandable: TableProps<TRecord, TRowData>['expandable'];
  onHeaderRow: TableProps<TRecord, TRowData>['onHeaderRow'];
  appearance: NonNullable<TableProps<TRecord, TRowData>['appearance']>;
  treeMode: boolean;
  currentRows: TableDataRow<TRecord, TRowData>[];
  resolvedRows: TableResolvedRow<TRecord, TRowData>[];
  resolvedExtendable: { rows?: unknown | null };
  handleAppendRow: () => Promise<TableDataRow<TRecord, TRowData>>;
  // selection
  selectedKeys: string[];
  selectedKeySet: Set<string>;
  changeableSelectionKeys: string[];
  rowByKey: Map<string, TableResolvedRow<TRecord, TRowData>>;
  isSelectionDisabled: (resolved: TableResolvedRow<TRecord, TRowData>) => boolean;
  applySelectionKeys: (keys: string[], type: 'single' | 'multiple' | 'all' | 'invert' | 'none') => string[];
  selectedRecordsForKeys: (keys: string[]) => TRecord[];
  selectionCheckboxPropsFor: (resolved: TableResolvedRow<TRecord, TRowData>) => React.InputHTMLAttributes<HTMLInputElement>;
  handleSelect: (resolved: TableResolvedRow<TRecord, TRowData>, checked: boolean, nativeEvent: Event) => void;
  resolvedSelectionActions: TableSelectionAction[];
  bulkActionsConfigured: boolean;
  clearSelection: () => void;
  runBulkAction: (action: TableSelectionAction) => void;
  selectionFixedSide: 'left' | 'right' | undefined;
  selectionAlignStyle: React.CSSProperties;
  lastSelectedKeyRef: React.MutableRefObject<string | null>;
  // dnd
  hasDraggableRows: boolean;
  // filter
  committedFilterKeys: (col: TableColumn<TRecord, TRowData>) => TableKey[];
  initialFilterItemsMap: Record<string, TableFilterItem[]>;
  commitFilter: (col: TableColumn<TRecord, TRowData>, values: TableKey[]) => void;
  // editable
  mergedLeafColumns: TableColumn<TRecord, TRowData>[];
  expanded: import('@tanstack/react-table').ExpandedState;
  toggleExpanded: (resolved: TableResolvedRow<TRecord, TRowData>) => void;
  classMap: { [key: string]: string | undefined };
  styleMap: { [key: string]: React.CSSProperties | undefined };
  bodyCellEditableConfig: (
    override: import('../Table.types').TableCellOverride<TRecord, TRowData> | undefined,
    col: TableColumn<TRecord, TRowData>,
  ) => ResolvedCellEditable<TRecord, TRowData> | null;
  editableCellTarget: (rowKey: string, columnKey: string, direction: -1 | 1) => import('./useEditableHandlers').EditableTarget<TRecord, TRowData> | null;
  firstEditableCellTarget: (resolved: TableResolvedRow<TRecord, TRowData>) => import('./useEditableHandlers').EditableTarget<TRecord, TRowData> | null;
  beginCellEdit: (
    resolved: TableResolvedRow<TRecord, TRowData>,
    col: TableColumn<TRecord, TRowData>,
    value: unknown,
    rowConfig: TableEditableRowConfig<TRecord, TRowData> | null,
    editableConfig: ResolvedCellEditable<TRecord, TRowData> | null,
  ) => void;
  saveCellEdit: (
    rowKey: string,
    col: TableColumn<TRecord, TRowData>,
    editableConfig: ResolvedCellEditable<TRecord, TRowData>,
    ctx: TableCellRenderContext<TRecord, TRowData>,
    nextValue?: unknown,
  ) => Promise<boolean>;
  saveRowEdit: (resolved: TableResolvedRow<TRecord, TRowData>, rowConfig: TableEditableRowConfig<TRecord, TRowData>) => Promise<void>;
  cancelCellEdit: (rowKey: string, columnKey: string) => void;
  cancelRowEdit: (resolved: TableResolvedRow<TRecord, TRowData>, rowConfig: TableEditableRowConfig<TRecord, TRowData>) => void;
  setEditableValue: (rowKey: string, columnKey: string, value: unknown) => void;
  rowInitialEditableValues: (
    resolved: TableResolvedRow<TRecord, TRowData>,
    rowConfig: TableEditableRowConfig<TRecord, TRowData> | null,
  ) => Record<string, unknown>;
  editableErrorKey: (rowKey: string, columnKey: string) => string;
  // TableStructure inputs (JSX assembly)
  tableRef: TableProps<TRecord, TRowData>['tableRef'];
  scroll: TableProps<TRecord, TRowData>['scroll'];
  sticky: TableProps<TRecord, TRowData>['sticky'];
  showHeader: boolean;
  beforeTableContent: TableProps<TRecord, TRowData>['beforeTableContent'];
  summary: TableProps<TRecord, TRowData>['summary'];
  currentData: TRecord[];
  resolvedTableLayout: React.CSSProperties['tableLayout'];
  onRow: TableProps<TRecord, TRowData>['onRow'];
  rowClassName: TableProps<TRecord, TRowData>['rowClassName'];
  locale: TableProps<TRecord, TRowData>['locale'];
  dragSensors: import('@dnd-kit/core').SensorDescriptor<import('@dnd-kit/core').SensorOptions>[];
  dragModifiers: import('@dnd-kit/core').Modifiers;
  setActiveDragId: (id: string | null) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  draggableColumnKeys: string[];
  draggableRowKeys: string[];
  enableVirtualRows: boolean;
  virtualItems: VirtualItem[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  renderRows: Row<TableResolvedRow<TRecord, TRowData>>[];
  loadingState: { active: boolean; props?: import('../Table.types').TableLoadingProps };
  loadingVariant: TableLoadingVariant;
}

export function useTableSlots<TRecord, TRowData>(input: UseTableSlotsInput<TRecord, TRowData>) {
  const {
    rowSelection,
    expandable,
    onHeaderRow,
    appearance,
    treeMode,
    currentRows,
    resolvedExtendable,
    handleAppendRow,
    selectedKeys,
    selectedKeySet,
    changeableSelectionKeys,
    rowByKey,
    isSelectionDisabled,
    applySelectionKeys,
    selectedRecordsForKeys,
    selectionCheckboxPropsFor,
    handleSelect,
    resolvedSelectionActions,
    bulkActionsConfigured,
    clearSelection,
    runBulkAction,
    selectionFixedSide,
    selectionAlignStyle,
    lastSelectedKeyRef,
    hasDraggableRows,
    committedFilterKeys,
    initialFilterItemsMap,
    commitFilter,
    mergedLeafColumns,
    expanded,
    toggleExpanded,
    classMap,
    styleMap,
    bodyCellEditableConfig,
    editableCellTarget,
    firstEditableCellTarget,
    beginCellEdit,
    saveCellEdit,
    saveRowEdit,
    cancelCellEdit,
    cancelRowEdit,
    setEditableValue,
    rowInitialEditableValues,
    editableErrorKey,
    tableRef,
    scroll,
    sticky,
    showHeader,
    beforeTableContent,
    summary,
    currentData,
    resolvedTableLayout,
    onRow,
    rowClassName,
    locale,
    dragSensors,
    dragModifiers,
    setActiveDragId,
    handleDragEnd,
    draggableColumnKeys,
    draggableRowKeys,
    enableVirtualRows,
    virtualItems,
    rowVirtualizer,
    renderRows,
    loadingState,
    loadingVariant,
  } = input;

  const renderHeaderCell = (col: TableColumn<TRecord, TRowData>, columnIndex: number, extraProps: React.ThHTMLAttributes<HTMLTableCellElement> = {}) => (
    <HeaderCell
      key={col.key}
      col={col}
      columnIndex={columnIndex}
      extraProps={extraProps}
      committedFilterKeys={committedFilterKeys}
      initialFilterItemsMap={initialFilterItemsMap}
      onCommitFilter={commitFilter}
    />
  );

  const renderRowDragHeader = () => (hasDraggableRows ? <RowDragHeader className={classMap['body.cell']} style={styleMap['body.cell']} /> : null);

  const renderRowDragCell = (resolved: TableResolvedRow<TRecord, TRowData>) =>
    hasDraggableRows ? (
      <RowDragCell
        rowKey={String(resolved.key)}
        draggable={Boolean(resolved.row.draggable && !resolved.row.disabled)}
        className={classMap['body.cell']}
        style={styleMap['body.cell']}
      />
    ) : null;

  const renderSelectionHeader = () => {
    if (!rowSelection) return null;
    if (rowSelection.hideSelectAll) {
      return <th data-bui-utility-cell="true" />;
    }
    const selectedChangeableKeys = changeableSelectionKeys.filter((key) => selectedKeySet.has(key));
    const allChangeableSelected = changeableSelectionKeys.length > 0 && selectedChangeableKeys.length === changeableSelectionKeys.length;
    const someChangeableSelected = selectedChangeableKeys.length > 0 && !allChangeableSelected;
    const selectionActions = bulkActionsConfigured ? [] : resolvedSelectionActions;
    const handleSelectAll = (nextChecked: boolean) => {
      const currentSelectedDisabledKeys = selectedKeys.filter((key) => {
        const resolved = rowByKey.get(key);
        return resolved ? isSelectionDisabled(resolved) : false;
      });
      const nextKeys = nextChecked ? Array.from(new Set([...selectedKeys, ...changeableSelectionKeys])) : currentSelectedDisabledKeys;
      const changeKeys = nextChecked
        ? changeableSelectionKeys.filter((key) => !selectedKeySet.has(key))
        : changeableSelectionKeys.filter((key) => selectedKeySet.has(key));
      const appliedKeys = applySelectionKeys(nextKeys, 'all');
      rowSelection.onSelectAll?.(nextChecked, selectedRecordsForKeys(appliedKeys), selectedRecordsForKeys(changeKeys));
      lastSelectedKeyRef.current = null;
    };
    return (
      <SelectionHeader
        rowSelection={rowSelection}
        actions={selectionActions}
        allChangeableSelected={allChangeableSelected}
        someChangeableSelected={someChangeableSelected}
        hasChangeableKeys={changeableSelectionKeys.length > 0}
        titleCheckboxProps={rowSelection.getTitleCheckboxProps?.() ?? {}}
        onSelectAll={handleSelectAll}
        onRunAction={(action) => action.onSelect(changeableSelectionKeys)}
        fixedSide={selectionFixedSide}
        alignStyle={selectionAlignStyle}
        className={classMap['selection.cell']}
      />
    );
  };

  const renderExpandHeader = () =>
    treeMode || !expandable || expandable.showExpandColumn === false ? null : <ExpandHeader expandable={expandable} className={classMap['expand.cell']} />;

  const renderSelectionCell = (resolved: TableResolvedRow<TRecord, TRowData>, rowIndex: number) => {
    if (!rowSelection) return null;
    return (
      <SelectionCell
        resolved={resolved}
        rowIndex={rowIndex}
        column={mergedLeafColumns[0]}
        checked={selectedKeySet.has(String(resolved.key))}
        rowSelection={rowSelection}
        checkboxProps={selectionCheckboxPropsFor(resolved)}
        onSelect={handleSelect}
        fixedSide={selectionFixedSide}
        alignStyle={selectionAlignStyle}
        className={classMap['selection.cell']}
      />
    );
  };

  const renderExpandCell = (resolved: TableResolvedRow<TRecord, TRowData>, rowIndex: number, indent = 0) => {
    if (treeMode) return null;
    if (!expandable || expandable.showExpandColumn === false) return null;
    const canExpand = expandable.rowExpandable
      ? expandable.rowExpandable(resolved.record, resolved.row)
      : Boolean(expandable.expandedRowRender || resolved.row.children?.length);
    const fixedSide = (expandable.fixed === true ? 'left' : expandable.fixed) as 'left' | 'right' | undefined;
    return (
      <ExpandCell
        resolved={resolved}
        rowIndex={rowIndex}
        indent={indent}
        column={mergedLeafColumns[0]}
        expandable={expandable}
        isExpanded={isExpandedKey(expanded, resolved.key)}
        canExpand={canExpand}
        fixedSide={fixedSide}
        indentSize={expandable.indentSize ?? 24}
        onToggle={toggleExpanded}
        className={classMap['expand.cell']}
      />
    );
  };

  const renderBodyCell = (
    resolved: TableResolvedRow<TRecord, TRowData>,
    col: TableColumn<TRecord, TRowData>,
    rowIndex: number,
    columnIndex: number,
    indent = 0,
  ) => (
    <BodyCell
      key={col.key}
      resolved={resolved}
      col={col}
      rowIndex={rowIndex}
      columnIndex={columnIndex}
      indent={indent}
      appearance={appearance}
      treeMode={treeMode}
      expandable={expandable}
      expanded={expanded}
      toggleExpanded={toggleExpanded}
      currentRows={currentRows}
      resolvedExtendable={resolvedExtendable}
      handleAppendRow={handleAppendRow}
      bodyCellEditableConfig={bodyCellEditableConfig}
      editableCellTarget={editableCellTarget}
      firstEditableCellTarget={firstEditableCellTarget}
      beginCellEdit={beginCellEdit}
      saveCellEdit={saveCellEdit}
      saveRowEdit={saveRowEdit}
      cancelCellEdit={cancelCellEdit}
      cancelRowEdit={cancelRowEdit}
      setEditableValue={setEditableValue}
      rowInitialEditableValues={rowInitialEditableValues}
      editableErrorKey={editableErrorKey}
    />
  );

  const renderHeaderRows = () => (
    <HeaderRows
      hasDraggableRows={hasDraggableRows}
      onHeaderRow={onHeaderRow}
      renderRowDragHeader={renderRowDragHeader}
      renderSelectionHeader={renderSelectionHeader}
      renderExpandHeader={renderExpandHeader}
      renderHeaderCell={renderHeaderCell}
      leafCount={leafCount}
      treeMode={treeMode}
    />
  );

  const bulkActionsBar =
    rowSelection?.bulkActions && rowSelection.type !== 'radio'
      ? (() => {
          const selectedRows = selectedRecordsForKeys(selectedKeys);
          const selectedDataRows = selectedKeys
            .map((key) => rowByKey.get(key))
            .filter((row): row is NonNullable<typeof row> => Boolean(row))
            .map((row) => row.row);
          return (
            <BulkActionsBar
              bulkActions={rowSelection.bulkActions}
              selectedKeys={selectedKeys}
              selectedRows={selectedRows}
              selectedDataRows={selectedDataRows}
              actions={resolvedSelectionActions}
              onRunAction={runBulkAction}
              onClear={clearSelection}
            />
          );
        })()
      : null;

  const tableContent = (
    <TableStructure<TRecord, TRowData>
      tableRef={tableRef}
      scroll={scroll}
      sticky={sticky}
      showHeader={showHeader}
      beforeTableContent={beforeTableContent}
      summary={summary}
      currentData={currentData}
      currentRows={currentRows}
      resolvedTableLayout={resolvedTableLayout}
      expandable={expandable}
      rowSelection={rowSelection}
      onRow={onRow}
      rowClassName={rowClassName}
      locale={locale}
      dragSensors={dragSensors}
      dragModifiers={dragModifiers}
      setActiveDragId={setActiveDragId}
      handleDragEnd={handleDragEnd}
      draggableColumnKeys={draggableColumnKeys}
      draggableRowKeys={draggableRowKeys}
      hasDraggableRows={hasDraggableRows}
      treeMode={treeMode}
      toggleExpanded={toggleExpanded}
      selectedKeys={selectedKeys}
      isSelectionDisabled={isSelectionDisabled}
      enableVirtualRows={enableVirtualRows}
      virtualItems={virtualItems}
      rowVirtualizer={rowVirtualizer}
      renderRows={renderRows}
      loadingState={loadingState}
      loadingVariant={loadingVariant}
      renderHeaderRows={renderHeaderRows}
      renderRowDragCell={renderRowDragCell}
      renderSelectionCell={renderSelectionCell}
      renderExpandCell={renderExpandCell}
      renderBodyCell={renderBodyCell}
    />
  );

  return { tableContent, bulkActionsBar };
}
