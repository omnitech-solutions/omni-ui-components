import * as React from 'react';

import { cn } from 'lib/utils';

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  vertical?: boolean;
  gap?: number | string;
  align?: React.CSSProperties['alignItems'];
  justify?: React.CSSProperties['justifyContent'];
  wrap?: React.CSSProperties['flexWrap'];
}

export const Flex = ({ vertical, gap, align, justify, wrap, className, style, ...props }: FlexProps) => (
  <div
    className={cn('flex', vertical && 'flex-col', className)}
    style={{ gap, alignItems: align, justifyContent: justify, flexWrap: wrap, ...style }}
    {...props}
  />
);
