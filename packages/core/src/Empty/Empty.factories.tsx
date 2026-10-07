import type { EmptyProps } from '@oc-tech/omni-ui-components/Empty';
import { Code, Hourglass, MonitorUp } from 'lucide-react';
import type { Variant } from '../../internal/support/makeFactory';

/** Build `<Empty>` props for standalone stories and tests. */
export const emptyPropsFactory = (overrides: Partial<EmptyProps> = {}): EmptyProps => ({
  description: 'No matching records',
  ...overrides,
});

/** The panel empty states of the Native App: 40px icon tile, optional title, one line, optional action. */
export const emptyVariants: Variant<EmptyProps>[] = [
  { name: 'Dashed (default)', args: { description: 'No matching records' } },
  {
    name: 'Tile with title and action',
    args: {
      variant: 'tile',
      icon: <MonitorUp />,
      title: 'Nothing analysed yet',
      description:
        'Open the problem in your browser and capture it. Spoken questions are answered automatically.',
      action: {
        label: 'Capture screen',
        icon: <MonitorUp />,
        shortcut: ['⌘', '⇧', 'S'],
        onClick: () => undefined,
      },
    },
  },
  {
    name: 'Tile, one line',
    args: {
      variant: 'tile',
      icon: <Code />,
      description: 'Code appears once the approach is drafted.',
    },
  },
  {
    name: 'Tile, waiting',
    args: {
      variant: 'tile',
      icon: <Hourglass />,
      description: 'Starts automatically after the approach.',
    },
  },
];
