import * as React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

import { cn } from 'lib/utils';

export interface ResultProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  status?: 'info' | 'success' | 'warning' | 'error';
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  extra?: React.ReactNode;
}

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
} as const;

export const Result = ({ status = 'info', title, subTitle, extra, className, ...props }: ResultProps) => {
  const Icon = icons[status];
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-lg border px-6 py-10 text-center', className)} {...props}>
      <Icon className={cn('h-10 w-10', status === 'error' ? 'text-destructive' : status === 'success' ? 'text-primary' : 'text-muted-foreground')} />
      {title ? <div className="text-lg font-semibold">{title}</div> : null}
      {subTitle ? <div className="text-sm text-muted-foreground">{subTitle}</div> : null}
      {extra}
    </div>
  );
};
