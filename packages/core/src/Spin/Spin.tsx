import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from 'lib/utils';

export interface SpinProps extends React.HTMLAttributes<HTMLDivElement> {
  spinning?: boolean;
  tip?: React.ReactNode;
}

export const Spin = ({ spinning = true, tip, className, children, ...props }: SpinProps) => (
  <div className={cn('relative', className)} {...props}>
    {spinning ? (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-md bg-background/70 backdrop-blur-[1px]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        {tip ? <div className="text-sm text-muted-foreground">{tip}</div> : null}
      </div>
    ) : null}
    <div aria-busy={spinning}>{children}</div>
  </div>
);
