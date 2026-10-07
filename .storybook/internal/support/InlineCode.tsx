import * as React from 'react';

export interface InlineCodeProps {
  code: string;
  className?: string;
}

export const InlineCode: React.FC<InlineCodeProps> = ({ code, className }) => (
  <code className={['pb-pill-inline-code font-mono', className ?? 'text-xs text-[var(--oui-primary-text)]'].filter(Boolean).join(' ')}>{code}</code>
);
