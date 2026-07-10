import * as React from 'react';
import classNames from 'classnames';
import { useTable } from '../hooks/useTable';
import { bodyCellClass, headerCellClass, SortableRowHandleCell } from '../internal';

export interface RowDragHeaderProps {
  className?: string;
  style?: React.CSSProperties;
}

export const RowDragHeader: React.FC<RowDragHeaderProps> = ({ className, style }) => {
  const { testIdPrefix } = useTable();
  return (
    <th
      className={classNames(headerCellClass, className)}
      style={{ width: 'var(--bui-table-selection-column-width)', ...style }}
      data-testid={`${testIdPrefix}-row-drag-header-cell`}
    />
  );
};

export interface RowDragCellProps {
  rowKey: string;
  draggable: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const RowDragCell: React.FC<RowDragCellProps> = ({ rowKey, draggable, className, style }) => {
  const { testIdPrefix } = useTable();
  return (
    <td
      className={classNames(bodyCellClass, className)}
      style={{ width: 'var(--bui-table-selection-column-width)', ...style }}
      data-bui-utility-cell="true"
      data-testid={`${testIdPrefix}-row-drag-cell-${rowKey}`}
    >
      {draggable && <SortableRowHandleCell label={`Reorder row ${rowKey}`} testId={`${testIdPrefix}-row-drag-handle-${rowKey}`} rowKey={rowKey} />}
    </td>
  );
};
