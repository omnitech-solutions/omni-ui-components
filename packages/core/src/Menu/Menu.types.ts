import type * as React from 'react';

export type MenuIndicatorTone = 'accent' | 'success' | 'warning' | 'danger';

/** A dot at the end of an item. `label` is what it means (`3 unread`): it is the dot's accessible name. */
export interface MenuIndicator {
  label: string;
  /** Default `accent`. */
  tone?: MenuIndicatorTone;
}

/** The minimum a menu item needs. Extend it with your own fields (a route, a record): `onSelect` gets the full item back. */
export interface MenuItem {
  key: React.Key;
  label: React.ReactNode;
  icon?: React.ReactNode;
  children?: MenuItem[];
  onClick?: () => void;
  /** The item is an anchor. The menu does not navigate: return `false` from `onSelect` to keep the click (a client-side router). */
  href?: string;
  target?: string;
  disabled?: boolean;
  /** Disables the item and says why, as its tooltip and its description. */
  disabledReason?: string;
  indicator?: MenuIndicator;
  /** Keys drawn at the end (`['G', 'H']`). The menu draws them; the host owns the shortcut. */
  shortcut?: string[];
  /** `item` (default); `group` draws its label over its children, flat; `divider` draws a rule. */
  type?: 'item' | 'group' | 'divider';
}

export interface MenuProps<T extends MenuItem = MenuItem>
  extends Omit<React.HTMLAttributes<HTMLUListElement>, 'onSelect'> {
  items: T[];
  /** The current item or items: each carries `aria-current="page"`. */
  selectedKeys?: React.Key[];
  /** Fires with the full item when one is chosen (click or keyboard). Return `false` to prevent the default of an `href` item. */
  onSelect?: (item: T) => void | false;
  /** Icons only; each item's label is its tooltip and stays its accessible name. */
  collapsed?: boolean;
  /** `card` (default) is a bordered surface; `plain` has no border or fill, for a `Sider`. */
  appearance?: 'card' | 'plain';
  /** Default `default`. */
  size?: 'default' | 'compact';
  /** Wraps the list in a `<nav>` with this accessible name. */
  label?: string;
}
