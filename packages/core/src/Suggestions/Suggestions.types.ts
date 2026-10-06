import * as React from 'react';

/** The base item of a follow-up: extend it with your own fields and they reach every callback and slot. */
export interface SuggestionItem {
  id: string;
  label: string;
}

export interface SuggestionsProps<T extends SuggestionItem = SuggestionItem> extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'onSelect'
> {
  items: T[];
  /** Fires when a chip is chosen, with the full item (the same object passed in `items`) and its index. Without it nothing is rendered. */
  onSelect?: (item: T, index: number) => void | Promise<void>;
  /** Replaces the label inside a chip; receives the full item. Default: `item.label`. */
  renderItem?: (item: T, index: number) => React.ReactNode;
  /** Icon node before each label (the original uses a bent arrow). */
  icon?: React.ReactNode;
  /** Disables every chip, e.g. while a reply is running. */
  disabled?: boolean;
  /** `column` (default, as in the original: one chip per line) or `wrap` (chips flow in a row). */
  layout?: 'column' | 'wrap';
  /** Accessible name of the group. Default `Follow-up suggestions`. */
  label?: string;
}
