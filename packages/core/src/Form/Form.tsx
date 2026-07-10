import * as React from 'react';
import { useForm, useStore } from '@tanstack/react-form';

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
function FormImpl<TFormData, TSubmitData = TFormData>(props: FormProps<TFormData, TSubmitData>): JSX.Element {
  const { zodSchema, formData, onChange, onSubmit, onError, disabled = false, readOnly = false, id: idProp, className, children } = props;

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
      try {
        await onSubmitRef.current(value as unknown as TSubmitData);
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
          void form.handleSubmit();
        }}
      >
        {typeof children === 'function' ? (children as any)(form) : children}
      </form>
    </FormContext.Provider>
  );
}

/** Form-root memo guard. Handler refs and zodSchema bridge through useRef. */
function formPropsEqual<TFormData, TSubmitData>(prev: FormProps<TFormData, TSubmitData>, next: FormProps<TFormData, TSubmitData>): boolean {
  return (
    Object.is(prev.formData, next.formData) &&
    prev.disabled === next.disabled &&
    prev.readOnly === next.readOnly &&
    prev.id === next.id &&
    prev.className === next.className &&
    prev.children === next.children
  );
}

export const Form = React.memo(FormImpl, formPropsEqual as (prev: Readonly<FormProps<unknown, unknown>>, next: Readonly<FormProps<unknown, unknown>>) => boolean) as typeof FormImpl;

export type OmniFormApi = any;
