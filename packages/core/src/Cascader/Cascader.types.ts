import type * as React from 'react';
import type { FieldLayoutProps, InputSize, InputVariant } from '../Input/Input.variants';
import type { RootProps } from '../lib';

/** One node of the option tree. Extend it to carry your own data: options reach `onChange` by reference. */
export interface CascaderOption {
  value: string;
  label: React.ReactNode;
  children?: CascaderOption[];
  disabled?: boolean;
}

/** Every user-visible or announced string of the Cascader. */
export interface CascaderLabels {
  /** Shown in the trigger when nothing is chosen (the `placeholder` prop wins). */
  placeholder: string;
  /** Accessible name of the clear control. */
  clear: string;
  /** Accessible name of the popup. */
  popup: string;
  /** Accessible name of a column, followed by its 1-based number. */
  level: string;
  /** Shown in the popup when `options` is empty. */
  empty: string;
}

export const DEFAULT_CASCADER_LABELS: CascaderLabels = {
  placeholder: 'Select…',
  clear: 'Clear selection',
  popup: 'Options',
  level: 'Level',
  empty: 'No options',
};

/**
 * Props of the bare cascading picker (trigger and popup only).
 *
 * @example
 * <CascaderPrimitive aria-label="Stack" options={stack} value={path} onChange={(path, chosen) => setPath(path)} />
 */
export interface CascaderPrimitiveProps<T extends CascaderOption = CascaderOption>
  extends RootProps {
  id?: string;
  /** When set, a hidden input carries the path joined by `/` for native form submits. */
  name?: string;
  options: T[];
  /** The chosen path, one option value per level. `[]` means nothing chosen. */
  value?: string[];
  defaultValue?: string[];
  /** Fires with the path, then the option of each path segment by reference. */
  onChange?: (path: string[], selectedOptions: T[]) => void;
  /** Fires after the clear control emptied the value. */
  onClear?: () => void;
  disabled?: boolean;
  /** Focusable and announced read-only; the popup does not open. */
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  variant?: InputVariant;
  inputSize?: InputSize;
  placeholder?: string;
  /** Drawn between the chosen labels in the trigger. Default ` / `. */
  displaySeparator?: React.ReactNode;
  /** A level that has children can be chosen too. Default false: only a leaf commits and closes. */
  changeOnSelect?: boolean;
  /** Draws a clear control while there is a value (never when disabled or read-only). */
  allowClear?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Portal target of the popup. */
  container?: HTMLElement | null;
  /** Marks an option that has children. */
  expandIcon?: React.ReactNode;
  /** Trailing icon of the trigger. */
  suffixIcon?: React.ReactNode;
  clearIcon?: React.ReactNode;
  labels?: Partial<CascaderLabels>;
  'aria-describedby'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Props of the chrome-wrapped Cascader (label, description and error rows).
 *
 * @example
 * <Cascader label="Stack" required options={stack} value={path} onChange={setPath} />
 */
export interface CascaderProps<T extends CascaderOption = CascaderOption>
  extends CascaderPrimitiveProps<T>,
    FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
}
