import * as React from 'react';

import { cn } from 'lib/utils';

export interface TimelineItem {
  key?: React.Key;
  color?: string;
  children: React.ReactNode;
}

export interface TimelineProps extends React.HTMLAttributes<HTMLUListElement> {
  items: TimelineItem[];
}

export const Timeline = ({ items, className, ...props }: TimelineProps) => (
  <ul className={cn('space-y-4', className)} {...props}>
    {items.map((item, index) => (
      <li key={item.key ?? index} className="relative pl-6">
        <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-primary" style={item.color ? { backgroundColor: item.color } : undefined} />
        <span className="absolute left-[4px] top-4 h-full w-px bg-border last:hidden" />
        <div className="text-sm">{item.children}</div>
      </li>
    ))}
  </ul>
);
