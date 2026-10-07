import type * as React from 'react';

/** The session state the bar renders: `live` shows Pause, `paused` shows Resume in the same slot. */
export type SessionStatus = 'live' | 'paused';

/** One footer button: its label, its caller-supplied icon node and its callback. */
export interface SessionAction {
  /** Visible label and accessible name. Defaults: `Pause session`, `Resume session`, `End session`. */
  label?: React.ReactNode;
  /** Icon node. Pause and Resume render it filled. */
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

/** End session: the outlined red button. With `confirm` it opens a Popconfirm and `onClick` runs on confirm. */
export interface SessionEndAction extends SessionAction {
  confirm?: {
    title: React.ReactNode;
    description?: React.ReactNode;
    confirmText?: React.ReactNode;
    cancelText?: React.ReactNode;
    /** Called when the person cancels the confirmation. */
    onCancel?: () => void;
  };
}

export interface SessionBarProps {
  /** Accessible name of the bar (`role="toolbar"`). Default `Session controls`. */
  label?: string;
  /** `live` (default) or `paused`: which of Pause / Resume is shown. Never changes the bar's background. */
  status?: SessionStatus;
  /** Left slot: the StatusClock (or anything). */
  leading?: React.ReactNode;
  /** Pause button (shown while live). */
  pause?: SessionAction;
  /** Resume button (shown while paused, in the Pause slot). */
  resume?: SessionAction;
  /** End button (always shown unless `end` is `null`). */
  end?: SessionEndAction | null;
  /** Replaces the three buttons entirely with caller nodes (right-aligned). */
  actions?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}
