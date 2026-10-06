import type { FileLimits, FileRejection } from './Attachment.types';

/** What can be attached: text and PDFs, and images (ported from the original `ATTACHMENT_TYPES`). */
export const DEFAULT_ATTACHMENT_TYPES = [
  'text/plain',
  'text/markdown',
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;
export const DEFAULT_MAX_FILES = 10;
export const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;

export const isImageFile = (file: Pick<File, 'type'>): boolean => file.type.startsWith('image/');

/**
 * The value of an `<input type="file" accept>`: the same allowlist the validation uses, so a file the picker
 * offers is never refused afterwards (and one the picker hides is refused when dropped or pasted).
 */
export const acceptAttribute = (accept: readonly string[] = DEFAULT_ATTACHMENT_TYPES): string => accept.join(',');

/**
 * Checks a list of files (the new ones, with `existing` counting those already attached) against the limits: at most
 * `maxFiles`, each at most `maxBytes`, each of an `accept`ed type. Pure. Returns `null` when every file passes,
 * otherwise the first reason (count first, then the first file that is too large or of the wrong type).
 * Ported from the original `validateFiles`, which throws for the whole batch.
 *
 * @example
 * validateFiles([{ size: 20_000_000, type: 'application/pdf' }]); // { code: 'too-large', file }
 */
export function validateFiles(files: readonly Pick<File, 'name' | 'size' | 'type'>[], limits: FileLimits = {}): FileRejection | null {
  const { accept = DEFAULT_ATTACHMENT_TYPES, maxFiles = DEFAULT_MAX_FILES, maxBytes = DEFAULT_MAX_BYTES, existing = 0 } = limits;
  if (existing + files.length > maxFiles) return { code: 'too-many' };
  const big = files.find((file) => file.size > maxBytes);
  if (big) return { code: 'too-large', file: big };
  const wrong = files.find((file) => !accept.includes(file.type));
  if (wrong) return { code: 'type', file: wrong };
  return null;
}
