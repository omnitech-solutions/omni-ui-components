import * as React from 'react';

import { cn } from 'lib/utils';

export interface WatermarkProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  content: React.ReactNode;
  children?: React.ReactNode;
}

export const Watermark = ({ content, children, className, ...props }: WatermarkProps) => (
  <div className={cn('relative overflow-hidden', className)} {...props}>
    <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-10">
      <div className="-rotate-12 text-4xl font-semibold">{content}</div>
    </div>
    <div className="relative">{children}</div>
  </div>
);
