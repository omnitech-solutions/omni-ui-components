import * as React from 'react';

import type { RootProps } from '../lib';
import type { FieldLayoutProps, InputVariantProps } from './Input.variants';

/**
 * Props for the Input primitive (the input element only, no chrome).
 *
 * @example
 * <InputPrimitive variant="bordered" inputSize="default" value={v} onChange={setV} />
 */
export interface InputPrimitiveProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'size'>, InputVariantProps, RootProps {
  invalid?: boolean;
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
