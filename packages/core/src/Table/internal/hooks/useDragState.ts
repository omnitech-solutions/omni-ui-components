import * as React from 'react';
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToHorizontalAxis, restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

// DnD sensors + axis modifier. Active id prefix (`column:` / `row:`) locks
// the axis so a column can't be dragged vertically off the table.
export function useDragState() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 1 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [activeDragId, setActiveDragId] = React.useState<string | null>(null);

  const modifiers = React.useMemo(() => {
    if (!activeDragId) return [restrictToParentElement];
    if (activeDragId.startsWith('column:')) return [restrictToHorizontalAxis, restrictToParentElement];
    if (activeDragId.startsWith('row:')) return [restrictToVerticalAxis, restrictToParentElement];
    return [restrictToParentElement];
  }, [activeDragId]);

  return { sensors, activeDragId, setActiveDragId, modifiers };
}
