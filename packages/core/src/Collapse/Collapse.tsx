import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from 'lib/utils';

export interface CollapseItem {
  key: React.Key;
  label: React.ReactNode;
  children: React.ReactNode;
  extra?: React.ReactNode;
  disabled?: boolean;
}

export interface CollapseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: CollapseItem[];
  defaultActiveKey?: React.Key | React.Key[];
  activeKey?: React.Key | React.Key[];
  accordion?: boolean;
  onChange?: (activeKeys: React.Key[]) => void;
}

export function Collapse({ items, defaultActiveKey, activeKey, accordion, onChange, className, ...props }: CollapseProps) {
  const controlled = activeKey !== undefined;
  const [internal, setInternal] = React.useState<React.Key[]>(() => {
    if (defaultActiveKey === undefined) return [];
    return Array.isArray(defaultActiveKey) ? defaultActiveKey : [defaultActiveKey];
  });
  const current = controlled ? (Array.isArray(activeKey) ? activeKey : [activeKey]) : internal;

  const toggle = (key: React.Key) => {
    const next = current.includes(key) ? current.filter((value) => value !== key) : accordion ? [key] : [...current, key];
    if (!controlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] shadow-xs',
        className,
      )}
      {...props}
    >
      {items.map((item) => {
        const open = current.includes(item.key);
        return (
          <div
            key={item.key}
            className={cn(
              'overflow-hidden',
              'border-b border-[var(--oui-border-field)] last:border-b-0',
              item.disabled && 'opacity-60',
            )}
            data-state={open ? 'open' : 'closed'}
          >
            <button
              type="button"
              disabled={item.disabled}
              onClick={() => toggle(item.key)}
              className={cn(
                'flex w-full items-start justify-between gap-4 px-4 py-3.5 text-left',
                'transition-colors duration-[var(--oui-transition-duration)] ease-[var(--oui-transition-easing)]',
                'hover:bg-muted/30',
                open && 'bg-muted/20',
                'disabled:cursor-not-allowed disabled:hover:bg-transparent',
              )}
              aria-expanded={open}
            >
              <span className="min-w-0 flex-1">
                <span className="block font-[family-name:var(--oui-font-sans)] text-sm font-semibold leading-5 text-[var(--oui-foreground)]">
                  {item.label}
                </span>
              </span>
              <span className="ml-auto flex shrink-0 items-center gap-2 pt-0.5">
                {item.extra}
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-[var(--oui-foreground-muted)] transition-transform duration-[var(--oui-transition-duration)] ease-[var(--oui-transition-easing)]',
                    open && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </span>
            </button>
            {open ? (
              <div className="border-t border-[var(--oui-border-field)] bg-background/60 px-4 py-3.5">
                <div className="font-[family-name:var(--oui-font-sans)] text-sm leading-6 text-[var(--oui-foreground-muted)]">{item.children}</div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
