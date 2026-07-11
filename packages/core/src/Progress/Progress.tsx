import * as React from 'react';

import { cn } from 'lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  percent?: number;
  showInfo?: boolean;
  status?: 'normal' | 'success' | 'exception' | 'active';
}

export const Progress = ({ percent = 0, showInfo = true, status = 'normal', className, ...props }: ProgressProps) => {
  const clamped = Math.max(0, Math.min(100, percent));
  const barClassName = status === 'exception' ? 'bg-destructive' : status === 'success' ? 'bg-primary' : 'bg-primary';

  return (
    <div className={cn('space-y-2', className)} {...props}>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full transition-[width]', barClassName, status === 'active' && 'animate-pulse')} style={{ width: `${clamped}%` }} />
      </div>
      {showInfo ? <div className="text-sm text-muted-foreground">{`${Math.round(clamped)}%`}</div> : null}
    </div>
  );
};
