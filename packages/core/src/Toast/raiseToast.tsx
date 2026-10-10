import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Toast } from './Toast';
import type { ToastItem, ToastPlacement } from './Toast.types';

/** A toast raised from outside React, with where it is drawn. */
export interface RaisedToast extends ToastItem {
  placement?: ToastPlacement;
}

type Listener = (toast: RaisedToast | null) => void;

let root: Root | null = null;
let host: HTMLElement | null = null;
let listener: Listener | null = null;
let waiting: RaisedToast | null = null;

/** The one `Toast` that `raiseToast` drives. It is mounted on the first call and stays. */
const RaisedToastHost = () => {
  const [toast, setToast] = React.useState<RaisedToast | null>(waiting);
  React.useEffect(() => {
    listener = setToast;
    if (waiting) setToast(waiting);
    return () => {
      listener = null;
    };
  }, []);
  return (
    <Toast
      toast={toast}
      open={toast !== null}
      placement={toast?.placement ?? 'top-center'}
      onOpenChange={(open) => {
        if (!open) {
          waiting = null;
          setToast(null);
        }
      }}
    />
  );
};

/**
 * Shows a `Toast` without rendering one: the first call mounts a single host at the end of `document.body`, and
 * each call replaces the toast on screen (as `useToast().notify` does). Does nothing where there is no document.
 * `message` and `notification` are built on it; inside React, prefer `useToast` and your own `<Toast>`.
 */
export const raiseToast = (toast: RaisedToast): void => {
  if (typeof document === 'undefined') return;
  waiting = toast;
  if (listener) {
    listener(toast);
    return;
  }
  if (!host?.isConnected) {
    root?.unmount();
    host = document.createElement('div');
    host.setAttribute('data-slot', 'toast-host');
    document.body.appendChild(host);
    root = createRoot(host);
    root.render(<RaisedToastHost />);
  }
};

/** Removes the raised toast and its host (a test's cleanup, a micro-frontend unmounting). */
export const clearRaisedToast = (): void => {
  waiting = null;
  listener = null;
  root?.unmount();
  host?.remove();
  root = null;
  host = null;
};
