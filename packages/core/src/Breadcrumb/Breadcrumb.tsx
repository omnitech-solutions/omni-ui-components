import * as React from 'react';
import { ChevronRight } from 'lucide-react';

import { cn } from 'lib/utils';

export interface BreadcrumbItem {
  key?: React.Key;
  title: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
}

export const Breadcrumb = ({ items = [], separator = <ChevronRight className="h-3.5 w-3.5" />, className, children, ...props }: BreadcrumbProps) => (
  <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm text-muted-foreground', className)} {...props}>
    {children ?? (
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const content = item.href ? (
            <a href={item.href} onClick={item.onClick} className={cn('transition-colors hover:text-foreground', isLast && 'pointer-events-none text-foreground')}>
              {item.title}
            </a>
          ) : item.onClick ? (
            <button type="button" onClick={item.onClick} className={cn('transition-colors hover:text-foreground', isLast && 'pointer-events-none text-foreground')}>
              {item.title}
            </button>
          ) : (
            <span className={cn(isLast && 'text-foreground')}>{item.title}</span>
          );
          return (
            <li key={item.key ?? index} className="flex items-center gap-2">
              {content}
              {!isLast ? <span aria-hidden="true">{separator}</span> : null}
            </li>
          );
        })}
      </ol>
    )}
  </nav>
);
