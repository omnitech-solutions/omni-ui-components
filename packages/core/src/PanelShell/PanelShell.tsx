import * as React from 'react';

import { cn } from 'lib/utils';
import { useControllableState } from '../lib/use-controllable-state';
import { panelShellSurfaceVariants } from './PanelShell.variants';
import type { PanelShellProps } from './PanelShell.types';

const toCss = (value: number | string | undefined) => (typeof value === 'number' ? `${value}px` : value);

/**
 * Omni PanelShell: the shell of an assistant. In `panel` mode it is a side panel (default 440px) beside the
 * host page; in `full` mode it fills the area and hides the host. It lays out `header`, a body (`children`), an
 * optional docked or overlay `sidebar` and a pinned `footer`; it positions nothing against the window, so it never
 * leaves its parent. Closed (`open={false}`) in panel mode it renders only the host.
 *
 * Compose it from the library parts: ConversationList as `sidebar`, ConversationHeader as `header`, a Transcript
 * or EmptyStarters as `children`, a composer as `footer`, and a Toast (`position="absolute"`) as `overlay`.
 *
 * Slots: `data-slot="panel-shell" | "panel-shell-host" | "panel-shell-panel" | "panel-shell-sidebar" | "panel-shell-main" | "panel-shell-body"`.
 *
 * @example
 * <PanelShell mode={mode} open={open} onOpenChange={setOpen} host={<App />} header={<ConversationHeader … />}
 *   sidebar={<ConversationList … />} sidebarMode={mode === 'full' ? 'docked' : 'overlay'} sidebarOpen={history} footer={<Composer … />}>…</PanelShell>
 */
export const PanelShell = ({
  mode = 'panel',
  width = 440,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  label = 'Chat',
  host,
  sidebar,
  sidebarMode = 'docked',
  sidebarOpen: sidebarOpenProp,
  defaultSidebarOpen = false,
  onSidebarOpenChange,
  sidebarWidth = 260,
  header,
  children,
  footer,
  overlay,
  closeOnEscape = false,
  className,
  panelClassName,
  'data-testid': testId,
}: PanelShellProps) => {
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [sidebarOpen, setSidebarOpen] = useControllableState(sidebarOpenProp, defaultSidebarOpen, onSidebarOpenChange);
  const full = mode === 'full';
  const showHost = host !== undefined && !(full && open);
  const showSidebar = Boolean(sidebar) && (sidebarMode === 'docked' || sidebarOpen);

  const onKeyDown = (event: React.KeyboardEvent) => {
    // Escape closes an open overlay sidebar first, then (only when asked, and only as a side panel) the assistant.
    if (event.key !== 'Escape') return;
    if (sidebarMode === 'overlay' && sidebarOpen && sidebar) {
      event.stopPropagation();
      setSidebarOpen(false);
    } else if (closeOnEscape && !full) {
      setOpen(false);
    }
  };

  return (
    <div data-slot="panel-shell" data-mode={mode} data-testid={testId} className={cn('flex h-full min-h-0 w-full min-w-0 gap-3', className)}>
      {showHost ? (
        <div data-slot="panel-shell-host" className="flex min-h-0 min-w-0 flex-1 flex-col">
          {host}
        </div>
      ) : null}
      {open ? (
        <section
          aria-label={label}
          data-slot="panel-shell-panel"
          onKeyDown={onKeyDown}
          style={!full ? { flex: `0 0 ${toCss(width)}` } : undefined}
          className={cn(panelShellSurfaceVariants({ mode }), panelClassName)}
        >
          {showSidebar && sidebarMode === 'docked' ? (
            <div data-slot="panel-shell-sidebar" data-mode="docked" style={{ width: toCss(sidebarWidth) }} className="flex min-h-0 flex-none flex-col">
              {sidebar}
            </div>
          ) : null}
          <div data-slot="panel-shell-main" className="flex min-h-0 min-w-0 flex-1 flex-col">
            {header ? <div data-slot="panel-shell-header" className="flex-none border-b border-solid border-[color:var(--oui-panel-divider)]">{header}</div> : null}
            <div data-slot="panel-shell-body" className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {children}
            </div>
            {footer ? <div data-slot="panel-shell-footer" className="flex-none">{footer}</div> : null}
          </div>
          {showSidebar && sidebarMode === 'overlay' ? (
            <div data-slot="panel-shell-sidebar" data-mode="overlay" style={{ width: `min(100%, ${toCss(sidebarWidth)})` }} className="absolute inset-y-0 left-0 z-10 flex flex-col p-1.5">
              {sidebar}
            </div>
          ) : null}
          {overlay}
        </section>
      ) : null}
    </div>
  );
};
