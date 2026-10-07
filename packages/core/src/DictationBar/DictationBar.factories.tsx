import type { DictationBarProps } from '@oc-tech/omni-ui-components/DictationBar';
import { Check, X } from 'lucide-react';
import type { Variant } from '../../internal/support/makeFactory';

export const dictationBarPropsFactory = (
  overrides: Partial<DictationBarProps> = {},
): DictationBarProps => ({
  text: '',
  cancelIcon: <X />,
  doneIcon: <Check />,
  onCancel: () => undefined,
  onDone: () => undefined,
  ...overrides,
});

export const dictationBarVariants: Variant<DictationBarProps>[] = [
  { name: 'Listening', args: {} },
  { name: 'Live transcript', args: { text: 'walk me through the two pointer approach' } },
  { name: 'Pill (no record dot)', args: { variant: 'pill', text: 'walk me through' } },
];
