import * as React from 'react';

import { useStableId } from '../lib';
import { FormContext } from './Form.context';
import type { FormFieldProps, FormFieldRenderProps } from './Form.types';

/**
 * Binds a single field to the surrounding {@link Form}. Thin wrapper around
 * `@tanstack/react-form`'s `form.Field` that adapts the TanStack render-prop
 * shape into Omni's `{id, value, onChange, error, ...}` contract so any
 * `components/Input`-shaped primitive can be dropped in.
 *
 * @example
 * <FormField name="email" required>
 *   {({ id, value, onChange, error, required }) => (
 *     <Input id={id} type="email" label="Email" required={required}
 *       value={(value as string) ?? ''} onChange={onChange} error={error}
 *     />
 *   )}
 * </FormField>
 */
export function FormField<TValue = unknown>({ name, required = false, children }: FormFieldProps<TValue>) {
  const ctx = React.useContext(FormContext) as { form: any; disabled: boolean; readOnly: boolean } | null;
  if (!ctx) throw new Error('FormField must be rendered inside <Form>.');
  const { form, disabled, readOnly } = ctx;
  const fallbackId = useStableId('oui-field');

  return (
    <form.Field name={name as any}>
      {(field: any) => {
        const meta = field.state.meta;
        const errorMessages: string[] = (meta?.errors ?? []).map((e: unknown) => (typeof e === 'string' ? e : (e as any)?.message)).filter(Boolean);
        const error = errorMessages[0];
        const render: FormFieldRenderProps<TValue> = {
          id: `${fallbackId}-${name}`,
          name,
          value: field.state.value as TValue,
          onChange: (next) => field.handleChange(next as any),
          onBlur: () => field.handleBlur(),
          error,
          invalid: Boolean(error),
          disabled,
          readOnly,
          required,
        };
        return children(render);
      }}
    </form.Field>
  );
}
