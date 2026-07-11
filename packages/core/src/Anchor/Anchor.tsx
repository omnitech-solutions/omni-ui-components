import * as React from 'react';

import { cn } from 'lib/utils';

export interface AnchorItem {
  key?: React.Key;
  href: string;
  title: React.ReactNode;
}

export interface AnchorProps extends React.HTMLAttributes<HTMLElement> {
  items: AnchorItem[];
}

export const Anchor = ({ items, className, ...props }: AnchorProps) => (
  <nav className={cn('space-y-2 text-sm', className)} {...props}>
    {items.map((item, index) => (
      <a key={item.key ?? index} href={item.href} className="block text-muted-foreground transition-colors hover:text-foreground">
        {item.title}
      </a>
    ))}
  </nav>
);
