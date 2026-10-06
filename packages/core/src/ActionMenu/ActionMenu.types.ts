import * as React from 'react';

import type { ControlTone } from '../internal/support/controlTone';

/** One row of an {@link ActionMenu}. */
export interface ActionMenuItem {
  /** Stable id, passed to `onSelect(itemId)`. */
  id: string;
  label: string;
  /** Second line under the label (e.g. "Analyse only when you press it"). */
  description?: string;
  /** Leading icon node (caller-supplied). Shown in the fixed check column when the row has no `checked` state. */
  icon?: React.ReactNode;
  /**
   * Selection state. `true` shows the check; `false` keeps the (empty) check column so every row of the
   * section lines up. Leave undefined for a plain action row.
   */
  checked?: boolean;
  /** Key glyphs as plain mono text, one entry per key: `['⌘', '⇧', 'S']` renders `⌘⇧S`. */
  shortcut?: string[];
  /** `danger` colours the row with the destructive tone (e.g. "Clear session memory"). */
  tone?: 'default' | 'danger';
  /** Not selectable; skipped by the keyboard. Use `disabledReason` to say why. */
  disabled?: boolean;
  /** Not selectable AND explained: shown as the row's second line (replacing `description`) and in `aria-disabled`. */
  disabledReason?: string;
  /** Called when the row is chosen (click, Enter, Space), before the menu-level `onSelect`. */
  onSelect?: () => void;
}

/** A labelled group of rows. */
export interface ActionMenuSection {
  id: string;
  /** Group heading ("When to analyse", "Technical"). Also the group's accessible name. */
  label?: string;
  /** `plain` (default): small sentence-case heading. `caps`: 11px uppercase heading (Technical, Capture). */
  labelStyle?: 'plain' | 'caps';
  /**
   * `single`: radio rows (`menuitemradio`, one checked). `multiple`: `menuitemcheckbox` rows.
   * `none`: plain `menuitem` rows. Default: `single` when any row has a `checked` state, otherwise `none`.
   */
  selection?: 'single' | 'multiple' | 'none';
  /**
   * Controlled single-select: the id of the chosen row. When set, every row's `checked` is derived from it
   * (`item.id === value`) and the section is `single` unless `selection` says otherwise. Pair it with the menu's
   * `onValueChange`; the menu keeps no selection state of its own.
   */
  value?: string;
  /** Tint the checked row (default true). */
  highlightChecked?: boolean;
  /** A 1px divider before the section (default true, except for `caps` headed sections which separate by spacing). */
  divider?: boolean;
  items: ActionMenuItem[];
}

/** A leading status row with an optional fix action ("Microphone lost · Retry now"). */
export interface ActionMenuNotice {
  tone: ControlTone;
  title: string;
  /** e.g. "Trying again · attempt 3". */
  detail?: string;
  /** Leading icon node; defaults to a circled "!" glyph. */
  icon?: React.ReactNode;
  action?: { label: string; onSelect: () => void };
}

/** The trailing hint row ("Previous / next   ⌘↑ ⌘↓"). */
export interface ActionMenuHint {
  label: string;
  /** One entry per chord, joined with a space: `['⌘↑', '⌘↓']`. */
  keys: string[];
}

/**
 * Props for the data-driven ActionMenu: sections and rows described as data, every
 * callback a prop, placement configurable.
 */
export interface ActionMenuProps {
  /** The element that opens the menu (`asChild`: it receives the trigger props). */
  trigger: React.ReactElement;
  /** Accessible name of the menu (`aria-label`). */
  label: string;
  /** Plain heading above the first section ("Answer style for new work"). */
  title?: string;
  sections: ActionMenuSection[];
  notice?: ActionMenuNotice;
  hint?: ActionMenuHint;
  /**
   * `menu` (default): an interactive Radix menu (arrow keys, Enter, Escape, typeahead).
   * `list`: a read-only grouped reference list (the shortcuts menu), a Popover dialog; rows are not selectable.
   */
  kind?: 'menu' | 'list';
  /** Called with the chosen row's id after the row's own `onSelect`, once per choice. */
  onSelect?: (itemId: string, item: ActionMenuItem) => void;
  /** Select mode: called once when a row of a single-select section is chosen, with that section's id and the row's id. */
  onValueChange?: (sectionId: string, itemId: string) => void;
  /**
   * Where focus goes when the menu closes. `keyboard` (default): back to the trigger after a keyboard-initiated close
   * (Enter, Space, Escape, Tab) but nowhere after a pointer selection or outside click, so no ring lingers.
   * `always`: always back to the trigger (Radix default).
   */
  returnFocus?: 'keyboard' | 'always';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  /** Keep this many px between the menu and the viewport edge. Default 8. */
  collisionPadding?: number;
  /** Menu width: px number or any CSS length. Default 300. Never wider than the viewport. */
  width?: number | string;
  /**
   * Cap on the menu height (px number or CSS length). The menu is always also capped to the room left in
   * the viewport; the rows scroll inside, the notice-free hint row stays pinned.
   */
  maxHeight?: number | string;
  /** Render in a portal (default true). `false` keeps the menu inside its trigger's DOM (e.g. a WKWebView root). */
  portal?: boolean;
  /** Portal target when `portal` is on; default `document.body`. Lets an app render the menu in its own root. */
  container?: HTMLElement | null;
  /** Radix modal behaviour for `kind="menu"` (default false: outside controls stay clickable). */
  modal?: boolean;
  className?: string;
  'data-testid'?: string;
}
