import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Paperclip } from 'lucide-react';

import { AttachmentCard, AttachmentDropzone, AttachmentStrip, validateFiles, type AttachmentItem, type AttachmentStripProps } from '@oc-tech/omni-ui-components/Attachment';
import { ComposerDemo } from 'factories/omni-ui-components/Composer/Composer.factories';
import {
  attachmentIcons,
  attachmentItem,
  attachmentRemoveIcon,
  manyItems,
  readyItems,
  sampleThumbnail,
  statusItems,
  useAttachmentUploads,
} from 'factories/omni-ui-components/Attachment/Attachment.factories';

type StoryArgs = AttachmentStripProps;

const meta: Meta<StoryArgs> = {
  title: 'omni-ui-components/Attachment',
  component: AttachmentStrip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '<primary>AttachmentCard</primary> is one file: a thumbnail (`previewUrl`) or your icon node, the name, a meta line and a remove button, at most 220px wide. `status` is `ready`, `uploading` (with `progress`, remove disabled), `extracting` or `failed` (with `error`). <primary>AttachmentStrip</primary> is the labelled row of them (`Selected files`), one horizontally scrolling line so files never push the textarea. <primary>useAttachmentDrop</primary> / <primary>AttachmentDropzone</primary> add files by <primary>drag and drop</primary> (with an overlay; the drag ends only when the pointer leaves the container rect), <primary>paste</primary> and a <primary>file picker</primary>, all checked by <primary>validateFiles</primary> against ONE allowlist (`accept`, `maxFiles` 10, `maxBytes` 10 MB). Refusals go to `onReject(reason)`, never silent. Image previews are object URLs created and revoked by `useFilePreviews`. `T` is your own item type (extend `AttachmentItem`): every callback hands back the same object, never a copy.\n\n**Callbacks**\n\n| Prop | Fires when | Payload |\n| --- | --- | --- |\n| `onRemove` | a remove button is chosen | `(item: T)`, the same object from `items` |\n| `onClick` | a card body is chosen (click, Enter, Space) | `(item: T)` |\n| `onFiles (useAttachmentDrop, AttachmentDropzone)` | files passed the checks (drop, paste, picker) | `(files: File[])` |\n| `onReject` | a batch was refused | `(reason: { code: too-many, too-large or type, file? })` |\n| `useAttachmentList onChange` | the list changes (controlled or not) | `(files: File[])` |\n',
      },
    },
  },
  args: { items: readyItems(), removeIcon: attachmentRemoveIcon, onRemove: fn() },
  argTypes: {
    items: { control: 'object', description: '`AttachmentItem[]`: { id, name, kind, meta, previewUrl, icon, status, progress, error }.' },
    onRemove: { action: 'removed', description: 'Called with the item id. Without it (or with `readOnly`) there is no remove button.' },
    readOnly: { control: 'boolean', description: 'A sent message: never shows the remove button.' },
    layout: { control: 'inline-radio', options: ['scroll', 'wrap'], description: '`scroll` (default): one scrolling row. `wrap`: wraps.' },
    variant: { control: 'inline-radio', options: ['card', 'chip'], description: '`card`: thumbnail + name + meta. `chip`: compact pill (a sent message).' },
    labels: { control: 'object', description: 'Strings: remove (`Remove {name}`), uploading, extracting, failed, strip, dropHere.' },
  },
  render: (args) => (
    <div className="max-w-md p-6">
      <AttachmentStrip {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<StoryArgs>;

/** A file, an image with a thumbnail and a surface from the host UI. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Selected files' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove resume.pdf' }));
    await expect(args.onRemove).toHaveBeenCalledWith(args.items[0]);
  },
};

/** The lifecycle: ready, uploading with progress, uploading without, extracting and failed. Remove is disabled while uploading. */
export const Lifecycle: Story = {
  args: { items: statusItems() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Remove portfolio.pdf' })).toBeDisabled();
    await expect(canvas.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '62');
    await expect(canvas.getByText('Could not read this PDF')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Remove scan.pdf' })).toBeEnabled();
  },
};

/** Nine files: the strip scrolls sideways in one row. */
export const ManyFiles: Story = { args: { items: manyItems() } };

/** Read-only chips, as on a sent message. */
export const ReadOnlyChips: Story = { args: { variant: 'chip', readOnly: true, layout: 'wrap', items: readyItems() } };

/** A single card with an image thumbnail (`previewUrl`). */
export const SingleCard: StoryObj<React.ComponentProps<typeof AttachmentCard>> = {
  render: (args) => (
    <div className="p-6">
      <AttachmentCard {...args} />
    </div>
  ),
  args: { item: { id: 'x', name: 'whiteboard-photo.png', kind: 'image', meta: 'Image', previewUrl: sampleThumbnail }, removeIcon: attachmentRemoveIcon, onRemove: fn(), onClick: fn() },
};

/** Without `previewUrl` the caller's icon node stands in. */
export const WithIcon: StoryObj<React.ComponentProps<typeof AttachmentCard>> = {
  ...SingleCard,
  args: { ...SingleCard.args, item: { id: 'y', name: 'notes.md', kind: 'file', meta: 'File', icon: attachmentIcons.file } },
};

const DropDemo: React.FC<{ onReject: (code: string) => void }> = ({ onReject }) => {
  const [items, setItems] = React.useState<AttachmentItem[]>([]);
  return (
    <div className="max-w-md p-6">
      <AttachmentDropzone
        current={items.length}
        maxFiles={3}
        onFiles={(files) => setItems((all) => [...all, ...files.map((file, i) => attachmentItem({ id: `${all.length + i}-${file.name}`, name: file.name }))])}
        onReject={(reason) => onReject(reason.code)}
        className="rounded-xl border border-dashed border-[color:var(--oui-panel-border)] p-6"
      >
        {(drop) => (
          <div className="flex flex-col gap-3">
            <button type="button" className="inline-flex items-center gap-2 self-start rounded-md border px-3 py-1.5 text-sm" onClick={drop.openPicker}>
              <Paperclip className="size-4" /> Choose files
            </button>
            <AttachmentStrip items={items} removeIcon={attachmentRemoveIcon} onRemove={(removed) => setItems((all) => all.filter((item) => item !== removed))} />
            <p className="m-0 text-xs text-[color:var(--oui-panel-meta-fg)]">Drop files here (max 3, text, Markdown, PDF or images, 10 MB each).</p>
          </div>
        )}
      </AttachmentDropzone>
    </div>
  );
};

/** Drag and drop with the overlay: `Drop files here…` shows while a file is over the container. Dropping a fourth file is refused through `onReject`. */
export const DropZone: StoryObj = {
  render: () => <DropDemo onReject={fn()} />,
  play: async ({ canvasElement }) => {
    const zone = canvasElement.querySelector('[data-slot="attachment-dropzone"]') as HTMLElement;
    const file = (name: string, type = 'text/plain') => new File(['x'], name, { type });
    // Native events with a real DataTransfer, built the way a browser builds them (its `types` then include `Files`).
    const drag = (type: 'dragenter' | 'drop', files: File[]) => {
      const transfer = new DataTransfer();
      for (const item of files) transfer.items.add(item);
      zone.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: transfer }));
    };
    drag('dragenter', [file('a.txt')]);
    await waitFor(() => expect(canvasElement.querySelector('[data-slot="attachment-drop-overlay"]')).not.toBeNull());
    drag('drop', [file('a.txt'), file('b.md', 'text/markdown')]);
    await waitFor(() => expect(canvasElement.querySelector('[data-slot="attachment-drop-overlay"]')).toBeNull());
    await expect(within(canvasElement).getByText('a.txt')).toBeVisible();
    await expect(validateFiles([file('big.pdf', 'application/pdf')], { maxBytes: 0 })?.code).toBe('too-large');
  },
};

