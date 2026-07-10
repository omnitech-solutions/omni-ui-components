import * as React from 'react';
import classNames from 'classnames';
import { useTable } from '../hooks/useTable';
import { isExpandedKey, SortableBodyRow } from '../internal';
import type { TableColumn, TableProps, TableResolvedRow } from '../Table.types';

export interface BodyRowProps<TRecord, TRowData> {
  resolved: TableResolvedRow<TRecord, TRowData>;
  rowIndex: number;
  indent: number;
  selected: boolean;
  disabled: boolean;
  canClickExpand: boolean;
  rowClass: string | undefined;
  expandedRowClass: string | undefined;
  rowProps: React.HTMLAttributes<HTMLTableRowElement> & { className?: string };
  hasDraggableRows: boolean;
  treeMode: boolean;
  expandable: TableProps<TRecord, TRowData>['expandable'];
  rowSelection: TableProps<TRecord, TRowData>['rowSelection'];
  toggleExpanded: (resolved: TableResolvedRow<TRecord, TRowData>) => void;
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

export function BodyRow<TRecord, TRowData>({
  resolved,
  rowIndex,
  indent,
  selected,
  disabled,
  canClickExpand,
  rowClass,
  expandedRowClass,
  rowProps,
  hasDraggableRows,
  treeMode,
  expandable,
  rowSelection,
  toggleExpanded,
  renderRowDragCell,
  renderSelectionCell,
  renderExpandCell,
  renderBodyCell,
}: BodyRowProps<TRecord, TRowData>) {
  const { table, props, registry, testIdPrefix, classMap, styleMap, renderedLeafColumns, mergedLeafColumns, expanded, moveRowByKeyboard } = useTable<
    TRecord,
    TRowData
  >();
  const { BodyRow: TBRow } = registry.components;

  const rowKey = String(resolved.key);
  const rowClassName = classNames(
    selected && 'bg-[var(--bui-table-row-selected-bg)]',
    classMap['body.row'],
    rowClass,
    resolved.row.className,
    rowProps.className,
  );
  const rowStyle: React.CSSProperties = { ...resolved.row.style, ...styleMap['body.row'], ...rowProps.style };
  const handleRowClick: React.MouseEventHandler<HTMLTableRowElement> = (event) => {
    rowProps.onClick?.(event);
    if (!event.defaultPrevented && canClickExpand) toggleExpanded(resolved);
  };
  const dataAttrs = {
    'data-row-key': rowKey,
    'data-testid': `${testIdPrefix}-body-row-${rowKey}`,
    'data-indent': indent,
    'data-selected': selected ? 'true' : 'false',
    'data-disabled': disabled ? 'true' : 'false',
  };
  const cells = (
    <>
      {renderRowDragCell(resolved)}
      {renderSelectionCell(resolved, rowIndex)}
      {renderExpandCell(resolved, rowIndex, indent)}
      {renderedLeafColumns.map((col) =>
        renderBodyCell(
          resolved,
          col,
          rowIndex,
          mergedLeafColumns.findIndex((item) => item.key === col.key),
          indent,
        ),
      )}
    </>
  );

  const isDraggable = resolved.row.draggable && !resolved.row.disabled;
  const shouldRenderExpandedRow = Boolean(expandable?.expandedRowRender) && isExpandedKey(expanded, resolved.key);

  return (
    <React.Fragment key={rowKey}>
      {isDraggable ? (
        <SortableBodyRow rowKey={rowKey} onKeyboardMove={moveRowByKeyboard} {...dataAttrs} className={rowClassName} style={rowStyle} onClick={handleRowClick}>
          {cells}
        </SortableBodyRow>
      ) : (
        <TBRow
          table={table}
          props={props}
          registry={registry}
          record={resolved.record}
          row={resolved.row}
          rowIndex={rowIndex}
          {...dataAttrs}
          className={rowClassName}
          style={rowStyle}
          onClick={handleRowClick}
        >
          {cells}
        </TBRow>
      )}
      {shouldRenderExpandedRow && (
        <TBRow
          table={table}
          props={props}
          registry={registry}
          record={resolved.record}
          row={resolved.row}
          rowIndex={rowIndex}
          className={classNames(expandedRowClass)}
          data-indent={indent}
          data-testid={`${testIdPrefix}-expanded-row-${rowKey}`}
        >
          <td
            colSpan={
              renderedLeafColumns.length + (hasDraggableRows ? 1 : 0) + (rowSelection ? 1 : 0) + (!treeMode && expandable!.showExpandColumn !== false ? 1 : 0)
            }
            data-testid={`${testIdPrefix}-expanded-cell-${rowKey}`}
          >
            {expandable!.expandedRowRender!(resolved.record, rowIndex, indent, true, resolved.row)}
          </td>
        </TBRow>
      )}
    </React.Fragment>
  );
}
