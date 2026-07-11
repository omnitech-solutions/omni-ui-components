import * as React from 'react';

import { cn } from 'lib/utils';

export interface SpaceProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical';
  size?: number | string;
  wrap?: boolean;
}

export const Space = ({ direction = 'horizontal', size = 8, wrap, className, style, ...props }: SpaceProps) => (
  <div className={cn('flex', direction === 'vertical' ? 'flex-col' : 'flex-row', wrap && 'flex-wrap', className)} style={{ gap: size, ...style }} {...props} />
);
