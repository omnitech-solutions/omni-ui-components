import '@testing-library/jest-dom';
import { FileUploadPrimitive, fileMatchesAccept } from '@oc-tech/omni-ui-components/FileUpload';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const file = (name: string, type: string, size = 4) => new File(['x'.repeat(size)], name, { type });

describe('omni-ui-components/FileUpload: keyboard, accepted types, words', () => {
  it('the drop zone is a keyboard stop that opens the picker with Enter and Space', async () => {
    const user = userEvent.setup();
    render(<FileUploadPrimitive id="f" aria-label="Attachment" />);
    const zone = screen.getByRole('button', { name: 'Attachment' });
    const input = document.getElementById('f') as HTMLInputElement;
    const click = jest.spyOn(input, 'click').mockImplementation(() => undefined);
    zone.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(click).toHaveBeenCalledTimes(2);
  });

  it('read-only and disabled do not open the picker; read-only stays focusable', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<FileUploadPrimitive id="f" readOnly aria-label="Attachment" />);
    const zone = screen.getByRole('button', { name: 'Attachment' });
    const input = document.getElementById('f') as HTMLInputElement;
    const click = jest.spyOn(input, 'click').mockImplementation(() => undefined);
    expect(zone).toHaveAttribute('tabindex', '0');
    expect(zone).toHaveAttribute('data-readonly');
    zone.focus();
    await user.keyboard('{Enter}');
    rerender(<FileUploadPrimitive id="f" disabled aria-label="Attachment" />);
    expect(zone).toHaveAttribute('tabindex', '-1');
    expect(click).not.toHaveBeenCalled();
  });

  it('refuses a dropped file of the wrong type and one that is too large, in its own words', () => {
    const onChange = jest.fn();
    const onError = jest.fn();
    render(
      <FileUploadPrimitive
        id="f"
        accept=".pdf,image/*"
        maxSize={10}
        onChange={onChange}
        onError={onError}
        labels={{ wrongType: (name) => `Refusé: ${name}` }}
      />,
    );
    const zone = document.querySelector('[data-slot="file-upload"]') as HTMLElement;
    const good = file('scan.png', 'image/png');
    fireEvent.drop(zone, {
      dataTransfer: {
        files: [file('notes.txt', 'text/plain'), good, file('big.pdf', 'application/pdf', 50)],
      },
    });
    expect(onError).toHaveBeenCalledWith('Refusé: notes.txt');
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('big.pdf exceeds'));
    expect(onChange).toHaveBeenCalledWith([good]);
  });

  it('appearance="button" draws a compact button with its own words and still takes a drop', () => {
    const onChange = jest.fn();
    render(
      <FileUploadPrimitive
        id="f"
        appearance="button"
        labels={{ choose: 'Attach' }}
        onChange={onChange}
      />,
    );
    const zone = screen.getByRole('button', { name: 'Attach' });
    expect(zone).toHaveAttribute('data-appearance', 'button');
    expect(screen.queryByText('Any file type')).toBeNull();
    const dropped = file('a.txt', 'text/plain');
    fireEvent.drop(zone, { dataTransfer: { files: [dropped] } });
    expect(onChange).toHaveBeenCalledWith([dropped]);
  });

  it('matches accept rules as a file picker does', () => {
    expect(fileMatchesAccept(file('a.PDF', ''), '.pdf')).toBe(true);
    expect(fileMatchesAccept(file('a.png', 'image/png'), 'image/*')).toBe(true);
    expect(fileMatchesAccept(file('a.txt', 'text/plain'), 'text/plain')).toBe(true);
    expect(fileMatchesAccept(file('a.txt', 'text/plain'), '.pdf, image/*')).toBe(false);
    expect(fileMatchesAccept(file('a.txt', 'text/plain'), undefined)).toBe(true);
  });
});
