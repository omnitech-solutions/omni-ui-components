import type { Variant } from '../internal/support/makeFactory';
import type { StepItem, StepsProps } from './Steps';

export const stepsFixture = (): StepItem[] => [
  { title: 'First' },
  { title: 'Second' },
  { title: 'Complete' },
];

/** Build `<Steps>` props for standalone stories and tests. */
export const stepsPropsFactory = (overrides: Partial<StepsProps> = {}): StepsProps => ({
  items: [{ title: 'Question' }, { title: 'Solution' }, { title: 'Tests' }],
  current: 1,
  ...overrides,
});

/** Analysis progress of the Native App Answer panel: done check, current ring, pending circle. */
export const stepsChecklistItems = (): StepItem[] => [
  { label: 'Captured the screen', state: 'done' },
  { label: 'Reading the problem', state: 'current' },
  { label: 'Drafting an answer', state: 'pending' },
];

export const stepsVariants: Variant<StepsProps>[] = [
  { name: 'Default', args: { current: 1 } },
  { name: 'Checklist, analysing', args: { variant: 'checklist', items: stepsChecklistItems() } },
  {
    name: 'Checklist, all pending',
    args: {
      variant: 'checklist',
      items: stepsChecklistItems().map((item) => ({ ...item, state: 'pending' as const })),
    },
  },
  {
    name: 'Checklist, all done',
    args: {
      variant: 'checklist',
      items: stepsChecklistItems().map((item) => ({ ...item, state: 'done' as const })),
    },
  },
];
