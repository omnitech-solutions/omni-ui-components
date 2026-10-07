import * as React from 'react';

import { useControllableState } from '../lib/use-controllable-state';
import type { FileLimits, FileRejection } from './Attachment.types';
import { acceptAttribute, isImageFile, validateFiles } from './validate-files';

export interface AttachmentDropOptions extends FileLimits {
  /** Files already attached: counted against `maxFiles`. Default 0. */
  current?: number;
  /** The files that passed the checks (drop, paste or picker). Optional notification: fires whether or not the list is also kept by `useAttachmentList`. */
  onFiles?: (files: File[]) => void;
  /** The batch was refused: say why (a toast). Never silent. The refused files are not passed to `onFiles`. */
  onReject?: (rejection: FileRejection) => void;
  /** Off: nothing is accepted and the overlay never shows. */
  disabled?: boolean;
}

const hasFiles = (event: React.DragEvent) =>
  Array.from(event.dataTransfer?.types ?? []).includes('Files');

/**
 * Add-file behaviour for a composer: drag and drop with an overlay flag, paste, and a file picker, all checked against
 * ONE allowlist. `dragging` clears only when the pointer leaves the container's bounding rect, so crossing from a
 * child to a child never flickers the overlay. Spread `dropProps` on the container, `onPaste` on the textarea,
 * `inputProps` on a hidden `<input type="file">` and call `openPicker()` from a button. The picker's input value is
 * reset after each choice, so the same file can be picked again.
 *
 * @example
 * const drop = useAttachmentDrop({ current: files.length, onFiles: (next) => setFiles((all) => [...all, ...next]), onReject: toast });
 * <div {...drop.dropProps}>…<textarea onPaste={drop.onPaste} />…<input {...drop.inputProps} /></div>
 */
export function useAttachmentDrop(options: AttachmentDropOptions) {
  const { accept, maxFiles, maxBytes, current = 0, disabled = false } = options;
  const [dragging, setDragging] = React.useState(false);
  const picker = React.useRef<HTMLInputElement>(null);
  const latest = React.useRef(options);
  latest.current = options;

  const add = React.useCallback((incoming: File[]) => {
    if (incoming.length === 0) return;
    const {
      current: have = 0,
      accept: types,
      maxFiles: count,
      maxBytes: bytes,
      onFiles: pass,
      onReject: reject,
    } = latest.current;
    // [GUARD] Files already attached count toward the limit.
    const refusal = validateFiles(incoming, {
      accept: types,
      maxFiles: count,
      maxBytes: bytes,
      existing: have,
    });
    if (refusal) reject?.(refusal);
    else pass?.(incoming);
  }, []);

  const onDragEnter = React.useCallback(
    (event: React.DragEvent) => {
      if (disabled || !hasFiles(event)) return;
      event.preventDefault();
      setDragging(true);
    },
    [disabled],
  );
  const onDragOver = React.useCallback(
    (event: React.DragEvent) => {
      if (disabled || !hasFiles(event)) return;
      // Required for the drop event to fire.
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    },
    [disabled],
  );
  const onDragLeave = React.useCallback((event: React.DragEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const { clientX: x, clientY: y } = event;
    // [SAFETY] Leaving into a child fires dragleave too: only a pointer outside the container's rect ends the drag.
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) setDragging(false);
  }, []);
  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      setDragging(false);
      if (disabled || !hasFiles(event)) return;
      event.preventDefault();
      add(Array.from(event.dataTransfer.files));
    },
    [add, disabled],
  );
  const onPaste = React.useCallback(
    (event: React.ClipboardEvent) => {
      if (disabled) return;
      const pasted = Array.from(event.clipboardData?.files ?? []);
      // Only files of an allowed type are taken; ordinary text paste is left alone.
      const types = latest.current.accept;
      const wanted = pasted.filter((file) => (types ? types.includes(file.type) : true));
      if (wanted.length === 0) return;
      event.preventDefault();
      add(wanted);
    },
    [add, disabled],
  );

  const inputProps = {
    ref: picker,
    type: 'file' as const,
    multiple: true,
    hidden: true,
    tabIndex: -1,
    accept: acceptAttribute(accept),
    disabled,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      add(Array.from(event.target.files ?? []));
      event.target.value = '';
    },
  };

  return {
    dragging,
    /** Spread on the drop container. */
    dropProps: { onDragEnter, onDragOver, onDragLeave, onDrop },
    /** Put on the textarea (or merge into its own handler). */
    onPaste,
    /** Spread on a hidden `<input type="file">`. */
    inputProps,
    /** Opens the file dialog (call from the `+` menu or an attach button). */
    openPicker: () => picker.current?.click(),
    /** Feed files in from anywhere (e.g. a custom picker). */
    addFiles: add,
    maxFiles: maxFiles ?? undefined,
    current,
    maxBytes,
  };
}

/**
 * Object-URL thumbnails for the image files in `files`: created when the list changes and revoked when it changes
 * again or the component unmounts. Without `URL.createObjectURL` (server rendering, some embeds) nothing is made and
 * the caller's icon stands in.
 */
export function useFilePreviews(files: readonly File[]): ReadonlyMap<File, string> {
  const [previews, setPreviews] = React.useState<ReadonlyMap<File, string>>(() => new Map());
  React.useEffect(() => {
    const next = new Map<File, string>();
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      for (const file of files) if (isImageFile(file)) next.set(file, URL.createObjectURL(file));
    }
    setPreviews(next);
    return () => {
      for (const url of next.values()) URL.revokeObjectURL(url);
    };
  }, [files]);
  return previews;
}

/**
 * The list of attached files, controlled (`value`) or kept inside (`defaultValue`), with `onChange` firing in both modes.
 * `add` appends accepted files (feed it `useAttachmentDrop`'s `onFiles`), `remove` drops one by index, `clear` empties it.
 *
 * @example
 * const list = useAttachmentList();
 * const drop = useAttachmentDrop({ current: list.files.length, onFiles: list.add });
 */
export function useAttachmentList(
  options: { value?: File[]; defaultValue?: File[]; onChange?: (files: File[]) => void } = {},
) {
  const [files, setFiles] = useControllableState<File[]>(
    options.value,
    options.defaultValue ?? [],
    options.onChange,
  );
  return {
    files,
    add: (incoming: File[]) => setFiles([...files, ...incoming]),
    remove: (index: number) => setFiles(files.filter((_, at) => at !== index)),
    clear: () => setFiles([]),
  };
}
