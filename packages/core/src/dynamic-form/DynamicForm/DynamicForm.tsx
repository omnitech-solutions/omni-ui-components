import { Form } from '@oc-tech/omni-ui-components';
import RjsfForm, { Templates as ShadcnTemplates, Widgets as ShadcnWidgets } from '@rjsf/shadcn';
import type {
  ErrorSchema,
  RegistryFieldsType,
  RegistryWidgetsType,
  RJSFSchema,
  TemplatesType,
  UiSchema,
} from '@rjsf/utils';
import { deepEquals } from '@rjsf/utils';
import ajvValidator from '@rjsf/validator-ajv8';
import * as React from 'react';
import type { z } from 'zod';
import type { FormError } from '../appFormSchema';
import type { OmniUiSchema } from '../lib/formContext';
import { focusFieldIn } from '../lib/widgetKit';
import { appFields } from '../registries/fields';
import { appTemplates } from '../registries/templates';
import { appWidgets } from '../registries/widgets';

/** What a host can ask of a mounted {@link DynamicForm} through `apiRef`. */
export interface DynamicFormHandle {
  /**
   * Moves focus to a field by its key: `'email'`, `'address.city'` or `['address', 'city']`. A host uses it to go
   * from a preview, an outline or an error summary to the field. Returns false when the form has no such field.
   */
  focusField: (path: string | readonly string[]) => boolean;
}

/**
 * Props for {@link DynamicForm}. `onSubmit` only runs when Zod parsing of
 * the current `formData` succeeds; failures map into RJSF `extraErrors`
 * (inline display) and call `onError` with `source: 'zod'`. Callback
 * throws / rejections surface through `onError` with `source: 'api'`.
 */
