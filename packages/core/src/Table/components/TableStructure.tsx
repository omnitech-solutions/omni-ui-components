import * as React from 'react';
import classNames from 'classnames';
import { closestCenter, DndContext, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Row } from '@tanstack/react-table';
import type { Virtualizer, VirtualItem } from '@tanstack/react-virtual';
import { useTable } from '../hooks/useTable';
import type { TableLoadingVariant } from '../Table.Loading';
import { tableClass } from '../internal';
import type { TableColumn, TableDataRow, TableLoadingProps, TableProps, TableResolvedRow } from '../Table.types';
import { BodyRow } from './BodyRow';

export interface TableStructureProps<TRecord, TRowData> {
  tableRef: TableProps<TRecord, TRowData>['tableRef'];
  scroll: TableProps<TRecord, TRowData>['scroll'];
  sticky: TableProps<TRecord, TRowData>['sticky'];
  showHeader: boolean;
  beforeTableContent: TableProps<TRecord, TRowData>['beforeTableContent'];
  summary: TableProps<TRecord, TRowData>['summary'];
  currentData: TRecord[];
  currentRows: TableDataRow<TRecord, TRowData>[];
  resolvedTableLayout: React.CSSProperties['tableLayout'];
  expandable: TableProps<TRecord, TRowData>['expandable'];
  rowSelection: TableProps<TRecord, TRowData>['rowSelection'];
  onRow: TableProps<TRecord, TRowData>['onRow'];
  rowClassName: TableProps<TRecord, TRowData>['rowClassName'];
  locale: TableProps<TRecord, TRowData>['locale'];
  dragSensors: import('@dnd-kit/core').SensorDescriptor<import('@dnd-kit/core').SensorOptions>[];
  dragModifiers: import('@dnd-kit/core').Modifiers;
  setActiveDragId: (id: string | null) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  draggableColumnKeys: string[];
  draggableRowKeys: string[];
  hasDraggableRows: boolean;
  treeMode: boolean;
  toggleExpanded: (resolved: TableResolvedRow<TRecord, TRowData>) => void;
  selectedKeys: string[];
  isSelectionDisabled: (resolved: TableResolvedRow<TRecord, TRowData>) => boolean;
  enableVirtualRows: boolean;
  virtualItems: VirtualItem[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  renderRows: Row<TableResolvedRow<TRecord, TRowData>>[];
  loadingState: { active: boolean; props?: TableLoadingProps };
  loadingVariant: TableLoadingVariant;
  renderHeaderRows: () => React.ReactNode;
  renderRowDragCell: (resolved: TableResolvedRow<TRecord, TRowData>) => React.ReactNode;
  renderSelectionCell: (resolved: TableResolvedRow<TRecord, TRowData>, rowIndex: number) => React.ReactNode;
  renderExpandCell: (resolved: TableResolvedRow<TRecord, TRowData>, rowIndex: number, indent: number) => React.ReactNode;
  renderBodyCell: (
    resolved: TableResolvedRow<TRecord, TRowData>,
    col: TableColumn<TRecord, TRowData>,
    rowIndex: number,
    columnIndex: number,
    indent: number,
  ) => React.ReactNode;
}

export function TableStructure<TRecord, TRowData>({
  tableRef,
  scroll,
  sticky,
  showHeader,
  beforeTableContent,
  summary,
  currentData,
  currentRows,
  resolvedTableLayout,
  expandable,
  rowSelection,
  onRow,
  rowClassName,
  locale,
  dragSensors,
  dragModifiers,
  setActiveDragId,
  handleDragEnd,
  draggableColumnKeys,
  draggableRowKeys,
  hasDraggableRows,
  treeMode,
  toggleExpanded,
  selectedKeys,
  isSelectionDisabled,
  enableVirtualRows,
  virtualItems,
  rowVirtualizer,
  renderRows,
  loadingState,
  loadingVariant,
  renderHeaderRows,
  renderRowDragCell,
  renderSelectionCell,
  renderExpandCell,
  renderBodyCell,
}: TableStructureProps<TRecord, TRowData>) {
  const { table, props, registry, testIdPrefix, classMap, styleMap, renderedLeafColumns } = useTable<TRecord, TRowData>();
  const { HeaderWrapper, BodyWrapper, Summary, Loading } = registry.components;

  const expandColumnCount = !treeMode && expandable && expandable.showExpandColumn !== false ? 1 : 0;
  const bodyColumnCount = renderedLeafColumns.length + (hasDraggableRows ? 1 : 0) + (rowSelection ? 1 : 0) + expandColumnCount;
  const virtualPadColSpan = bodyColumnCount;

  const virtualBottomPad = (() => {
    if (!enableVirtualRows || virtualItems.length === 0) return null;
    const totalSize = rowVirtualizer.getTotalSize();
    const lastEnd = virtualItems[virtualItems.length - 1].end;
    const remainder = totalSize - lastEnd;
    if (remainder <= 0) return null;
    return (
      <tr aria-hidden="true" style={{ height: remainder }}>
        <td colSpan={virtualPadColSpan} />
      </tr>
    );
  })();

  return (
    <DndContext
      sensors={dragSensors}
      collisionDetection={closestCenter}
      onDragStart={(event: DragStartEvent) => setActiveDragId(String(event.active.id))}
      onDragEnd={(event) => {
        setActiveDragId(null);
        handleDragEnd(event);
      }}
      onDragCancel={() => setActiveDragId(null)}
      modifiers={dragModifiers}
    >
      <table
        ref={tableRef}
        className={tableClass}
        style={{ tableLayout: resolvedTableLayout, minWidth: scroll?.x === true ? '100%' : scroll?.x || undefined }}
        data-testid={`${testIdPrefix}-table`}
      >
        {beforeTableContent}
        {showHeader && (
          <HeaderWrapper
            table={table}
            props={props}
            registry={registry}
            className={classNames(sticky && 'sticky top-0 z-[3]', classMap['header.wrapper'])}
            style={{
              ...(sticky ? { position: 'sticky', top: typeof sticky === 'object' ? (sticky.offsetHeader ?? 0) : 0 } : {}),
              ...styleMap['header.wrapper'],
            }}
            data-testid={`${testIdPrefix}-header-wrapper`}
          >
            <SortableContext items={draggableColumnKeys} strategy={horizontalListSortingStrategy}>
              {renderHeaderRows()}
            </SortableContext>
          </HeaderWrapper>
        )}
        <BodyWrapper
          table={table}
          props={props}
          registry={registry}
          className={classNames(classMap['body.wrapper'])}
          style={styleMap['body.wrapper']}
          data-testid={`${testIdPrefix}-body-wrapper`}
        >
          <SortableContext items={draggableRowKeys} strategy={verticalListSortingStrategy}>
            {loadingState.active &&
              loadingVariant.renderRows?.({
                rowCount: renderRows.length,
                columnCount: bodyColumnCount,
                columns: renderedLeafColumns,
                testIdPrefix,
                props: loadingState.props,
                Spinner: Loading,
              })}
            {!(loadingState.active && loadingVariant.replacesBody) && renderRows.length === 0 && (
              <tr>
                <td className="bui-table-empty-cell" colSpan={bodyColumnCount} data-testid={`${testIdPrefix}-empty`}>
                  {registry.renderers.empty({ children: locale?.emptyText })}
                </td>
              </tr>
            )}
            {enableVirtualRows && virtualItems.length > 0 && virtualItems[0].start > 0 && (
              <tr aria-hidden="true" style={{ height: virtualItems[0].start }}>
                <td colSpan={virtualPadColSpan} />
              </tr>
            )}
            {!(loadingState.active && loadingVariant.replacesBody) &&
              renderRows.map((tanRow, renderIndex) => {
                const resolved = tanRow.original;
                const rowIndex = enableVirtualRows ? (virtualItems[renderIndex]?.index ?? renderIndex) : renderIndex;
                const indent = tanRow.depth ?? 0;
                const rowProps = { ...(onRow?.(resolved.record, rowIndex, resolved.row) ?? {}), ...(resolved.row.onRow?.(resolved.record, rowIndex) ?? {}) };
                const rowClass = typeof rowClassName === 'function' ? rowClassName(resolved.record, rowIndex, resolved.row) : rowClassName;
                const selected = selectedKeys.includes(String(resolved.key)) || resolved.row.selected;
                const disabled = resolved.row.disabled || isSelectionDisabled(resolved);
                const canClickExpand = Boolean(
                  expandable?.expandRowByClick && (expandable.rowExpandable ? expandable.rowExpandable(resolved.record, resolved.row) : true),
                );
                const expandedRowClass =
                  typeof expandable?.expandedRowClassName === 'function'
                    ? expandable.expandedRowClassName(resolved.record, rowIndex, indent)
                    : expandable?.expandedRowClassName;
                return (
                  <BodyRow
                    key={String(resolved.key)}
                    resolved={resolved}
                    rowIndex={rowIndex}
                    indent={indent}
                    selected={Boolean(selected)}
                    disabled={Boolean(disabled)}
                    canClickExpand={canClickExpand}
                    rowClass={rowClass}
                    expandedRowClass={expandedRowClass}
                    rowProps={rowProps}
                    hasDraggableRows={hasDraggableRows}
                    treeMode={treeMode}
                    expandable={expandable}
                    rowSelection={rowSelection}
                    toggleExpanded={toggleExpanded}
                    renderRowDragCell={renderRowDragCell}
                    renderSelectionCell={renderSelectionCell}
                    renderExpandCell={renderExpandCell}
                    renderBodyCell={renderBodyCell}
                  />
                );
              })}
            {virtualBottomPad}
          </SortableContext>
        </BodyWrapper>
        {summary && (
          <Summary
            table={table}
            props={props}
            registry={registry}
            className={classMap.summary}
            style={styleMap.summary}
            data-testid={`${testIdPrefix}-summary`}
          >
            {summary(currentData, currentRows)}
          </Summary>
        )}
      </table>
    </DndContext>
  );
}
