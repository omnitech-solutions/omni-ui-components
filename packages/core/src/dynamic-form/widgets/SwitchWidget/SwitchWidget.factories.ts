import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface NotifyFormData {
  notify: boolean;
}

const SCHEMA: RJSFSchema = {
  type: 'object',
  properties: { notify: { type: 'boolean', title: 'Email notifications' } },
};

const ZOD = z.object({ notify: z.boolean() }) as unknown as z.ZodType<NotifyFormData>;

const fixtureFor = (uiSchema: UiSchema, opts: { initial?: boolean } = {}): FormFixture<NotifyFormData> => ({
  schema: SCHEMA,
  uiSchema,
  zodSchema: ZOD,
  defaults: { notify: opts.initial ?? false },
});

export const plainNotifyFixture = (): FormFixture<NotifyFormData> => fixtureFor({ notify: { 'ui:widget': 'switch' } });
export const prefilledNotifyFixture = (): FormFixture<NotifyFormData> => fixtureFor({ notify: { 'ui:widget': 'switch' } }, { initial: true });
export const disabledNotifyFixture = (): FormFixture<NotifyFormData> => fixtureFor({ notify: { 'ui:widget': 'switch', 'ui:disabled': true } });
