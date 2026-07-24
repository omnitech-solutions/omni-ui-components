import type { RJSFSchema, RegistryFieldsType, RegistryWidgetsType, TemplatesType, UiSchema } from '@rjsf/utils';
import type { z } from 'zod';

/**
 * Re-export the canonical `FormError` shape owned by `omni-ui-components/Form`.
 * `DynamicForm` and the vanilla `Form` share the same submit-time error contract;
 * the RJSF adapter only adds `source: 'ajv'` for render-time JSON Schema errors.
 */
export type { FormError } from '@oc-tech/omni-ui-components';

/**
 * Canonical Omni wrapper around an RJSF render contract plus a Zod parser
 * that gates submit. Feature schema modules export one of these per form and
 * pass it to `<DynamicForm>`.
 *
 * @example
 * export const automationFormSchema: AppFormSchema<AutomationFormData, AutomationSubmitData> = {
 *   id: 'automation.modal',
 *   schema,
 *   uiSchema,
 *   zodSchema: submitSchema,
 *   defaultFormData,
 *   fields: { scheduleConfiguration: ScheduleConfigurationField },
 *   widgets: { currency: CurrencyWidget },
 *   formContext: { info },
 *   toFormData: (api) => api,
 *   toSubmitPayload: (parsed) => ({ automation: parsed }),
 * };
 */
export type AppFormSchema<TFormData, TSubmitData = TFormData> = {
  id: string;
  schema: RJSFSchema;
  uiSchema?: UiSchema;
  zodSchema: z.ZodType<TSubmitData>;
  defaultFormData?: TFormData;
  fields?: RegistryFieldsType;
  widgets?: RegistryWidgetsType;
  templates?: Partial<TemplatesType>;
  formContext?: Record<string, unknown>;
  toFormData?: (input: unknown) => TFormData;
  toSubmitPayload?: (data: TSubmitData) => unknown;
};
