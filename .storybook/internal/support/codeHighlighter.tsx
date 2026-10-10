/**
 * @fileoverview
 * The syntax highlighter, in its own chunk: it is loaded by `import()` the first time a code panel is opened (or a
 * signature is drawn), never by a story that shows no code. Prism's light build with TSX only, and class names
 * instead of inline styles, so `example.css` colours the tokens for the light and the dark theme.
 */
import type * as React from 'react';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import PrismLight from 'react-syntax-highlighter/dist/esm/prism-light';

PrismLight.registerLanguage('tsx', tsx);

export interface HighlightedProps {
  code: string;
  /** `span` draws the code in the run of a line (a signature); `pre` is a block. */
  as?: 'pre' | 'span';
}

export const Highlighted: React.FC<HighlightedProps> = ({ code, as = 'pre' }) => (
  <PrismLight
    language="tsx"
    useInlineStyles={false}
    PreTag={as}
    CodeTag={as === 'pre' ? 'code' : 'span'}
    className="pb-code-pre"
  >
    {code}
  </PrismLight>
);
