import * as React from 'react';

import type { RootProps } from '../lib';
import type { FieldLayoutProps, InputVariantProps } from './Input.variants';

/**
 * Props for the Input primitive (the input element only, no chrome).
 *
 * @example
 * <InputPrimitive variant="bordered" inputSize="default" value={v} onChange={setV} />
 */
export interface InputPrimitiveProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'size' | 'onSubmit'>, InputVariantProps, RootProps {
  invalid?: boolean;
  /**
   * Render an auto-growing `<textarea>` instead of an `<input>` (a message box). The ref then holds the textarea (typed as
   * `HTMLInputElement` for compatibility: both share `value`, `focus`, `setSelectionRange`). Slot: `data-slot="input"` still.
   */
  multiline?: boolean;
  /** Multiline only: the field grows to this many px, then scrolls inside. Default 200. */
  maxHeight?: number;
  /** Multiline only: Enter calls `onSubmit` (Shift+Enter is a newline; IME composition is never interrupted). Default false: Enter is a newline. */
  sendOnEnter?: boolean;
  /** Multiline with `sendOnEnter`: Enter (also on a blank value: the host guards). Payload: the value. A promise is ignored. Absent: Enter stays a newline. */
  onSubmit?: (value: string) => void | Promise<void>;
  /** Blur the input on Enter/Escape so callers can save-on-blur. */
  commitOnEnter?: boolean;
  onChange?: (next: string) => void;
}

/**
 * Props for the chrome-wrapped Input (label + description + error rows).
 *
 * @example
 * <Input label="Project Title" required value={title} onChange={setTitle} />
 */
export interface InputProps extends InputPrimitiveProps, FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  /** Override the auto-generated outer field-group className. */
  wrapperClassName?: string;
  /**
   * Trailing action slot: nodes (IconButtons with their own `onClick`) rendered in a row after the field, e.g. a
   * composer's mic and send. The field flexes; the actions keep their size. Slot: `data-slot="input-actions"`.
   */
  actions?: React.ReactNode;
  /** Override the label className (e.g. align right, custom width). */
  labelClassName?: string;
}

export type { InputVariant, InputSize, InputVariantProps, FieldLayout, FieldLayoutProps } from './Input.variants';
