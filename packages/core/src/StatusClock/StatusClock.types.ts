import * as React from 'react';

/** `live`: red record icon + timer. `paused`: amber pause icon + amber timer + the paused label. */
export type StatusClockState = 'live' | 'paused';

/** The development-build tag: `<short sha> · <branch>` in mono after a divider; click to copy. */
export interface StatusClockBuildTag {
  /** Visible text, e.g. `a1b2c3d · feat/native-panel-cleanup`. */
  label: string;
  /** Tooltip (native `title`): the full SHA. */
  title?: string;
  /** Called when the tag is chosen; the caller copies and then sets `copied`. */
  onCopy?: () => void;
  /** Controlled: show `copiedLabel` instead of `label` (the caller times it out). */
  copied?: boolean;
  /** Text shown while `copied`. Default `Copied`. */
  copiedLabel?: string;
  /** Optional leading icon node (the board shows a commit glyph). */
  icon?: React.ReactNode;
  /** Accessible name. Default `Copy build <title or label>`. */
  'aria-label'?: string;
}

export interface StatusClockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** `live` (default) or `paused`. Only the icon, the timer and the paused label change colour. */
  state?: StatusClockState;
  /** The already formatted elapsed time (`2:18:20`); the library never ticks or formats. */
  elapsed: string;
  /** Caller-supplied icon node: the filled record icon (red while live). */
  icon?: React.ReactNode;
  /** Icon node while paused (the amber pause icon). Default: `icon`. */
  pausedIcon?: React.ReactNode;
  /** Label after the timer while paused. Default `Paused`; pass `null` to hide it. */
  pausedLabel?: React.ReactNode;
  /** Optional trailing development-build tag. Rendered only when given: the caller decides dev builds only. */
  buildTag?: StatusClockBuildTag;
  /** Accessible name of the group. Default `Session status`. */
  label?: string;
  'data-testid'?: string;
}
