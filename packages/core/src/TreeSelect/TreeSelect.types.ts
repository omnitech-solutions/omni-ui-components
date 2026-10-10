import type * as React from 'react';
import type { FieldLayoutProps, InputSize, InputVariant } from '../Input/Input.variants';
import type { RootProps } from '../lib';

/** One node of the tree. Extend it with your own fields: nodes reach every callback by reference. */
export interface TreeSelectNode {
  value: string;
  title: React.ReactNode;
  children?: TreeSelectNode[];
  /** Shown and reachable by keyboard, but cannot be chosen. */
  disabled?: boolean;
}

/** Every string the control shows or announces. */
export interface TreeSelectLabels {
  /** Trigger text while nothing is chosen (the `placeholder` prop wins when given). */
  placeholder: string;
  /** Accessible name of the clear button. */
  clear: string;
  /** Shown in the popover when `treeData` is empty. */
  empty: string;
  /** Accessible name of the tree when the control has no label of its own. */
  tree: string;
}

export const DEFAULT_TREE_SELECT_LABELS: TreeSelectLabels = {
  placeholder: 'Select…',
  clear: 'Clear selection',
  empty: 'No options',
  tree: 'Options',
};

interface TreeSelectPrimitiveBaseProps<T extends TreeSelectNode> extends RootProps {
  id?: string;
  /** With a name, the value is also written to hidden inputs (one per chosen value) for native form posts. */
  name?: string;
  treeData: T[];
  placeholder?: string;
  disabled?: boolean;
  /** Focusable and announced read-only; the popover does not open and the value cannot change. */
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  variant?: InputVariant;
  inputSize?: InputSize;
  /** Values of the open parents (controlled). */
  expandedKeys?: string[];
  /** Open parents at first render. Default: the ancestors of the current value. */
  defaultExpandedKeys?: string[];
  /** Fires with the whole list of open parents, then the node that was opened or closed. */
  onExpandedChange?: (next: string[], node: T) => void;
  /** Start with every parent open (ignored when `defaultExpandedKeys` or `expandedKeys` is given). */
  defaultExpandAll?: boolean;
  /** Default true. False: only leaves can be chosen; choosing a parent opens or closes it instead. */
  selectableParents?: boolean;
  /** Draws a clear button while something is chosen. */
  allowClear?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Element the popover is portalled into (default `document.body`). */
  container?: HTMLElement | null;
  labels?: Partial<TreeSelectLabels>;
  /** Trigger chevron. */
  chevronIcon?: React.ReactNode;
  /** Expand / collapse marker of a parent row (rotated a quarter turn while open). */
  toggleIcon?: React.ReactNode;
  /** Mark on a chosen row. */
  checkIcon?: React.ReactNode;
  clearIcon?: React.ReactNode;
  'aria-describedby'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/** One node at a time (default). The empty string means nothing is chosen. */
export interface TreeSelectSingleProps<T extends TreeSelectNode = TreeSelectNode> {
  mode?: 'single';
  value?: string;
  defaultValue?: string;
  onChange?: (next: string, node: T | undefined) => void;
}

/** Several nodes, each checked on its own: checking a parent does not check its children. */
export interface TreeSelectMultipleProps<T extends TreeSelectNode = TreeSelectNode> {
  mode: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onChange?: (next: string[], nodes: T[]) => void;
}

/**
 * Bare tree select (trigger and popover tree, no label).
 *
 * @example
 * <TreeSelectPrimitive treeData={places} value={place} onChange={(next, node) => setPlace(next)} />
 * <TreeSelectPrimitive mode="multiple" treeData={places} value={picked} onChange={setPicked} />
 */
export type TreeSelectPrimitiveProps<T extends TreeSelectNode = TreeSelectNode> =
  TreeSelectPrimitiveBaseProps<T> & (TreeSelectSingleProps<T> | TreeSelectMultipleProps<T>);

/**
 * Tree select inside the field chrome (label, description, error).
 *
 * @example
 * <TreeSelect label="Location" treeData={places} value={place} onChange={setPlace} />
 */
export type TreeSelectProps<T extends TreeSelectNode = TreeSelectNode> =
  TreeSelectPrimitiveProps<T> &
    FieldLayoutProps & {
      label?: React.ReactNode;
      description?: React.ReactNode;
      error?: React.ReactNode;
      wrapperClassName?: string;
      labelClassName?: string;
    };
