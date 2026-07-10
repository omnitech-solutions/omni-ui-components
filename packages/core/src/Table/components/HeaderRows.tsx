import * as React from 'react';
import classNames from 'classnames';
import { useTable } from '../hooks/useTable';
import { leafColumns } from '../internal';
import type { TableColumn, TableProps } from '../Table.types';

export interface HeaderRowsProps<TRecord, TRowData> {
  hasDraggableRows: boolean;
  onHeaderRow: TableProps<TRecord, TRowData>['onHeaderRow'];
  renderRowDragHeader: () => React.ReactNode;
  renderSelectionHeader: () => React.ReactNode;
  renderExpandHeader: () => React.ReactNode;
  renderHeaderCell: (col: TableColumn<TRecord, TRowData>, columnIndex: number, extraProps?: React.ThHTMLAttributes<HTMLTableCellElement>) => React.ReactNode;
  leafCount: (col: TableColumn<TRecord, TRowData>) => number;
  treeMode?: boolean;
}

export function HeaderRows<TRecord, TRowData>({
  hasDraggableRows,
  onHeaderRow,
  renderRowDragHeader,
  renderSelectionHeader,
  renderExpandHeader,
  renderHeaderCell,
  leafCount,
  treeMode = false,
}: HeaderRowsProps<TRecord, TRowData>) {
  const { table, props, registry, testIdPrefix, classMap, styleMap, mergedColumns, mergedLeafColumns, renderedLeafColumns } = useTable<TRecord, TRowData>();
  const hasGroups = mergedColumns.some((col) => col.children?.length);
  const { HeaderRow } = registry.components;

  if (!hasGroups) {
    return (
      <HeaderRow
        table={table}
        props={props}
        registry={registry}
        className={classNames(classMap['header.row'])}
        style={styleMap['header.row']}
        data-testid={`${testIdPrefix}-header-row-main`}
        {...onHeaderRow?.(renderedLeafColumns, 0)}
      >
        {renderRowDragHeader()}
        {renderSelectionHeader()}
        {renderExpandHeader()}
        {renderedLeafColumns.map((col) =>
          renderHeaderCell(
            col,
            mergedLeafColumns.findIndex((item) => item.key === col.key),
          ),
        )}
      </HeaderRow>
    );
  }

  return (
    <>
      <HeaderRow
        table={table}
        props={props}
        registry={registry}
        className={classNames(classMap['header.row'])}
        style={styleMap['header.row']}
        data-testid={`${testIdPrefix}-header-row-main`}
        {...onHeaderRow?.(mergedColumns, 0)}
      >
        {renderRowDragHeader()}
        {renderSelectionHeader()}
        {renderExpandHeader()}
        {mergedColumns.map((col, index) =>
          col.children?.length ? renderHeaderCell(col, index, { colSpan: leafCount(col) }) : renderHeaderCell(col, index, { rowSpan: 2 }),
        )}
      </HeaderRow>
      <HeaderRow
        table={table}
        props={props}
        registry={registry}
        className={classNames(classMap['header.row'])}
        style={styleMap['header.row']}
        data-testid={`${testIdPrefix}-header-row-leaf`}
      >
        {hasDraggableRows && <th data-testid={`${testIdPrefix}-row-drag-header-cell-leaf`} />}
        {props.rowSelection && <th data-testid={`${testIdPrefix}-selection-header-cell-leaf`} />}
        {!treeMode && props.expandable && props.expandable.showExpandColumn !== false && <th data-testid={`${testIdPrefix}-expand-header-cell-leaf`} />}
        {mergedColumns.flatMap((col) => (col.children?.length ? leafColumns([col]).map((leaf, index) => renderHeaderCell(leaf, index)) : []))}
      </HeaderRow>
    </>
  );
}
