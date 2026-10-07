import { cn } from 'lib/utils';
import type * as React from 'react';

export interface SpaceProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical';
  size?: number | string;
  wrap?: boolean;
}

export const Space = ({
  direction = 'horizontal',
  size = 8,
  wrap,
  className,
  style,
  ...props
}: SpaceProps) => (
  <div
    className={cn(
      'flex',
      direction === 'vertical' ? 'flex-col' : 'flex-row',
      wrap && 'flex-wrap',
      className,
    )}
    style={{ gap: size, ...style }}
    {...props}
  />
);
