import { useForm, useStore } from '@tanstack/react-form';
import * as React from 'react';

import { useStableId } from '../lib';
import { FormContext } from './Form.context';
import type { FormError, FormProps } from './Form.types';

/**
 * Omni Form primitive. Wraps `@tanstack/react-form`'s `useForm` for state
 * (touched / dirty / async validators / array fields) and adds Omni's
 * Zod-gated submit contract.
 *
 * Submit contract (mirrors `dynamic-form`'s `DynamicForm`):
 * - Zod parse success → `onSubmit(parsed)` (awaited).
 * - Zod parse failure → `onError(errors)` with `source: 'zod'`.
 * - `onSubmit` throw / rejection → `onError([{ source: 'api', ... }])`.
 *
 * @example
 * <Form zodSchema={schema} formData={initial} onSubmit={save} onError={setErrors}>
 *   <FormField name="title">
 *     {({ id, value, onChange, error }) => (
 *       <Input id={id} label="Title" value={(value as string) ?? ''} onChange={onChange} error={error} />
 *     )}
 *   </FormField>
 *   <button type="submit">Save</button>
 * </Form>
 */
/** Equal by identity, or by content for plain data. A value that cannot be serialised (a `File`) is equal only to itself. */
const sameValue = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (a instanceof Blob || b instanceof Blob) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
};

function FormImpl<TFormData, TSubmitData = TFormData>(
  props: FormProps<TFormData, TSubmitData>,
): JSX.Element {
  const {
    zodSchema,
    formData,
    onChange,
    onSubmit,
    onError,
    disabled = false,
    readOnly = false,
    id: idProp,
    className,
    children,
  } = props;

  const fallbackId = useStableId('oui-form');
  const formId = idProp ?? fallbackId;

  /* Stable handler refs so consumers can pass fresh closures without thrashing. */
  const onChangeRef = React.useRef(onChange);
  const onSubmitRef = React.useRef(onSubmit);
  const onErrorRef = React.useRef(onError);
  React.useEffect(() => {
    onChangeRef.current = onChange;
    onSubmitRef.current = onSubmit;
    onErrorRef.current = onError;
  });

  const defaultValues = (formData ?? ({} as TFormData)) as TFormData;

  const form = useForm({
    defaultValues,
    validators: { onSubmit: zodSchema as any },
    onSubmitInvalid: ({ value }: any) => {
      /* TanStack already populated per-field errors via the zod validator;
       * forward the full issue list to caller as FormError[]. */
      const parse = (zodSchema as any).safeParse(value);
      if (parse.success) return;
      const errors: FormError[] = parse.error.issues.map((i: any) => ({
        path: i.path.map(String),
        message: i.message,
        source: 'zod' as const,
      }));
      onErrorRef.current?.(errors);
    },
    onSubmit: async ({ value }) => {
      if (disabled || readOnly) return;
      // The host receives what the schema PARSED (trims, defaults, coercions), not the raw values.
      const parsed = (zodSchema as any).safeParse(value);
      try {
        await onSubmitRef.current((parsed.success ? parsed.data : value) as TSubmitData);
      } catch (err) {
        const apiError: FormError = {
          path: [],
          message: err instanceof Error ? err.message : String(err),
          source: 'api',
        };
        onErrorRef.current?.([apiError]);
      }
    },
  });

  /* A controlled form takes the host's values whenever the HOST changes them, also after the person has edited
   * a field (TanStack only re-reads `defaultValues` while the form is untouched). Only the keys that differ are
   * written, so nothing remounts: focus and the caret stay where they are. A host that passes the same values
   * again (a new object with equal content) changes nothing. */
  const hostDataRef = React.useRef(formData);
  React.useEffect(() => {
    const previous = hostDataRef.current as Record<string, unknown> | undefined;
    const next = formData as Record<string, unknown> | undefined;
    hostDataRef.current = formData;
    if (!next || next === previous || sameValue(previous, next)) return;
    const current = (form.state.values ?? {}) as Record<string, unknown>;
    for (const key of new Set([...Object.keys(current), ...Object.keys(next)]))
      if (!sameValue(current[key], next[key])) (form as any).setFieldValue(key, next[key]);
  }, [formData, form]);

  /* Forward field-level changes to caller-supplied onChange via TanStack's
   * useStore selector. Selector returns a stable reference until values change. */
  const values = useStore(form.store, (s: any) => s.values);
  const lastValuesRef = React.useRef(values);
  React.useEffect(() => {
    if (values !== lastValuesRef.current) {
      lastValuesRef.current = values;
      onChangeRef.current?.(values as TFormData);
    }
  }, [values]);

  return (
    <FormContext.Provider value={{ form, disabled, readOnly } as any}>
      <form
        id={formId}
        data-testid={formId}
        className={className}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          /* A failed submit leaves a form-level `onSubmit` error behind, and with it `canSubmit: false`. Values
           * that arrive without a registered field (the schema form) never clear it, so every later submit
           * would be dropped. Values that now pass the schema start clean; the submit validates them again. */
          const api = form as any;
          if ((zodSchema as any).safeParse(api.state.values).success) {
            api.setErrorMap?.({ onSubmit: undefined });
            for (const name of Object.keys(api.state.fieldMeta ?? {}))
              api.setFieldMeta?.(name, (meta: any) => ({ ...meta, errorMap: {}, errors: [] }));
          }
          void form.handleSubmit();
        }}
      >
        {typeof children === 'function' ? (children as any)(form) : children}
      </form>
    </FormContext.Provider>
  );
}

/** Form-root memo guard. Handler refs and zodSchema bridge through useRef. */
function formPropsEqual<TFormData, TSubmitData>(
  prev: FormProps<TFormData, TSubmitData>,
  next: FormProps<TFormData, TSubmitData>,
): boolean {
  return (
    Object.is(prev.formData, next.formData) &&
    prev.disabled === next.disabled &&
    prev.readOnly === next.readOnly &&
    prev.id === next.id &&
    prev.className === next.className &&
    prev.children === next.children
  );
}

export const Form = React.memo(
  FormImpl,
  formPropsEqual as (
    prev: Readonly<FormProps<unknown, unknown>>,
    next: Readonly<FormProps<unknown, unknown>>,
  ) => boolean,
) as typeof FormImpl;

export type OmniFormApi = any;
