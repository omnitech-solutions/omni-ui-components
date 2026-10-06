import * as React from 'react';

import type { ActionMenuProps } from '../ActionMenu';
import type { ControlTone } from '../internal/support/controlTone';
import type { IconButtonBadge } from '../IconButton';
import type { ToolbarSize } from '../Toolbar';

/** The primary action half of a SplitButton. */
export interface SplitButtonMain {
  /** Accessible name (`aria-label`); also the caption under the icon in the `control-labelled` size. */
  label: string;
  /** Icon node (caller-supplied, 20px outline by convention). */
  icon: React.ReactNode;
  /** Caption in the labelled size when it differs from `label` (e.g. label "Capture", caption "Stop"). */
  caption?: string;
  /**
   * `analysing`: the icon is swapped for the indeterminate progress ring, `aria-busy` is set and the control
   * takes the `accent` tone unless `tone` says otherwise. Clicks still reach `onPress` (a running run is stopped).
   */
  state?: 'idle' | 'analysing';
  /** Toggle state of the main action (`aria-pressed`, accent tint on the main half). */
  pressed?: boolean;
  /** Rich tooltip on hover and keyboard focus. Replaced by `disabledReason` while that is set. */
  tooltip?: React.ReactNode;
  /** Key glyphs appended to the tooltip in mono text, one entry per key: `['⌘', '⇧', 'S']`. */
  shortcut?: string[];
  /** Native `disabled` on the main action only; the caret stays usable. */
  disabled?: boolean;
  /**
   * Why the main action cannot be used (e.g. "Resume to capture"). Sets `aria-disabled` (not native `disabled`) so the
   * button stays hoverable: the reason is the tooltip. The click is swallowed; the caret stays usable.
   */
  disabledReason?: string;
  /** Called when the main action is pressed. */
  onPress?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  'data-testid'?: string;
}

/** The menu half's trigger. */
export interface SplitButtonCaret {
  /** Accessible name of the caret. Default "More options". */
  label?: string;
  tooltip?: React.ReactNode;
  /** Why the menu cannot be opened. While set the caret renders `aria-disabled` and never opens. */
  disabledReason?: string;
  'data-testid'?: string;
}

/** The ActionMenu spec (everything except what the SplitButton wires itself: trigger and open state). */
export type SplitButtonMenu = Omit<ActionMenuProps, 'trigger' | 'open' | 'defaultOpen' | 'onOpenChange'>;

export interface SplitButtonProps {
  main: SplitButtonMain;
  caret?: SplitButtonCaret;
  /** The caret menu, as an ActionMenu spec. */
  menu: SplitButtonMenu;
  /** Tone of the whole control (one border, tinted surface): neutral | accent | success | warning | danger | dim. */
  tone?: ControlTone;
  /** Status badge anchored to the top-right of the main icon glyph (inside the main half, never over the caret), e.g. `{ tone: 'warning', label: '!', description: 'Microphone lost' }`. */
  status?: IconButtonBadge;
  /** Control size. Default: the enclosing Toolbar's size, else `control`. */
  size?: ToolbarSize;
  open?: boolean;
  defaultOpen?: boolean;
  /** Called when the menu opens or closes (e.g. to reserve window room for the popup). */
  onOpenChange?: (open: boolean) => void;
  /** Extra ways to open the menu from the main half: right-click and / or ArrowDown. The caret always opens it. */
  openMenuOn?: Array<'contextmenu' | 'arrowdown'>;
  className?: string;
  'data-testid'?: string;
}
