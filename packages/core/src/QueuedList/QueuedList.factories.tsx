import type { QueuedListProps } from '@oc-tech/omni-ui-components/QueuedList';
import { Clock, X } from 'lucide-react';
import type { Variant } from '../../internal/support/makeFactory';

/** Build `<QueuedList>` props with its icons (nodes are supplied by the factory). */
export const queuedListPropsFactory = (
  overrides: Partial<QueuedListProps> = {},
): QueuedListProps => ({
  items: [
    { id: 'a', text: 'And the space trade-off?' },
    {
      id: 'b',
      text: 'Then show the two pointer version with the sorted-input assumption spelled out in a comment.',
    },
  ],
  icon: <Clock />,
  removeIcon: <X />,
  onRemove: () => undefined,
  ...overrides,
});

export const queuedListVariants: Variant<QueuedListProps>[] = [
  { name: 'Two queued', args: {} },
  { name: 'One queued', args: { items: [{ id: 'a', text: 'And the space trade-off?' }] } },
  { name: 'Read only (no remove)', args: { onRemove: undefined } },
];
