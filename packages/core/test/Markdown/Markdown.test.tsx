import '@testing-library/jest-dom';

import {
  type CitationSource,
  closeOpenMarkdown,
  Markdown,
} from '@oc-tech/omni-ui-components/Markdown';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MarkdownDemo,
  markdownPropsFactory,
  SAMPLE_REPLY,
} from 'factories/omni-ui-components/Markdown/Markdown.factories';
import { expectTypeOf } from 'vitest';

const slot = (name: string) => document.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('omni-ui-components/Markdown', () => {
  it('renders headings as styled blocks (no outline), emphasis, lists and GFM tables', () => {
    render(<Markdown {...markdownPropsFactory()} />);
    expect(slot('markdown-heading')).toHaveTextContent('Two Sum');
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('hash map').tagName).toBe('STRONG');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Space' })).toBeInTheDocument();
  });

  it('opens links in a new tab with noopener noreferrer', () => {
    render(<Markdown {...markdownPropsFactory()} />);
    const link = screen.getByRole('link', { name: 'MDN Map docs' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('draws inline code without a block and fenced code as a block with the language header', () => {
    render(<Markdown {...markdownPropsFactory()} />);
    expect(screen.getByText('target - x').tagName).toBe('CODE');
    expect(slot('markdown-code')).toHaveAttribute('data-language', 'ts');
    expect(slot('markdown-code-header')).toHaveTextContent('ts');
    expect(screen.getByLabelText('ts code')).toHaveTextContent('export function twoSum');
  });

  it('falls back to the text language name and highlights only when a highlighter is given', () => {
    const { rerender } = render(<Markdown text={'```\nplain\n```'} />);
    expect(slot('markdown-code-header')).toHaveTextContent('text');
    expect(document.querySelector('.hljs-keyword')).toBeNull();
    rerender(<Markdown {...markdownPropsFactory({ text: '```ts\nconst a = 1;\n```' })} />);
    expect(document.querySelector('.hljs-keyword')).not.toBeNull();
  });

  it('labels are configurable', () => {
    render(
      <Markdown
        {...markdownPropsFactory({
          text: '```ts\nx\n```',
          onCopy: () => undefined,
          labels: { copy: 'Kopieren' },
        })}
      />,
    );
    expect(screen.getByRole('button', { name: 'Kopieren' })).toBeInTheDocument();
  });

  describe('citations', () => {
    it('turns [n] into a pill only for numbers in citations, and never inside code', async () => {
      const onCite = vi.fn();
      render(
        <Markdown
          {...markdownPropsFactory({
            onCite,
            text: 'A [1] B [2] C [9] and `x[1]`',
          })}
        />,
      );
      const pills = screen.getAllByRole('button');
      expect(pills.map((pill) => pill.textContent)).toEqual(['1', '2']);
      expect(document.body).toHaveTextContent('C [9]');
      expect(screen.getByText('x[1]').tagName).toBe('CODE');
      await userEvent.click(screen.getByRole('button', { name: 'Open source 2' }));
      expect(onCite).toHaveBeenCalledWith({ n: 2 });
    });

    it('makes no pills without citations', () => {
      render(<Markdown text="A [1]" />);
      expect(screen.queryByRole('button')).toBeNull();
    });
  });

  describe('copy', () => {
    it('has no copy control without onCopy or an icon', () => {
      render(<Markdown text={'```ts\nx\n```'} />);
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('reports the code and language, and shows Copied for copiedCode', async () => {
      const onCopy = vi.fn();
      const { rerender } = render(
        <Markdown {...markdownPropsFactory({ text: '```ts\nlet a;\n```', onCopy })} />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Copy' }));
      expect(onCopy).toHaveBeenCalledWith('let a;', 'ts');
      rerender(
        <Markdown
          {...markdownPropsFactory({
            text: '```ts\nlet a;\n```',
            onCopy,
            copiedCode: 'let a;',
          })}
        />,
      );
      expect(screen.getByRole('button', { name: 'Copied' })).toHaveAttribute('data-copied', 'true');
    });

    it('the demo confirms a copy', async () => {
      render(<MarkdownDemo />);
      await userEvent.click(screen.getByRole('button', { name: 'Copy' }));
      expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
    });
  });

  describe('streaming', () => {
    it('closes an open fence for display, so the half code stays one block, and draws the cursor', () => {
      render(
        <Markdown
          {...markdownPropsFactory({
            streaming: true,
            text: 'Try:\n\n```ts\nconst a = 1;',
          })}
        />,
      );
      expect(screen.getByLabelText('ts code')).toHaveTextContent('const a = 1;');
      expect(slot('markdown-cursor')).not.toBeNull();
      expect(slot('markdown')).toHaveAttribute('data-streaming', 'true');
    });

    it('cursor can be a node or null, and is absent when not streaming', () => {
      const { rerender } = render(
        <Markdown text="hi" streaming cursor={<i data-testid="c">|</i>} />,
      );
      expect(screen.getByTestId('c')).toBeInTheDocument();
      rerender(<Markdown text="hi" streaming cursor={null} />);
      expect(slot('markdown-cursor')).toBeNull();
      rerender(<Markdown text="hi" />);
      expect(slot('markdown-cursor')).toBeNull();
    });

    it('closeOpenMarkdown closes fences, backticks and bold, and leaves complete text alone', () => {
      expect(closeOpenMarkdown('a\n```ts\nx')).toBe('a\n```ts\nx\n```');
      expect(closeOpenMarkdown('a\n```ts\nx\n```')).toBe('a\n```ts\nx\n```');
      expect(closeOpenMarkdown('use `map')).toBe('use `map`');
      expect(closeOpenMarkdown('this is **bold')).toBe('this is **bold**');
      expect(closeOpenMarkdown('**done** and `ok`')).toBe('**done** and `ok`');
      expect(closeOpenMarkdown('```\n** not bold\n```')).toBe('```\n** not bold\n```');
      expect(closeOpenMarkdown('~~~\ncode')).toBe('~~~\ncode\n~~~');
      expect(closeOpenMarkdown(SAMPLE_REPLY)).toBe(SAMPLE_REPLY);
    });
  });

  it('components override a built-in element', () => {
    render(
      <Markdown
        text="[x](https://a.b)"
        components={{
          a: ({ children }) => <span data-testid="own">{children}</span>,
        }}
      />,
    );
    expect(screen.getByTestId('own')).toHaveTextContent('x');
    expect(within(document.body).queryByRole('link')).toBeNull();
  });

  it('a citation stays plain text without onCite', () => {
    render(<Markdown text="A [1]" citations={[1]} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(document.body).toHaveTextContent('A [1]');
  });

  it('onLinkClick reports the href and the link still targets a new tab', async () => {
    const onLinkClick = vi.fn();
    render(<Markdown text="[docs](https://a.example/x)" onLinkClick={onLinkClick} />);
    const link = screen.getByRole('link', { name: 'docs' });
    link.addEventListener('click', (event) => event.preventDefault());
    await userEvent.click(link);
    expect(onLinkClick).toHaveBeenCalledWith('https://a.example/x');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('onCite receives the extended source item from sources by reference; its extra fields are typed', async () => {
    type Doc = CitationSource & { id: string; url: string };
    const sources: Doc[] = [
      { id: 'd1', n: 1, url: 'https://a.example' },
      { id: 'd2', n: 2, url: 'https://b.example' },
    ];
    const onCite = vi.fn((source: Doc) => {
      expectTypeOf(source.url).toEqualTypeOf<string>();
    });
    render(<Markdown<Doc> text="A [2] B [3]" sources={sources} onCite={onCite} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'Open source 2' }));
    expect(onCite.mock.calls[0]![0]).toBe(sources[1]);
  });
});
