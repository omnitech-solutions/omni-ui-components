import type * as React from 'react';

/** What every section accepts: the attributes of its element. */
export interface LayoutSectionProps extends React.HTMLAttributes<HTMLElement> {}

export interface LayoutProps extends LayoutSectionProps {
  /** `column` (default) stacks the sections; `row` lays a `Sider` beside the rest. */
  direction?: 'column' | 'row';
  /** The layout is as tall as the viewport and the page behind it does not scroll: a `Content scroll` scrolls instead. */
  fill?: boolean;
}

export type HeaderLevel = 1 | 2 | 3;

export interface HeaderProps extends Omit<LayoutSectionProps, 'title'> {
  /** The heading. With it the header draws a page header: eyebrow, heading, description, then `meta` and `actions` at the end. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** A short line above the heading (a section name, a back link the host supplies). */
  eyebrow?: React.ReactNode;
  /** Quiet content before the actions (a status, a count). */
  meta?: React.ReactNode;
  /** Controls at the end of the row. */
  actions?: React.ReactNode;
  /** The heading element and its size step: `h1`, `h2` (default) or `h3`. */
  level?: HeaderLevel;
  /** The rule under the header. Default `true`. */
  bordered?: boolean;
  /** Default `md`. */
  padding?: 'none' | 'sm' | 'md';
}

export interface ContentProps extends LayoutSectionProps {
  /** The widest the content gets; it is centred in the space left over. `full` (default) has no limit. */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Default `md`. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Centres its child in the space, both ways (a sign-in card, an empty page). */
  center?: boolean;
  /** Scrolls inside, with the thin scrollbar of `Panel`, instead of growing the page. */
  scroll?: boolean;
  /** The element. Default `main`; use `div` or `section` for a second content region on a page. */
  as?: 'main' | 'div' | 'section';
}

export interface SiderState {
  collapsed: boolean;
}

export type SiderSlot = React.ReactNode | ((state: SiderState) => React.ReactNode);

export interface SiderLabels {
  /** Name of the control while the sider is open. Default `Collapse sidebar`. */
  collapse: string;
  /** Name of the control while the sider is collapsed. Default `Expand sidebar`. */
  expand: string;
}

export interface SiderProps extends LayoutSectionProps {
  /** Width in pixels while open. Default 240 once any option below is used. */
  width?: number;
  /** Width in pixels while collapsed. Default 56. */
  collapsedWidth?: number;
  /** Draws the collapse control. Without it the sider collapses only through `collapsed`. */
  collapsible?: boolean;
  /** Controlled state. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  /** Fires in controlled and uncontrolled mode. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Pinned above the body: a node, or a function of `{ collapsed }`. */
  header?: SiderSlot;
  /** Pinned under the body: a node, or a function of `{ collapsed }`. */
  footer?: SiderSlot;
  /** The body scrolls inside, with the thin scrollbar of `Panel`. */
  scroll?: boolean;
  /** Accessible name of the region (`Main navigation`). */
  label?: string;
  /** Which edge of the layout it sits on: the rule is drawn on the other side. Default `start`. */
  side?: 'start' | 'end';
  collapseIcon?: React.ReactNode;
  expandIcon?: React.ReactNode;
  labels?: Partial<SiderLabels>;
}
