import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import { cn } from 'lib/utils';
import { IconAction } from '../internal/support/IconAction';
import { useControllableState } from '../lib/use-controllable-state';
import { Modal, ModalDescription, ModalOverlay, ModalPortal, ModalTitle } from '../Modal';
import { SETTINGS_TAB_CLASS } from './SettingsDialog.variants';
import type { SettingsDialogLabels, SettingsDialogProps, SettingsTab } from './SettingsDialog.types';

export const DEFAULT_SETTINGS_DIALOG_LABELS: SettingsDialogLabels = { title: 'Settings', close: 'Close' };

/**
 * Omni SettingsDialog: the library Modal (Radix Dialog) with a vertical tablist on the left and the active tab's
 * panel on the right. Focus is trapped inside while open and returns to the control that was focused before it
 * opened; Escape and the backdrop call `onClose`. Tabs follow the WAI-ARIA tabs pattern: Up / Down / Home / End move
 * focus and select, only the active tab is in the tab order.
 *
 * Tabs are data (`tabs[{ id, label, icon, render }]`); the shown tab is `activeTab` (controlled) or kept inside.
 *
 * Slots: `data-slot="settings-dialog" | "settings-nav" | "settings-tab" | "settings-body" | "settings-content"`.
 *
 * @example
 * <SettingsDialog open={open} onClose={() => setOpen(false)} tabs={[{ id: 'general', label: 'General', icon: <Sliders />, render: () => <General /> }]} />
 */
export const SettingsDialog = <Tab extends SettingsTab<Tab> = SettingsTab>({
  open,
  onClose,
  tabs,
  activeTab,
  defaultTab,
  onTabChange,
  closeIcon,
  labels: labelOverrides,
  className,
  'data-testid': testId,
}: SettingsDialogProps<Tab>) => {
  const labels = { ...DEFAULT_SETTINGS_DIALOG_LABELS, ...labelOverrides };
  const [requested, setTab] = useControllableState<string | undefined>(activeTab, defaultTab ?? tabs[0]?.id);
  const current = tabs.find((tab) => tab.id === requested) ?? tabs[0];
  const base = React.useId();
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const select = (id: string) => {
    setTab(id);
    const tab = tabs.find((item) => item.id === id);
    if (tab) onTabChange?.(tab);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex((tab) => tab.id === current?.id);
    const last = tabs.length - 1;
    const next =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? (index + 1) % tabs.length
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1;
    if (next < 0) return;
    event.preventDefault();
    const target = tabs[next];
    select(target.id);
    tabRefs.current[target.id]?.focus();
  };

  if (!current) return null;
  const tabId = (id: string) => `${base}-tab-${id}`;
  const panelId = `${base}-panel`;

  return (
    <Modal open={open} onOpenChange={(next) => !next && void onClose?.()}>
      <ModalPortal>
        <ModalOverlay />
        <DialogPrimitive.Content
          data-slot="settings-dialog"
          data-testid={testId}
          className={cn(
            'fixed top-[50%] left-[50%] z-50 flex h-[min(80vh,540px)] w-[min(calc(100vw-2rem),720px)] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl border border-solid',
            'border-[color:var(--oui-panel-border)] bg-[color:var(--oui-panel-bg)] text-[color:var(--oui-tone-neutral-fg)] shadow-2xl',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:animate-none',
            className,
          )}
        >
          <div data-slot="settings-nav" className="flex w-[180px] flex-none flex-col gap-0.5 border-r border-solid border-[color:var(--oui-panel-divider)] bg-[color:var(--oui-panel-dock-bg)] p-2.5">
            <ModalTitle className="px-2.5 pt-1.5 pb-2 text-[13px] leading-none font-semibold">{labels.title}</ModalTitle>
            <div role="tablist" aria-orientation="vertical" aria-label={labels.title} onKeyDown={onKeyDown} className="flex flex-col gap-0.5">
              {tabs.map((tab) => {
                const selected = tab.id === current.id;
                return (
                  <button
                    key={tab.id}
                    ref={(node) => {
                      tabRefs.current[tab.id] = node;
                    }}
                    id={tabId(tab.id)}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={selected ? panelId : undefined}
                    tabIndex={selected ? 0 : -1}
                    data-slot="settings-tab"
                    className={SETTINGS_TAB_CLASS}
                    onClick={() => select(tab.id)}
                  >
                    {tab.icon ? (
                      <span aria-hidden="true" className="flex-none">
                        {tab.icon}
                      </span>
                    ) : null}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div id={panelId} role="tabpanel" aria-labelledby={tabId(current.id)} tabIndex={-1} data-slot="settings-body" className="flex min-w-0 flex-1 flex-col outline-none">
            <div className="flex h-12 flex-none items-center justify-between border-b border-solid border-[color:var(--oui-panel-divider)] pr-2 pl-5">
              <span className="text-[14px] font-semibold">{current.label}</span>
              {onClose ? (
                <IconAction icon={closeIcon} label={labels.close} onClick={() => void onClose()} />
              ) : null}
            </div>
            <ModalDescription className="sr-only">{current.label}</ModalDescription>
            <div data-slot="settings-content" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
              {current.render(current)}
            </div>
          </div>
        </DialogPrimitive.Content>
      </ModalPortal>
    </Modal>
  );
};
