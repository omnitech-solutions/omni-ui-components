import * as React from 'react';

import { cn } from 'lib/utils';

export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  gutter?: number;
}

export interface ColProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: number;
}

export const Row = ({ gutter = 0, className, style, ...props }: RowProps) => <div className={cn('flex flex-wrap', className)} style={{ gap: gutter, ...style }} {...props} />;

export const Col = ({ span = 24, className, style, ...props }: ColProps) => (
  <div className={cn(className)} style={{ width: `${(span / 24) * 100}%`, ...style }} {...props} />
);
