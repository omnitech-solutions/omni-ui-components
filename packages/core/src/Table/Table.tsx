import * as React from 'react';

import './Table.append.css';
import './Table.cellAlignment.css';
import './Table.filter.css';
import './Table.loading.css';

import { getDefaultTableRegistry, mergeTableRegistry } from './Table.registry';
import type { TablePaginationState, TableProps, TableRef, TableRegistry } from './Table.types';

import './Table.tokens.css';
import './Table.theme.css';
import './Table.drag.css';

import {
  appearanceStyle,
  DEFAULT_SORT_DIRECTIONS,
  isEllipsisEnabled,
  resolveClassNames,
  resolveStyles,
  tableEditableConfig,
  useAppendControls,
  useDragState,
  useLoadingState,
  useResolvedRows,
  useRowDataTypeMap,
} from './internal';
import {
  TableProvider,
  useDerivedColumns,
  useEditableHandlers,
  usePaginationHandlers,
  useReorderHandlers,
  useSelectionHandlers,
  useTableInstance,
  useTableState,
  useTableContextValue,
  useTableHandlers,
  useTableRefHandle,
  useTableSlots,
  useVirtualization,
  type TableContextShape,
} from './hooks';

import { TableRoot } from './components/TableRoot';

function TableImpl<TRecord, TRowData = unknown>(rawProps: TableProps<TRecord, TRowData>, ref: React.Ref<TableRef>) {
  const {
    bordered = false,
    columns,
    column,
    dataSource = [],
    rows,
    row,
    rowKey,
    components,
    registry: registryOverride,
    renderers,
    appearance,
    editable,
    showHeader = true,
    tableRef,
    beforeTableContent,
    rowHoverable = true,
    rowSelection,
    testIdPrefix = 'table',
    pagination = false,
    tableLayout,
    size = 'large',
    sortDirections: tableSortDirections = [...DEFAULT_SORT_DIRECTIONS],
    scroll,
    sticky,
    virtual = false,
    loading = false,
    locale,
    className,
    style,
    title,
    footer,
    summary,
    expandable,
    onChange,
    onStateChange,
    onRowOrderChange,
    onColumnOrderChange,
    onHeaderRow,
    onRow,
    onScroll,
    onEdit,
    extendable,
    rowDataTypes: rowDataTypesOverride,
  } = { ...rawProps, appearance: { borders: 'grid' as const, headerRow: true, ...rawProps.appearance } };
  const { state: loadingState, variant: loadingVariant } = useLoadingState(loading);
  const {
    resolvedExtendable,
    appendedRows,
    appendedColumns,
    appendRow: handleAppendRow,
    appendColumn: handleAppendColumn,
  } = useAppendControls({ extendable, columns, rows });

  const props = rawProps;
  const rowDataTypeMap = useRowDataTypeMap(rowDataTypesOverride);
  const rootEditableConfig = tableEditableConfig(editable);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const state = useTableState(rawProps, columns);
  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    initialFilterItemsRef,
    expanded,
    setExpanded,
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
    columnSizing,
    setColumnSizing,
    columnPinning,
    setColumnPinning,
    paginationStateValue,
    setPaginationStateValue,
    tanStackRowSelection,
    setTanStackRowSelection,
    selectionKeysToState,
    preserveSelectedRecordsRef,
    lastSelectedKeyRef,
    editingCell,
    setEditingCell,
    editingRowKey,
    setEditingRowKey,
    editValues,
    setEditValues,
    editErrors,
    setEditErrors,
    internalCellValues,
    setInternalCellValues,
    rowOrder,
    setRowOrder,
  } = state;
  const { sensors: dragSensors, setActiveDragId, modifiers: dragModifiers } = useDragState();

  const emitStateChange = React.useCallback(
    (partial: Partial<NonNullable<TableProps<TRecord, TRowData>['state']>>) => {
      onStateChange?.({
        sorting,
        filters: columnFilters,
        expanded,
        pagination: paginationStateValue,
        rowSelection: tanStackRowSelection,
        columnVisibility,
        columnOrder,
        columnSizing,
        columnPinning,
        ...partial,
      });
    },
    [columnFilters, columnOrder, columnPinning, columnSizing, columnVisibility, expanded, onStateChange, paginationStateValue, sorting, tanStackRowSelection],
  );

  const registry = React.useMemo(() => {
    const merged = mergeTableRegistry(getDefaultTableRegistry<TRecord, TRowData>(), registryOverride);
    return mergeTableRegistry(merged, { components, renderers } as Partial<TableRegistry<TRecord, TRowData>>);
  }, [components, registryOverride, renderers]);

  const { childrenColumnName, treeMode, mergedColumns, mergedLeafColumns } = useDerivedColumns({
    columns,
    column,
    appendedColumns,
    dataSource,
    expandable,
    columnVisibility,
    columnOrder,
  });
  const { resolvedRows, allResolvedRows, rowByKey } = useResolvedRows({
    dataSource,
    rows,
    row,
    rowKey,
    childrenColumnName,
    appendedRows,
    rowOrder,
  });

  const paginationStateRef = React.useRef<() => TablePaginationState>(() => ({ current: 1, pageSize: 1, total: 0 }));
  const scrollToFirstRowRef = React.useRef<() => void>(() => {});

  const { table, applySortingChange } = useTableInstance({
    rawProps,
    columns,
    mergedLeafColumns,
    resolvedRows,
    dataSource,
    sorting,
    columnFilters,
    expanded,
    paginationStateValue,
    tanStackRowSelection,
    columnVisibility,
    columnOrder,
    columnSizing,
    columnPinning,
    setSorting,
    setColumnFilters,
    setExpanded,
    setPaginationStateValue,
    setTanStackRowSelection,
    setColumnVisibility,
    setColumnOrder,
    setColumnSizing,
    setColumnPinning,
    emitStateChange,
    paginationState: () => paginationStateRef.current(),
    scrollToFirstRow: () => scrollToFirstRowRef.current(),
  });

  const visibleRows = table.getRowModel().rows;
  const selection = useSelectionHandlers({
    rowSelection,
    locale,
    allResolvedRows,
    resolvedRows,
    rowByKey,
    tanStackRowSelection,
    setTanStackRowSelection,
    selectionKeysToState,
    preserveSelectedRecordsRef,
    lastSelectedKeyRef,
    emitStateChange,
  });
  const {
    selectedKeys,
    selectedKeySet,
    selectionFixedSide,
    selectionAlignStyle,
    selectedRecordsForKeys,
    selectionCheckboxPropsFor,
    isSelectionDisabled,
    changeableSelectionKeys,
    applySelectionKeys,
    handleSelect,
    resolvedSelectionActions,
    bulkActionsConfigured,
    clearSelection,
    runBulkAction,
  } = selection;
  const { enableVirtualRows, rowVirtualizer, virtualItems, renderRows, renderedLeafColumns } = useVirtualization({
    virtual,
    visibleRows,
    scrollRef,
    mergedLeafColumns,
    columnPinning,
  });
  const virtualRowsEnabled = Boolean(enableVirtualRows);
  const classMap = resolveClassNames(props);
  const styleMap = resolveStyles(props);
  const rootStyle = { ...appearanceStyle(appearance), ...styleMap.root, ...style } as React.CSSProperties;
  const borders = bordered ? 'grid' : (appearance.borders ?? 'grid');
  const currentRows = resolvedRows.map((r) => r.row);
  const currentData = resolvedRows.map((r) => r.record);
  const resolvedTableLayout = tableLayout ?? (mergedLeafColumns.some(isEllipsisEnabled) ? 'fixed' : undefined);
  const stickyContainer = React.useMemo(() => (typeof sticky === 'object' ? sticky.getContainer?.() : undefined), [sticky]);

  const { paginationState, scrollToFirstRow, committedFilterKeys, commitFilter, toggleExpanded } = useTableHandlers<TRecord, TRowData>({
    columnFilters,
    setColumnFilters,
    paginationStateValue,
    setPaginationStateValue,
    expanded,
    setExpanded,
    sorting,
    tanStackRowSelection,
    emitStateChange,
    onStateChange,
    onChange,
    allResolvedRows,
    resolvedRows,
    mergedLeafColumns,
    table,
    pagination,
    expandable,
    scroll,
    scrollRef,
  });

  paginationStateRef.current = paginationState;
  scrollToFirstRowRef.current = scrollToFirstRow;

  useTableRefHandle({ ref, rootRef, scrollRef, visibleRows, enableVirtualRows: virtualRowsEnabled, rowVirtualizer });

  const { draggableRowKeys, hasDraggableRows, draggableColumnKeys, moveRowByKeyboard, moveColumnByKeyboard, handleDragEnd } = useReorderHandlers({
    resolvedRows,
    mergedLeafColumns,
    setRowOrder,
    setColumnOrder,
    emitStateChange,
    onRowOrderChange,
    onColumnOrderChange,
  });
  const {
    editableErrorKey,
    rowInitialEditableValues,
    setEditableValue,
    beginCellEdit,
    bodyCellEditableConfig,
    saveCellEdit,
    editableCellTarget,
    firstEditableCellTarget,
    saveRowEdit,
    cancelCellEdit,
    cancelRowEdit,
  } = useEditableHandlers({
    registry,
    renderedLeafColumns,
    renderRows,
    rootEditableConfig,
    editValues,
    setEditValues,
    setEditErrors,
    setEditingCell,
    setEditingRowKey,
    setInternalCellValues,
    onEdit,
  });
  const { tableContent, bulkActionsBar } = useTableSlots<TRecord, TRowData>({
    rowSelection,
    expandable,
    onHeaderRow,
    appearance,
    treeMode,
    currentRows,
    resolvedRows,
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
    initialFilterItemsMap: initialFilterItemsRef.current,
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
    rowClassName: rawProps.rowClassName,
    locale,
    dragSensors,
    dragModifiers,
    setActiveDragId,
    handleDragEnd,
    draggableColumnKeys,
    draggableRowKeys,
    enableVirtualRows: virtualRowsEnabled,
    virtualItems,
    rowVirtualizer,
    renderRows,
    loadingState,
    loadingVariant,
  });

  const { topPagination, bottomPagination } = usePaginationHandlers({
    pagination,
    paginationStateValue,
    setPaginationStateValue,
    table,
    paginationState,
    scrollToFirstRow,
    onChange,
    columnFilters,
    dataSource,
    resolvedRows,
    allResolvedRows,
    emitStateChange,
    classMap,
    styleMap,
  });

  const tableContextValue = useTableContextValue<TRecord, TRowData>({
    table,
    props,
    registry,
    testIdPrefix,
    mergedColumns,
    mergedLeafColumns,
    renderedLeafColumns,
    resolvedRows,
    rowByKey,
    rowDataTypeMap,
    classMap,
    styleMap,
    rootEditableConfig,
    expanded,
    editingCell,
    editingRowKey,
    editValues,
    editErrors,
    internalCellValues,
    sorting,
    columnSizing,
    columnPinning,
    tableSortDirections,
    applySortingChange,
    moveColumnByKeyboard,
    moveRowByKeyboard,
  });

  return (
    <TableProvider value={tableContextValue as TableContextShape}>
      <TableRoot<TRecord, TRowData>
        rootRef={rootRef}
        scrollRef={scrollRef}
        className={className}
        style={style}
        rootStyle={rootStyle}
        appearance={appearance}
        borders={borders}
        showHeader={showHeader}
        size={size}
        rowHoverable={rowHoverable}
        scroll={scroll}
        sticky={sticky}
        stickyContainer={stickyContainer}
        enableVirtualRows={virtualRowsEnabled}
        virtual={virtual}
        onScroll={onScroll}
        currentData={currentData}
        currentRows={currentRows}
        resolvedExtendable={resolvedExtendable}
        handleAppendRow={handleAppendRow}
        handleAppendColumn={handleAppendColumn}
        loadingState={loadingState}
        loadingVariant={loadingVariant}
        renderRows={renderRows}
        hasDraggableRows={hasDraggableRows}
        rowSelection={rowSelection}
        expandable={expandable}
        treeMode={treeMode}
        tableContent={tableContent}
        bulkActionsBar={bulkActionsBar}
        topPagination={topPagination}
        bottomPagination={bottomPagination}
        title={title}
        footer={footer}
      />
    </TableProvider>
  );
}

export const Table = React.forwardRef(TableImpl) as <TRecord, TRowData = unknown>(
  props: TableProps<TRecord, TRowData> & { ref?: React.Ref<TableRef> },
) => React.ReactElement;

export default Table;