/** A composer with attachments: the `+` menu picker, paste, drop, the strip above the field and a vision warning once an image is attached. */
export const InComposer: StoryObj = {
  render: () => (
    <div className="max-w-md p-6">
      <ComposerDemo initialItems={[attachmentItem({ id: 'i', name: 'screenshot.png', kind: 'image', meta: 'Image', previewUrl: sampleThumbnail })]} />
    </div>
  ),
};

const UploadsDemo: React.FC<{ onReject: (code: string) => void; onRetry: (id: string) => void }> = ({ onReject, onRetry }) => {
  const uploads = useAttachmentUploads();
  return (
    <div className="max-w-md p-6">
      <AttachmentDropzone
        current={uploads.items.length}
        onFiles={uploads.add}
        onReject={(reason) => onReject(reason.code)}
        className="rounded-xl border border-dashed border-[color:var(--oui-panel-border)] p-6"
      >
        {(drop) => (
          <div className="flex flex-col gap-3">
            <button type="button" className="inline-flex items-center gap-2 self-start rounded-md border px-3 py-1.5 text-sm" onClick={drop.openPicker}>
              <Paperclip className="size-4" /> Choose files
            </button>
            <AttachmentStrip
              items={uploads.items}
              removeIcon={attachmentRemoveIcon}
              onRemove={uploads.remove}
              onClick={(item) => {
                if (item.status !== 'failed') return;
                onRetry(item.id);
                uploads.retry(item);
              }}
            />
            <p className="m-0 text-xs text-[color:var(--oui-panel-meta-fg)]">
              Each file goes uploading, extracting (PDF and images), then ready. A name starting <code>fail-upload</code> or <code>fail-extract</code> ends failed; choose a failed card to retry it.
            </p>
          </div>
        )}
      </AttachmentDropzone>
    </div>
  );
};

/** The life of a file the host sends: `uploading` (progress), `extracting`, `ready`, or `failed` ("Not sent", or an error text). `useAttachmentUploads` in the factories file is the example host state; the card is only data in, callbacks out. */
export const Uploads: StoryObj = {
  render: () => <UploadsDemo onReject={fn()} onRetry={fn()} />,
  play: async ({ canvasElement }) => {
    const zone = canvasElement.querySelector('[data-slot="attachment-dropzone"]') as HTMLElement;
    const transfer = new DataTransfer();
    transfer.items.add(new File(['x'], 'fail-upload.txt', { type: 'text/plain' }));
    zone.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Uploading…')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Remove fail-upload.txt' })).toBeDisabled();
    await expect(await canvas.findByText('Not sent', undefined, { timeout: 3000 })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Remove fail-upload.txt' })).toBeEnabled();
  },
};
