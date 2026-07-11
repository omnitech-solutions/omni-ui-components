import * as React from 'react';

import { cn } from 'lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
}

export const Skeleton = React.memo(
  React.forwardRef<HTMLDivElement, SkeletonProps>(({ className, active = true, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-md bg-muted', active && 'animate-pulse', className)} {...props} />
  )),
);
Skeleton.displayName = 'Skeleton';
