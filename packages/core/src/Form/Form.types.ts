import type * as React from 'react';
import type { z } from 'zod';

/**
 * Single error item produced by `Form` (and by `DynamicForm` in the
 * RJSF adapter layer) and forwarded to `onError`.
 *
 * - `source: 'zod'` — submit-time Zod parsing failed.
 * - `source: 'api'` — `onSubmit` callback threw or rejected.
 * - `source: 'ajv'` — render-time JSON Schema validation (RJSF only).
 */
export interface FormError {
  path: string[];
  message: string;
  source: 'zod' | 'api' | 'ajv';
}

/**
 * Shape passed to render-prop children and to {@link FormField}.
 * Formik-like `bag`, trimmed to what Omni forms use.
 */
export interface FormApi<TFormData> {
  formData: TFormData;
  errors: Record<string, string | undefined>;
  isSubmitting: boolean;
  disabled: boolean;
  readOnly: boolean;
  setField: (path: string, value: unknown) => void;
  getField: (path: string) => unknown;
  reset: (next?: TFormData) => void;
}

export interface FormProps<TFormData, TSubmitData = TFormData> {
  /** Zod schema used as both the validator and the input/output contract. */
  zodSchema: z.ZodType<TSubmitData>;
  /** Initial form data. Treated as uncontrolled seed; updates flow through onChange. */
  formData?: TFormData;
  onChange?: (next: TFormData) => void;
  onSubmit: (parsed: TSubmitData) => void | Promise<void>;
  onError?: (issues: FormError[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  className?: string;
  children: React.ReactNode | ((api: FormApi<TFormData>) => React.ReactNode);
}

export interface FormFieldRenderProps<TValue = unknown> {
  id: string;
  name: string;
  value: TValue;
  onChange: (next: TValue) => void;
  onBlur: () => void;
  error: string | undefined;
  invalid: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
}

export interface FormFieldProps<TValue = unknown> {
  name: string;
  required?: boolean;
  children: (props: FormFieldRenderProps<TValue>) => React.ReactElement;
}

/* -------------------------------------------------------------------------- */
/* Fixture shapes — shared between `factories/` and the zod-schema builder.    */
/* -------------------------------------------------------------------------- */

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'checkboxes'
  | 'range'
  | 'segmented'
  | 'stepper'
  | 'date'
  | 'phone'
  | 'currency'
  | 'otp'
  | 'tags'
  | 'time'
  | 'color'
  | 'file';

/** Single field declaration. `required` and `type` are render-only hints; */
/* required-ness is also encoded in the Zod schema so submit-time validation matches. */
export interface FieldDef<TName extends string = string> {
  name: TName;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: FieldType;
  description?: string;
  /** Multi-line `rows` count when `type='textarea'`. Default 5. */
  rows?: number;
  /** Choice list when `type='select'` or `type='radio'`. */
  options?: { value: string; label: string; description?: string; disabled?: boolean }[];
  /** Radio orientation when `type='radio'`. `vertical` (default) stacks, `horizontal` lays inline. */
  orientation?: 'vertical' | 'horizontal';
  /** Numeric range bounds when `type='range'`. */
  min?: number;
  max?: number;
  step?: number;
  /** Suffix appended to the slider's inline value display. */
  valueSuffix?: string;
  /** Per-field layout. `vertical` (default) stacks label/input; `horizontal` puts label inline. */
  layout?: 'vertical' | 'horizontal';
}

export interface FormRowDef<TName extends string = string> {
  /** Columns in this row. Default 2. */
  cols?: 1 | 2 | 3 | 4;
  fields: FieldDef<TName>[];
}

export interface FormSectionHeading {
  kind: 'heading';
  title: string;
  description?: string;
}

/** Inline IconButton toolbar row — demos the IconButton next to fields. */
export interface FormToolbarRow {
  kind: 'toolbar';
  /** Optional label rendered above the toolbar. */
  label?: string;
  /** Optional description rendered above the buttons. */
  description?: string;
  actions: FormToolbarAction[];
}

export interface FormToolbarAction {
  /** Lucide icon name supported by FormDemo's toolbar renderer. */
  icon: 'trash' | 'copy' | 'move-up' | 'move-down' | 'x';
  label: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export type FormRow<TName extends string = string> = FieldDef<TName>[] | FormRowDef<TName> | FormSectionHeading | FormToolbarRow;

/** Reusable fixture passed into `<FormDemo>` and tests. */
export interface FormFixture<TFormData> {
  title?: string;
  /** Outer width class — `max-w-md`, `max-w-2xl`, etc. Default `max-w-2xl`. */
  maxWidth?: string;
  /** Zod schema; treated as both validator and contract. */
  schema: z.ZodType<TFormData>;
  /** Initial values; passed to `Form.formData`. */
  initial: TFormData;
  /**
   * Row layout — `FieldDef[]` (2-col grid), `FormRowDef` (explicit cols), or
   * `{ kind: 'heading', title }` section divider.
   */
  rows: FormRow<Extract<keyof TFormData, string>>[];
  /** Submit button label. Default `Save`. */
  submitLabel?: string;
}
