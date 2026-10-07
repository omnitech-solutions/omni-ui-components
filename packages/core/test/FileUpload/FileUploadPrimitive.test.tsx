import '@testing-library/jest-dom';
import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { FileUploadPrimitive } from '../../src/FileUpload/FileUploadPrimitive';

const makeFile = (name: string, size = 10, lastModified = 1) => {
  const file = new File(['x'.repeat(size)], name, { type: 'text/plain', lastModified });
  return file;
};

const input = () => document.querySelector('input[type="file"]') as HTMLInputElement;
const zone = () => document.querySelector('[data-slot="file-upload"]') as HTMLElement;

const pick = (files: File[]) => {
  fireEvent.change(input(), { target: { files } });
};

const drop = (files: File[]) => {
  const event = createEvent.drop(zone());
  Object.defineProperty(event, 'dataTransfer', { value: { files } });
  fireEvent(zone(), event);
};

describe('omni-ui-components/FileUploadPrimitive', () => {
  it('describes accepted types and the size limit', () => {
    const { rerender } = render(<FileUploadPrimitive />);
    expect(screen.getByText('Any file type')).toBeInTheDocument();

    rerender(<FileUploadPrimitive accept=".png" maxSize={2048} />);
    expect(screen.getByText(/Accepted: \.png/)).toHaveTextContent('up to 2.0 KB');
  });

  it('formats file sizes in B, KB and MB in the list', () => {
    const big = makeFile('big.bin', 1);
    Object.defineProperty(big, 'size', { value: 3 * 1024 * 1024 });
    const mid = makeFile('mid.bin', 1, 2);
    Object.defineProperty(mid, 'size', { value: 1536 });
    render(<FileUploadPrimitive value={[makeFile('tiny.txt', 5), mid, big]} />);
    expect(screen.getByText('5 B')).toBeInTheDocument();
    expect(screen.getByText('1.5 KB')).toBeInTheDocument();
    expect(screen.getByText('3.0 MB')).toBeInTheDocument();
  });

  it('clicking the zone opens the native picker, unless disabled or read-only', () => {
    const { rerender } = render(<FileUploadPrimitive />);
    const click = vi.spyOn(input(), 'click').mockImplementation(() => undefined);
    fireEvent.click(zone());
    expect(click).toHaveBeenCalledTimes(1);

    click.mockClear();
    rerender(<FileUploadPrimitive disabled />);
    fireEvent.click(zone());
    expect(click).not.toHaveBeenCalled();
    expect(input()).toBeDisabled();

    rerender(<FileUploadPrimitive readOnly />);
    fireEvent.click(zone());
    expect(click).not.toHaveBeenCalled();
  });

  it('single mode keeps only the first picked file', () => {
    const onChange = vi.fn();
    const a = makeFile('a.txt');
    const b = makeFile('b.txt');
    render(<FileUploadPrimitive onChange={onChange} />);
    pick([a, b]);
    expect(onChange).toHaveBeenCalledWith([a]);
    expect(onChange.mock.calls[0][0][0]).toBe(a);
  });

  it('ignores an empty selection', () => {
    const onChange = vi.fn();
    render(<FileUploadPrimitive onChange={onChange} />);
    pick([]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('multiple mode appends to the existing value', () => {
    const onChange = vi.fn();
    const existing = makeFile('old.txt');
    const added = makeFile('new.txt');
    render(<FileUploadPrimitive multiple value={[existing]} onChange={onChange} />);
    pick([added]);
    expect(onChange).toHaveBeenCalledWith([existing, added]);
  });

  it('reports oversize files and drops them', () => {
    const onChange = vi.fn();
    const onError = vi.fn();
    const small = makeFile('small.txt', 5);
    const huge = makeFile('huge.txt', 5000);
    render(<FileUploadPrimitive multiple maxSize={1024} onChange={onChange} onError={onError} />);
    pick([small, huge]);
    expect(onError).toHaveBeenCalledWith('huge.txt exceeds 1.0 KB limit');
    expect(onChange).toHaveBeenCalledWith([small]);
  });

  it('does not require an onError handler for oversize files', () => {
    const onChange = vi.fn();
    render(<FileUploadPrimitive maxSize={1} onChange={onChange} />);
    pick([makeFile('huge.txt', 50)]);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('caps the number of files and reports it', () => {
    const onChange = vi.fn();
    const onError = vi.fn();
    const files = [makeFile('1.txt'), makeFile('2.txt'), makeFile('3.txt')];
    render(<FileUploadPrimitive multiple maxFiles={2} onChange={onChange} onError={onError} />);
    pick(files);
    expect(onError).toHaveBeenCalledWith('Pick up to 2 files');
    expect(onChange).toHaveBeenCalledWith([files[0], files[1]]);
  });

  it('removing a file emits the list without it and does not open the picker', () => {
    const onChange = vi.fn();
    const a = makeFile('a.txt', 1, 1);
    const b = makeFile('b.txt', 1, 2);
    render(<FileUploadPrimitive multiple value={[a, b]} onChange={onChange} />);
    const click = vi.spyOn(input(), 'click').mockImplementation(() => undefined);
    fireEvent.click(screen.getByRole('button', { name: 'Remove a.txt' }));
    expect(onChange).toHaveBeenCalledWith([b]);
    expect(click).not.toHaveBeenCalled();
  });

  it('hides remove buttons when disabled or read-only', () => {
    const a = makeFile('a.txt');
    const { rerender } = render(<FileUploadPrimitive value={[a]} disabled />);
    expect(screen.queryByRole('button', { name: 'Remove a.txt' })).not.toBeInTheDocument();
    rerender(<FileUploadPrimitive value={[a]} readOnly />);
    expect(screen.queryByRole('button', { name: 'Remove a.txt' })).not.toBeInTheDocument();
  });

  it('shows the drop hint while dragging over and resets on leave or drop', () => {
    const onChange = vi.fn();
    const dropped = makeFile('dropped.txt');
    render(<FileUploadPrimitive onChange={onChange} />);
    fireEvent.dragOver(zone());
    expect(screen.getByText('Drop to upload')).toBeInTheDocument();
    fireEvent.dragLeave(zone());
    expect(screen.getByText('Click to browse or drag files here')).toBeInTheDocument();

    fireEvent.dragOver(zone());
    drop([dropped]);
    expect(onChange).toHaveBeenCalledWith([dropped]);
    expect(screen.getByText('Click to browse or drag files here')).toBeInTheDocument();
  });

  it('ignores an empty drop', () => {
    const onChange = vi.fn();
    render(<FileUploadPrimitive onChange={onChange} />);
    drop([]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores drag and drop when disabled or read-only', () => {
    const onChange = vi.fn();
    const { rerender } = render(<FileUploadPrimitive disabled onChange={onChange} />);
    fireEvent.dragOver(zone());
    expect(screen.queryByText('Drop to upload')).not.toBeInTheDocument();
    drop([makeFile('a.txt')]);

    rerender(<FileUploadPrimitive readOnly onChange={onChange} />);
    fireEvent.dragOver(zone());
    expect(screen.queryByText('Drop to upload')).not.toBeInTheDocument();
    drop([makeFile('a.txt')]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('forwards the ref (callback and object) to the input and sets aria attributes', () => {
    const callbackRef = vi.fn();
    const objectRef = { current: null as HTMLInputElement | null };
    const { rerender } = render(
      <FileUploadPrimitive ref={callbackRef} id="f" name="docs" required invalid aria-describedby="hint" multiple accept=".txt" />,
    );
    expect(callbackRef).toHaveBeenCalledWith(input());
    expect(input()).toHaveAttribute('aria-required', 'true');
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveAttribute('aria-describedby', 'hint');
    expect(input()).toHaveAttribute('name', 'docs');
    expect(input()).toHaveAttribute('accept', '.txt');
    expect(input()).toHaveAttribute('multiple');
    expect(zone()).toHaveAttribute('data-testid', 'f');

    rerender(<FileUploadPrimitive ref={objectRef} id="f" data-testid="custom" />);
    expect(objectRef.current).toBe(input());
    expect(zone()).toHaveAttribute('data-testid', 'custom');
  });
});
