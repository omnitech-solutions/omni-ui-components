import * as React from 'react';
import { ChevronDown, ListCollapse } from 'lucide-react';

import type { SummaryDividerProps } from '@oc-tech/omni-ui-components/SummaryDivider';
import type { Variant } from '../../internal/support/makeFactory';

/** Build `<SummaryDivider>` props for stories and tests. */
export const summaryDividerPropsFactory = (overrides: Partial<SummaryDividerProps> = {}): SummaryDividerProps => ({
  count: 12,
  text: 'You asked for a Two Sum solution, settled on a hash map, and agreed to add tests.',
  icon: <ListCollapse />,
  chevron: <ChevronDown />,
  ...overrides,
});

export const summaryDividerVariants: Variant<SummaryDividerProps>[] = [
  { name: 'Closed', args: {} },
  { name: 'Open', args: { defaultOpen: true } },
  { name: 'One message', args: { count: 1 } },
];