export interface DynamicFormProps<TFormData, TSubmitData> {
  schema: RJSFSchema;
  uiSchema?: UiSchema | OmniUiSchema;
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
  /**
   * Prefix of every field id (`<idPrefix>_<field>`), and so of the labels' `for` and of `aria-describedby`.
   * Default `root`. Give each form its own when two forms share a screen, or their ids collide.
   */
  idPrefix?: string;
  /**
   * Errors the server returned, drawn through the same display as validation errors: an empty `path` is a
   * form-level error (drawn once for the whole form), any other path lands under its field. They are hidden as soon as the
   * person changes a value; pass a new array to show errors again.
   */
  serverErrors?: FormError[];
  /** Focus entered a field (from outside the form or from another field). `key` is its path: `email`, `address.city`. */
  onFieldFocus?: (key: string) => void;
  /** Focus left a field. A host saves on it, or stops highlighting a preview. */
  onFieldBlur?: (key: string) => void;
  /** A ref the form fills with its {@link DynamicFormHandle} (`focusField`). */
  apiRef?: React.Ref<DynamicFormHandle>;
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

/** Both error trees in one: messages of the same field are listed together. */
const mergeErrorSchemas = (a: ErrorSchema, b: ErrorSchema): ErrorSchema => {
  const out: Record<string, unknown> = { ...(a as Record<string, unknown>) };
  for (const [key, value] of Object.entries(b as Record<string, unknown>)) {
    if (key === '__errors')
      out.__errors = [...((out.__errors as string[] | undefined) ?? []), ...(value as string[])];
    else
      out[key] = out[key]
        ? mergeErrorSchemas(out[key] as ErrorSchema, value as ErrorSchema)
        : value;
  }
  return out as ErrorSchema;
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
  idPrefix,
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
  idPrefix?: string;
}) {
  /* Controlled bridge: Omni `<Form>` owns canonical state via
   * `form.state.values`. RJSF receives the *current* values on every render
   * instead of a one-time mount snapshot, so derived state (computed from
   * `formData` in the parent or story shell) recomputes correctly and the
   * parent can reset / hydrate `formData` after mount. RJSF onChange still
   * mirrors back into Omni form via `setFieldValue` below. */
  const mergedUiSchema = React.useMemo<UiSchema>(
    () => ({ ...uiSchema, ...noopSubmitUiSchema }),
    [uiSchema],
  );
  return (
    <RjsfForm
      tagName="div"
      idPrefix={idPrefix}
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
        // A cleared field is absent from RJSF's data: it must be cleared here too, or the old value is submitted.
        for (const key of Object.keys(form.state.values ?? {})) {
          if (!(key in next) && form.state.values[key] !== undefined)
            form.setFieldValue(key, undefined);
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
function DynamicFormImpl<TFormData extends Record<string, unknown>, TSubmitData>(
  props: DynamicFormProps<TFormData, TSubmitData>,
): JSX.Element {
  const {
    schema,
    uiSchema,
    zodSchema,
    formData,
    fields,
    widgets,
    templates,
    formContext,
    onChange,
    onSubmit,
    onError,
    disabled,
    readOnly,
    apiRef,
    idPrefix,
    serverErrors,
    onFieldFocus,
    onFieldBlur,
    children,
  } = props;

  // The field a focus event belongs to, by the wrapper the field template draws (`data-field-key`).
  const fieldKeyOf = (node: EventTarget | null): string | undefined =>
    (node instanceof Element ? node.closest('[data-field-key]') : null)?.getAttribute(
      'data-field-key',
    ) ?? undefined;
  const handleFocus = (event: React.FocusEvent) => {
    const key = fieldKeyOf(event.target);
    if (key && key !== fieldKeyOf(event.relatedTarget)) onFieldFocus?.(key);
  };
  const handleBlur = (event: React.FocusEvent) => {
    const key = fieldKeyOf(event.target);
    if (key && key !== fieldKeyOf(event.relatedTarget)) onFieldBlur?.(key);
  };

  const fieldsRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(
    apiRef,
    () => ({
      focusField: (path) =>
        fieldsRef.current ? focusFieldIn(fieldsRef.current, path, idPrefix) : false,
    }),
    [idPrefix],
  );
  // The server errors the person has already answered by changing a value (by array identity).
  const [answered, setAnswered] = React.useState<FormError[] | undefined>(undefined);

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
      setAnswered(serverErrors);
      onChange?.(next);
    },
    [onChange, serverErrors],
  );
  const shownErrors = React.useMemo(() => {
    const fromServer = serverErrors?.length && serverErrors !== answered ? serverErrors : undefined;
    if (!fromServer) return extraErrors;
    const merged = formErrorsToExtraErrors(fromServer);
    return extraErrors ? mergeErrorSchemas(extraErrors, merged) : merged;
  }, [serverErrors, answered, extraErrors]);

  const mergedFields = React.useMemo(() => ({ ...appFields, ...fields }), [fields]);
  const mergedWidgets = React.useMemo(
    () => ({ ...ShadcnWidgets, ...appWidgets, ...widgets }),
    [widgets],
  );
  const mergedTemplates = React.useMemo(
    () => ({ ...ShadcnTemplates, ...appTemplates, ...templates }),
    [templates],
  );

  return (
    <Form
      zodSchema={zodSchema}
      formData={formData}
      onChange={handleChange}
      onSubmit={onSubmit}
      onError={handleError}
      disabled={disabled}
      readOnly={readOnly}
    >
      {(form: any) => (
        <>
          {/* `display: contents`: the wrapper is only a handle for `focusField`, it draws no box. */}
          <div
            ref={fieldsRef}
            data-slot="dynamic-form-fields"
            className="contents"
            onFocus={onFieldFocus ? handleFocus : undefined}
            onBlur={onFieldBlur ? handleBlur : undefined}
          >
            <RjsfBridge
              form={form}
              schema={schema}
              uiSchema={uiSchema as UiSchema | undefined}
              fields={mergedFields}
              widgets={mergedWidgets}
              templates={mergedTemplates}
              formContext={formContext}
              extraErrors={shownErrors}
              idPrefix={idPrefix}
              disabled={disabled}
              readOnly={readOnly}
            />
          </div>
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
  prev.apiRef === next.apiRef &&
  prev.idPrefix === next.idPrefix &&
  prev.serverErrors === next.serverErrors &&
  same(prev.formContext, next.formContext);

export const DynamicForm = React.memo(
  DynamicFormImpl,
  dynamicFormPropsEqual as (
    prev: Readonly<DynamicFormProps<Record<string, unknown>, unknown>>,
    next: Readonly<DynamicFormProps<Record<string, unknown>, unknown>>,
  ) => boolean,
) as typeof DynamicFormImpl;
