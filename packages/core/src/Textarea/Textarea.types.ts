import * as React from 'react';

import type { RootProps } from '../lib';
import type { FieldLayoutProps } from '../Input/Input.variants';
import type { TextareaVariantProps } from './Textarea.variants';

/**
 * Props for the Textarea primitive (the textarea element only, no chrome).
 *
 * @example
 * <TextareaPrimitive variant="bordered" textareaSize="default" value={v} onChange={setV} />
 */
export interface TextareaPrimitiveProps extends Omit<React.ComponentProps<'textarea'>, 'onChange' | 'rows'>, TextareaVariantProps, RootProps {
  invalid?: boolean;
  /** Number of visible text lines. Default 5 (matches @rjsf/shadcn). */
  rows?: number;
  onChange?: (next: string) => void;
}

/**
 * Props for the chrome-wrapped Textarea (label + description + error rows).
 *
 * @example
 * <Textarea label="Message" required value={message} onChange={setMessage} rows={6} />
 */
export interface TextareaProps extends TextareaPrimitiveProps, FieldLayoutProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  /** Override the auto-generated outer field-group className. */
  wrapperClassName?: string;
  /** Override the label className (e.g. align right, custom width). */
  labelClassName?: string;
}

export type { TextareaVariant, TextareaSize, TextareaVariantProps } from './Textarea.variants';
