import {
  type OutlineItem,
  OutlineList,
  type OutlineListProps,
} from '@oc-tech/omni-ui-components/OutlineList';
import * as React from 'react';
import type { Variant } from '../internal/support/makeFactory';

/** A question of an interview: the base item plus the caller's own field. */
export interface OutlineQuestion extends OutlineItem {
  askedAt: string;
}

/** The questions of a call in the order they were asked; the last one is being answered now. */
export const outlineQuestions: OutlineQuestion[] = [
  { id: 'q1', label: 'Tell me about yourself', meta: '11:32', askedAt: '11:32' },
  { id: 'q2', label: 'Microservice or monolith?', meta: '11:38', askedAt: '11:38' },
  {
    id: 'q3',
    label: 'How would you migrate a monolith without a freeze?',
    meta: '11:41 · 2 follow-ups',
    askedAt: '11:41',
  },
  {
    id: 'q4',
    label: 'Data consistency across services',
    meta: '11:46',
    state: 'live',
    askedAt: '11:46',
  },
];

/** Build `<OutlineList>` props for stories and tests. */
export const outlineListPropsFactory = (
  overrides: Partial<OutlineListProps<OutlineQuestion>> = {},
): OutlineListProps<OutlineQuestion> => ({
  items: outlineQuestions,
  title: 'Questions',
  hint: 'newest first',
  order: 'reversed',
  defaultValue: 'q2',
  onValueChange: () => undefined,
  ...overrides,
});

/** A list that keeps the chosen question itself, reporting each choice. `readOnly` leaves `onValueChange` out. */
export const OutlineListDemo: React.FC<
  Partial<OutlineListProps<OutlineQuestion>> & {
    readOnly?: boolean;
    onAction?: (name: string, detail?: unknown) => void;
  }
> = ({ onAction, readOnly = false, ...props }) => {
  const [value, setValue] = React.useState<string | null>(props.defaultValue ?? 'q2');
  return (
    <OutlineList<OutlineQuestion>
      {...outlineListPropsFactory(props)}
      value={value}
      onValueChange={
        readOnly
          ? undefined
          : (item) => {
              onAction?.('value', item);
              setValue(item.id);
            }
      }
    />
  );
};

export const outlineListVariants: Variant<OutlineListProps<OutlineQuestion>>[] = [
  { name: 'Newest first, one chosen, one live', args: {} },
  { name: 'In the order given', args: { order: 'as-given', hint: 'oldest first' } },
  { name: 'The live question is the one on show', args: { defaultValue: 'q4' } },
  { name: 'Read-only (no onValueChange)', args: { onValueChange: undefined } },
  {
    name: 'Empty',
    args: { items: [], hint: undefined, empty: 'Questions appear here as they are asked.' },
  },
  { name: 'No header', args: { title: undefined, hint: undefined } },
];
