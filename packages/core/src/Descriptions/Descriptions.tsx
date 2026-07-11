import * as React from 'react';

import { cn } from 'lib/utils';

export interface DescriptionItem {
  key?: React.Key;
  label: React.ReactNode;
  children: React.ReactNode;
}

export interface DescriptionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  items: DescriptionItem[];
  columns?: number;
}

export const Descriptions = ({ title, items, columns = 2, className, ...props }: DescriptionsProps) => (
  <div className={cn('rounded-lg border bg-background', className)} {...props}>
    {title ? <div className="border-b px-4 py-3 text-sm font-semibold">{title}</div> : null}
    <dl className="grid gap-x-6 gap-y-4 px-4 py-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {items.map((item, index) => (
        <div key={item.key ?? index} className="space-y-1">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</dt>
          <dd className="text-sm text-foreground">{item.children}</dd>
        </div>
      ))}
    </dl>
  </div>
);
