import * as React from 'react';

import { cn } from 'lib/utils';

export interface StatisticProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'prefix'> {
  title?: React.ReactNode;
  value: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Statistic = ({ title, value, prefix, suffix, className, ...props }: StatisticProps) => (
  <div className={cn('space-y-1 rounded-lg border bg-background px-4 py-3', className)} {...props}>
    {title ? <div className="text-sm text-muted-foreground">{title}</div> : null}
    <div className="text-2xl font-semibold tracking-tight">
      {prefix}
      {value}
      {suffix}
    </div>
  </div>
);
