import type * as React from 'react';

/** English strings of {@link Splitter}. */
export interface SplitterLabels {
  /** Accessible name of a handle, given the name of the panel it resizes. */
  handle: (panel: string) => string;
  /** Tooltip of a handle. */
  hint: string;
}

/** Panel sizes in px, by panel `id`. A panel with no entry takes the room that is left. */
export type SplitterSizes = Record<string, number>;

export interface SplitterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  children?: React.ReactNode;
  /** Draw a drag handle between panels and keep their sizes. Off by default: a static split layout. */
  resizable?: boolean;
  /** `horizontal` lays panels left to right (the default); `vertical` stacks them. */
  orientation?: 'horizontal' | 'vertical';
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
