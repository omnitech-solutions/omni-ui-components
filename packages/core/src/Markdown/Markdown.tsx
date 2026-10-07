import { cn } from 'lib/utils';
import * as React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../Button';
import type { HighlightFn } from '../Highlight';
import { TokenLines } from '../Highlight/TokenLines';
import { CITE_ELEMENT, remarkCitations } from './Markdown.citations';
import { closeOpenMarkdown } from './Markdown.streaming';
import type { CitationSource, MarkdownLabels, MarkdownProps } from './Markdown.types';
import {
  markdownBlockquoteClasses,
  markdownCellClasses,
  markdownCiteClasses,
  markdownCodeBlockClasses,
  markdownCodeHeaderClasses,
  markdownCodeTextClasses,
  markdownCopyClasses,
  markdownCursorClasses,
  markdownHeadCellClasses,
  markdownHeadingClasses,
  markdownInlineCodeClasses,
  markdownLinkClasses,
  markdownListClasses,
  markdownParagraphClasses,
  markdownRootClasses,
  markdownRuleClasses,
  markdownTableClasses,
  markdownTableWrapClasses,
} from './Markdown.variants';

/** English strings of {@link Markdown}; pass `labels` to replace any of them. */
export const DEFAULT_MARKDOWN_LABELS: MarkdownLabels = {
  codeFallbackLanguage: 'text',
  copy: 'Copy',
  copied: 'Copied',
  cite: 'Open source {n}',
};

interface CodeBlockProps {
  code: string;
  language?: string;
  highlight?: HighlightFn;
  lineNumbers: boolean;
  wrap: boolean;
  labels: MarkdownLabels;
  copyIcon?: React.ReactNode;
  copiedIcon?: React.ReactNode;
  copied: boolean;
  onCopy?: () => void;
}

/** A fenced block: header with the language and the copy control, then monospace (optionally highlighted) code. */
const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  highlight,
  lineNumbers,
  wrap,
  labels,
  copyIcon,
  copiedIcon,
  copied,
  onCopy,
}) => {
  const lines = React.useMemo(
    () => (highlight ? highlight(code, language) : null),
    [highlight, code, language],
  );
  const copyable = Boolean(onCopy) && copyIcon !== undefined && copyIcon !== null;
  const name = language || labels.codeFallbackLanguage;
  return (
    <div data-slot="markdown-code" data-language={language} className={markdownCodeBlockClasses}>
      <div data-slot="markdown-code-header" className={markdownCodeHeaderClasses}>
        <span className="min-w-0 truncate">{name}</span>
        {copyable ? (
          <Button
            variant="ghost"
            buttonSize="sm"
            data-slot="markdown-code-copy"
            data-copied={copied ? 'true' : undefined}
            icon={copied && copiedIcon ? copiedIcon : copyIcon}
            className={markdownCopyClasses}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onCopy}
          >
            {copied ? labels.copied : labels.copy}
          </Button>
        ) : null}
      </div>
      <pre
        tabIndex={0}
        aria-label={`${name} code`}
        className={cn(
          markdownCodeTextClasses,
          wrap ? 'whitespace-pre-wrap break-words' : 'overflow-x-auto whitespace-pre',
        )}
      >
        <code>{lines ? <TokenLines lines={lines} lineNumbers={lineNumbers} /> : code}</code>
      </pre>
    </div>
  );
};

type CiteProps = { n: number | string; children?: React.ReactNode };

/**
 * Omni Markdown: renders a reply's markdown (react-markdown + GFM) with the library's look. Headings are styled
 * blocks (no document outline), links open in a new tab with `noopener noreferrer`, fenced code becomes a block
 * with a language header, a copy control and optional highlighting (the library's `highlightLines`, as in the
 * Transcript), and `[n]` becomes a citation pill only when `n` is in `citations`.
 *
 * With `streaming` the open fence, backtick or `**` at the end of the text is closed for display and a cursor
 * follows the last line. Copy is a callback plus controlled state (`onCopy`, `copiedCode`), as in the Transcript.
 * Every string is in `labels`; icons are nodes; any element can be replaced through `components`.
 *
 * Slots: `data-slot="markdown" | "markdown-heading" | "markdown-code" | "markdown-code-header" | "markdown-code-copy" | "markdown-cite" | "markdown-cursor"`.
 *
 * @example
 * <Markdown text={reply} highlight={highlightLines} citations={[1, 2]} onCite={openSource}
 *   copyIcon={<Copy />} copiedIcon={<Check />} onCopy={({ code }) => copy(code)} copiedCode={copied} />
 */
