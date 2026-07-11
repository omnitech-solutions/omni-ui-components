import * as React from 'react';

import { cn } from 'lib/utils';

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {}
export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {}

export const List = React.memo(
  React.forwardRef<HTMLUListElement, ListProps>(({ className, ...props }, ref) => <ul ref={ref} className={cn('divide-y rounded-lg border bg-background', className)} {...props} />),
);
List.displayName = 'List';

export const ListItem = React.memo(
  React.forwardRef<HTMLLIElement, ListItemProps>(({ className, ...props }, ref) => <li ref={ref} className={cn('px-4 py-3 text-sm', className)} {...props} />),
);
ListItem.displayName = 'ListItem';
