import type * as React from 'react';

import type { ModelInfo } from '../ModelPicker/ModelPicker.types';

/** `connected` shows the success dot and "Connected · N models"; `checking` and `disconnected` use their own lines. */
export type ModelsConnectionStatus = 'connected' | 'checking' | 'disconnected';

export interface ModelsSettingsLabels {
  /** Name of the read-only endpoint field. */
  endpoint: string;
  /** Status line when connected, from the model count. */
  connected: (count: number) => string;
  checking: string;
  disconnected: string;
  /** Heading and accessible name of the model list. */
  modelsTitle: string;
  /** Shown when there are no models. */
  empty: string;
  /** Context window of a row, from the formatted size (`262k`). */
  context: (size: string) => string;
  providersTitle: string;
  providersDescription: string;
  addProvider: string;
}

export interface ModelsSettingsProps<M extends ModelInfo = ModelInfo> {
  /** The local server address, shown read-only. The endpoint row is not rendered without it. */
  endpoint?: string;
  /** Default `connected`. */
  status?: ModelsConnectionStatus;
  /** The available models. Items pass through untouched. */
  models: M[];
  /** Fires when the Add provider button is pressed. The cloud-providers row is not rendered without it. May return a promise; it is ignored. */
  onAddProvider?: () => void | Promise<void>;
  /** Caller icon for the Add provider button. */
  addProviderIcon?: React.ReactNode;
  /** Caller icon at the start of each model row. */
  modelIcon?: React.ReactNode;
  /** Replaces the secondary line of a row (default: parameters, context window and description). Receives the full model. */
  renderModelMeta?: (model: M) => React.ReactNode;
  labels?: Partial<ModelsSettingsLabels>;
  className?: string;
}
