import { cn } from 'lib/utils';
import * as React from 'react';
import type { CodeToken } from './Highlight.types';

export interface TokenLinesProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** One token list per line, from a {@link HighlightFn}. */
  lines: CodeToken[][];
  /** Number each line in a quiet, non-selectable gutter. Default false. */
  lineNumbers?: boolean;
  /** 1-based line numbers to mark (`data-marked`, a tinted row). */
  markedLines?: number[];
}

/**
 * Draws highlighted lines. It only renders: pass the lines from `highlightLines` (or any highlighter), so this file
 * never pulls in the grammars. Meant to sit inside a `<pre><code>`; lines are block spans so selection and copy
 * keep real newlines.
 */
export const TokenLines: React.FC<TokenLinesProps> = ({
  lines,
  lineNumbers = false,
  markedLines,
  className,
  ...rest
}) => (
  <span data-slot="code-lines" className={cn('block', className)} {...rest}>
    {lines.map((line, index) => (
      <span
        key={index}
        data-slot="code-line"
        data-marked={markedLines?.includes(index + 1) ? 'true' : undefined}
        className="block min-h-[1.5em] data-[marked=true]:bg-[color:var(--oui-code-mark-bg)]"
      >
        {lineNumbers ? (
          <span
            aria-hidden="true"
            data-slot="code-line-number"
            className="mr-3 inline-block min-w-[2ch] text-right text-[color:var(--oui-code-gutter)] select-none"
          >
            {index + 1}
          </span>
        ) : null}
        {line.map((token, at) =>
          token.className ? (
            <span key={at} className={token.className}>
              {token.text}
            </span>
          ) : (
            <React.Fragment key={at}>{token.text}</React.Fragment>
          ),
        )}
      </span>
    ))}
  </span>
);
TokenLines.displayName = 'TokenLines';
