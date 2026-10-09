import { cn } from 'lib/utils';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';

export interface CollapseItem {
  key: React.Key;
  label: React.ReactNode;
  /** A quiet second line under the label, shown open or closed: a role, a date, a path. */
  description?: React.ReactNode;
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
  /** `small` tightens the header and the body for a narrow column. Default `default`. */
  size?: 'default' | 'small';
  /** `accent` marks the whole group as the chosen one: an accent border and tint. Default `default`. */
  tone?: 'default' | 'accent';
}

/**
 * Omni Collapse: a group of headers that each open a body. A header is one button (`aria-expanded`) with its
 * `label`, an optional quiet `description` under it and an optional `extra` node at the end (a `Tag`, a count).
 *
 * Slots: `data-slot="collapse" | "collapse-item" | "collapse-header" | "collapse-label" |
 * "collapse-description" | "collapse-extra" | "collapse-content"`. The root carries `data-size` and `data-tone`.
 *
 * @example
 * <Collapse size="small" items={[{ key: 'api', label: 'API', description: 'v2 · stable', children: <Descriptions items={facts} /> }]} />
 */

export function Collapse({
  items,
  defaultActiveKey,
  activeKey,
  accordion,
  onChange,
  size = 'default',
  tone = 'default',
  className,
  ...props
}: CollapseProps) {
  const small = size === 'small';
  const controlled = activeKey !== undefined;
  const [internal, setInternal] = React.useState<React.Key[]>(() => {
    if (defaultActiveKey === undefined) return [];
    return Array.isArray(defaultActiveKey) ? defaultActiveKey : [defaultActiveKey];
  });
  const current = controlled ? (Array.isArray(activeKey) ? activeKey : [activeKey]) : internal;

  const toggle = (key: React.Key) => {
    const next = current.includes(key)
      ? current.filter((value) => value !== key)
      : accordion
        ? [key]
        : [...current, key];
    if (!controlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div
      data-slot="collapse"
      data-size={size}
      data-tone={tone}
      className={cn(
        'overflow-hidden rounded-xl border shadow-xs',
        tone === 'accent'
          ? 'border-[color:var(--oui-tone-accent-fg)] bg-[color:var(--oui-tone-accent-bg)]'
          : 'border-[var(--oui-border-field)] bg-[var(--oui-surface-field)]',
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
            data-slot="collapse-item"
            data-state={open ? 'open' : 'closed'}
          >
            <button
              type="button"
              disabled={item.disabled}
              onClick={() => toggle(item.key)}
              data-slot="collapse-header"
              className={cn(
                'flex w-full cursor-pointer items-start justify-between text-left',
                small ? 'gap-2.5 px-3 py-2' : 'gap-4 px-4 py-3.5',
                'transition-colors duration-[var(--oui-transition-duration)] ease-[var(--oui-transition-easing)]',
                'hover:bg-muted/30',
                open && 'bg-muted/20',
                'disabled:cursor-not-allowed disabled:hover:bg-transparent',
              )}
              aria-expanded={open}
            >
              <span className="min-w-0 flex-1">
                <span
                  data-slot="collapse-label"
                  className={cn(
                    'block font-[family-name:var(--oui-font-sans)] font-semibold leading-5 break-words text-[var(--oui-foreground)]',
                    small ? 'text-[13px]' : 'text-sm',
                  )}
                >
                  {item.label}
                </span>
                {item.description ? (
                  <span
                    data-slot="collapse-description"
                    className={cn(
                      'block font-[family-name:var(--oui-font-sans)] font-normal break-words text-[var(--oui-foreground-muted)]',
                      small ? 'text-xs leading-4' : 'mt-0.5 text-[13px] leading-5',
                    )}
                  >
                    {item.description}
                  </span>
                ) : null}
              </span>
              <span
                data-slot="collapse-extra"
                className="ml-auto flex shrink-0 items-center gap-2 pt-0.5"
              >
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
              <div
                data-slot="collapse-content"
                className={cn(
                  'border-t border-[var(--oui-border-field)] bg-background/60',
                  small ? 'px-3 py-2.5' : 'px-4 py-3.5',
                )}
              >
                <div className="font-[family-name:var(--oui-font-sans)] text-sm leading-6 text-[var(--oui-foreground-muted)]">
                  {item.children}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
