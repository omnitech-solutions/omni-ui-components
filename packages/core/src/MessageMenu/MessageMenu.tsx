import { copyText, download, exportFileName, toMarkdown } from 'lib/chat';
import { useControllableState } from 'lib/use-controllable-state';
import * as React from 'react';
import { ActionMenu } from '../ActionMenu/ActionMenu';
import type { ActionMenuItem, ActionMenuSection } from '../ActionMenu/ActionMenu.types';
import {
  DEFAULT_MESSAGE_MENU_LABELS,
  type MessageItem,
  type MessageMenuProps,
} from './MessageMenu.types';

/**
 * The per-message menu, built on `ActionMenu`: copy, hide / unhide, delete behind an inline "cannot be undone" confirm,
 * and an optional "Download conversation". A row exists only when its callback is passed. Escape closes the confirm and
 * returns to the rows; a second Escape closes the menu.
 *
 * @example
 * <MessageMenu message={message} trigger={<button>More</button>} onCopy={notify} onHide={toggleHidden} onDelete={remove} />
 */
export function MessageMenu<T extends MessageItem = MessageItem>({
  message,
  trigger,
  onCopy,
  onHide,
  onDelete,
  conversation,
  labels,
  icons,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side,
  align,
  width,
  portal,
  container,
  className,
  'data-testid': testId,
}: MessageMenuProps<T>) {
  const l = { ...DEFAULT_MESSAGE_MENU_LABELS, ...labels };
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [confirming, setConfirming] = React.useState(false);
  // Set by a row that keeps the menu open (Delete, Cancel) or closes it itself (confirm), read by the close that follows.
  const intent = React.useRef<'keep' | 'close' | null>(null);

  const handleOpenChange = (next: boolean) => {
    const marked = intent.current;
    intent.current = null;
    if (!next) {
      if (marked === 'keep') return;
      // Escape while the confirm is showing: back to the rows, menu stays open.
      if (marked === null && confirming) {
        setConfirming(false);
        return;
      }
      setConfirming(false);
    }
    setOpen(next);
  };

  // The row that had focus is gone after the swap; hand focus to Cancel (safe default) or back to the Delete row.
  const swapped = React.useRef(false);
  React.useEffect(() => {
    if (!swapped.current) {
      swapped.current = true;
      return;
    }
    const id = window.requestAnimationFrame(() => {
      const menu = Array.from(
        document.querySelectorAll<HTMLElement>('[data-slot="action-menu"][role="menu"]'),
      ).find((node) => node.getAttribute('aria-label') === l.menu);
      menu
        ?.querySelector<HTMLElement>(`[data-item-id="${confirming ? 'cancel' : 'delete'}"]`)
        ?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [confirming]);

  const rows: ActionMenuItem[] = [];
  if (onCopy) {
    rows.push({
      id: 'copy',
      label: l.copy,
      icon: icons?.copy,
      onSelect: () => {
        void copyText(message.text);
        void onCopy(message);
      },
    });
  }
  if (onHide) {
    const hidden = Boolean(message.hidden);
    rows.push({
      id: 'hide',
      label: hidden ? l.unhide : l.hide,
      icon: hidden ? icons?.unhide : icons?.hide,
      onSelect: () => void onHide(message),
    });
  }
  if (conversation) {
    rows.push({
      id: 'download',
      label: l.download,
      icon: icons?.download,
      onSelect: () =>
        download(
          exportFileName(conversation.title, 'md'),
          toMarkdown(conversation.title, conversation.messages, l.export),
          'text/markdown',
        ),
    });
  }
  if (onDelete) {
    rows.push({
      id: 'delete',
      label: l.delete,
      icon: icons?.delete,
      tone: 'danger',
      onSelect: () => {
        intent.current = 'keep';
        setConfirming(true);
      },
    });
  }

  const showConfirm = confirming && Boolean(onDelete);
  const sections: ActionMenuSection[] = showConfirm
    ? [
        {
          id: 'confirm',
          items: [
            {
              id: 'cancel',
              label: l.cancel,
              onSelect: () => {
                intent.current = 'keep';
                setConfirming(false);
              },
            },
          ],
        },
      ]
    : [{ id: 'message', items: rows }];

  const notice =
    showConfirm && onDelete
      ? {
          tone: 'danger' as const,
          title: l.confirmTitle,
          detail: l.confirmDetail,
          icon: icons?.confirm,
          action: {
            label: l.confirmDelete,
            onSelect: () => {
              intent.current = 'close';
              void onDelete(message);
            },
          },
        }
      : undefined;

  // Nothing to offer: no menu at all, just the trigger.
  if (!rows.length) return trigger;

  return (
    <ActionMenu
      trigger={trigger}
      label={l.menu}
      sections={sections}
      notice={notice}
      open={open}
      onOpenChange={handleOpenChange}
      side={side}
      align={align}
      width={width}
      portal={portal}
      container={container}
      className={className}
      data-testid={testId}
    />
  );
}
MessageMenu.displayName = 'MessageMenu';
