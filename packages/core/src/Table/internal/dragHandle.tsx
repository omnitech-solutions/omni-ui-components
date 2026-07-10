import * as React from 'react';
import { GripVertical } from 'lucide-react';

export type SortableHandleBinding = {
  attributes: Record<string, unknown>;
  listeners: React.HTMLAttributes<HTMLButtonElement> | undefined;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  isDragging: boolean;
  onKeyboardMove: (direction: -1 | 1) => void;
};

type SortableHandleProps = {
  label: string;
  testId: string;
  axis: 'horizontal' | 'vertical';
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  attributes: Record<string, unknown>;
  listeners: React.HTMLAttributes<HTMLButtonElement> | undefined;
  isDragging: boolean;
  onKeyboardMove: (direction: -1 | 1) => void;
};

export const SortableHandle = ({ label, testId, axis, setActivatorNodeRef, attributes, listeners, isDragging, onKeyboardMove }: SortableHandleProps) => {
  const listenerProps = listeners;
  return (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label={label}
      className="bui-table-drag-handle"
      data-testid={testId}
      data-dragging={isDragging ? 'true' : 'false'}
      data-axis={axis}
      {...attributes}
      {...listenerProps}
      onKeyDown={(event) => {
        if (axis === 'vertical' && event.key === 'ArrowUp') {
          event.preventDefault();
          onKeyboardMove(-1);
          return;
        }
        if (axis === 'vertical' && event.key === 'ArrowDown') {
          event.preventDefault();
          onKeyboardMove(1);
          return;
        }
        if (axis === 'horizontal' && event.key === 'ArrowLeft') {
          event.preventDefault();
          onKeyboardMove(-1);
          return;
        }
        if (axis === 'horizontal' && event.key === 'ArrowRight') {
          event.preventDefault();
          onKeyboardMove(1);
          return;
        }
        listenerProps?.onKeyDown?.(event);
      }}
    >
      <GripVertical className="bui-table-drag-handle__icon" aria-hidden="true" />
    </button>
  );
};

export const RowDragHandleContext = React.createContext<SortableHandleBinding | null>(null);

type SortableRowHandleCellProps = {
  label: string;
  testId: string;
  rowKey: string;
};

export const SortableRowHandleCell = ({ label, testId, rowKey }: SortableRowHandleCellProps) => {
  const binding = React.useContext(RowDragHandleContext);
  if (!binding) return null;

  return (
    <span className="bui-table-sortable-row-handle" data-row-key={rowKey} data-dragging={binding.isDragging ? 'true' : 'false'}>
      <SortableHandle
        label={label}
        testId={testId}
        axis="vertical"
        setActivatorNodeRef={binding.setActivatorNodeRef}
        attributes={binding.attributes}
        listeners={binding.listeners}
        isDragging={binding.isDragging}
        onKeyboardMove={binding.onKeyboardMove}
      />
    </span>
  );
};
