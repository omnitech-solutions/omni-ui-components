import { Button } from '@oc-tech/omni-ui-components/Button';
import type { ToastItem, ToastProps } from '@oc-tech/omni-ui-components/Toast';
import { Toast, useToast } from '@oc-tech/omni-ui-components/Toast';
import { Archive } from 'lucide-react';
import type * as React from 'react';
import type { Variant } from '../../internal/support/makeFactory';

/** A toast item that carries its own undo, to show that extra fields reach the callbacks. */
export interface UndoToast extends ToastItem {
  undo?: () => void;
}

/** Build `<Toast>` props for standalone stories and tests (the caller owns `open`). */
export const toastPropsFactory = (
  overrides: Partial<ToastProps<UndoToast>> = {},
): ToastProps<UndoToast> => ({
  toast: { text: 'Conversation archived', actionLabel: 'Undo' },
  onAction: (toast) => toast.undo?.(),
  duration: 0,
  position: 'absolute',
  ...overrides,
});

export const toastVariants: Variant<ToastProps<UndoToast>>[] = [
  { name: 'With Undo', args: {} },
  { name: 'Text only', args: { toast: { text: 'Copied to clipboard' } } },
  {
    name: 'With icon',
    args: { toast: { text: 'Conversation archived', actionLabel: 'Undo', icon: <Archive /> } },
  },
  { name: 'Top right', args: { placement: 'top-right' } },
  { name: 'Bottom left', args: { placement: 'bottom-left' } },
];

/** A working toast: the buttons raise toasts through `useToast`; Undo reports through `onAction`. */
export const ToastDemo: React.FC<{
  duration?: number;
  onAction?: (name: string, ...args: unknown[]) => void;
}> = ({ duration = 3800, onAction }) => {
  const toast = useToast<UndoToast>({ duration, position: 'absolute' });
  return (
    <div className="flex h-full w-full items-start gap-2 p-4">
      <Button
        variant="outline"
        buttonSize="sm"
        onClick={() =>
          toast.notify({
            text: 'Conversation archived',
            actionLabel: 'Undo',
            undo: () => onAction?.('undo'),
          })
        }
      >
        Archive (with Undo)
      </Button>
      <Button
        variant="outline"
        buttonSize="sm"
        onClick={() => toast.notify({ text: 'Copied to clipboard' })}
      >
        Copy (text only)
      </Button>
      <Toast {...toast.props} onAction={(item) => item.undo?.()} />
    </div>
  );
};
