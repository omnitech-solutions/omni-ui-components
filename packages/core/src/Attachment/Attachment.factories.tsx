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
