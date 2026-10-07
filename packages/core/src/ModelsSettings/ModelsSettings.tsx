import { cn } from 'lib/utils';
import * as React from 'react';
import { Button } from '../Button';
import { InputPrimitive } from '../Input';
import type { ModelInfo } from '../ModelPicker/ModelPicker.types';
import { SettingRow } from '../SettingsDialog/SettingRow';
import type { ModelsSettingsLabels, ModelsSettingsProps } from './ModelsSettings.types';
import { modelsStatusVariants } from './ModelsSettings.variants';

export const DEFAULT_MODELS_SETTINGS_LABELS: ModelsSettingsLabels = {
  endpoint: 'Endpoint',
  connected: (count) => `Connected · ${count} ${count === 1 ? 'model' : 'models'}`,
  checking: 'Checking connection…',
  disconnected: 'Not connected',
  modelsTitle: 'Available models',
  empty: 'No models found.',
  context: (size) => `${size} context`,
  providersTitle: 'Cloud providers',
  providersDescription: 'Use hosted models alongside local ones',
  addProvider: 'Add provider',
};

const formatTokens = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));

/**
 * The Models tab of the settings dialog: the read-only endpoint, a "Connected · N models" status, the available
 * models and a cloud-providers row. Generic over `ModelInfo`: extend it and `renderModelMeta` receives your type.
 * `onAddProvider()` adds the Add provider button; without it the whole row is not rendered.
 *
 * Slots: `data-slot="models-settings" | "models-status" | "models-list" | "model-row" | "models-providers"`.
 *
 * @example
 * <ModelsSettings endpoint="http://localhost:1234/v1" models={models} onAddProvider={openProviders} />
 */
export const ModelsSettings = <M extends ModelInfo = ModelInfo>({
  endpoint,
  status = 'connected',
  models,
  onAddProvider,
  addProviderIcon,
  modelIcon,
  renderModelMeta,
  labels: labelOverrides,
  className,
}: ModelsSettingsProps<M>) => {
  const labels = { ...DEFAULT_MODELS_SETTINGS_LABELS, ...labelOverrides };
  const endpointId = React.useId();
  const statusText =
    status === 'connected'
      ? labels.connected(models.length)
      : status === 'checking'
        ? labels.checking
        : labels.disconnected;
  return (
    <div data-slot="models-settings" className={cn('flex flex-col gap-4', className)}>
      {endpoint ? (
        <SettingRow title={labels.endpoint} layout="stack" htmlFor={endpointId}>
          <InputPrimitive id={endpointId} readOnly value={endpoint} className="font-mono" />
        </SettingRow>
      ) : null}
      <div
        data-slot="models-status"
        data-status={status}
        role="status"
        className="flex items-center gap-2 text-[13px]"
      >
        <span aria-hidden="true" className={modelsStatusVariants({ status })} />
        {statusText}
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-[13.5px] font-medium">{labels.modelsTitle}</div>
        <ul
          aria-label={labels.modelsTitle}
          data-slot="models-list"
          className="m-0 flex list-none flex-col overflow-hidden rounded-xl border border-solid border-[color:var(--oui-panel-border)] p-0"
        >
          {models.map((model) => {
            const meta = renderModelMeta
              ? renderModelMeta(model)
              : [
                  model.parameters,
                  model.contextWindow
                    ? labels.context(formatTokens(model.contextWindow))
                    : undefined,
                  model.description,
                ]
                  .filter(Boolean)
                  .join(' · ');
            return (
              <li
                key={model.id}
                data-slot="model-row"
                className="flex items-center gap-3 border-b border-solid border-[color:var(--oui-panel-divider)] p-3 last:border-b-0"
              >
                {modelIcon ? (
                  <span
                    aria-hidden="true"
                    className="flex size-8 flex-none items-center justify-center rounded-lg bg-[color:var(--oui-tone-neutral-bg)] text-[color:var(--oui-panel-meta-fg)] [&_svg]:size-4"
                  >
                    {modelIcon}
                  </span>
                ) : null}
                <div className="min-w-0 flex-1 leading-snug">
                  <div className="truncate text-[13.5px] font-medium">{model.name}</div>
                  {meta ? (
                    <div className="truncate text-[12px] text-[color:var(--oui-panel-meta-fg)]">
                      {meta}
                    </div>
                  ) : null}
                </div>
                {model.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="flex-none rounded-md bg-[color:var(--oui-tone-neutral-bg)] px-1.5 py-0.5 text-[11px] text-[color:var(--oui-panel-meta-fg)]"
                  >
                    {tag}
                  </span>
                ))}
              </li>
            );
          })}
          {models.length === 0 ? (
            <li className="px-3 py-4 text-[13px] text-[color:var(--oui-panel-meta-fg)]">
              {labels.empty}
            </li>
          ) : null}
        </ul>
      </div>
      {onAddProvider ? (
        <div data-slot="models-providers">
          <SettingRow
            tone="boxed"
            title={labels.providersTitle}
            description={labels.providersDescription}
          >
            <Button variant="outline" icon={addProviderIcon} onClick={() => void onAddProvider()}>
              {labels.addProvider}
            </Button>
          </SettingRow>
        </div>
      ) : null}
    </div>
  );
};
