import * as React from 'react';

import { cn } from 'lib/utils';

export interface SplitterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface SplitterPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSize?: string | number;
}

export const Splitter = ({ className, children, ...props }: SplitterProps) => (
  <div className={cn('flex min-h-0 w-full divide-x overflow-hidden rounded-lg border', className)} {...props}>
    {children}
  </div>
);

export const SplitterPanel = ({ defaultSize, style, ...props }: SplitterPanelProps) => <div style={{ flexBasis: defaultSize, flexGrow: 1, ...style }} {...props} />;
