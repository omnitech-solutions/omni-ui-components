import type * as React from 'react';
import './example.css';

export interface InlineCodeProps {
  code: string;
  className?: string;
}

export const InlineCode: React.FC<InlineCodeProps> = ({ code, className }) => (
  <code
    className={['pb-pill-inline-code font-mono', className ?? 'text-xs pb-accent']
      .filter(Boolean)
      .join(' ')}
  >
    {code}
  </code>
);
