import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { RichText } from '@oc-tech/omni-ui-components/RichText';
import { RichTextPrimitive } from '../../src/RichText/RichTextPrimitive';

const editable = () => document.querySelector('.ProseMirror') as HTMLElement;
const selectAll = async () => {
  editable().focus();
  const range = document.createRange();
  range.selectNodeContents(editable());
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  // ProseMirror reads the DOM selection on a delayed selectionchange.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
};
const stubPrompt = (answer: string | null) => {
  const prompt = vi.fn().mockReturnValue(answer);
  window.prompt = prompt;
  return prompt;
};
const press = (name: string) => fireEvent.click(screen.getByRole('button', { name }));

describe('omni-ui-components/RichText', () => {
  beforeAll(() => {
    // ProseMirror measures client rects when scrolling the selection into view.
    const empty = { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0, toJSON: () => ({}) };
    Range.prototype.getBoundingClientRect ??= () => empty as DOMRect;
    Range.prototype.getClientRects ??= () => ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] }) as unknown as DOMRectList;
    document.elementFromPoint ??= () => null;
  });

  it('renders the initial HTML value inside the editor', async () => {
    render(<RichTextPrimitive id="rt" value="<p>Hello <strong>world</strong></p>" />);
    await waitFor(() => expect(editable()).toHaveTextContent('Hello world'));
    expect(editable().querySelector('strong')).toHaveTextContent('world');
    expect(screen.getByTestId('rt')).toHaveAttribute('data-slot', 'rich-text');
  });

  it('shows the placeholder text on an empty editor', async () => {
    render(<RichTextPrimitive placeholder="Write here" />);
    await waitFor(() => expect(document.querySelector('p.is-editor-empty')).toHaveAttribute('data-placeholder', 'Write here'));
  });

  it('falls back to the default placeholder', async () => {
    render(<RichTextPrimitive />);
    await waitFor(() => expect(document.querySelector('p.is-editor-empty')).toHaveAttribute('data-placeholder', 'Start writing…'));
  });

  it('applies toolbar formatting to the selection and reports the new HTML', async () => {
    const onChange = vi.fn();
    render(<RichTextPrimitive value="<p>Hi</p>" onChange={onChange} />);
    await waitFor(() => expect(editable()).toHaveTextContent('Hi'));

    const cases: Array<[string, string]> = [
      ['Bold', 'strong'],
      ['Italic', 'em'],
      ['Underline', 'u'],
      ['Strikethrough', 's'],
      ['Highlight', 'mark'],
    ];
    for (const [label, tag] of cases) {
      await selectAll();
      press(label);
      await waitFor(() => expect(editable().querySelector(tag)).not.toBeNull());
      expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'true');
    }
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)![0]).toContain('<strong>');
  });

  it('toggles block formats: headings, lists, quote, code block', async () => {
    render(<RichTextPrimitive value="<p>Block</p>" />);
    await waitFor(() => expect(editable()).toHaveTextContent('Block'));

    const cases: Array<[string, string]> = [
      ['Heading 1', 'h1'],
      ['Heading 2', 'h2'],
      ['Heading 3', 'h3'],
      ['Bullet list', 'ul'],
      ['Ordered list', 'ol'],
      ['Blockquote', 'blockquote'],
      ['Code block', 'pre'],
    ];
    for (const [label, tag] of cases) {
      await selectAll();
      press(label);
      await waitFor(() => expect(editable().querySelector(tag)).not.toBeNull());
    }
  });

  it('aligns text and toggles bold back off', async () => {
    const onChange = vi.fn();
    render(<RichTextPrimitive value="<p>Align</p>" onChange={onChange} />);
    await waitFor(() => expect(editable()).toHaveTextContent('Align'));

    for (const [label, align] of [
      ['Align center', 'center'],
      ['Align right', 'right'],
      ['Align left', 'left'],
    ]) {
      await selectAll();
      press(label);
      await waitFor(() => expect(onChange.mock.calls.at(-1)![0]).toContain(`text-align: ${align}`));
    }

    await selectAll();
    press('Bold');
    await waitFor(() => expect(editable().querySelector('strong')).not.toBeNull());
    await selectAll();
    press('Bold');
    await waitFor(() => expect(editable().querySelector('strong')).toBeNull());
  });

  it('undo and redo are disabled until there is history, then revert and reapply a change', async () => {
    render(<RichTextPrimitive value="<p>Undo me</p>" />);
    await waitFor(() => expect(editable()).toHaveTextContent('Undo me'));
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Redo' })).toBeDisabled();

    await selectAll();
    press('Bold');
    await waitFor(() => expect(editable().querySelector('strong')).not.toBeNull());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled());

    press('Undo');
    await waitFor(() => expect(editable().querySelector('strong')).toBeNull());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Redo' })).toBeEnabled());
    press('Redo');
    await waitFor(() => expect(editable().querySelector('strong')).not.toBeNull());
  });

  describe('link button', () => {
    it('prompts for a URL and links the selection with a safe rel and target', async () => {
      const prompt = stubPrompt('https://example.com');
      const onChange = vi.fn();
      render(<RichTextPrimitive value="<p>Site</p>" onChange={onChange} />);
      await waitFor(() => expect(editable()).toHaveTextContent('Site'));

      await selectAll();
      press('Link');
      expect(prompt).toHaveBeenCalledWith('Link URL', '');
      await waitFor(() => expect(editable().querySelector('a')).toHaveAttribute('href', 'https://example.com'));
      const anchor = editable().querySelector('a')!;
      expect(anchor).toHaveAttribute('rel', 'noopener noreferrer nofollow');
      expect(anchor).toHaveAttribute('target', '_blank');
    });

    it('does nothing when the prompt is cancelled or empty', async () => {
      const prompt = stubPrompt(null);
      render(<RichTextPrimitive value="<p>Site</p>" />);
      await waitFor(() => expect(editable()).toHaveTextContent('Site'));
      await selectAll();
      press('Link');
      expect(editable().querySelector('a')).toBeNull();

      prompt.mockReturnValue('');
      await selectAll();
      press('Link');
      expect(editable().querySelector('a')).toBeNull();
    });

    it('removes an existing link without prompting', async () => {
      const prompt = stubPrompt('unused');
      render(<RichTextPrimitive value='<p><a href="https://example.com">Site</a></p>' />);
      await waitFor(() => expect(editable().querySelector('a')).not.toBeNull());
      await selectAll();
      await waitFor(() => expect(screen.getByRole('button', { name: 'Link' })).toHaveAttribute('aria-pressed', 'true'));
      press('Link');
      await waitFor(() => expect(editable().querySelector('a')).toBeNull());
      expect(prompt).not.toHaveBeenCalled();
    });
  });

  it('syncs the editor when the controlled value changes, without emitting onChange', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<RichTextPrimitive value="<p>One</p>" onChange={onChange} />);
    await waitFor(() => expect(editable()).toHaveTextContent('One'));
    onChange.mockClear();
    rerender(<RichTextPrimitive value="<p>Two</p>" onChange={onChange} />);
    await waitFor(() => expect(editable()).toHaveTextContent('Two'));
    rerender(<RichTextPrimitive value="" onChange={onChange} />);
    await waitFor(() => expect(editable()).not.toHaveTextContent('Two'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('emits HTML as the user types', async () => {
    const onChange = vi.fn();
    render(<RichTextPrimitive onChange={onChange} />);
    await waitFor(() => expect(editable()).toBeInTheDocument());
    await selectAll();
    press('Bullet list');
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(expect.stringContaining('<ul>')));
  });

  it.each([
    ['disabled', { disabled: true }],
    ['readOnly', { readOnly: true }],
  ])('locks the editor and toolbar when %s', async (_name, props) => {
    render(<RichTextPrimitive value="<p>Locked</p>" {...props} />);
    await waitFor(() => expect(editable()).toHaveAttribute('contenteditable', 'false'));
    expect(screen.getByRole('button', { name: 'Bold' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Link' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
  });

  it('re-enables editing when disabled turns off', async () => {
    const { rerender } = render(<RichTextPrimitive value="<p>x</p>" disabled />);
    await waitFor(() => expect(editable()).toHaveAttribute('contenteditable', 'false'));
    rerender(<RichTextPrimitive value="<p>x</p>" />);
    await waitFor(() => expect(editable()).toHaveAttribute('contenteditable', 'true'));
  });

  it('prevents the toolbar mousedown from stealing editor focus', () => {
    render(<RichTextPrimitive />);
    const notPrevented = fireEvent.mouseDown(screen.getByRole('button', { name: 'Bold' }));
    expect(notPrevented).toBe(false);
  });

  it('puts aria attributes on the editor content', () => {
    render(<RichTextPrimitive id="rt" invalid required aria-describedby="hint" />);
    const content = document.getElementById('rt')!;
    expect(content).toHaveAttribute('aria-invalid', 'true');
    expect(content).toHaveAttribute('aria-required', 'true');
    expect(content).toHaveAttribute('aria-describedby', 'hint');
  });

  it('prefers an explicit data-testid and forwards the ref to the root', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<RichTextPrimitive ref={ref} id="rt" data-testid="custom" className="extra" />);
    expect(ref.current).toBe(screen.getByTestId('custom'));
    expect(ref.current).toHaveClass('extra');
  });

  it('RichText adds label, description and error chrome and marks the editor invalid', () => {
    const { rerender } = render(<RichText label="Notes" description="Supports formatting" />);
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Supports formatting')).toBeInTheDocument();
    expect(document.querySelector('[aria-invalid="true"]')).toBeNull();

    rerender(<RichText label="Notes" description="Supports formatting" error="Required" required />);
    expect(screen.getByText('Required')).toBeInTheDocument();
    const content = document.querySelector('[aria-invalid="true"]') as HTMLElement;
    expect(content).toBeInTheDocument();
    expect(content.getAttribute('aria-describedby')).toBeTruthy();
    expect(content).toHaveAttribute('aria-required', 'true');
  });
});
