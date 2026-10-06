import * as React from 'react';
import { ArrowUp, Check, ChevronDown, Plus } from 'lucide-react';

import { ContextMeter } from '../ContextMeter';
import { SAMPLE_SECTIONS } from '../ContextMeter/ContextMeter.factories';
import { IconButton } from '../IconButton';
import { Input } from '../Input';
import { makeFactory, type Variant } from '../internal/support/makeFactory';
import { ModelPicker } from './ModelPicker';
import type { ModelIcons, ModelInfo, ModelPickerProps, ModelProvider } from './ModelPicker.types';

export const LOCAL_PROVIDER: ModelProvider = { name: 'LM Studio', endpoint: 'http://localhost:1234/v1', local: true };
export const CLOUD_PROVIDER: ModelProvider = { name: 'OpenRouter', endpoint: 'openrouter.ai' };

export const QWEN: ModelInfo = {
  id: 'lm-studio/qwen3-coder-30b',
  name: 'Qwen3 Coder 30B',
  shortName: 'Qwen3 Coder',
  description: 'Strong local model for code and agent work.',
  tags: ['Local', 'Fast'],
  contextWindow: 262144,
  tools: true,
  vision: true,
  reasoning: true,
  parameters: '30B',
  strengths: ['coding', 'agents'],
};

export const GEMMA: ModelInfo = {
  id: 'lm-studio/gemma-3-12b',
  name: 'Gemma 3 12B',
  tags: ['Local'],
  contextWindow: 131072,
  vision: true,
  parameters: '12B',
  strengths: ['reading documents', 'speed'],
};

export const SONNET: ModelInfo = {
  id: 'openrouter/claude-sonnet',
  name: 'Claude Sonnet',
  shortName: 'Sonnet',
  description: 'Careful, long-context reasoning.',
  provider: CLOUD_PROVIDER,
  contextWindow: 1_000_000,
  tools: true,
  vision: true,
  reasoning: true,
  strengths: ['coding', 'research'],
};

export const MINI: ModelInfo = { id: 'openrouter/mini', name: 'Mini', provider: CLOUD_PROVIDER, tools: true };

/** A local listing followed by a hosted one: two groups. */
export const sampleModels = (): ModelInfo[] => [QWEN, GEMMA, SONNET, MINI];

/** Lucide icons for stories and tests (the component takes any node). */
export const MODEL_ICONS: ModelIcons = { check: <Check />, add: <Plus />, expand: <ChevronDown /> };

/** Build `<ModelPicker>` props: two providers, a reasoning model selected at medium effort. */
export const modelPickerPropsFactory = makeFactory<ModelPickerProps>({
  models: sampleModels(),
  provider: LOCAL_PROVIDER,
  selectedId: QWEN.id,
  effort: 'medium',
  icons: MODEL_ICONS,
  onAddProvider: () => undefined,
});

export const modelPickerVariants: Variant<ModelPickerProps>[] = [
  { name: 'Reasoning model (chip shows effort)', args: {} },
  { name: 'Non-reasoning model (effort ignored note)', args: { selectedId: GEMMA.id } },
  { name: 'Hosted model', args: { selectedId: SONNET.id, effort: 'high' } },
  { name: 'Local only', args: { models: [QWEN, GEMMA], onAddProvider: undefined } },
  { name: 'No effort control', args: { showEffort: false } },
  { name: 'Nothing selected', args: { selectedId: undefined } },
  { name: 'Disabled', args: { disabled: true } },
];

export interface ModelPickerDemoProps extends Partial<ModelPickerProps> {
  onAction?: (name: string, detail?: unknown) => void;
}

/** Holds the selected model and effort the way an app would. */
export const ModelPickerDemo: React.FC<ModelPickerDemoProps> = ({ onAction, selectedId, effort, ...props }) => {
  const [id, setId] = React.useState(selectedId ?? QWEN.id);
  const [level, setLevel] = React.useState(effort ?? 'medium');
  React.useEffect(() => setId(selectedId ?? QWEN.id), [selectedId]);
  React.useEffect(() => setLevel(effort ?? 'medium'), [effort]);
  return (
    <ModelPicker
      {...modelPickerPropsFactory()}
      {...props}
      selectedId={id}
      effort={level}
      onPick={(model) => {
        setId(model.id);
        onAction?.('pick', model.id);
      }}
      onEffortChange={(next) => {
        setLevel(next);
        onAction?.('effort', next);
      }}
      onAddProvider={props.onAddProvider ?? (() => onAction?.('add-provider'))}
    />
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Composer toolbar: the model chip and the context meter in the trailing slot of the library Input (story only).
// ---------------------------------------------------------------------------------------------------------------

export interface ComposerToolbarDemoProps {
  /** Tokens in context; the ring colour follows it against `window`. */
  used?: number;
  window?: number;
  onAction?: (name: string, detail?: unknown) => void;
}

/** `Input` (panel field) whose `actions` slot holds the model chip, the context meter and Send. State lives here. */
export const ComposerToolbarDemo: React.FC<ComposerToolbarDemoProps> = ({ used = 183400, window = 262000, onAction }) => {
  const [value, setValue] = React.useState('');
  const send = () => {
    if (!value.trim()) return;
    onAction?.('send', value.trim());
    setValue('');
  };
  return (
    <div className="w-[560px] max-w-full">
      <Input
        variant="panel"
        aria-label="Message"
        placeholder="Ask anything, or add context"
        value={value}
        onChange={setValue}
        onKeyDown={(event) => {
          if (event.key === 'Enter') send();
        }}
        className="h-[40px]"
        actions={
          <>
            <ModelPickerDemo onAction={onAction} />
            <ContextMeter used={used} window={window} sections={SAMPLE_SECTIONS} onSummarise={() => onAction?.('summarise')} />
            <IconButton variant="ghost" iconSize="md" icon={<ArrowUp />} label="Send" disabled={!value.trim()} onClick={send} />
          </>
        }
      />
    </div>
  );
};
