import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RowDragHandleContext, type SortableHandleBinding } from '../dragHandle';

// Sortable `<tr>`. Publishes the drag binding via RowDragHandleContext
// so a nested handle cell can attach the grip. Vertical-axis lock lives in useDragState.
export interface SortableBodyRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  rowKey: string;
  onKeyboardMove: (rowKey: string, direction: -1 | 1) => void;
  children?: React.ReactNode;
}

export const SortableBodyRow: React.FC<SortableBodyRowProps> = ({ rowKey, onKeyboardMove, children, style, ...rowProps }) => {
  const { attributes, listeners, setActivatorNodeRef, transform, transition, setNodeRef, isDragging } = useSortable({ id: `row:${rowKey}` });

  const mergedStyle: React.CSSProperties = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative',
    zIndex: isDragging ? 4 : style?.zIndex,
  };

  const handleBinding = React.useMemo<SortableHandleBinding>(
    () => ({
      attributes: attributes as unknown as Record<string, unknown>,
      listeners: listeners as React.HTMLAttributes<HTMLButtonElement> | undefined,
      setActivatorNodeRef,
      isDragging,
      onKeyboardMove: (direction) => onKeyboardMove(rowKey, direction),
    }),
    [attributes, listeners, setActivatorNodeRef, isDragging, rowKey, onKeyboardMove],
  );

  return (
    <RowDragHandleContext.Provider value={handleBinding}>
      <tr {...rowProps} style={mergedStyle} ref={setNodeRef} data-dragging={isDragging ? 'true' : undefined}>
        {children}
      </tr>
    </RowDragHandleContext.Provider>
  );
};
