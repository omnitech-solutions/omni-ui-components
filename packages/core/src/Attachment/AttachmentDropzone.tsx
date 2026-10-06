import * as React from 'react';

import { cn } from 'lib/utils';
import { DEFAULT_ATTACHMENT_LABELS, type AttachmentLabels } from './Attachment.types';
import { attachmentDropOverlayClasses } from './Attachment.variants';
import { useAttachmentDrop, type AttachmentDropOptions } from './use-attachments';

export interface AttachmentDropzoneProps extends AttachmentDropOptions, Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrop' | 'children'> {
  labels?: Partial<Pick<AttachmentLabels, 'dropHere'>>;
  /** Receives the hook's result so a child can use `onPaste`, `inputProps` and `openPicker` (the picker input is rendered for you). */
  children: React.ReactNode | ((drop: ReturnType<typeof useAttachmentDrop>) => React.ReactNode);
}

/**
 * A container that accepts dropped files and shows a drop overlay (`labels.dropHere`) while a file is dragged over it.
 * It renders the hidden file `<input>` too, so a child only has to call `drop.openPicker()`. Pass a function as
 * `children` to receive `drop` (`onPaste` for the textarea, `openPicker`, `addFiles`).
 * Slots: `data-slot="attachment-dropzone" | "attachment-drop-overlay"`; `data-dragging` is set while dragging.
 *
 * @example
 * <AttachmentDropzone current={files.length} onFiles={add} onReject={toast}>
 *   {(drop) => <Composer onPaste={drop.onPaste} … />}
 * </AttachmentDropzone>
 */
export function AttachmentDropzone({ children, labels, className, current, accept, maxFiles, maxBytes, onFiles, onReject, disabled, ...rest }: AttachmentDropzoneProps) {
  const drop = useAttachmentDrop({ current, accept, maxFiles, maxBytes, onFiles, onReject, disabled });
  const { ref: inputRef, ...input } = drop.inputProps;
  const text = labels?.dropHere ?? DEFAULT_ATTACHMENT_LABELS.dropHere;
  return (
    <div data-slot="attachment-dropzone" data-dragging={drop.dragging ? 'true' : undefined} className={cn('relative min-w-0', className)} {...drop.dropProps} {...rest}>
      {typeof children === 'function' ? children(drop) : children}
      <input ref={inputRef} aria-label="Attach files" {...input} />
      {drop.dragging ? (
        <div data-slot="attachment-drop-overlay" role="status" className={attachmentDropOverlayClasses}>
          {text}
        </div>
      ) : null}
    </div>
  );
}
