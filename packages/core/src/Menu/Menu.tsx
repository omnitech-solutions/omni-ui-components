import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { cn } from 'lib/utils';

export interface MenuItem {
  key: React.Key;
  label: React.ReactNode;
  icon?: React.ReactNode;
  children?: MenuItem[];
  onClick?: () => void;
}

export interface MenuProps extends React.HTMLAttributes<HTMLUListElement> {
  items: MenuItem[];
  selectedKeys?: React.Key[];
}

function MenuBranch({ item, selectedKeys, depth = 0 }: { item: MenuItem; selectedKeys: React.Key[]; depth?: number }) {
  const hasChildren = Boolean(item.children?.length);
  const isSelected = selectedKeys.includes(item.key);
  const hasSelectedDescendant = Boolean(item.children?.some((child) => selectedKeys.includes(child.key)));
  const [open, setOpen] = React.useState(hasSelectedDescendant || isSelected);

  React.useEffect(() => {
    if (hasSelectedDescendant || isSelected) setOpen(true);
  }, [hasSelectedDescendant, isSelected]);

  return (
    <li>
      <button
        type="button"
        onClick={() => {
          if (hasChildren) setOpen((value) => !value);
          item.onClick?.();
        }}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors',
          'font-[family-name:var(--oui-font-sans)] text-sm text-[var(--oui-foreground)]',
          'hover:bg-muted/40',
          isSelected && 'bg-muted/60 font-semibold text-[var(--oui-foreground)]',
        )}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
        aria-expanded={hasChildren ? open : undefined}
      >
        {item.icon ? <span className="shrink-0 text-[var(--oui-foreground-muted)]">{item.icon}</span> : null}
        {!item.icon && hasChildren ? (
          open ? <ChevronDown className="h-4 w-4 shrink-0 text-[var(--oui-foreground-muted)]" aria-hidden="true" /> : <ChevronRight className="h-4 w-4 shrink-0 text-[var(--oui-foreground-muted)]" aria-hidden="true" />
        ) : null}
        {!item.icon && !hasChildren ? <span className="w-4 shrink-0" aria-hidden="true" /> : null}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      </button>
      {hasChildren && open ? (
        <ul className={cn('mt-1 space-y-1 rounded-xl border border-[var(--oui-border-field)] bg-background/60 p-2', depth > 0 && 'ml-4')}>
          {item.children!.map((child) => (
            <MenuBranch key={child.key} item={child} selectedKeys={selectedKeys} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export const Menu = ({ items, selectedKeys, className, ...props }: MenuProps) => (
  <ul
    className={cn(
      'space-y-1 rounded-xl border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-2 shadow-xs',
      className,
    )}
    {...props}
  >
    {items.map((item) => (
      <MenuBranch key={item.key} item={item} selectedKeys={selectedKeys ?? []} />
    ))}
  </ul>
);
