import * as React from 'react';

export interface InlineCodeProps {
  code: string;
  className?: string;
}

export const InlineCode: React.FC<InlineCodeProps> = ({ code, className }) => (
  <code className={['font-mono', className ?? 'text-xs text-sky-200'].filter(Boolean).join(' ')}>{code}</code>
);
