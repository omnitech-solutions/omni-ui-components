import { z } from 'zod';
import type { RJSFSchema } from '@rjsf/utils';

import type { DynamicFormFixture } from '../DynamicForm/DynamicForm.factories';

/**
 * Fixtures exercising the template + field enhancements shipped in
 * PR 4: collapsible ObjectFieldTemplate, FieldTemplate labelAction
 * slot, and the StaticPanelField. Used by the
 * `dynamic-form/templates/*` stories.
 */

/* -------------------------------------------------------------------------- */
/* Collapsible ObjectFieldTemplate                                              */
/* -------------------------------------------------------------------------- */

export interface CollapsibleFormData {
  name: string;
  additionalFields: { project: string; note: string };
}
const COLLAPSIBLE_SCHEMA: RJSFSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name' },
    additionalFields: {
      type: 'object',
      title: 'Additional Fields',
      properties: { project: { type: 'string', title: 'Project' }, note: { type: 'string', title: 'Note' } },
    },
  },
};
const COLLAPSIBLE_ZOD = z.object({
  name: z.string().optional().default(''),
  additionalFields: z.object({ project: z.string().optional().default(''), note: z.string().optional().default('') }),
}) as unknown as z.ZodType<CollapsibleFormData>;

export const collapsibleClosedFixture = (): DynamicFormFixture<CollapsibleFormData, Record<string, string>> => ({
  schema: COLLAPSIBLE_SCHEMA,
  uiSchema: {
    additionalFields: {
      'ui:options': { collapsible: { title: 'Additional Fields', defaultOpen: false } },
      note: { 'ui:widget': 'textarea' },
    },
  },
  zodSchema: COLLAPSIBLE_ZOD,
  defaults: { name: '', additionalFields: { project: '', note: '' } },
  derive: () => ({}),
  formContext: { optionSets: {}, actions: {}, locale: 'en-GB' },
});

export const collapsibleOpenFixture = (): DynamicFormFixture<CollapsibleFormData, Record<string, string>> => ({
  ...collapsibleClosedFixture(),
  uiSchema: {
    additionalFields: {
      'ui:options': { collapsible: { title: 'Additional Fields', defaultOpen: true } },
      note: { 'ui:widget': 'textarea' },
    },
  },
});

/* -------------------------------------------------------------------------- */
/* FieldTemplate labelAction slot                                               */
/* -------------------------------------------------------------------------- */

export interface LabelActionFormData {
  taskId: string;
}
const LABEL_ACTION_SCHEMA: RJSFSchema = { type: 'object', properties: { taskId: { type: 'string', title: 'Task' } } };
const LABEL_ACTION_ZOD = z.object({ taskId: z.string().optional().default('') }) as unknown as z.ZodType<LabelActionFormData>;

export const labelActionLinkFixture = (): DynamicFormFixture<LabelActionFormData, Record<string, string>> => ({
  schema: LABEL_ACTION_SCHEMA,
  uiSchema: { taskId: { 'ui:widget': 'text', 'ui:options': { labelActionKey: 'viewTask' } } },
  zodSchema: LABEL_ACTION_ZOD,
  defaults: { taskId: 'task-123' },
  derive: () => ({}),
  formContext: {
    optionSets: {},
    actions: { viewTask: { label: 'View Task', href: '/tasks/task-123', actionId: 'viewTask' } },
    locale: 'en-GB',
  },
});

export const labelActionSpanFixture = (): DynamicFormFixture<LabelActionFormData, Record<string, string>> => ({
  ...labelActionLinkFixture(),
  formContext: {
    optionSets: {},
    actions: { viewTask: { label: 'View Task', href: null, actionId: 'viewTask' } },
    locale: 'en-GB',
  },
});

/* -------------------------------------------------------------------------- */
/* StaticPanelField — non-input timer/header                                    */
/* -------------------------------------------------------------------------- */

export interface StaticPanelFormData {
  notes: string;
}
const STATIC_PANEL_SCHEMA: RJSFSchema = {
  type: 'object',
  properties: { header: { type: 'string', title: '', readOnly: true }, notes: { type: 'string', title: 'Notes' } },
};
const STATIC_PANEL_ZOD = z.object({ notes: z.string().optional().default('') }) as unknown as z.ZodType<StaticPanelFormData>;

interface StaticPanelDerived {
  durationLabel: string;
  dateLabel: string;
  statusLabel: string;
  [key: string]: string;
}

export const staticPanelFixture = (): DynamicFormFixture<StaticPanelFormData, StaticPanelDerived> => ({
  schema: STATIC_PANEL_SCHEMA,
  uiSchema: {
    'ui:rows': [[{ value: 'header', span: 2 }], [{ value: 'notes', span: 2 }]],
    header: { 'ui:field': 'staticPanel', 'ui:options': { panelKey: 'durationLabel', lines: ['dateLabel', 'statusLabel'] } },
    notes: { 'ui:widget': 'textarea', 'ui:placeholder': 'What are you working on?' },
  },
  zodSchema: STATIC_PANEL_ZOD,
  defaults: { notes: '' },
  derive: () => ({ durationLabel: '12h 21m 32s', dateLabel: 'Thu, Jun 11, 2026', statusLabel: 'Unbilled' }),
  formContext: { optionSets: {}, actions: {}, locale: 'en-GB' },
});
