import * as React from 'react';
import { act, fireEvent, render, screen, within, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import type { z } from 'zod';

import { DynamicForm, type DynamicFormProps } from 'dynamic-form';

/**
 * Options for {@link renderDynamicForm}. Inherits {@link DynamicFormProps}
 * except `onSubmit`/`onError`, which the helper provides as jest mocks if
 * none are passed.
 */
export interface RenderDynamicFormOptions<TFormData, TSubmitData> extends Omit<DynamicFormProps<TFormData, TSubmitData>, 'onSubmit' | 'onError'> {
  onSubmit?: jest.Mock;
  onError?: jest.Mock;
  children?: React.ReactNode;
}

/** Return shape of {@link renderDynamicForm}. */
export interface RenderDynamicFormResult {
  rtl: RenderResult;
  user: ReturnType<typeof userEvent.setup>;
  onSubmit: jest.Mock;
  onError: jest.Mock;
  submit: () => Promise<void>;
}

const DEFAULT_SUBMIT_LABEL = 'Save';

/**
 * Render a `<DynamicForm>` for testing with a userEvent instance, jest spies,
 * and a `submit()` helper that clicks the default submit button.
 *
 * @example
 * const { user, onSubmit, submit } = renderDynamicForm({
 *   schema: buildSingleFieldSchema('subject', { type: 'string', title: 'Subject' }),
 *   uiSchema: buildSingleFieldUiSchema('subject', { 'ui:widget': 'text' }),
 *   zodSchema: z.object({ subject: z.string().min(1) }),
 *   formData: { subject: '' },
 * });
 * await user.type(screen.getByRole('textbox'), 'Welcome');
 * await submit();
 * expect(onSubmit).toHaveBeenCalledWith({ subject: 'Welcome' });
 */
export function renderDynamicForm<TFormData, TSubmitData>(opts: RenderDynamicFormOptions<TFormData, TSubmitData>): RenderDynamicFormResult {
  const onSubmit = opts.onSubmit ?? jest.fn();
  const onError = opts.onError ?? jest.fn();
  const user = userEvent.setup();
  const children = opts.children ?? (
    <button type="submit" data-testid="rdf-submit">
      {DEFAULT_SUBMIT_LABEL}
    </button>
  );
  const rtl = render(
    <DynamicForm
      schema={opts.schema}
      uiSchema={opts.uiSchema}
      zodSchema={opts.zodSchema}
      formData={opts.formData}
      fields={opts.fields}
      widgets={opts.widgets}
      templates={opts.templates}
      formContext={opts.formContext}
      onChange={opts.onChange}
      onSubmit={onSubmit}
      onError={onError}
      disabled={opts.disabled}
      readOnly={opts.readOnly}
    >
      {children}
    </DynamicForm>,
  );
  return {
    rtl,
    user,
    onSubmit,
    onError,
    submit: async () => {
      await user.click(rtl.getByTestId('rdf-submit'));
    },
  };
}

/**
 * Pass-through Zod schema for tests that do not care about parsing.
 *
 * @example
 * renderDynamicForm({ ..., zodSchema: passthroughZod<{ subject: string }>() });
 */
export const passthroughZod = <T,>() => ({ safeParse: (v: T) => ({ success: true as const, data: v }) }) as unknown as z.ZodType<T, z.ZodTypeDef, T>;

export { screen, within, act, fireEvent };

/**
 * Build a single-property `RJSFSchema` for fixture tests.
 *
 * @example
 * buildSingleFieldSchema('subject', { type: 'string', title: 'Subject' }, true);
 */
export const buildSingleFieldSchema = (fieldName: string, fieldSchema: RJSFSchema, required = false): RJSFSchema => ({
  type: 'object',
  ...(required ? { required: [fieldName] } : {}),
  properties: { [fieldName]: fieldSchema },
});

/**
 * Build a single-property `UiSchema` for fixture tests.
 *
 * @example
 * buildSingleFieldUiSchema('subject', { 'ui:widget': 'text', 'ui:placeholder': '…' });
 */
export const buildSingleFieldUiSchema = (fieldName: string, ui: UiSchema[string]): UiSchema => ({ [fieldName]: ui });
