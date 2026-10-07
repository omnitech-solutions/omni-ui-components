import type * as React from 'react';

export type PanelShellMode = 'panel' | 'full';

export interface PanelShellLabels {
  /** Accessible name of the backdrop behind an overlay sidebar (a click on it closes the sidebar). Default `Close conversations`. */
  closeSidebar: string;
  /** Accessible name of the overlay sidebar (a modal dialog while it floats). Default `Conversations`. */
  sidebar: string;
}

export interface PanelShellProps {
  /** `panel`: a side panel next to the host page. `full`: the assistant fills the whole area and hides the host. Default `panel`. */
  mode?: PanelShellMode;
  /** Panel width (number = px, or any CSS length). Default 440. */
  width?: number | string;
  /** Whether the assistant is shown (panel mode hides it, leaving the host). Default true. */
  open?: boolean;
  defaultOpen?: boolean;
  /** Notification: fires in controlled and uncontrolled mode when the panel asks to close (Escape with `closeOnEscape`). */
  onOpenChange?: (open: boolean) => void;
  /** Escape inside the panel closes it through `onOpenChange` (an open overlay sidebar closes first). Default false. */
  closeOnEscape?: boolean;
  /** Accessible name of the assistant region. Default `Chat`. */
  label?: string;
  /** The host page beside the panel. Hidden while `mode="full"` and open. */
  host?: React.ReactNode;
  /** The conversation list. `docked` sits beside the body; `overlay` floats over it. */
  sidebar?: React.ReactNode;
  sidebarMode?: 'docked' | 'overlay';
  /** Overlay mode: whether the sidebar is showing. Docked sidebars are always shown. */
  sidebarOpen?: boolean;
  defaultSidebarOpen?: boolean;
  /** Notification: fires in controlled and uncontrolled mode. */
  onSidebarOpenChange?: (open: boolean) => void;
  /** Width of the sidebar. Default 260. */
  sidebarWidth?: number | string;
  /** Above the body: a ConversationHeader. */
  header?: React.ReactNode;
  /** The conversation. It fills the space and scrolls inside. */
  children?: React.ReactNode;
  /** Pinned under the body: a composer. */
  footer?: React.ReactNode;
  /** Overlays that belong to the assistant (a Toast with `position="absolute"`). */
  overlay?: React.ReactNode;
  labels?: Partial<PanelShellLabels>;
  /** Extra classes of the root row. */
  className?: string;
  /** Extra classes of the assistant surface. */
  panelClassName?: string;
  'data-testid'?: string;
}
