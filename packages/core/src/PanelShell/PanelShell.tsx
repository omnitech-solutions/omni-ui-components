import { cn } from 'lib/utils';
import * as React from 'react';
import { useControllableState } from '../lib/use-controllable-state';
import type { PanelShellLabels, PanelShellProps } from './PanelShell.types';
import { panelShellSurfaceVariants } from './PanelShell.variants';

/** English strings of {@link PanelShell}. */
export const DEFAULT_PANEL_SHELL_LABELS: PanelShellLabels = {
  closeSidebar: 'Close conversations',
  sidebar: 'Conversations',
};

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

const toCss = (value: number | string | undefined) =>
  typeof value === 'number' ? `${value}px` : value;

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
  labels: labelOverrides,
  className,
  panelClassName,
  'data-testid': testId,
}: PanelShellProps) => {
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [sidebarOpen, setSidebarOpen] = useControllableState(
    sidebarOpenProp,
    defaultSidebarOpen,
    onSidebarOpenChange,
  );
  const labels = { ...DEFAULT_PANEL_SHELL_LABELS, ...labelOverrides };
  const full = mode === 'full';
  const showHost = host !== undefined && !(full && open);
  const showSidebar = Boolean(sidebar) && (sidebarMode === 'docked' || sidebarOpen);

  const overlayShown = showSidebar && sidebarMode === 'overlay' && open;
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  // [SAFETY] An overlay sidebar behaves like a modal: focus moves in when it opens and returns to the opener when it closes.
  React.useEffect(() => {
    if (!overlayShown) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const box = overlayRef.current;
    (box?.querySelector<HTMLElement>(FOCUSABLE) ?? box)?.focus();
    return () => {
      if (opener?.isConnected) opener.focus();
    };
  }, [overlayShown]);

  const trapTab = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // [GUARD] Tab and Shift+Tab wrap inside the sidebar so focus never reaches the covered conversation.
    if (event.key !== 'Tab') return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === event.currentTarget)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

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
    <div
      data-slot="panel-shell"
      data-mode={mode}
      data-testid={testId}
      className={cn('flex h-full min-h-0 w-full min-w-0 gap-3', className)}
    >
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
            <div
              data-slot="panel-shell-sidebar"
              data-mode="docked"
              style={{ width: toCss(sidebarWidth) }}
              className="flex min-h-0 flex-none flex-col"
            >
              {sidebar}
            </div>
          ) : null}
          <div data-slot="panel-shell-main" className="flex min-h-0 min-w-0 flex-1 flex-col">
            {header ? (
              <div
                data-slot="panel-shell-header"
                className="flex-none border-b border-solid border-[color:var(--oui-panel-divider)]"
              >
                {header}
              </div>
            ) : null}
            <div
              data-slot="panel-shell-body"
              className="flex min-h-0 flex-1 flex-col overflow-y-auto"
            >
              {children}
            </div>
            {footer ? (
              <div data-slot="panel-shell-footer" className="flex-none">
                {footer}
              </div>
            ) : null}
          </div>
          {showSidebar && sidebarMode === 'overlay' ? (
            <>
              <button
                type="button"
                tabIndex={-1}
                aria-label={labels.closeSidebar}
                data-slot="panel-shell-backdrop"
                className="absolute inset-0 z-[9] cursor-default border-0 bg-[color:color-mix(in_srgb,var(--oui-tone-neutral-fg)_30%,transparent)] p-0"
                onClick={() => setSidebarOpen(false)}
              />
              <div
                ref={overlayRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label={labels.sidebar}
                data-slot="panel-shell-sidebar"
                data-mode="overlay"
                style={{ width: `min(100%, ${toCss(sidebarWidth)})` }}
                className="absolute inset-y-0 left-0 z-10 flex flex-col p-1.5 focus:outline-none"
                onKeyDown={trapTab}
              >
                {sidebar}
              </div>
            </>
          ) : null}
          {overlay}
        </section>
      ) : null}
    </div>
  );
};
