import * as React from 'react';
import { Trash2 } from 'lucide-react';

import { PreferencesForm } from '@oc-tech/omni-ui-components/PreferencesForm';
import type { MemoryItem, PreferencesFormProps } from '@oc-tech/omni-ui-components/PreferencesForm';
import type { Variant } from '../../internal/support/makeFactory';

export const sampleMemories = (): MemoryItem[] => [
  { id: 'm1', text: 'Prefers TypeScript over JavaScript' },
  { id: 'm2', text: 'Interviewing for a staff full-stack role' },
];

/** Build `<PreferencesForm>` props for standalone stories and tests. */
export const preferencesFormPropsFactory = (overrides: Partial<PreferencesFormProps> = {}): PreferencesFormProps => ({
  instructions: 'Answer in short bullet points. Say the complexity out loud.',
  memories: sampleMemories(),
  memoryEnabled: true,
  onMemoryToggle: () => undefined,
  onForget: () => undefined,
  forgetIcon: <Trash2 />,
  ...overrides,
});

export const preferencesFormVariants: Variant<PreferencesFormProps>[] = [
  { name: 'Instructions and memory', args: {} },
  { name: 'Instructions only', args: { memories: undefined } },
  { name: 'Memory empty', args: { memories: [] } },
  { name: 'Loading', args: { loading: true } },
];

/** A working form: the memory switch and Forget change local state; `onChange` reports every keystroke. */
export const PreferencesFormDemo: React.FC<{ onAction?: (name: string, ...args: unknown[]) => void }> = ({ onAction }) => {
  const [enabled, setEnabled] = React.useState(true);
  const [memories, setMemories] = React.useState(sampleMemories());
  return (
    <div className="w-[520px]">
      <PreferencesForm
        {...preferencesFormPropsFactory({
          memoryEnabled: enabled,
          memories,
          onChange: (text) => onAction?.('change', text),
          onMemoryToggle: (next) => {
            setEnabled(next);
            onAction?.('memory', next);
          },
          onForget: (memory) => {
            setMemories((list) => list.filter((item) => item.id !== memory.id));
            onAction?.('forget', memory.id);
          },
        })}
      />
    </div>
  );
};
