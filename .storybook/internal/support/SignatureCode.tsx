import * as React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface SignatureCodeProps {
  code: string;
}

export const SignatureCode: React.FC<SignatureCodeProps> = ({ code }) => (
  <SyntaxHighlighter
    language="tsx"
    PreTag="span"
    CodeTag="span"
    customStyle={{
      margin: 0,
      padding: 0,
      background: 'transparent',
      display: 'inline',
      fontSize: '0.66rem',
      lineHeight: 1,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace',
    }}
    codeTagProps={{ style: { background: 'transparent', padding: 0, whiteSpace: 'pre' } }}
    style={{
      ...oneDark,
      tag: { color: 'var(--color-muted-foreground)' },
      punctuation: { color: 'var(--color-muted-foreground)' },
      attrName: { color: 'var(--color-primary)' },
      selectorTag: { color: 'var(--color-primary)' },
      title: { color: 'var(--color-primary)' },
      className: { color: 'var(--color-primary)' },
    }}
  >
    {code}
  </SyntaxHighlighter>
);
