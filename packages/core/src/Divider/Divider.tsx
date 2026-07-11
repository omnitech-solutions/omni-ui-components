import * as React from 'react';

import { Separator } from '../components/ui/separator';
import type { DividerProps } from './Divider.types';

const DividerInner = React.forwardRef<HTMLDivElement, DividerProps>(({ children, orientation = 'horizontal', ...props }, ref) => {
  if (!children) return <Separator ref={ref} orientation={orientation} {...props} />;

  return (
    <div className="flex items-center gap-3">
      <Separator ref={ref} orientation="horizontal" className="flex-1" {...props} />
      <span className="shrink-0 text-xs text-muted-foreground">{children}</span>
      <Separator orientation="horizontal" className="flex-1" decorative />
    </div>
  );
});
DividerInner.displayName = 'Divider';

export const Divider = React.memo(DividerInner) as typeof DividerInner;
