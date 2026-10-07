import type * as React from 'react';

/** One suggested first message. Extend it with your own fields; `onStart` gets the full starter back. */
export interface StarterItem {
  /** Stable key; defaults to `title`. */
  key?: string;
  /** Caller-supplied icon node. */
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  /** What is sent when the card is chosen. */
  prompt: string;
}

export interface EmptyStartersLabels {
  /** Accessible name of the card group. Default `Suggested prompts`. */
  starters: string;
}

export interface EmptyStartersProps<S extends StarterItem = StarterItem>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Heading: `What are we working on?` */
  title: React.ReactNode;
  /** One line under the heading (the product description). */
  description?: React.ReactNode;
  starters?: S[];
  /** Fires when a card is chosen, with the full starter item (the object you passed; it carries its `prompt`). The cards are not rendered without it. */
  onStart?: (starter: S) => void | Promise<void>;
  /** Card columns from `sm` up. Default 2. */
  columns?: 1 | 2 | 3;
  labels?: Partial<EmptyStartersLabels>;
  'data-testid'?: string;
}
