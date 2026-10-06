import * as React from 'react';

import type { EmptyProps } from '../Empty';

/** Scrolling behaviour of the Panel body. Every key is optional; omit `scroll` for a plain scrolling body. */
export interface PanelScroll {
  /** 28px mask that fades the top edge of the body, so a line is never cut mid-text. */
  fade?: boolean;
  /** Thin scrollbar with a transparent track. */
  thinScrollbar?: boolean;
  /** Follow the newest content until the person scrolls up, then show the jump pill (see `useFollowLatest`). */
  stickToBottom?: boolean;
  /** Distance in px from the end that still counts as at the end (`useFollowLatest` `threshold`). Default 48. A conversation passes 200. */
  threshold?: number;
  /** How many lines the body holds; a growing count while scrolled up is what the pill counts. Default: the number of `children`. */
  lines?: number;
  /** A value that changes when content changes without the line count changing (a line streaming in). */
  activity?: unknown;
  /** Called after the person chooses the jump pill (the body has already scrolled to the end). */
  onJumpToLatest?: () => void;
  /** Label of the jump pill. Default `Jump to latest`. */
  jumpLabel?: string;
  /** Label of the count shown in the pill while lines were missed. Default `${n} new`. */
  missedLabel?: (missed: number) => string;
}

/** Body padding: `none` (default), `sm` (10px 12px, a chat log) or `md` (16px 20px, reading text). */
export type PanelPadding = 'none' | 'sm' | 'md';

export interface PanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  /** Panel title in the 40px header. It is also the accessible name of the region. */
  title: React.ReactNode;
  /** Muted text right after the title (`S2 · 10:57`). */
  subtitle?: React.ReactNode;
  /** Right-aligned meta before the actions: text, or nodes such as Tag chips. It truncates before the actions. */
  meta?: React.ReactNode;
  /** Header actions, right-aligned: the caller passes Buttons with their own callbacks. */
  actions?: React.ReactNode;
  /** Pinned under the body, inside the panel. Rendered only when provided. */
  dock?: React.ReactNode;
  /** The body. It fills the rest of the panel, scrolls inside and never overflows it. */
  children?: React.ReactNode;
  /** Shown instead of an empty body: the 40px-tile Empty. */
  empty?: Pick<EmptyProps, 'icon' | 'title' | 'description' | 'action'>;
  scroll?: PanelScroll;
  bodyPadding?: PanelPadding;
  /** Extra classes for the body (e.g. a flex column with `justify-end` for a chat log). */
  bodyClassName?: string;
  /** Extra classes for the dock row (e.g. `bg-transparent` for a composer that should look like the body). */
  dockClassName?: string;
  /** Fixed width (number = px, or any CSS length): the panel keeps it (`flex: 0 0 width`). Without it the panel shares the row (`flex: 1 1 0`). */
  width?: number | string;
  /** Minimum width (number = px). Default 0 so a shared-row panel can shrink instead of overflowing. */
  minWidth?: number | string;
  /** Overrides the computed `flex` shorthand (`1 1 0`, or `0 0 <width>`). */
  flex?: React.CSSProperties['flex'];
  /** Element for the root. Default `section`; the region role is always set. */
  as?: 'section' | 'div' | 'aside' | 'article';
  /** Overrides the id used to name the region from the title. */
  'aria-labelledby'?: string;
  'data-testid'?: string;
}
