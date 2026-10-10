import { cn } from 'lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';
import type { MenuIndicatorTone, MenuItem, MenuProps } from './Menu.types';

interface MenuSettings {
  selectedKeys: React.Key[];
  collapsed: boolean;
  plain: boolean;
  compact: boolean;
  onSelect?: (item: MenuItem) => void | false;
}

const indicatorTone: Record<MenuIndicatorTone, string> = {
  accent: 'bg-[color:var(--oui-tone-accent-fg)]',
  success: 'bg-[color:var(--oui-tone-success-fg)]',
  warning: 'bg-[color:var(--oui-tone-warning-fg)]',
  danger: 'bg-[color:var(--oui-tone-danger-fg)]',
};

const holdsKey = (item: MenuItem, keys: React.Key[]): boolean =>
  Boolean(item.children?.some((child) => keys.includes(child.key) || holdsKey(child, keys)));

/** In a collapsed menu an item without an icon shows the first letter of a text label. */
const initial = (label: React.ReactNode) =>
  typeof label === 'string' && label.length > 0 ? label.slice(0, 1).toUpperCase() : null;

function MenuList({
  items,
  settings,
  depth,
}: {
  items: MenuItem[];
  settings: MenuSettings;
  depth: number;
}) {
  return (
    <>
      {items.map((item) =>
        item.type === 'divider' ? (
          <li
            key={item.key}
            aria-hidden="true"
            data-slot="menu-divider"
            className="my-1 border-t border-[var(--oui-border-field)]"
          />
        ) : item.type === 'group' ? (
          <MenuGroup key={item.key} item={item} settings={settings} depth={depth} />
        ) : (
          <MenuBranch key={item.key} item={item} settings={settings} depth={depth} />
        ),
      )}
    </>
  );
}

function MenuGroup({
  item,
  settings,
  depth,
}: {
  item: MenuItem;
  settings: MenuSettings;
  depth: number;
}) {
  const labelId = React.useId();
  return (
    <li data-slot="menu-group">
      <div
        id={labelId}
        data-slot="menu-group-label"
        className={cn(
          'px-3 pt-3 pb-1 font-[family-name:var(--oui-font-sans)] text-xs font-medium text-[var(--oui-foreground-muted)]',
          settings.collapsed && 'sr-only',
        )}
      >
        {item.label}
      </div>
      {settings.collapsed ? (
        <div aria-hidden="true" className="my-1 border-t border-[var(--oui-border-field)]" />
      ) : null}
      <ul aria-labelledby={labelId} className="m-0 list-none space-y-1 p-0">
        <MenuList items={item.children ?? []} settings={settings} depth={depth} />
      </ul>
    </li>
  );
}

