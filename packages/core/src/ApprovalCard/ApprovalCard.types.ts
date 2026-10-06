import * as React from 'react';

/** Where the request is: waiting for a decision, or how it was answered. */
export type ApprovalStatus = 'pending' | 'once' | 'always' | 'denied';

/** What the person chose. */
export type ApprovalDecision = 'once' | 'always' | 'deny';

export interface ApprovalLabels {
  /** Accessible name of the card (`section`). Default `Approval needed`. */
  region: string;
  deny: string;
  /** The standing permission button. Default `Always allow in this chat`. */
  always: string;
  once: string;
  /** Resolved line after Allow once. Default `Allowed once`. */
  allowedOnce: string;
  /** Resolved line after the standing permission; `tool` is the card's `tool`. */
  alwaysAllowed: (tool?: string) => string;
  /** Resolved line after Deny. Default `Denied · nothing was run`. */
  denied: string;
}

export interface ApprovalIcons {
  /** The shield badge. */
  badge?: React.ReactNode;
  /** Beside the resolved line, per outcome. */
  once?: React.ReactNode;
  always?: React.ReactNode;
  denied?: React.ReactNode;
}

/** The base item of an approval request: extend it with your own fields (a call id, a run) and they reach `onDecide`. */
export interface ApprovalItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  tags?: string[];
  tool?: string;
}

export interface ApprovalCardProps<T extends ApprovalItem = ApprovalItem> extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The request to show; `title`, `description`, `tags` and `tool` default to its fields, and the props override them. Callbacks receive it by reference. */
  approval?: T;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Small tags under the description; the first is drawn monospace (the tool name). */
  tags?: string[];
  /** Tool name used in the `alwaysAllowed` line. */
  tool?: string;
  /** Default `pending`. */
  status?: ApprovalStatus;
  /** Fires when Deny (`'deny'`), the standing permission (`'always'`) or Allow once (`'once'`) is chosen, with the decision and the full `approval` item (or `{ id, title, description, tags, tool }` built from the props when none was given). The caller resolves the request and sets `status`. Without it a pending card shows no buttons. */
  onDecide?: (decision: ApprovalDecision, approval: T) => void | Promise<void>;
  /** Disables the three buttons while the decision is sent. */
  busy?: boolean;
  icons?: ApprovalIcons;
  labels?: Partial<ApprovalLabels>;
}
