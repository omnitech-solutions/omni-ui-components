import type * as React from 'react';

/** English strings of {@link Splitter}. */
export interface SplitterLabels {
  /** Accessible name of a handle, given the name of the panel it resizes. */
  handle: (panel: string) => string;
  /** Tooltip of a handle. */
  hint: string;
  /** Accessible name of the handle at an outer edge. */
  edge: (edge: SplitterEdge, orientation: 'horizontal' | 'vertical') => string;
}

/** An outer edge of the splitter along its orientation: `start` is left (or top), `end` is right (or bottom). */
export type SplitterEdge = 'start' | 'end';

/** Panel sizes in px, by panel `id`. A panel with no entry takes the room that is left. */
export type SplitterSizes = Record<string, number>;

export interface SplitterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  children?: React.ReactNode;
  /** Draw a drag handle between panels and keep their sizes. Off by default: a static split layout. */
  resizable?: boolean;
  /** `horizontal` lays panels left to right (the default); `vertical` stacks them. */
  orientation?: 'horizontal' | 'vertical';
  /**
   * What happens when the panels need more room than the splitter has (kept sizes from a larger container,
   * or floors that do not fit). `scroll` (default): the splitter scrolls along its orientation, so the last
   * panel can always be reached. `clip`: the panels overflow and whatever holds the splitter cuts them off.
   */
  overflow?: 'scroll' | 'clip';
  /** Controlled sizes in px, by panel `id`. */
  sizes?: SplitterSizes;
  /** Starting sizes in px, by panel `id`. A panel's own `defaultSize` is used where this has no entry. */
  defaultSizes?: SplitterSizes;
  /** Fires with every size on each change: a drag, a key, a reset. */
  onSizesChange?: (sizes: SplitterSizes) => void;
  /** A handle was pressed: the id of the panel it resizes. */
  onResizeStart?: (panelId: string) => void;
  /** The handle was let go. */
  onResizeEnd?: (panelId: string, sizes: SplitterSizes) => void;
  /**
   * Draw a handle at these outer edges. It does not resize a panel: it reports the size wanted for whatever
   * holds the splitter (a window, a drawer, a card) through `onExtentChange`, and the caller applies it.
   * Needs `resizable`. `onResizeStart` and `onResizeEnd` fire for it with the id `edge:start` or `edge:end`.
   */
  edges?: readonly SplitterEdge[];
  /** The current size in px of what the edges resize. Defaults to the splitter's own measured size. */
  extent?: number;
  minExtent?: number;
  maxExtent?: number;
  /**
   * How the container grows. `opposite` (default): the far edge stays put, so the size changes by the distance
   * dragged. `centre`: it grows about its centre, so the size changes by twice the distance.
   */
  edgeAnchor?: 'opposite' | 'centre';
  /** The size wanted, from a drag or an arrow key on an edge handle. */
  onExtentChange?: (extent: number, edge: SplitterEdge) => void;
  /** An edge handle was double-clicked (or Enter pressed on it): go back to the default size. */
  onExtentReset?: (edge: SplitterEdge) => void;
  /** Every panel goes back to its default size whenever this value changes. */
  resetKey?: React.Key;
  /** Px a panel moves per arrow key press. */
  keyboardStep?: number;
  /** Extra attributes for every handle (for example a host's hit-testing hook). */
  handleProps?: React.HTMLAttributes<HTMLDivElement> & Record<`data-${string}`, string | undefined>;
  labels?: Partial<SplitterLabels>;
}

export interface SplitterPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Names the panel in `sizes` and in callbacks. Needed for a panel that is resized. */
  id?: string;
  /** Starting size: px (number) makes the panel resizable; a CSS length (string) is a static basis. */
  defaultSize?: string | number;
  /** Smallest size in px. 0 lets the panel be folded away. */
  minSize?: number;
  /** Largest size in px. */
  maxSize?: number;
  /** Accessible name of the panel, used in its handle's name. */
  label?: string;
}
