import type { SuggestionsProps } from '@oc-tech/omni-ui-components/Suggestions';
import { CornerDownRight } from 'lucide-react';
import type { Variant } from '../../internal/support/makeFactory';

/** Build `<Suggestions>` props for stories and tests. */
export const suggestionsPropsFactory = (
  overrides: Partial<SuggestionsProps> = {},
): SuggestionsProps => ({
  items: [
    { id: 'test', label: 'Show me a test for it' },
    { id: 'sorted', label: 'What if the array is sorted?' },
    { id: 'complexity', label: 'Explain the complexity' },
  ],
  icon: <CornerDownRight />,
  onSelect: () => undefined,
  ...overrides,
});

export const suggestionsVariants: Variant<SuggestionsProps>[] = [
  { name: 'Column (default)', args: {} },
  { name: 'Wrapping row', args: { layout: 'wrap' } },
  { name: 'Disabled while replying', args: { disabled: true } },
];
