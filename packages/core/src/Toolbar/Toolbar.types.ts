import type * as React from 'react';

/** `control`: 36px compact row. `control-labelled`: 52px row, icon with a caption under it. */
export type ToolbarSize = 'control' | 'control-labelled';

/** A named cluster of controls. Adjacent clusters are separated by the 20px control separator. */
export interface ToolbarGroup {
  id: string;
  /** Accessible name of the cluster (`role="group"` + `aria-label`). */
  label?: string;
  children: React.ReactNode;
}

export interface ToolbarProps {
  /** Accessible name of the toolbar (`aria-label`). */
  label: string;
  /** Control size for every control that reads the toolbar context (SplitButton). Default `control`. */
  size?: ToolbarSize;
  /** Content before the groups (e.g. the app's own window dots). Never interpreted by the library. */
  leading?: React.ReactNode;
  /** Data-driven clusters, rendered in order with separators between them. */
  groups?: ToolbarGroup[];
  /** Extra controls after the groups, one more cluster. */
  children?: React.ReactNode;
  /** Content after everything (e.g. a close or overflow control). */
  trailing?: React.ReactNode;
  /** Draw the 20px separators between sections (default true). */
  separators?: boolean;
  /**
   * `plain` (default): just the row. `floating`: the rounded pill surface used by the Native App window.
   * `bar`: a full-width row that wraps (never overflows): `leading` fills the left and shrinks, `trailing` is
   * right-aligned. No surface of its own (SessionBar paints it).
   */
  variant?: 'plain' | 'floating' | 'bar';
  className?: string;
  'data-testid'?: string;
}
