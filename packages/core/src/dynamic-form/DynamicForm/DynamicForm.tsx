import * as React from 'react';
import RjsfForm from '@rjsf/shadcn';
import { Templates as ShadcnTemplates, Widgets as ShadcnWidgets } from '@rjsf/shadcn';
import type { ErrorSchema, RegistryFieldsType, RegistryWidgetsType, RJSFSchema, TemplatesType, UiSchema } from '@rjsf/utils';
import { deepEquals } from '@rjsf/utils';
import ajvValidator from '@rjsf/validator-ajv8';
import type { z } from 'zod';

import { Form } from '@omnitech/omni-ui-core';
import type { FormError } from '../appFormSchema';
import { appFields } from '../registries/fields';
import { appWidgets } from '../registries/widgets';
import { appTemplates } from '../registries/templates';

/**
 * Props for {@link DynamicForm}. `onSubmit` only runs when Zod parsing of
 * the current `formData` succeeds; failures map into RJSF `extraErrors`
 * (inline display) and call `onError` with `source: 'zod'`. Callback
 * throws / rejections surface through `onError` with `source: 'api'`.
 */
export interface DynamicFormProps<TFormData, TSubmitData> {
  schema: RJSFSchema;
  uiSchema?: UiSchema;
  zodSchema: z.ZodType<TSubmitData>;
  formData?: TFormData;
  fields?: RegistryFieldsType;
  widgets?: RegistryWidgetsType;
  templates?: Partial<TemplatesType>;
  formContext?: Record<string, unknown>;
  onChange?: (next: TFormData) => void;
  onSubmit: (parsed: TSubmitData) => void | Promise<void>;
  onError?: (errors: FormError[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  children?: React.ReactNode;
}

/** Translate Omni's flat `FormError[]` into RJSF's nested `ErrorSchema`. */
const formErrorsToExtraErrors = (errors: FormError[]): ErrorSchema => {
  const acc: ErrorSchema = {};
  for (const err of errors) {
    let cursor: ErrorSchema = acc;
    for (const segment of err.path) {
      const existing = (cursor as Record<string, unknown>)[segment] as ErrorSchema | undefined;
      const next = existing ?? ({} as ErrorSchema);
      (cursor as Record<string, unknown>)[segment] = next;
      cursor = next;
    }
    const arr = (cursor as { __errors?: string[] }).__errors ?? [];
    arr.push(err.message);
    (cursor as { __errors?: string[] }).__errors = arr;
  }
  return acc;
};

/**
 * RJSF rendering bridge. Mounted inside Omni `<Form>` as a `tagName="div"`
 * subtree so the outer `<form>` element + submit pipeline belongs to Omni
 * Form. RJSF stays in controlled mode: `formData` flows down from TanStack
 * state, `onChange` flows back up via `form.reset`.
 */
/**
 * The outer Omni `<Form>` owns the actual `<form>` element + submit. RJSF
 * provides field rendering + ajv inline validation. We pass `tagName="div"`
 * so RJSF skips its own form wrapper, and merge `submitButton: { norender }`
 * into uiSchema so RJSF's default submit button does not render.
 */
const noopSubmitUiSchema: UiSchema = {
  'ui:submitButtonOptions': { norender: true },
};

function RjsfBridge({
  form,
  schema,
  uiSchema,
  fields,
  widgets,
  templates,
  formContext,
  extraErrors,
  disabled,
  readOnly,
}: {
  form: any;
  schema: RJSFSchema;
  uiSchema?: UiSchema;
  fields: RegistryFieldsType;
  widgets: RegistryWidgetsType;
  templates: Partial<TemplatesType>;
  formContext?: Record<string, unknown>;
  extraErrors?: ErrorSchema;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  /* Controlled bridge: Omni `<Form>` owns canonical state via
   * `form.state.values`. RJSF receives the *current* values on every render
   * instead of a one-time mount snapshot, so derived state (computed from
   * `formData` in the parent or story shell) recomputes correctly and the
   * parent can reset / hydrate `formData` after mount. RJSF onChange still
   * mirrors back into Omni form via `setFieldValue` below. */
  const mergedUiSchema = React.useMemo<UiSchema>(() => ({ ...(uiSchema ?? {}), ...noopSubmitUiSchema }), [uiSchema]);
  return (
    <RjsfForm
      tagName="div"
      schema={schema}
      uiSchema={mergedUiSchema}
      formData={form.state.values}
      validator={ajvValidator}
      fields={fields}
      widgets={widgets}
      templates={templates as TemplatesType}
      formContext={formContext}
      extraErrors={extraErrors}
      disabled={disabled}
      readonly={readOnly}
      showErrorList={false}
      noHtml5Validate
      onChange={(e) => {
        const next = e.formData ?? {};
        for (const key of Object.keys(next)) {
          form.setFieldValue(key, next[key]);
        }
      }}
    />
  );
}

/**
 * Omni RJSF facade. Composes `omni-ui-components/Form` as the outer
 * root (form element, Zod-gated submit, FormError plumbing) with the
 * `@rjsf/shadcn` rendering tree as a `tagName="div"` child. Single submit
 * contract — there is only one form element, owned by Omni Form.
 *
 * Layout uses `@rjsf/shadcn` conventions: flat `ui:rows: string[][]` or the
 * full `ui:layoutGrid` / `LayoutGridField` pattern.
 *
 * @example
 * <DynamicForm
 *   schema={schema}
 *   uiSchema={uiSchema}
 *   zodSchema={zodSchema}
 *   formData={formData}
 *   onSubmit={(parsed) => save(parsed)}
 *   onError={(errors) => setErrors(errors)}
 * >
 *   <Button type="submit">Save</Button>
 * </DynamicForm>
 */
function DynamicFormImpl<TFormData extends Record<string, unknown>, TSubmitData>(props: DynamicFormProps<TFormData, TSubmitData>): JSX.Element {
  const { schema, uiSchema, zodSchema, formData, fields, widgets, templates, formContext, onChange, onSubmit, onError, disabled, readOnly, children } = props;

  const [extraErrors, setExtraErrors] = React.useState<ErrorSchema | undefined>(undefined);

  const handleError = React.useCallback(
    (errors: FormError[]) => {
      const zodErrors = errors.filter((e) => e.source === 'zod');
      if (zodErrors.length) setExtraErrors(formErrorsToExtraErrors(zodErrors));
      onError?.(errors);
    },
    [onError],
  );

  const handleChange = React.useCallback(
    (next: TFormData) => {
      setExtraErrors((prev) => (prev ? undefined : prev));
      onChange?.(next);
    },
    [onChange],
  );

  const mergedFields = React.useMemo(() => ({ ...appFields, ...(fields ?? {}) }), [fields]);
  const mergedWidgets = React.useMemo(() => ({ ...ShadcnWidgets, ...appWidgets, ...(widgets ?? {}) }), [widgets]);
  const mergedTemplates = React.useMemo(() => ({ ...ShadcnTemplates, ...appTemplates, ...(templates ?? {}) }), [templates]);

  return (
    <Form zodSchema={zodSchema} formData={formData} onChange={handleChange} onSubmit={onSubmit} onError={handleError} disabled={disabled} readOnly={readOnly}>
      {(form: any) => (
        <>
          <RjsfBridge
            form={form}
            schema={schema}
            uiSchema={uiSchema}
            fields={mergedFields}
            widgets={mergedWidgets}
            templates={mergedTemplates}
            formContext={formContext}
            extraErrors={extraErrors}
            disabled={disabled}
            readOnly={readOnly}
          />
          {children}
        </>
      )}
    </Form>
  );
}

/** Cheap-first equality: `Object.is` short-circuit, fall back to RJSF's `deepEquals`. */
const same = (a: unknown, b: unknown): boolean => Object.is(a, b) || deepEquals(a, b);

/**
 * Form-root memo guard. Handler refs and `zodSchema` are bridged through
 * `useRef` inside Omni Form, so they are intentionally NOT in the equality
 * check. Registries compare by reference — declare at module scope or memoize.
 */
const dynamicFormPropsEqual = <TFormData, TSubmitData>(
  prev: DynamicFormProps<TFormData, TSubmitData>,
  next: DynamicFormProps<TFormData, TSubmitData>,
): boolean =>
  same(prev.formData, next.formData) &&
  same(prev.schema, next.schema) &&
  same(prev.uiSchema, next.uiSchema) &&
  prev.disabled === next.disabled &&
  prev.readOnly === next.readOnly &&
  prev.children === next.children &&
  prev.fields === next.fields &&
  prev.widgets === next.widgets &&
  prev.templates === next.templates &&
  same(prev.formContext, next.formContext);

export const DynamicForm = React.memo(
  DynamicFormImpl,
  dynamicFormPropsEqual as (
    prev: Readonly<DynamicFormProps<Record<string, unknown>, unknown>>,
    next: Readonly<DynamicFormProps<Record<string, unknown>, unknown>>,
  ) => boolean,
) as typeof DynamicFormImpl;
