import * as React from 'react';

/** What an attachment is: a file, an image (may carry a thumbnail) or a piece of the host UI added with `@`. */
export type AttachmentKind = 'file' | 'image' | 'surface';

/** Where an attachment is in its life: `ready` (default), `uploading` (with `progress`), `extracting`, `failed` (with `error`). */
export type AttachmentStatus = 'ready' | 'uploading' | 'extracting' | 'failed';

/** Plain data of one attachment: no `File`, no server type. */
export interface AttachmentItem {
  /** Stable id: the React key and what `onRemove(id)` receives. */
  id: string;
  name: string;
  kind?: AttachmentKind;
  /** Second line, e.g. `File`, `Image` or `From Notes`. Replaced by the status text while not `ready`. */
  meta?: string;
  /** Thumbnail of an image (an object URL or a remote URL). Without it `icon` stands in. */
  previewUrl?: string;
  /** Caller-supplied icon node shown when there is no `previewUrl`. */
  icon?: React.ReactNode;
  status?: AttachmentStatus;
  /** 0-100 while `uploading`: draws a thin progress bar. Omit for an indeterminate upload (text only). */
  progress?: number;
  /** Shown instead of `meta` when `status` is `failed`. */
  error?: string;
}

/** Every user-visible string of the attachment parts. `{name}` is replaced with the attachment's name. */
export interface AttachmentLabels {
  /** Accessible name of a card's remove button. Default `Remove {name}`. */
  remove: string;
  /** Meta text while `uploading`. Default `Uploading…`. */
  uploading: string;
  /** Meta text while `extracting`. Default `Extracting…`. */
  extracting: string;
  /** Meta text when `failed` and the item has no `error`. Default `Not sent`. */
  failed: string;
  /** Accessible name of the strip. Default `Selected files`. */
  strip: string;
  /** Text of the drop overlay. Default `Drop files here…`. */
  dropHere: string;
}

export const DEFAULT_ATTACHMENT_LABELS: AttachmentLabels = {
  remove: 'Remove {name}',
  uploading: 'Uploading…',
  extracting: 'Extracting…',
  failed: 'Not sent',
  strip: 'Selected files',
  dropHere: 'Drop files here…',
};

export interface AttachmentCardProps<T extends AttachmentItem = AttachmentItem> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onClick'> {
  /** The attachment. Extend {@link AttachmentItem} with your own fields: the callbacks hand the same object back, never a copy. */
  item: T;
  /**
   * `card` (default): thumbnail, name, meta line and a remove button, at most 220px wide.
   * `chip`: a compact one-line pill (icon, name) for a sent message; it has no remove button.
   */
  variant?: 'card' | 'chip';
  /** The remove button was chosen. Payload: the full item. Absent (or `readOnly`): no remove button. */
  onRemove?: (item: T) => void | Promise<void>;
  /** The card body was chosen (click, Enter or Space): open a preview. Payload: the full item. Absent: the body is not a button. */
  onClick?: (item: T) => void | Promise<void>;
  /** Icon node of the remove button (caller-supplied, e.g. an X). Without it the button shows a plain `×`. */
  removeIcon?: React.ReactNode;
  /** Icon nodes by kind, used when the item has no `icon` of its own (keeps items free of nodes). */
  kindIcons?: Partial<Record<AttachmentKind, React.ReactNode>>;
  /** Read-only (a sent message): never shows the remove button. */
  readOnly?: boolean;
  labels?: Partial<AttachmentLabels>;
}

export interface AttachmentStripProps<T extends AttachmentItem = AttachmentItem> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onClick'> {
  items: T[];
  /** A card's remove button was chosen. Payload: the full item (the same object from `items`). Absent: no remove buttons. */
  onRemove?: (item: T) => void | Promise<void>;
  /** A card body was chosen. Payload: the full item. Absent: bodies are not buttons. */
  onClick?: (item: T) => void | Promise<void>;
  removeIcon?: React.ReactNode;
  kindIcons?: Partial<Record<AttachmentKind, React.ReactNode>>;
  readOnly?: boolean;
  /** `scroll` (default): one horizontally scrolling row, so files never push the textarea. `wrap`: wraps onto more rows. */
  layout?: 'scroll' | 'wrap';
  /** Card variant of every item. Default `card`. */
  variant?: 'card' | 'chip';
  labels?: Partial<AttachmentLabels>;
}

/** Why a batch of files was refused. The whole batch is refused, as the original `validateFiles` does. */
export type FileRejectCode = 'too-many' | 'too-large' | 'type';

export interface FileRejection {
  code: FileRejectCode;
  /** The first offending file for `too-large` and `type`. */
  file?: Pick<File, 'name' | 'size' | 'type'>;
}

export interface FileLimits {
  /** Allowed MIME types: the ONE list the picker's `accept` attribute and the validation both read. Default {@link DEFAULT_ATTACHMENT_TYPES}. */
  accept?: readonly string[];
  /** Most files in one message, counting those already attached. Default 10. */
  maxFiles?: number;
  /** Largest single file in bytes. Default 10 MB (10485760). */
  maxBytes?: number;
  /** Files already attached: counted against `maxFiles`. Default 0. */
  existing?: number;
}
