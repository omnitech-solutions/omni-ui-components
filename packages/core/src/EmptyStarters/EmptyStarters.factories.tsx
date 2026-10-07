import type { EmptyStartersProps, StarterItem } from '@oc-tech/omni-ui-components/EmptyStarters';
import { BookOpen, Code2, MessagesSquare, Sparkles } from 'lucide-react';
import type { Variant } from '../../internal/support/makeFactory';

export const sampleStarters = (): StarterItem[] => [
  {
    icon: <Code2 />,
    title: 'Solve a coding question',
    subtitle: 'Runnable answer with tests',
    prompt: 'Solve Two Sum in TypeScript',
  },
  {
    icon: <BookOpen />,
    title: 'Explain a concept',
    subtitle: 'Spoken in 60 seconds',
    prompt: 'Explain closures',
  },
  {
    icon: <MessagesSquare />,
    title: 'Behavioural story',
    subtitle: 'Evidence-backed mini-STAR',
    prompt: 'Help me tell the outage story',
  },
  { icon: <Sparkles />, title: 'Mock interview', prompt: '/mock-interview' },
];

/** Build `<EmptyStarters>` props for standalone stories and tests. */
export const emptyStartersPropsFactory = (
  overrides: Partial<EmptyStartersProps> = {},
): EmptyStartersProps => ({
  title: 'What are we working on?',
  description: 'Ask anything, or pick a starter.',
  starters: sampleStarters(),
  onStart: () => undefined,
  ...overrides,
});

export const emptyStartersVariants: Variant<EmptyStartersProps>[] = [
  { name: 'Two columns', args: {} },
  { name: 'Three columns', args: { columns: 3 } },
  { name: 'One column (narrow)', args: { columns: 1 } },
  { name: 'Title only', args: { starters: [], description: undefined } },
];
