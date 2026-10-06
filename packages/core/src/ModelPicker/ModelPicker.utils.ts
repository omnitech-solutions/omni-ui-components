import type { ModelCapabilityLabels, ModelGroup, ModelInfo, ModelPickerLabels, ModelProvider, ReasoningEffort } from './ModelPicker.types';

export const DEFAULT_MODEL_CAPABILITY_LABELS: ModelCapabilityLabels = {
  context: '{n} context',
  tools: 'tools',
  vision: 'vision',
  reasoning: 'reasoning',
};

export const DEFAULT_EFFORT_LABELS: Record<ReasoningEffort, string> = { off: 'Off', low: 'Low', medium: 'Medium', high: 'High' };

export const EFFORT_ORDER: readonly ReasoningEffort[] = ['off', 'low', 'medium', 'high'];

/** `1_000_000` → `1M`, otherwise thousands (1024 per k, as model cards quote windows): `262144` → `256k`. */
export function formatWindow(count: number): string {
  return count >= 1_000_000 ? `${Math.round(count / 1_000_000)}M` : `${Math.round(count / 1024)}k`;
}

/** The chip name of a model: its short name, else its name, else nothing. */
export const shortName = (model: ModelInfo | undefined): string => model?.shortName ?? model?.name ?? '';

/** `DeepSeek R1 · Medium` for a reasoning model, its short name otherwise; empty without a model. */
export function modelLabel(model: ModelInfo | undefined, effort: string, effortLabels: Record<string, string> = DEFAULT_EFFORT_LABELS): string {
  if (!model) return '';
  return model.reasoning ? `${shortName(model)} · ${effortLabels[effort] ?? effort}` : shortName(model);
}

/**
 * What the model can do in plain words: `262k context · tools · vision · reasoning · 30B`. Parts that do not apply
 * are left out; a model with none gives an empty string.
 */
export function capabilitiesOf(model: ModelInfo, labels: ModelCapabilityLabels = DEFAULT_MODEL_CAPABILITY_LABELS): string {
  return [
    model.contextWindow ? labels.context.replace('{n}', formatWindow(model.contextWindow)) : '',
    model.tools ? labels.tools : '',
    model.vision ? labels.vision : '',
    model.reasoning ? labels.reasoning : '',
    model.parameters ?? '',
  ]
    .filter(Boolean)
    .join(' · ');
}

/**
 * Consecutive models from the same provider form one group, in listing order; the same provider listed twice with
 * another between stays two groups. Models without their own provider belong to `fallback`.
 */
export function groupModels<M extends ModelInfo>(models: readonly M[], fallback?: ModelProvider): ModelGroup<M>[] {
  const groups: ModelGroup<M>[] = [];
  for (const model of models) {
    const provider = model.provider ?? fallback;
    const last = groups.at(-1);
    if (last && last.provider?.name === provider?.name && last.provider?.endpoint === provider?.endpoint) last.models.push(model);
    else groups.push({ provider, models: [model] });
  }
  return groups;
}

/** The `labels` with defaults filled (a partial `capabilities` or `efforts` keeps the rest). */
export const withLabelDefaults = (defaults: ModelPickerLabels, labels?: Partial<ModelPickerLabels>): ModelPickerLabels => ({
  ...defaults,
  ...labels,
  capabilities: { ...defaults.capabilities, ...labels?.capabilities },
  efforts: { ...defaults.efforts, ...labels?.efforts },
});
