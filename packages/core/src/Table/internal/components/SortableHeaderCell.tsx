import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableHandle } from '../dragHandle';

// Sortable `<th>`: adds grip + transform styling around the header content.
// Horizontal-axis lock lives in useDragState.
export interface SortableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  columnKey: string;
  testIdPrefix: string;
  onKeyboardMove: (columnKey: string, direction: -1 | 1) => void;
  children?: React.ReactNode;
}

export const SortableHeaderCell: React.FC<SortableHeaderCellProps> = ({ columnKey, testIdPrefix, onKeyboardMove, children, style, ...cellProps }) => {
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging } = useSortable({ id: `column:${columnKey}` });

  const mergedStyle: React.CSSProperties = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative',
    zIndex: isDragging ? 5 : style?.zIndex,
  };

  return (
    <th {...cellProps} style={mergedStyle} ref={setNodeRef} scope="col" data-dragging={isDragging ? 'true' : undefined}>
      <span className="bui-table-header-drag">
        <SortableHandle
          label={`Reorder column ${columnKey}`}
          testId={`${testIdPrefix}-column-drag-handle-${columnKey}`}
          axis="horizontal"
          setActivatorNodeRef={setActivatorNodeRef}
          attributes={attributes as unknown as Record<string, unknown>}
          listeners={listeners as React.HTMLAttributes<HTMLButtonElement> | undefined}
          isDragging={isDragging}
          onKeyboardMove={(direction) => onKeyboardMove(columnKey, direction)}
        />
        <span className="bui-table-header-content">{children}</span>
      </span>
    </th>
  );
};
