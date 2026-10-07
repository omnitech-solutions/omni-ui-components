import * as React from 'react';

import type { ExportLabels, ExportMessage } from 'lib/chat';
import type { ActionMenuProps } from '../ActionMenu/ActionMenu.types';

/** The message the menu acts on. Extend it with your own fields; the same object comes back in every callback. */
export interface MessageItem extends ExportMessage {
  id: string;
  /** The message is hidden from the thread: the menu offers "Unhide" instead of "Hide". */
  hidden?: boolean;
}

/** The conversation behind the optional "Download conversation" item. */
export interface MessageMenuConversation {
  /** Heading of the Markdown file and base of its file name. */
  title?: string;
  messages: readonly ExportMessage[];
}

export interface MessageMenuLabels {
  /** Accessible name of the menu. */
  menu: string;
  copy: string;
  hide: string;
  unhide: string;
  delete: string;
  download: string;
  /** Title of the inline confirm. */
  confirmTitle: string;
  /** Detail line of the inline confirm. */
  confirmDetail: string;
  /** The confirm's destructive button. */
  confirmDelete: string;
  /** The confirm's way back. */
  cancel: string;
  /** Headings of the downloaded Markdown file. */
  export: Partial<ExportLabels>;
}

export const DEFAULT_MESSAGE_MENU_LABELS: MessageMenuLabels = {
  menu: 'Message options',
  copy: 'Copy message',
  hide: 'Hide message',
  unhide: 'Unhide message',
  delete: 'Delete message',
  download: 'Download conversation',
  confirmTitle: 'Delete this message?',
  confirmDetail: 'This cannot be undone.',
  confirmDelete: 'Delete',
  cancel: 'Cancel',
  export: {},
};

/** Icons are nodes you pass in; any left out leaves that row without one. */
export interface MessageMenuIcons {
  copy?: React.ReactNode;
  hide?: React.ReactNode;
  unhide?: React.ReactNode;
  delete?: React.ReactNode;
  download?: React.ReactNode;
  /** Leading icon of the delete confirm. */
  confirm?: React.ReactNode;
}

export interface MessageMenuProps<T extends MessageItem = MessageItem> {
  /** The message the menu is for. Passed by reference to `onCopy`, `onHide` and `onDelete`. */
  message: T;
  /** The element that opens the menu. */
  trigger: React.ReactElement;
  /** Without it the "Copy message" row is not rendered. The text is written to the clipboard first, then this is called. */
  onCopy?(message: T): void | Promise<void>;
  /** Without it the Hide / Unhide row is not rendered. Called for both directions; flip `message.hidden` yourself. */
  onHide?(message: T): void | Promise<void>;
  /** Without it the Delete row is not rendered. Called only after the inline "cannot be undone" confirm. */
  onDelete?(message: T): void | Promise<void>;
  /** Give it to add "Download conversation": the messages are saved as a Markdown file. */
  conversation?: MessageMenuConversation;
  labels?: Partial<MessageMenuLabels>;
  icons?: MessageMenuIcons;
  open?: boolean;
  defaultOpen?: boolean;
  /** Fires on every open or close, controlled or not. */
  onOpenChange?: (open: boolean) => void;
  side?: ActionMenuProps['side'];
  align?: ActionMenuProps['align'];
  width?: ActionMenuProps['width'];
  portal?: boolean;
  container?: HTMLElement | null;
  className?: string;
  'data-testid'?: string;
}