function MenuBranch({
  item,
  settings,
  depth,
}: {
  item: MenuItem;
  settings: MenuSettings;
  depth: number;
}) {
  const { selectedKeys, collapsed, plain, compact, onSelect } = settings;
  const hasChildren = Boolean(item.children?.length);
  const isSelected = selectedKeys.includes(item.key);
  const hasSelectedDescendant = holdsKey(item, selectedKeys);
  const [open, setOpen] = React.useState(hasSelectedDescendant || isSelected);
  const reasonId = React.useId();
  const disabled = Boolean(item.disabled || item.disabledReason);

  React.useEffect(() => {
    if (hasSelectedDescendant || isSelected) setOpen(true);
  }, [hasSelectedDescendant, isSelected]);

  const choose = (event: React.MouseEvent) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    if (hasChildren) setOpen((value) => !value);
    item.onClick?.();
    if (onSelect?.(item) === false) event.preventDefault();
  };

  const className = cn(
    'flex w-full appearance-none items-center gap-2 rounded-lg border-0 bg-transparent px-3 py-2.5 text-left transition-colors',
    'font-[family-name:var(--oui-font-sans)] text-sm text-[var(--oui-foreground)]',
    'hover:bg-muted/40',
    isSelected && 'bg-primary/10 font-semibold text-[var(--oui-foreground)]',
    item.href !== undefined &&
      'no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
    compact && 'py-1.5 text-[13px]',
    collapsed && 'justify-center px-0',
    disabled && 'cursor-not-allowed opacity-60 hover:bg-transparent',
  );
  const style = collapsed ? undefined : { paddingLeft: `${12 + depth * 14}px` };
  const letter = collapsed && !item.icon ? initial(item.label) : null;

  const body = (
    <>
      {item.icon ? (
        <span className="shrink-0 text-[var(--oui-foreground-muted)]">{item.icon}</span>
      ) : null}
      {letter ? (
        <span aria-hidden="true" className="shrink-0 text-xs font-semibold">
          {letter}
        </span>
      ) : null}
      {!collapsed && !item.icon && hasChildren ? (
        open ? (
          <ChevronDown
            className="h-4 w-4 shrink-0 text-[var(--oui-foreground-muted)]"
            aria-hidden="true"
          />
        ) : (
          <ChevronRight
            className="h-4 w-4 shrink-0 text-[var(--oui-foreground-muted)]"
            aria-hidden="true"
          />
        )
      ) : null}
      {!collapsed && !item.icon && !hasChildren ? (
        <span className="w-4 shrink-0" aria-hidden="true" />
      ) : null}
      <span className={collapsed ? 'sr-only' : 'min-w-0 flex-1 truncate'}>{item.label}</span>
      {item.indicator ? (
        <span
          role="img"
          aria-label={item.indicator.label}
          data-slot="menu-indicator"
          data-tone={item.indicator.tone ?? 'accent'}
          className={cn(
            'size-2 shrink-0 rounded-full',
            indicatorTone[item.indicator.tone ?? 'accent'],
            collapsed && 'absolute top-1.5 right-1.5',
          )}
        />
      ) : null}
      {item.shortcut?.length && !collapsed ? (
        <span data-slot="menu-shortcut" className="flex shrink-0 items-center gap-1">
          {item.shortcut.map((key) => (
            <kbd
              key={key}
              className="rounded border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] px-1 font-[family-name:var(--oui-font-sans)] text-[11px] font-medium leading-4 text-[var(--oui-foreground-muted)]"
            >
              {key}
            </kbd>
          ))}
        </span>
      ) : null}
      {item.disabledReason ? (
        <span id={reasonId} className="sr-only">
          {item.disabledReason}
        </span>
      ) : null}
    </>
  );

  const shared = {
    className: cn(className, collapsed && item.indicator && 'relative'),
    style,
    'aria-current': isSelected ? ('page' as const) : undefined,
    'aria-disabled': disabled ? (true as const) : undefined,
    'aria-describedby': item.disabledReason ? reasonId : undefined,
    'data-slot': 'menu-item',
    onClick: choose,
  };
  const control =
    item.href !== undefined ? (
      <a
        {...shared}
        href={disabled ? undefined : item.href}
        target={item.target}
        rel={item.target === '_blank' ? 'noreferrer' : undefined}
        // A disabled link has no `href`, so it is named a link and kept in the tab order by hand.
        role={disabled ? 'link' : undefined}
        tabIndex={disabled ? 0 : undefined}
      >
        {body}
      </a>
    ) : (
      <button {...shared} type="button" aria-expanded={hasChildren ? open : undefined}>
        {body}
      </button>
    );
  const tip = item.disabledReason ?? (collapsed ? item.label : null);

  return (
    <li>
      {tip ? (
        <Tooltip>
          <TooltipTrigger asChild>{control}</TooltipTrigger>
          <TooltipContent side="right">{tip}</TooltipContent>
        </Tooltip>
      ) : (
        control
      )}
      {hasChildren && open ? (
        <ul
          className={cn(
            'mt-1 list-none space-y-1 rounded-xl border border-[var(--oui-border-field)] bg-background/60 p-2',
            depth > 0 && 'ml-4',
            plain && 'rounded-none border-0 bg-transparent p-0',
            plain && depth > 0 && 'ml-0',
          )}
        >
          <MenuList items={item.children ?? []} settings={settings} depth={depth + 1} />
        </ul>
      ) : null}
    </li>
  );
}

/**
 * Omni Menu: a list of items for side navigation. Items are typed data: an item with `href` is an anchor (the menu
 * never navigates; return `false` from `onSelect` to keep the click), the current item carries
 * `aria-current="page"`, `indicator` is a named dot, `shortcut` draws keys, a `group` draws its label over its
 * children and a `divider` a rule. `collapsed` shows icons only with the label as a tooltip; `appearance="plain"`
 * drops the card for use in a `Sider`.
 *
 * @example
 * <Menu<Route> label="Main" appearance="plain" items={routes} selectedKeys={[current]}
 *   onSelect={(route) => { go(route.path); return false; }} />
 */
export const Menu = <T extends MenuItem = MenuItem>({
  items,
  selectedKeys,
  onSelect,
  collapsed = false,
  appearance = 'card',
  size = 'default',
  label,
  className,
  ...props
}: MenuProps<T>) => {
  const plain = appearance === 'plain';
  const settings: MenuSettings = {
    selectedKeys: selectedKeys ?? [],
    collapsed,
    plain,
    compact: size === 'compact',
    onSelect: onSelect as MenuSettings['onSelect'],
  };
  const list = (
    <ul
      data-collapsed={collapsed ? 'true' : undefined}
      className={cn(
        'list-none space-y-1 rounded-xl border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-2 shadow-xs',
        plain && 'm-0 rounded-none border-0 bg-transparent p-0 shadow-none',
        className,
      )}
      {...props}
    >
      <MenuList items={items} settings={settings} depth={0} />
    </ul>
  );
  return <TooltipProvider>{label ? <nav aria-label={label}>{list}</nav> : list}</TooltipProvider>;
};
