import * as React from 'react';

/** The reasoning-effort scale of the default control. Any string works when `efforts` is passed. */
export type ReasoningEffort = 'off' | 'low' | 'medium' | 'high';

/** Where a model is served from. A provider with `local` shows the "Local · " prefix. */
export interface ModelProvider {
  name: string;
  /** Shown in monospace at the right of the group header (`http://localhost:1234/v1`). */
  endpoint?: string;
  local?: boolean;
}

/** The minimal model item; extend it with your own fields and the extended type reaches every callback. */
export interface ModelInfo {
  id: string;
  name: string;
  /** Short name for the chip (`DeepSeek R1`). Defaults to `name`. */
  shortName?: string;
  /** Third line of the row; also the row's tooltip. */
  description?: string;
  /** Small chips next to the name (`Local`, `Fast`). */
  tags?: string[];
  vision?: boolean;
  /** Reasons step by step: the effort control applies to it. */
  reasoning?: boolean;
  /** Window in tokens (shown as `262k context`). */
  contextWindow?: number;
  tools?: boolean;
  /** `Good for coding, agents`. */
  strengths?: string[];
  /** Parameter count as text (`30B`). */
  parameters?: string;
  /** Overrides the list's default provider for grouping. */
  provider?: ModelProvider;
}

/** Consecutive models of one provider: one section of the menu. */
export interface ModelGroup<M extends ModelInfo = ModelInfo> {
  provider: ModelProvider | undefined;
  models: M[];
}

export interface ModelEffortOption {
  value: string;
  label: string;
}

/** Words of the capability line. `{n}` in `context` is the window (`262k`). */
export interface ModelCapabilityLabels {
  context: string;
  tools: string;
  vision: string;
  reasoning: string;
}

/** Every visible string. `{strengths}` and `{model}` are replaced in the notes. */
export interface ModelPickerLabels {
  /** Accessible name of the menu dialog. */
  dialog: string;
  /** Chip text when no model is selected. */
  noModel: string;
  /** Accessible name of a group without a provider. */
  models: string;
  /** Prefix of a local provider's header. */
  local: string;
  capabilities: ModelCapabilityLabels;
  goodFor: string;
  effortTitle: string;
  effortNote: string;
  effortIgnored: string;
  efforts: Record<ReasoningEffort, string>;
  addProvider: string;
}

export interface ModelIcons {
  /** Marks the selected row. */
  check?: React.ReactNode;
  /** Before the add-provider action. */
  add?: React.ReactNode;
  /** Chevron of the chip. */
  expand?: React.ReactNode;
}

export interface ModelMenuProps<M extends ModelInfo = ModelInfo> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onSelect'> {
  models: M[];
  /** Provider of every model that has none of its own. */
  provider?: ModelProvider;
  /** Selected model (controlled). Leave unset and use `defaultSelectedId` for an uncontrolled menu. */
  selectedId?: string;
  defaultSelectedId?: string;
  /** Effort (controlled), or `defaultEffort` (default `medium`) for an uncontrolled one. */
  effort?: string;
  defaultEffort?: string;
  /** Effort scale; default Off, Low, Medium, High from `labels.efforts`. */
  efforts?: ModelEffortOption[];
  /** Show the effort control. Default true. */
  showEffort?: boolean;
  /** Fires when a model row is chosen, in controlled and uncontrolled mode (also when it is already selected). Payload: the full model object, by reference (extra fields intact). A returned promise is ignored. */
  onPick?: (model: M) => void | Promise<void>;
  /** Fires when another effort is chosen, in controlled and uncontrolled mode. Payload: the effort value, then the selected model (undefined when none is selected). */
  onEffortChange?: (effort: string, model: M | undefined) => void | Promise<void>;
  /** Fires when "Add a cloud provider" is chosen. The row exists only when this is given. */
  onAddProvider?: () => void | Promise<void>;
  labels?: Partial<ModelPickerLabels>;
  icons?: ModelIcons;
}

export interface ModelPickerProps<M extends ModelInfo = ModelInfo> extends Omit<ModelMenuProps<M>, 'className'> {
  /** Controlled open state; leave unset for an uncontrolled menu. */
  open?: boolean;
  defaultOpen?: boolean;
  /** Fires when the menu opens or closes (chip, Escape, outside click, picking a model), in controlled and uncontrolled mode. Payload: the new open state. */
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /** Menu alignment against the chip. Default `start`. */
  align?: 'start' | 'center' | 'end';
  /** Side of the chip the menu opens on. Default `top` (the chip sits in a composer toolbar). */
  side?: 'top' | 'bottom';
  /** Classes of the chip. */
  className?: string;
  /** Classes of the menu. */
  menuClassName?: string;
  'data-testid'?: string;
}
