import '@testing-library/jest-dom';

import {
  AttachmentCard,
  AttachmentDropzone,
  type AttachmentItem,
  AttachmentStrip,
  acceptAttribute,
  DEFAULT_ATTACHMENT_TYPES,
  useAttachmentDrop,
  useAttachmentList,
  useFilePreviews,
  validateFiles,
} from '@oc-tech/omni-ui-components/Attachment';
import { Composer } from '@oc-tech/omni-ui-components/Composer';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  manyItems,
  planForFile,
  readyItems,
  statusItems,
  useAttachmentUploads,
} from 'factories/omni-ui-components/Attachment/Attachment.factories';
import type * as React from 'react';

const file = (name: string, type = 'text/plain', size = 10) => {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
};

describe('omni-ui-components/Attachment', () => {
  describe('validateFiles', () => {
    it('passes allowed files', () =>
      expect(validateFiles([file('a.txt'), file('b.pdf', 'application/pdf')])).toBeNull());
    it('refuses more than maxFiles (default 10), counting existing', () => {
      expect(validateFiles(Array.from({ length: 11 }, (_, i) => file(`${i}.txt`)))?.code).toBe(
        'too-many',
      );
      expect(validateFiles([file('a.txt')], { existing: 10 })?.code).toBe('too-many');
      expect(validateFiles([file('a.txt')], { existing: 9 })).toBeNull();
    });
    it('refuses a file over maxBytes (default 10 MB) and a wrong type', () => {
      expect(validateFiles([file('big.pdf', 'application/pdf', 10485761)])).toMatchObject({
        code: 'too-large',
      });
      expect(validateFiles([file('ok.pdf', 'application/pdf', 10485760)])).toBeNull();
      expect(validateFiles([file('x.zip', 'application/zip')])).toMatchObject({
        code: 'type',
        file: { name: 'x.zip' },
      });
    });
    it('one allowlist: the accept attribute is the same list', () => {
      expect(acceptAttribute()).toBe(DEFAULT_ATTACHMENT_TYPES.join(','));
      expect(validateFiles([file('a.png', 'image/png')], { accept: ['text/plain'] })?.code).toBe(
        'type',
      );
    });
  });

  describe('AttachmentCard', () => {
    it('shows name, meta and a remove button named with the file; onRemove gets the same item', async () => {
      const onRemove = vi.fn();
      const item = { id: '1', name: 'resume.pdf', meta: 'File' };
      render(<AttachmentCard item={item} onRemove={onRemove} />);
      expect(screen.getByText('File')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Remove resume.pdf' }));
      expect(onRemove.mock.calls[0][0]).toBe(item);
    });
    it('onClick makes the body a button and gets the same item', async () => {
      const onClick = vi.fn();
      const item = { id: '1', name: 'resume.pdf' };
      const { rerender } = render(<AttachmentCard item={item} onClick={onClick} />);
      await userEvent.click(screen.getByRole('button', { name: /resume\.pdf/ }));
      expect(onClick.mock.calls[0][0]).toBe(item);
      rerender(<AttachmentCard item={item} />);
      expect(screen.queryByRole('button')).toBeNull();
    });
    it('no onRemove means no remove button', () => {
      render(<AttachmentCard item={{ id: '1', name: 'a.pdf' }} />);
      expect(screen.queryByRole('button')).toBeNull();
    });
    it('uploading: progress bar, upload text, remove disabled', () => {
      render(
        <AttachmentCard
          item={{ id: '1', name: 'a.pdf', status: 'uploading', progress: 62 }}
          onRemove={() => undefined}
        />,
      );
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '62');
      expect(screen.getByText('Uploading…')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove a.pdf' })).toBeDisabled();
    });
    it('failed: shows the error, extracting says so, strings come from labels', () => {
      const { rerender } = render(
        <AttachmentCard item={{ id: '1', name: 'a.pdf', status: 'failed', error: 'Bad PDF' }} />,
      );
      expect(screen.getByText('Bad PDF')).toBeInTheDocument();
      rerender(
        <AttachmentCard
          item={{ id: '1', name: 'a.pdf', status: 'extracting' }}
          labels={{ extracting: 'Lecture…' }}
        />,
      );
      expect(screen.getByText('Lecture…')).toBeInTheDocument();
    });
    it('readOnly and chip have no remove button; previewUrl renders a thumbnail; kindIcons stand in for a missing icon', () => {
      const { rerender } = render(
        <AttachmentCard
          item={{ id: '1', name: 'a.png', previewUrl: 'data:image/png;base64,AA' }}
          onRemove={() => undefined}
          readOnly
        />,
      );
      expect(screen.queryByRole('button')).toBeNull();
      expect(document.querySelector('img')).toHaveAttribute('src', 'data:image/png;base64,AA');
      rerender(
        <AttachmentCard
          item={{ id: '1', name: 'a.png' }}
          variant="chip"
          onRemove={() => undefined}
        />,
      );
      expect(screen.queryByRole('button')).toBeNull();
      rerender(
        <AttachmentCard
          item={{ id: '1', name: 'a.md', kind: 'file' }}
          kindIcons={{ file: <i data-testid="k" /> }}
        />,
      );
      expect(screen.getByTestId('k')).toBeInTheDocument();
    });
  });

  describe('AttachmentStrip', () => {
    it('is a labelled scrolling group of cards and empty renders nothing', () => {
      const { rerender } = render(<AttachmentStrip items={manyItems()} />);
      const strip = screen.getByRole('group', { name: 'Selected files' });
      expect(strip).toHaveClass('overflow-x-auto');
      expect(strip.querySelectorAll('[data-slot="attachment"]')).toHaveLength(9);
      rerender(<AttachmentStrip items={[]} />);
      expect(document.querySelector('[data-slot="attachment-strip"]')).toBeNull();
    });
    it('renders every status', () => {
      render(<AttachmentStrip items={statusItems()} />);
      expect(document.querySelectorAll('[data-status]').length).toBe(5);
      render(<AttachmentStrip items={readyItems()} readOnly />);
    });
  });

  describe('AttachmentDropzone', () => {
    const setup = (props: Partial<React.ComponentProps<typeof AttachmentDropzone>> = {}) => {
      const onFiles = vi.fn();
      const onReject = vi.fn();
      render(
        <AttachmentDropzone onFiles={onFiles} onReject={onReject} {...props}>
          {(drop) => <textarea aria-label="t" onPaste={drop.onPaste} />}
        </AttachmentDropzone>,
      );
      return {
        onFiles,
        onReject,
        zone: document.querySelector('[data-slot="attachment-dropzone"]') as HTMLElement,
      };
    };
    const dt = (files: File[]) => ({ dataTransfer: { types: ['Files'], files } });

    it('shows the overlay while a file is dragged over and hides it on drop, passing the files', () => {
      const { zone, onFiles } = setup();
      fireEvent.dragEnter(zone, dt([file('a.txt')]));
      expect(screen.getByText('Drop files here…')).toBeInTheDocument();
      fireEvent.drop(zone, dt([file('a.txt')]));
      expect(screen.queryByText('Drop files here…')).toBeNull();
      expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: 'a.txt' })]);
    });
    it('ignores a drag that is not files', () => {
      const { zone } = setup();
      fireEvent.dragEnter(zone, { dataTransfer: { types: ['text/plain'], files: [] } });
      expect(screen.queryByText('Drop files here…')).toBeNull();
    });
    it('dragleave inside the container rect keeps the overlay; outside ends it', () => {
      const { zone } = setup();
      zone.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
      fireEvent.dragEnter(zone, dt([file('a.txt')]));
      fireEvent(zone, new MouseEvent('dragleave', { bubbles: true, clientX: 50, clientY: 50 }));
      expect(screen.getByText('Drop files here…')).toBeInTheDocument();
      fireEvent(zone, new MouseEvent('dragleave', { bubbles: true, clientX: 150, clientY: 50 }));
      expect(screen.queryByText('Drop files here…')).toBeNull();
    });
    it('rejects an unsupported or oversized batch through onReject, never onFiles', () => {
      const { zone, onFiles, onReject } = setup();
      fireEvent.drop(zone, dt([file('x.zip', 'application/zip')]));
      expect(onReject).toHaveBeenCalledWith(expect.objectContaining({ code: 'type' }));
      fireEvent.drop(zone, dt([file('big.pdf', 'application/pdf', 20_000_000)]));
      expect(onReject).toHaveBeenLastCalledWith(expect.objectContaining({ code: 'too-large' }));
      expect(onFiles).not.toHaveBeenCalled();
    });
    it('counts current files toward maxFiles', () => {
      const { zone, onReject } = setup({ current: 10 });
      fireEvent.drop(zone, dt([file('a.txt')]));
      expect(onReject).toHaveBeenCalledWith({ code: 'too-many' });
    });
    it('takes pasted files of an allowed type, leaves text paste alone', () => {
      const { onFiles } = setup({ accept: ['image/png'] });
      const box = screen.getByLabelText('t');
      fireEvent.paste(box, { clipboardData: { files: [file('s.png', 'image/png')] } });
      expect(onFiles).toHaveBeenCalledTimes(1);
      fireEvent.paste(box, { clipboardData: { files: [] } });
      expect(onFiles).toHaveBeenCalledTimes(1);
    });
    it('the picker input shares the allowlist, passes files and resets its value', () => {
      const { onFiles } = setup();
      const input = screen.getByLabelText('Attach files') as HTMLInputElement;
      expect(input).toHaveAttribute('accept', acceptAttribute());
      fireEvent.change(input, { target: { files: [file('a.md', 'text/markdown')] } });
      expect(onFiles).toHaveBeenCalled();
      expect(input.value).toBe('');
    });
    it('disabled accepts nothing', () => {
      const { zone, onFiles } = setup({ disabled: true });
      fireEvent.dragEnter(zone, dt([file('a.txt')]));
      fireEvent.drop(zone, dt([file('a.txt')]));
      expect(onFiles).not.toHaveBeenCalled();
    });
  });

  describe('generic items: extra fields flow through by reference', () => {
    interface MyAttachment extends AttachmentItem {
      uploadId: string;
    }
    it('Strip: onRemove and onClick get the SAME object, with the extra field visible to the compiler', async () => {
      const items: MyAttachment[] = [{ id: 'a', name: 'a.pdf', uploadId: 'u-1' }];
      const seen: string[] = [];
      const onRemove = vi.fn((item: MyAttachment) => void seen.push(item.uploadId));
      const onClick = vi.fn((item: MyAttachment) => void seen.push(item.uploadId));
      render(<AttachmentStrip items={items} onRemove={onRemove} onClick={onClick} />);
      await userEvent.click(screen.getByRole('button', { name: 'a.pdf' }));
      await userEvent.click(screen.getByRole('button', { name: 'Remove a.pdf' }));
      expect(onClick.mock.calls[0][0]).toBe(items[0]);
      expect(onRemove.mock.calls[0][0]).toBe(items[0]);
      expect(seen).toEqual(['u-1', 'u-1']);
    });
  });

  describe('useAttachmentList', () => {
    it('uncontrolled: add and remove keep the list and onChange fires', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useAttachmentList({ onChange }));
      act(() => result.current.add([file('a.txt')]));
      expect(result.current.files).toHaveLength(1);
      act(() => result.current.remove(0));
      expect(result.current.files).toHaveLength(0);
      expect(onChange).toHaveBeenCalledTimes(2);
    });
    it('controlled: the list follows value and onChange still fires', () => {
      const onChange = vi.fn();
      const fixed = [file('a.txt')];
      const { result } = renderHook(() => useAttachmentList({ value: fixed, onChange }));
      act(() => result.current.add([file('b.txt')]));
      expect(result.current.files).toBe(fixed);
      expect(onChange).toHaveBeenCalledWith([fixed[0], expect.objectContaining({ name: 'b.txt' })]);
    });
  });

  describe('useFilePreviews', () => {
    it('creates object URLs for images and revokes them when the list changes or unmounts', () => {
      const create = vi.fn(() => 'blob:1');
      const revoke = vi.fn();
      Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
      const image = file('a.png', 'image/png');
      const { result, rerender, unmount } = renderHook(({ files }) => useFilePreviews(files), {
        initialProps: { files: [image, file('b.txt')] },
      });
      expect(create).toHaveBeenCalledTimes(1);
      expect(result.current.get(image)).toBe('blob:1');
      act(() => rerender({ files: [] }));
      expect(revoke).toHaveBeenCalledWith('blob:1');
      unmount();
    });
  });
  describe('one allowlist for the picker, drop, paste and validation', () => {
    const allowed = ['text/plain', 'application/pdf', 'image/png'];
    const picked = (accept: string | null) => (accept ?? '').split(',');

    it('the default picker accept attribute is exactly the default validation list', () => {
      expect(picked(acceptAttribute())).toEqual([...DEFAULT_ATTACHMENT_TYPES]);
      for (const type of DEFAULT_ATTACHMENT_TYPES)
        expect(validateFiles([file('f', type)])).toBeNull();
      expect(validateFiles([file('f.zip', 'application/zip')])?.code).toBe('type');
    });

    it('useAttachmentDrop: inputProps.accept, a dropped file and a pasted file all follow the same custom list', () => {
      const onFiles = vi.fn();
      const onReject = vi.fn();
      const { result } = renderHook(() =>
        useAttachmentDrop({ accept: allowed, onFiles, onReject }),
      );
      expect(picked(result.current.inputProps.accept)).toEqual(allowed);
      // Every type the picker offers is accepted when added by any route.
      for (const type of allowed) result.current.addFiles([file('ok', type)]);
      expect(onFiles).toHaveBeenCalledTimes(allowed.length);
      expect(onReject).not.toHaveBeenCalled();
      // A type the picker hides is refused when dropped and ignored when pasted.
      result.current.addFiles([file('x.md', 'text/markdown')]);
      expect(onReject).toHaveBeenCalledWith(expect.objectContaining({ code: 'type' }));
      const preventDefault = vi.fn();
      result.current.onPaste({
        clipboardData: { files: [file('x.md', 'text/markdown')] },
        preventDefault,
      } as never);
      expect(preventDefault).not.toHaveBeenCalled();
      expect(onFiles).toHaveBeenCalledTimes(allowed.length);
    });

    it('Composer: its hidden picker input carries the same accept as validation', () => {
      const { container, rerender } = render(
        <Composer value="" onChange={() => {}} onFiles={() => {}} />,
      );
      const input = () => container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(picked(input().getAttribute('accept'))).toEqual([...DEFAULT_ATTACHMENT_TYPES]);
      rerender(
        <Composer
          value=""
          onChange={() => {}}
          onFiles={() => {}}
          fileLimits={{ accept: allowed }}
        />,
      );
      expect(picked(input().getAttribute('accept'))).toEqual(allowed);
    });
  });

  describe('useAttachmentUploads (example host state)', () => {
    afterEach(() => vi.useRealTimers());

    it('goes uploading (progress) -> extracting -> ready for a PDF', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useAttachmentUploads());
      act(() => result.current.add([file('cv.pdf', 'application/pdf')]));
      expect(result.current.items[0]).toMatchObject({
        name: 'cv.pdf',
        status: 'uploading',
        progress: 0,
      });
      act(() => void vi.advanceTimersByTime(600));
      expect(result.current.items[0].progress).toBe(50);
      act(() => void vi.advanceTimersByTime(600));
      expect(result.current.items[0].status).toBe('extracting');
      act(() => void vi.advanceTimersByTime(700));
      expect(result.current.items[0].status).toBe('ready');
    });

    it('a text file skips extracting; a failing upload ends failed ("Not sent" in the card) and retry restarts it', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useAttachmentUploads());
      act(() => result.current.add([file('a.txt'), file('fail-upload.txt')]));
      act(() => void vi.advanceTimersByTime(1200));
      expect(result.current.items.map((item) => item.status)).toEqual(['ready', 'failed']);
      render(<AttachmentCard item={result.current.items[1]} />);
      expect(screen.getByText('Not sent')).toBeInTheDocument();
      act(() => result.current.retry(result.current.items[1]));
      expect(result.current.items[1].status).toBe('uploading');
    });

    it('an extraction failure carries its error text; remove is refused while uploading but works once failed', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() =>
        useAttachmentUploads({
          plan: (f) => (f.name === 'x.pdf' ? { failAt: 'extract' } : planForFile(f)),
        }),
      );
      act(() => result.current.add([file('x.pdf', 'application/pdf')]));
      act(() => result.current.remove(result.current.items[0]));
      expect(result.current.items).toHaveLength(1);
      act(() => void vi.advanceTimersByTime(1900));
      expect(result.current.items[0]).toMatchObject({
        status: 'failed',
        error: 'Could not read this file',
      });
      act(() => result.current.remove(result.current.items[0]));
      expect(result.current.items).toHaveLength(0);
    });
  });
});
