import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { z } from 'zod';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface TransferFormData {
  f?: unknown;
}

type TransferFixture = FormFixture<TransferFormData>;

const FIELD: RJSFSchema = {
  type: 'array',
  title: 'Teams',
  description: 'Move the teams that take part.',
  uniqueItems: true,
  items: { type: 'string', enum: ['Design', 'Engineering', 'Finance', 'Operations'] },
};
const ZOD = z.object({ f: z.any() }) as unknown as z.ZodType<TransferFormData>;

const fixtureFor = (uiSchema: UiSchema, required = false): TransferFixture => ({
  schema: { type: 'object', ...(required ? { required: ['f'] } : {}), properties: { f: FIELD } },
  uiSchema,
  zodSchema: ZOD,
  defaults: { f: ['Finance'] },
});

export const plainTransferFixture = (): TransferFixture =>
  fixtureFor({ f: { 'ui:widget': 'transfer' } });
export const requiredTransferFixture = (): TransferFixture =>
  fixtureFor({ f: { 'ui:widget': 'transfer' } }, true);
export const disabledTransferFixture = (): TransferFixture =>
  fixtureFor({ f: { 'ui:widget': 'transfer', 'ui:disabled': true } });
export const readOnlyTransferFixture = (): TransferFixture =>
  fixtureFor({ f: { 'ui:widget': 'transfer', 'ui:readonly': true } });
export const searchableTransferFixture = (): TransferFixture =>
  fixtureFor({ f: { 'ui:widget': 'transfer', 'ui:options': { searchable: true } } });
export const oneWayTransferFixture = (): TransferFixture =>
  fixtureFor({ f: { 'ui:widget': 'transfer', 'ui:options': { oneWay: true } } });
