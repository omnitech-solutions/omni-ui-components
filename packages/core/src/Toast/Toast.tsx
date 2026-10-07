import { cn } from 'lib/utils';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { surfaceProps } from '../internal/support/PortalContainer';
import { useControllableState } from '../lib/use-controllable-state';
import type { ToastController, ToastItem, ToastProps } from './Toast.types';
import { toastVariants } from './Toast.variants';

export const DEFAULT_TOAST_DURATION = 3800;

/**
 * Omni Toast: a short status message with an optional action (Undo). It is an `<output>` (role `status`, polite),
 * so screen readers announce it without taking focus. It dismisses itself after `duration` (default 3800 ms, paused
 * while hovered or focused) and on Escape; choosing the action runs it and dismisses. The caller owns `open`
 * (or use `useToast`).
 *
 * Slots: `data-slot="toast" | "toast-action"`.
 *
 * @example
 * const toast = useToast();
 * const toast = useToast<{ text: string; actionLabel?: string; undo?: () => void }>();
 * toast.notify({ text: 'Conversation archived', actionLabel: 'Undo', undo: restore });
 * <Toast {...toast.props} position="absolute" onAction={(t) => t.undo?.()} />
 */
export const Toast = <T extends ToastItem = ToastItem>({
  toast,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  onAction,
  onDismiss,
  onTimeout,
  duration = DEFAULT_TOAST_DURATION,
  placement = 'bottom-center',
  position = 'fixed',
  container,
  className,
  'data-testid': testId,
}: ToastProps<T>) => {
  const [paused, setPaused] = React.useState(false);
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const live = React.useRef({ setOpen, toast, onDismiss, onTimeout });
  live.current = { setOpen, toast, onDismiss, onTimeout };
  const ms = toast?.duration ?? duration;

  // The timer restarts whenever a new message arrives (`toast`) and holds while the pointer or focus is inside.
  React.useEffect(() => {
    if (!open || !toast || ms <= 0 || paused) return undefined;
    const timer = setTimeout(() => {
      if (live.current.toast) live.current.onTimeout?.(live.current.toast);
      live.current.setOpen(false);
    }, ms);
    return () => clearTimeout(timer);
  }, [open, ms, paused, toast]);

  React.useEffect(() => {
    if (!open || !toast) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (live.current.toast) live.current.onDismiss?.(live.current.toast);
      live.current.setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, toast]);

  if (!open || !toast) return null;
  const node = (
    <output
      data-slot="toast"
      {...surfaceProps('toast')}
      data-testid={testId}
      className={cn(toastVariants({ position, placement }), className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {toast.icon ? (
        <span aria-hidden="true" className="flex-none [&_svg]:size-4">
          {toast.icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">{toast.text}</span>
      {toast.actionLabel && onAction ? (
        <button
          type="button"
          data-slot="toast-action"
          className="flex-none rounded-md px-1.5 py-0.5 text-[13px] font-semibold text-[color:var(--oui-tone-accent-fg)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={() => {
            void onAction(toast);
            setOpen(false);
          }}
        >
          {toast.actionLabel}
        </button>
      ) : null}
    </output>
  );
  return container ? createPortal(node, container) : node;
};

/** State for one toast: `notify(item)` shows it (replacing any on screen), `dismiss` hides it. */
export const useToast = <T extends ToastItem = ToastItem>(
  defaults: {
    duration?: number;
    placement?: ToastProps['placement'];
    position?: ToastProps['position'];
  } = {},
): ToastController<T> => {
  const [toast, setToast] = React.useState<T | null>(null);
  const notify = React.useCallback((next: T) => setToast(next), []);
  const dismiss = React.useCallback(() => setToast(null), []);
  return {
    toast,
    notify,
    dismiss,
    props: {
      toast,
      open: toast !== null,
      duration: defaults.duration,
      placement: defaults.placement,
      position: defaults.position,
      onOpenChange: (open) => !open && setToast(null),
    },
  };
};
