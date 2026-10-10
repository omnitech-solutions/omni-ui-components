import type * as React from 'react';
import type { FieldLayoutProps } from '../Input/Input.variants';
import type { RootProps } from '../lib';

/** One row. Extend it with your own fields: items pass through untouched and reach `onChange` by reference. */
export interface TransferItem {
  key: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Shown, but it can be neither selected nor moved. */
  disabled?: boolean;
}

/** `right`: source to target. `left`: target back to source. */
export type TransferDirection = 'left' | 'right';

/** Every string the control shows or speaks. */
export interface TransferLabels {
  sourceTitle: string;
  targetTitle: string;
  /** Header count of a panel whose rows can be selected. */
  selectedCount: (selected: number, total: number) => string;
  /** Header count of a panel without selection (the target of a `oneWay` transfer). */
  itemCount: (total: number) => string;
  /** A panel with no items. */
  empty: string;
  /** A panel whose filter matches nothing. */
  noMatches: string;
  moveToTarget: string;
  moveToSource: string;
  searchSource: string;
  searchTarget: string;
  searchPlaceholder: string;
  /** Accessible name of a target row's remove button (`oneWay`). */
  remove: (item: TransferItem) => string;
}

const plain = (node: React.ReactNode) =>
  typeof node === 'string' || typeof node === 'number' ? String(node) : '';

export const DEFAULT_TRANSFER_LABELS: TransferLabels = {
  sourceTitle: 'Available',
  targetTitle: 'Selected',
  selectedCount: (selected, total) => `${selected} of ${total} selected`,
  itemCount: (total) => `${total} ${total === 1 ? 'item' : 'items'}`,
  empty: 'No items',
  noMatches: 'No matches',
  moveToTarget: 'Move selected to target',
  moveToSource: 'Move selected to source',
  searchSource: 'Filter source',
  searchTarget: 'Filter target',
  searchPlaceholder: 'Filter',
  remove: (item) => `Remove ${plain(item.title) || item.key}`,
};

/**
 * Props for the Transfer primitive: two listboxes and the move buttons, nothing else.
 *
 * @example
 * <TransferPrimitive aria-label="Teams" dataSource={teams} targetKeys={keys} onChange={(next) => setKeys(next)} />
 */
export interface TransferPrimitiveProps<T extends TransferItem = TransferItem> extends RootProps {
  /** On the source listbox, which also takes the ref: focusing by id lands there. */
  id?: string;
  /** With a name, every target key is also written to a hidden input for native form posts. */
  name?: string;
  dataSource: T[];
  /** The value: keys of the items in the target, in the order they were moved. */
  targetKeys?: string[];
  defaultTargetKeys?: string[];
  /** After a move: the next keys, then the moved items (by reference) and the direction. */
  onChange?: (nextTargetKeys: string[], moved: T[], direction: TransferDirection) => void;
  /** A filter input above each list. */
  searchable?: boolean;
  /** Replaces the built-in filter (case-insensitive match on a text title, description, or the key). */
  filterOption?: (query: string, item: T) => boolean;
  /** No move-back button: target rows get a remove button instead (also Delete or Backspace on the row). */
  oneWay?: boolean;
  disabled?: boolean;
  /** Lists stay focusable and are announced read-only; nothing can be selected or moved. */
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** Height of each list. Default 12rem. */
  listHeight?: number | string;
  moveToTargetIcon?: React.ReactNode;
  moveToSourceIcon?: React.ReactNode;
  removeIcon?: React.ReactNode;
  labels?: Partial<TransferLabels>;
  'aria-describedby'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Props for the chrome-wrapped Transfer (label, description and error rows).
 *
 * @example
 * <Transfer label="Teams with access" dataSource={teams} targetKeys={keys} onChange={(next) => setKeys(next)} />
 */
export interface TransferProps<T extends TransferItem = TransferItem>
  extends TransferPrimitiveProps<T>,
    FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
}
