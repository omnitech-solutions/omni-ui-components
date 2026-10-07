import * as React from 'react';
import { FileText, Image as ImageIcon, LayoutGrid, X } from 'lucide-react';

import { type AttachmentItem, type AttachmentKind } from '@oc-tech/omni-ui-components/Attachment';
import type { Variant } from '../../internal/support/makeFactory';

/** The default icon of each attachment kind, as nodes (the component never imports icons). */
export const attachmentIcons: Record<AttachmentKind, React.ReactNode> = {
  file: <FileText />,
  image: <ImageIcon />,
  surface: <LayoutGrid />,
};

export const attachmentRemoveIcon = <X />;

/** A 64x64 SVG used as an image thumbnail (a data URL: no network, no object URL). */
export const sampleThumbnail =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' fill='%233b6fe0'/><circle cx='22' cy='24' r='8' fill='%23ffffff' opacity='.85'/><path d='M0 56 L22 34 L40 50 L52 40 L64 52 V64 H0Z' fill='%231a3a7a'/></svg>";

/** Build an item with the kind's icon filled in. */
export const attachmentItem = (overrides: Partial<AttachmentItem> & Pick<AttachmentItem, 'id' | 'name'>): AttachmentItem => ({
  kind: 'file',
  meta: 'File',
  icon: attachmentIcons[overrides.kind ?? 'file'],
  ...overrides,
});

/** One of each look: file, image with a thumbnail, a surface from the host UI. */
export const readyItems = (): AttachmentItem[] => [
  attachmentItem({ id: 'a', name: 'resume.pdf', meta: 'File' }),
  attachmentItem({ id: 'b', name: 'screenshot.png', kind: 'image', meta: 'Image', previewUrl: sampleThumbnail }),
  attachmentItem({ id: 'c', name: 'Notes', kind: 'surface', meta: 'From Studio' }),
];

/** The lifecycle: ready, uploading with progress, extracting, failed with an error. */
export const statusItems = (): AttachmentItem[] => [
  attachmentItem({ id: 's1', name: 'job-description.md', meta: 'File' }),
  attachmentItem({ id: 's2', name: 'portfolio.pdf', status: 'uploading', progress: 62 }),
  attachmentItem({ id: 's3', name: 'big-diagram.png', kind: 'image', status: 'uploading' }),
  attachmentItem({ id: 's4', name: 'transcript.txt', status: 'extracting' }),
  attachmentItem({ id: 's5', name: 'scan.pdf', status: 'failed', error: 'Could not read this PDF' }),
];

/** A long list to show the strip scroll sideways. */
export const manyItems = (): AttachmentItem[] =>
  Array.from({ length: 9 }, (_, index) => attachmentItem({ id: `m${index}`, name: `interview-notes-${index + 1}.md`, meta: 'File' }));

export const attachmentVariants: Variant<{ items: AttachmentItem[] }>[] = [
  { name: 'Ready', args: { items: readyItems() } },
  { name: 'Lifecycle', args: { items: statusItems() } },
];

/** How `useAttachmentUploads` treats one file: how long each step lasts, and whether it fails. */
export interface UploadPlan {
  /** Milliseconds of the `uploading` step (progress climbs to 100). Default 1200. */
  uploadMs?: number;
  /** Milliseconds of the `extracting` step (text pulled out of a PDF or image). Default 700. */
  extractMs?: number;
  /** Fail this file after `uploading` (`'upload'`) or after `extracting` (`'extract'`). Default: it succeeds. */
  failAt?: 'upload' | 'extract';
}

/** A file's name decides its fate in the demo: `fail-upload*` fails while uploading, `fail-extract*` while extracting. */
export const planForFile = (file: Pick<File, 'name'>): UploadPlan =>
  file.name.startsWith('fail-upload') ? { failAt: 'upload' } : file.name.startsWith('fail-extract') ? { failAt: 'extract' } : {};

/**
 * Example host state for sending files: each added `File` becomes an `AttachmentItem` that goes
 * `uploading` (with `progress` 0-100) then `extracting` (PDFs and images only) then `ready`, or ends `failed` with the
 * `Not sent` label (or an `error` text). The component does not own this: a host keeps a list like this and hands it to the
 * strip. `remove` is refused while an item is uploading (the card disables its button too); `retry` restarts a failed one.
 * Timers are cleared on unmount. Replace `plan` and the timers with your real upload and extraction calls.
 */
export function useAttachmentUploads(options: { plan?: (file: File) => UploadPlan } = {}) {
  const { plan = planForFile } = options;
  const [items, setItems] = React.useState<AttachmentItem[]>([]);
  const files = React.useRef(new Map<string, File>());
  const timers = React.useRef(new Set<ReturnType<typeof setTimeout>>());
  const counter = React.useRef(0);
  const latest = React.useRef(plan);
  latest.current = plan;

  const patch = React.useCallback((id: string, change: Partial<AttachmentItem>) => setItems((all) => all.map((item) => (item.id === id ? { ...item, ...change } : item))), []);
  const later = React.useCallback((ms: number, run: () => void) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      run();
    }, ms);
    timers.current.add(timer);
  }, []);
  React.useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const run = React.useCallback(
    (id: string, file: File) => {
      const { uploadMs = 1200, extractMs = 700, failAt } = latest.current(file);
      const steps = 4;
      patch(id, { status: 'uploading', progress: 0, error: undefined });
      for (let step = 1; step <= steps; step += 1) later((uploadMs / steps) * step, () => patch(id, { progress: (step / steps) * 100 }));
      later(uploadMs, () => {
        if (failAt === 'upload') return patch(id, { status: 'failed', progress: undefined });
        const needsExtraction = file.type === 'application/pdf' || file.type.startsWith('image/');
        if (!needsExtraction) return patch(id, { status: 'ready' });
        patch(id, { status: 'extracting', progress: undefined });
        later(extractMs, () => patch(id, failAt === 'extract' ? { status: 'failed', error: 'Could not read this file' } : { status: 'ready' }));
      });
    },
    [later, patch],
  );

  const add = React.useCallback(
    (incoming: File[]) => {
      const created = incoming.map((file) => {
        const id = `up-${(counter.current += 1)}`;
        files.current.set(id, file);
        const kind: AttachmentKind = file.type.startsWith('image/') ? 'image' : 'file';
        return { id, file, item: attachmentItem({ id, name: file.name, kind, meta: kind === 'image' ? 'Image' : 'File', status: 'uploading', progress: 0 }) };
      });
      setItems((all) => [...all, ...created.map((entry) => entry.item)]);
      for (const entry of created) run(entry.id, entry.file);
    },
    [run],
  );
  const remove = React.useCallback((item: AttachmentItem) => {
    files.current.delete(item.id);
    setItems((all) => all.filter((candidate) => candidate.id !== item.id || candidate.status === 'uploading'));
  }, []);
  const retry = React.useCallback(
    (item: AttachmentItem) => {
      const file = files.current.get(item.id);
      if (file) run(item.id, file);
    },
    [run],
  );
  return { items, add, remove, retry };
}
