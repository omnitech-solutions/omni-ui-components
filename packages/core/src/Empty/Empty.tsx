import * as React from 'react';
import { Inbox } from 'lucide-react';

import { cn } from 'lib/utils';

export interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: React.ReactNode;
  description?: React.ReactNode;
}

export const Empty = ({ image, description = 'No data', className, children, ...props }: EmptyProps) => (
  <div className={cn('flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center', className)} {...props}>
    <div className="text-muted-foreground">{image ?? <Inbox className="h-8 w-8" />}</div>
    <div className="text-sm text-muted-foreground">{description}</div>
    {children}
  </div>
);
