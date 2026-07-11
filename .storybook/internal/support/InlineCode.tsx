import * as React from 'react';

export interface InlineCodeProps {
  code: string;
  className?: string;
}

export const InlineCode: React.FC<InlineCodeProps> = ({ code, className }) => (
  <code className={['pb-pill-inline-code font-mono', className ?? 'text-xs text-[var(--color-primary)]'].filter(Boolean).join(' ')}>{code}</code>
);
