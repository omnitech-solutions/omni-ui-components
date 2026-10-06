import * as React from 'react';

import { cn } from 'lib/utils';
import { Button } from '../Button';
import { InputPrimitive } from '../Input';
import { IconAction } from '../internal/support/IconAction';
import { SwitchPrimitive } from '../Switch';
import { integrationStatusVariants } from './IntegrationList.variants';
import type { IntegrationItem, IntegrationListLabels, IntegrationListProps } from './IntegrationList.types';

export const DEFAULT_INTEGRATION_LIST_LABELS: IntegrationListLabels = {
  intro: 'Connect tools through the Model Context Protocol. The assistant asks before using any tool that changes something.',
  loading: 'Checking connectors…',
  empty: 'No connectors yet.',
  remove: (name) => `Remove ${name}`,
  toggle: (name) => name,
  addField: 'MCP server address',
  addPlaceholder: 'https://your-server.example/mcp',
  add: 'Add server',
  list: 'Connectors',
};

const statusKey = (status: string | undefined) => (status === 'connected' || status === 'unreachable' || status === 'off' ? status : status ? 'other' : 'off');

/**
 * Omni IntegrationList: the tools an assistant may use. Rows (icon tile, name, detail with a status dot, switch,
 * remove), an add-by-address form, loading and empty states. Today's rows are MCP servers; an OAuth variant fits
 * the same list through `connectAction` (list header) and each row's `account` and `connectAction`. Callbacks:
 * `onToggle(id, enabled)`, `onRemove(id)`, `onAdd(url)`.
 *
 * Slots: `data-slot="integration-list" | "integration-row" | "integration-add"`.
 *
 * @example
 * <IntegrationList items={servers} onToggle={toggle} onRemove={remove} onAdd={add} itemIcon={<Network />} removeIcon={<Trash2 />} />
 */
export const IntegrationList = <I extends IntegrationItem = IntegrationItem>({
  items,
  loading = false,
  intro,
  onToggle,
  onRemove,
  onAdd,
  empty,
  itemIcon,
  removeIcon,
  connectAction,
  labels: labelOverrides,
  className,
}: IntegrationListProps<I>) => {
  const labels = { ...DEFAULT_INTEGRATION_LIST_LABELS, ...labelOverrides };
  const [url, setUrl] = React.useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const address = url.trim();
    if (!address || !onAdd) return;
    try {
      await onAdd(address);
      setUrl('');
    } catch {
      // The host reports the failure; the address stays so it can be corrected.
    }
  };

  const introNode = intro === undefined ? labels.intro : intro;
  return (
    <div data-slot="integration-list" className={cn('flex flex-col gap-3', className)}>
      {introNode || connectAction ? (
        <div className="flex items-start justify-between gap-3">
          {introNode ? <p className="m-0 flex-1 text-[13px] text-[color:var(--oui-panel-meta-fg)]">{introNode}</p> : <span />}
          {connectAction}
        </div>
      ) : null}

      {items === undefined && loading ? (
        <div className="text-[13px] text-[color:var(--oui-panel-meta-fg)]">{labels.loading}</div>
      ) : (
        <ul aria-label={labels.list} className="m-0 flex list-none flex-col overflow-hidden rounded-xl border border-solid border-[color:var(--oui-panel-border)] p-0">
          {(items ?? []).map((item) => (
            <li
              key={item.id}
              data-slot="integration-row"
              data-status={item.status}
              className="flex items-center gap-3 border-b border-solid border-[color:var(--oui-panel-divider)] p-3 last:border-b-0"
            >
              <span aria-hidden="true" className="flex size-8 flex-none items-center justify-center rounded-lg bg-[color:var(--oui-tone-neutral-bg)] text-[color:var(--oui-panel-meta-fg)] [&_svg]:size-4">
                {item.icon ?? itemIcon}
              </span>
              <div className="min-w-0 flex-1 leading-snug">
                <div className="truncate text-[13.5px] font-medium">{item.name}</div>
                {item.detail || item.status ? (
                  <div className="flex items-center gap-1.5 text-[12px] text-[color:var(--oui-panel-meta-fg)]">
                    <span aria-hidden="true" className={integrationStatusVariants({ status: statusKey(item.status) })} />
                    {item.detail}
                  </div>
                ) : null}
                {item.account ? <div className="mt-0.5 text-[12px]">{item.account}</div> : null}
              </div>
              {item.connectAction}
              {onRemove ? <IconAction
                  icon={removeIcon}
                  label={labels.remove(item.name)}
                  onClick={() => void onRemove(item)}
                /> : null}
              {onToggle ? <SwitchPrimitive
                  aria-label={labels.toggle(item.name)}
                  checked={item.enabled}
                  onChange={(next) => void onToggle(item, next)}
                /> : null}
            </li>
          ))}
          {(items ?? []).length === 0 ? <li className="px-3 py-4 text-[13px] text-[color:var(--oui-panel-meta-fg)]">{empty ?? labels.empty}</li> : null}
        </ul>
      )}

      {onAdd ? (
        <form data-slot="integration-add" className="flex gap-2" onSubmit={submit}>
          <InputPrimitive type="url" aria-label={labels.addField} placeholder={labels.addPlaceholder} value={url} onChange={setUrl} className="flex-1" />
          <Button type="submit" buttonSize="default" disabled={!url.trim()}>
            {labels.add}
          </Button>
        </form>
      ) : null}
    </div>
  );
};
