import type * as React from 'react';

export type ToastPlacement =
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'top-left'
  | 'top-right';

/** The minimum a toast needs. Extend it with your own fields (an `undo` function, an id); callbacks get the full item back. */
export interface ToastItem {
  text: React.ReactNode;
  /** Label of the action button (`Undo`). The button is rendered only when `onAction` is also given. */
  actionLabel?: string;
  /** Overrides the toast's `duration` for this item. */
  duration?: number;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
}

export interface ToastProps<T extends ToastItem = ToastItem> {
  /** The message (the full item). Nothing is rendered without it. */
  toast?: T | null;
  /** Shown while true (controlled; see `useToast`). Omit for a toast that starts at `defaultOpen` and closes itself. */
  open?: boolean;
  defaultOpen?: boolean;
  /** Fires with `false` in controlled and uncontrolled mode when it closes (timer, action or Escape). */
  onOpenChange?: (open: boolean) => void;
  /** Fires with the full toast item when the action button is chosen; the toast then closes. The button is not rendered without it. A host may return a promise; it is ignored. */
  onAction?: (toast: T) => void | Promise<void>;
  /** Fires with the full toast item when the person closes it with Escape; the toast then closes. */
  onDismiss?: (toast: T) => void;
  /** Fires with the full toast item when it closes itself after `duration`; the toast then closes. */
  onTimeout?: (toast: T) => void;
  /** Milliseconds before it dismisses itself; 0 keeps it until dismissed. Pauses while hovered or focused. Default 3800. */
  duration?: number;
  /** Default `bottom-center`. */
  placement?: ToastPlacement;
  /** `fixed` (default) pins to the window; `absolute` pins inside the nearest positioned parent (a PanelShell). */
  position?: 'fixed' | 'absolute';
  /** Set: the toast renders in a portal into this element (a native host's root). Unset: it renders in place, as before. */
  container?: HTMLElement | null;
  className?: string;
  'data-testid'?: string;
}

export interface ToastController<T extends ToastItem = ToastItem> {
  /** Spread onto `<Toast {...toast.props} onAction={...} />`. */
  props: Pick<
    ToastProps<T>,
    'toast' | 'open' | 'onOpenChange' | 'placement' | 'position' | 'duration'
  >;
  /** The toast on screen, if any. */
  toast: T | null;
  /** Show a toast (replacing the one on screen and restarting its timer). */
  notify: (toast: T) => void;
  dismiss: () => void;
}
