import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { Copy, Trash2, X } from 'lucide-react';
import { z } from 'zod';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';
import type { OmniRjsfAction, OmniRjsfFormContext } from '../../lib/formContext';

export interface QuickActionsFormData {
  quick_actions?: string;
}

type QuickActionsFixture = FormFixture<QuickActionsFormData> & {
  formContext: Omit<OmniRjsfFormContext, 'derived'>;
  derive: () => Record<string, unknown>;
};

const QUICK_ACTIONS_SCHEMA: RJSFSchema = {
  type: 'object',
  properties: {
    quick_actions: {
      type: 'string',
      title: 'Quick actions',
      description: 'Actions of the form. The schema names them; the host supplies them.',
    },
  },
};

const QUICK_ACTIONS_ZOD = z.object({
  quick_actions: z.string().optional(),
}) as unknown as z.ZodType<QuickActionsFormData>;

/** What the host supplies: words, icon nodes and what each action does. None of it is in the schema. */
const quickActions = (): Record<string, OmniRjsfAction> => ({
  duplicate: {
    actionId: 'duplicate',
    label: 'Duplicate',
    href: null,
    icon: <Copy />,
    onSelect: () => undefined,
  },
  clear: { actionId: 'clear', label: 'Clear', href: null, icon: <X />, onSelect: () => undefined },
  remove: {
    actionId: 'remove',
    label: 'Delete',
    href: null,
    icon: <Trash2 />,
    onSelect: () => undefined,
  },
  help: { actionId: 'help', label: 'Help', href: '#help' },
});

const fixtureFor = (uiSchema: UiSchema): QuickActionsFixture => ({
  schema: QUICK_ACTIONS_SCHEMA,
  uiSchema,
  zodSchema: QUICK_ACTIONS_ZOD,
  defaults: {},
  formContext: { optionSets: {}, locale: 'en', actions: quickActions() },
  derive: () => ({}),
});

export const plainQuickActionsFixture = (): QuickActionsFixture =>
  fixtureFor({
    quick_actions: {
      'ui:widget': 'iconToolbar',
      'ui:options': {
        actions: [
          { actionKey: 'duplicate', variant: 'ghost' },
          { actionKey: 'clear', variant: 'ghost' },
          { actionKey: 'remove' },
        ],
      },
    },
  });

export const withLinkQuickActionsFixture = (): QuickActionsFixture =>
  fixtureFor({
    quick_actions: {
      'ui:widget': 'iconToolbar',
      'ui:options': { actions: [{ actionKey: 'remove' }, { actionKey: 'help' }] },
    },
  });
