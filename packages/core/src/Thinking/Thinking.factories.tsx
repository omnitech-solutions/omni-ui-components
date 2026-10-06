import * as React from 'react';
import { Brain, ChevronDown } from 'lucide-react';

import type { ThinkingProps } from '@oc-tech/omni-ui-components/Thinking';
import type { Variant } from '../../internal/support/makeFactory';

export const SAMPLE_REASONING =
  'The input is unsorted, so two pointers do not apply. A hash map from value to index gives O(n): for each number I check whether target minus the number was already seen.';

/** Build `<Thinking>` props for stories and tests. */
export const thinkingPropsFactory = (overrides: Partial<ThinkingProps> = {}): ThinkingProps => ({
  text: SAMPLE_REASONING,
  seconds: 4,
  icon: <Brain />,
  chevron: <ChevronDown />,
  ...overrides,
});

export const thinkingVariants: Variant<ThinkingProps>[] = [
  { name: 'Streaming', args: { streaming: true } },
  { name: 'Thought for 4s', args: {} },
  { name: 'Expanded', args: { defaultOpen: true } },
  { name: 'No duration', args: { seconds: undefined } },
];
