import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface QuickActionsFormData {
  quick_actions?: string;
}

const QUICK_ACTIONS_SCHEMA: RJSFSchema = {
  type: 'object',
  properties: {
    quick_actions: {
      type: 'string',
      title: 'Quick actions',
      description: 'Omni IconButtons via the iconToolbar widget.',
    },
  },
};

const QUICK_ACTIONS_ZOD = z.object({ quick_actions: z.string().optional() }) as unknown as z.ZodType<QuickActionsFormData>;

const fixtureFor = (uiSchema: UiSchema): FormFixture<QuickActionsFormData> => ({
  schema: QUICK_ACTIONS_SCHEMA,
  uiSchema,
  zodSchema: QUICK_ACTIONS_ZOD,
  defaults: {},
});

export const plainQuickActionsFixture = (): FormFixture<QuickActionsFormData> =>
  fixtureFor({
    quick_actions: {
      'ui:widget': 'iconToolbar',
      'ui:options': {
        actions: [
          { icon: 'move-up', label: 'Move up', variant: 'ghost' },
          { icon: 'move-down', label: 'Move down', variant: 'ghost' },
          { icon: 'copy', label: 'Duplicate', variant: 'ghost' },
          { icon: 'x', label: 'Clear', variant: 'ghost' },
          { icon: 'trash', label: 'Delete' },
        ],
      },
    },
  });

export const destructiveOnlyQuickActionsFixture = (): FormFixture<QuickActionsFormData> =>
  fixtureFor({
    quick_actions: {
      'ui:widget': 'iconToolbar',
      'ui:options': {
        actions: [{ icon: 'trash', label: 'Delete this thing' }],
      },
    },
  });
