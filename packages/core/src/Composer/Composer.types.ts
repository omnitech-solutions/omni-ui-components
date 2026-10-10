import type * as React from 'react';

import type { ActionMenuProps } from '../ActionMenu';
import type {
  AttachmentItem,
  AttachmentKind,
  AttachmentLabels,
  FileLimits,
  FileRejection,
} from '../Attachment';
import type { CommandTrigger } from '../CommandPopover';
import type { QueuedItem, QueuedListLabels } from '../QueuedList';

/** The four looks of the send control, in the order the original decides them. */
export type SendState = 'idle' | 'ready' | 'streaming' | 'queue';

/** Every user-visible string of the composer. */
export interface ComposerLabels {
  /** Accessible name of the textarea. Default `Message`. */
  message: string;
  /** Send button (idle with text). Default `Send (Enter)`. */
  send: string;
  /** Send button while a reply runs and the draft is empty. Default `Stop (Esc)`. */
  stop: string;
  /** Send button while a reply runs and there is a draft: the message is queued. Default `Queue message`. */
  queue: string;
  /** The `+` button of the {@link PlusMenu}. Default `Add files, images or context`. */
  plus: string;
  /** The microphone button. Default `Dictate`. */
  dictate: string;
}

export const DEFAULT_COMPOSER_LABELS: ComposerLabels = {
  message: 'Message',
  send: 'Send (Enter)',
  stop: 'Stop (Esc)',
  queue: 'Queue message',
  plus: 'Add files, images or context',
  dictate: 'Dictate',
};

/** Which send state applies: stop when a reply runs and the draft is empty, queue when it runs and there is a draft. */
export const sendStateOf = ({
  streaming,
  hasDraft,
  canQueue = true,
}: {
  streaming: boolean;
  hasDraft: boolean;
  canQueue?: boolean;
}): SendState =>
  streaming && !hasDraft
    ? 'streaming'
    : streaming && canQueue
      ? 'queue'
      : hasDraft
        ? 'ready'
        : 'idle';

export interface SendButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  state: SendState;
  /** Icon nodes per state: arrow for `idle` and `ready`, stop square for `streaming`, playlist-add for `queue`. */
  sendIcon: React.ReactNode;
  stopIcon?: React.ReactNode;
  queueIcon?: React.ReactNode;
  labels?: Partial<Pick<ComposerLabels, 'send' | 'stop' | 'queue'>>;
}

/** What a `leading` / `toolbar` / `trailing` function receives, to wire the `+` menu and friends. */
export interface ComposerApi {
  /** Opens the file dialog (only does something when `onFiles` is set). */
  openPicker: () => void;
  /** Focuses the textarea. */
  focus: () => void;
}

type ComposerSlot = React.ReactNode | ((api: ComposerApi) => React.ReactNode);

/**
 * Callbacks (all optional, all plain `on` + Verb, payloads are data, a host may return a promise and the component ignores
 * it). A control that exists only for a callback is not rendered without it.
 */
/** What `onSubmit` and `onQueue` receive: the text and the full attachment items (the same objects as `attachmentItems`). */
export interface ComposerDraft<A extends AttachmentItem = AttachmentItem> {
  value: string;
  attachments: A[];
}

export interface ComposerProps<
  A extends AttachmentItem = AttachmentItem,
  Q extends QueuedItem = QueuedItem,
> extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'onChange' | 'onSubmit' | 'children' | 'onPaste' | 'onKeyDown' | 'onFocus' | 'onBlur'
  > {
  /** The draft. Controlled when set (the host owns it and clears it); otherwise kept inside (`defaultValue`). Nothing in the composer clears it on submit. */
  value?: string;
  defaultValue?: string;
  /** Fires with the new text on every edit (typing, paste, a recalled prompt), in both modes. */
  onChange?: (next: string) => void;
  /**
   * Enter (when `sendOnEnter`) or the send button, with a non-empty draft and not streaming (or streaming without
   * `onQueue`). Payload: `{ value, attachments }` with the full attachment items. The host does its own saving here and clears `value`.
   * Without it there is no send button and Enter does nothing.
   */
  onSubmit?: (draft: ComposerDraft<A>) => void | Promise<void>;
  /** Submit while `streaming` (the draft is queued behind the running reply). Same payload as `onSubmit`. Without it a draft submits through `onSubmit`. */
  onQueue?: (draft: ComposerDraft<A>) => void | Promise<void>;
  /** Stop the running reply: the send button while `streaming` with an empty draft, and Escape. Absent: no Stop button. */
  onStop?: () => void | Promise<void>;
  /**
   * ArrowUp with the caret collapsed on the FIRST line of the draft (or Cmd/Ctrl+ArrowUp anywhere). Return the earlier prompt to recall
   * it (the composer fires `onChange` with it and puts the caret at the end), or nothing to leave the key alone. Lines are logical
   * (separated by newlines): a long soft-wrapped first line counts as one. The draft being left is kept, and ArrowDown past the newest
   * entry restores it. Not set: no recall.
   */
  onRecallPrevious?: () => string | null | undefined;
  /**
   * ArrowDown with the caret collapsed on the LAST line (or Cmd/Ctrl+ArrowDown anywhere), after a recall. Return the later prompt, or
   * nothing when there is none: the draft that was there before the recall comes back. Without it, Down only restores that draft.
   */
  onRecallNext?: () => string | null | undefined;
  /** The textarea gained focus. No payload. */
  onFocus?: () => void;
  /** The textarea lost focus. No payload. */
  onBlur?: () => void;
  /** A reply is running: the send button becomes Stop (empty draft) or Queue (draft, with `onQueue`). */
  streaming?: boolean;
  placeholder?: string;
  /** Enter sends and Shift+Enter adds a newline (default true). Off: Enter adds a newline and only the button sends. */
  sendOnEnter?: boolean;
  /** The textarea grows up to this many px, then scrolls. Default 200. */
  maxHeight?: number;
  /** `stacked` (default): field above a toolbar row. `pill`: a single row, `leading` then field then actions. */
  variant?: 'stacked' | 'pill';
  disabled?: boolean;
  /** Escape stops a running reply (default true). */
  stopOnEscape?: boolean;

  /** The attached items, drawn as a strip above the box and passed to `onSubmit`/`onQueue`. */
  attachmentItems?: A[];
  /** A card's remove button was chosen. Payload: the full item (the same object from `attachmentItems`). Absent: no remove buttons. */
  onRemoveAttachment?: (attachment: A) => void | Promise<void>;
  /** A card body was chosen. Payload: the full item. Absent: bodies are not buttons. */
  onAttachmentClick?: (attachment: A) => void | Promise<void>;
  /** Icon nodes by attachment kind, for items without an `icon`. */
  attachmentKindIcons?: Partial<Record<AttachmentKind, React.ReactNode>>;
  /** Icon node of the cards' remove buttons. */
  attachmentRemoveIcon?: React.ReactNode;
  /**
   * Files that passed the checks, from a drop, a paste or the picker. Payload: the new files. Setting it turns on drag and drop
   * (with an overlay), paste and `openPicker`; without it none of those exist.
   */
  onFiles?: (files: File[]) => void;
  /** A batch was refused (too many, too large, wrong type). Payload: the reason. Nothing reaches `onFiles`. */
  onReject?: (reason: FileRejection) => void;
  /** The one allowlist, `maxFiles` and `maxBytes` shared by the picker, drop and paste. */
  fileLimits?: FileLimits;

  /** Rows queued behind the running reply, drawn above the box. */
  queued?: Q[];
  /** A queued row's remove button was chosen. Payload: the full item (the same object from `queued`). Absent: no remove buttons. */
  onRemoveQueued?: (item: Q) => void | Promise<void>;
  /** Icon nodes of the queued rows. */
  queuedIcon?: React.ReactNode;
  queuedRemoveIcon?: React.ReactNode;

  /**
   * Triggers to watch in the draft (`{ id, pattern }`, e.g. the slash and mention patterns). `onTrigger` fires when one
   * starts, its query changes, or it ends.
   */
  triggers?: Pick<CommandTrigger, 'id' | 'pattern'>[];
  /** Payload: `{ trigger, query }`: the trigger id (`null` when no trigger matches any more) and its query (`''` when null). The host opens its own popover. */
  onTrigger?: (event: { trigger: string | null; query: string }) => void;

  /** The mic button was chosen or the dictation key started: dictation begins. Absent: no mic button. */
  onDictationStart?: () => void | Promise<void>;
  /** Done was chosen (or the key was released after a hold). Payload: the transcript (`dictationText`) to append to the draft. */
  onDictationFinish?: (text: string) => void | Promise<void>;
  /** Cancel was chosen: discard the transcript. */
  onDictationCancel?: () => void | Promise<void>;
  /** The live transcript shown by the dictation bar. */
  dictationText?: string;
  /** `KeyboardEvent.code` of the tap/hold-to-talk key (`AltRight`). Empty: no key. */
  dictationKey?: string;
  /** Listening now. Controlled when set; otherwise kept inside (the mic and the callbacks drive it). */
  dictating?: boolean;
  /** Icon nodes of the mic button and the bar's Cancel and Done. */
  micIcon?: React.ReactNode;
  dictationCancelIcon?: React.ReactNode;
  dictationDoneIcon?: React.ReactNode;

  /** Runs first on every textarea keydown; return `true` when it handled the key (an open CommandPopover). */
  onBeforeKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => boolean | void;
  /** Runs after the built-in file paste handling (a paste of files is taken by `onFiles`). */
  onPaste?: React.ClipboardEventHandler<HTMLTextAreaElement>;
  /** Ref of the textarea (focus it after a pick, set the caret). */
  inputRef?: React.Ref<HTMLTextAreaElement>;
  /** Extra attributes for the textarea, e.g. `aria-activedescendant`, `aria-controls`, `aria-autocomplete` (a textarea stays a textbox: it may not take `role="combobox"`). */
  textareaProps?: Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'value' | 'onChange' | 'placeholder' | 'disabled' | 'rows' | 'onFocus' | 'onBlur'
  >;
  /** Slot before the field: usually the `+` menu. A function receives {@link ComposerApi}. */
  leading?: ComposerSlot;
  /** Slot of the toolbar row (stacked) or before the actions (pill): the model button, effort. */
  toolbar?: ComposerSlot;
  /** Slot right before the send button: the context meter. */
  trailing?: ComposerSlot;
  /** Extra node under the attachment strip. */
  attachments?: React.ReactNode;
  /** Slot above everything: notices, a capability warning. */
  above?: React.ReactNode;
  /**
   * The popover (a CommandPopover). A function receives the composer root as `anchor`: pass it to `CommandPopover` so it
   * renders in a portal above the composer and is not clipped by an `overflow: hidden` ancestor such as the Panel dock.
   */
  popover?: React.ReactNode | ((api: { anchor: HTMLElement | null }) => React.ReactNode);
  /** Replaces the field and the actions (a custom dictation bar). */
  dictation?: React.ReactNode;
  /** Line under the box, e.g. `Replies come from Claude`. */
  hint?: React.ReactNode;
  /** Icon nodes of the built-in send button. Without `sendIcon` the button shows a plain arrow glyph. */
  sendIcon?: React.ReactNode;
  stopIcon?: React.ReactNode;
  queueIcon?: React.ReactNode;
  /** Off: no built-in send button (render your own in `trailing`). Default true. */
  showSend?: boolean;
  labels?: Partial<ComposerLabels>;
  attachmentLabels?: Partial<AttachmentLabels>;
  queuedLabels?: Partial<QueuedListLabels>;
}