const MarkdownImpl = React.memo(
  React.forwardRef<HTMLDivElement, MarkdownProps>(
    (
      {
        text,
        highlight,
        codeLineNumbers = false,
        citations: citationNumbers,
        sources,
        onCite,
        copyIcon,
        copiedIcon,
        onCopy,
        onLinkClick,
        copiedCode,
        streaming = false,
        cursor,
        wrapCode = false,
        components: overrides,
        labels: labelOverrides,
        className,
        ...rest
      },
      ref,
    ) => {
      const labels = React.useMemo<MarkdownLabels>(
        () => ({ ...DEFAULT_MARKDOWN_LABELS, ...labelOverrides }),
        [labelOverrides],
      );
      const components = React.useMemo<Components>(() => {
        const heading = ({ children }: { children?: React.ReactNode }) => (
          <div data-slot="markdown-heading" className={markdownHeadingClasses}>
            {children}
          </div>
        );
        const built = {
          h1: heading,
          h2: heading,
          h3: heading,
          h4: heading,
          h5: heading,
          h6: heading,
          p: ({ children }) => <p className={markdownParagraphClasses}>{children}</p>,
          ul: ({ children, className: own }) => (
            <ul
              className={cn(
                markdownListClasses,
                'list-disc',
                own?.includes('contains-task-list') && 'list-none ps-1',
              )}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={cn(markdownListClasses, 'list-decimal')}>{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className={markdownBlockquoteClasses}>{children}</blockquote>
          ),
          hr: () => <hr className={markdownRuleClasses} />,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={markdownLinkClasses}
              onClick={() => href && onLinkClick?.(href)}
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className={markdownTableWrapClasses}>
              <table className={markdownTableClasses}>{children}</table>
            </div>
          ),
          th: ({ children }) => <th className={markdownHeadCellClasses}>{children}</th>,
          td: ({ children }) => <td className={markdownCellClasses}>{children}</td>,
          pre: ({ children }) => {
            const code = (children as { props?: React.ComponentProps<'code'> } | undefined)?.props;
            const language = /language-([\w+-]+)/.exec(String(code?.className ?? ''))?.[1];
            const source = String(code?.children ?? '').replace(/\n$/, '');
            return (
              <CodeBlock
                code={source}
                language={language}
                highlight={highlight}
                lineNumbers={codeLineNumbers}
                wrap={wrapCode}
                labels={labels}
                copyIcon={copyIcon}
                copiedIcon={copiedIcon}
                copied={copiedCode === source}
                onCopy={onCopy ? () => onCopy(source, language) : undefined}
              />
            );
          },
          code: ({ children, className: own }) => (
            <code className={own ? own : markdownInlineCodeClasses}>{children}</code>
          ),
          [CITE_ELEMENT]: ({ n }: CiteProps) => {
            if (!onCite) return <span>[{n}]</span>;
            const name = labels.cite.replace('{n}', String(n));
            return (
              <button
                type="button"
                data-slot="markdown-cite"
                aria-label={name}
                title={name}
                className={markdownCiteClasses}
                onClick={() =>
                  onCite(sources?.find((source) => source.n === Number(n)) ?? { n: Number(n) })
                }
              >
                {n}
              </button>
            );
          },
        } as Components;
        return { ...built, ...overrides };
      }, [
        highlight,
        codeLineNumbers,
        wrapCode,
        labels,
        copyIcon,
        copiedIcon,
        copiedCode,
        onCopy,
        onCite,
        sources,
        onLinkClick,
        overrides,
      ]);

      const citations = sources ? sources.map((source) => source.n) : (citationNumbers ?? []);
      const citeKey = citations.join(',');
      // The numbers, not the array identity, decide when the plugin list changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const plugins = React.useMemo(
        () => [remarkGfm, remarkCitations(new Set(citations))],
        [citeKey],
      );
      const source = streaming ? closeOpenMarkdown(text) : text;

      return (
        <div
          ref={ref}
          data-slot="markdown"
          data-streaming={streaming ? 'true' : undefined}
          className={cn(markdownRootClasses, className)}
          {...rest}
        >
          <ReactMarkdown remarkPlugins={plugins} components={components}>
            {source}
          </ReactMarkdown>
          {streaming && cursor !== null ? (
            <div>
              {cursor ?? (
                <span
                  data-slot="markdown-cursor"
                  aria-hidden="true"
                  className={markdownCursorClasses}
                />
              )}
            </div>
          ) : null}
        </div>
      );
    },
  ),
);
MarkdownImpl.displayName = 'Markdown';

/** Generic over the source item type: an extended source reaches `onCite` by reference. */
export const Markdown = MarkdownImpl as unknown as <T extends CitationSource = CitationSource>(
  props: MarkdownProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