/** One row of the `+` menu. */
export interface PlusMenuItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  /** Chosen. A row without it is not rendered. */
  onClick?: () => void | Promise<void>;
  /** A divider is drawn before this row (a new group). */
  separated?: boolean;
  disabled?: boolean;
}

export interface PlusMenuProps
  extends Pick<
    ActionMenuProps,
    | 'side'
    | 'align'
    | 'sideOffset'
    | 'width'
    | 'portal'
    | 'container'
    | 'open'
    | 'onOpenChange'
    | 'returnFocus'
  > {
  items: PlusMenuItem[];
  /** The `+` glyph (a caller-supplied icon node). */
  icon?: React.ReactNode;
  /** Accessible name of the trigger and of the menu. Default `Add files, images or context`. */
  label?: string;
  /** Outlined (stacked) or plain (pill) trigger. Default `outlined`. */
  appearance?: 'outlined' | 'plain';
}

export interface ComposerNoticeProps
  extends Omit<React.HTMLAttributes<HTMLOutputElement>, 'children'> {
  /** The message, e.g. `Haiku can't see images. Switch to Sonnet?`. */
  message: React.ReactNode;
  /** Caller-supplied icon node. */
  icon?: React.ReactNode;
  /** Optional action button (e.g. `Switch`). */
  action?: { label: string; onClick: () => void | Promise<void> };
  /** Tone from the token scale. Default `warning`. */
  tone?: 'warning' | 'danger' | 'accent' | 'neutral';
}
