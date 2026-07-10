import '@testing-library/jest-dom';
import { z } from 'zod';
import type { RJSFSchema } from '@rjsf/utils';

import { renderDynamicForm } from './testing/renderDynamicForm';

const toolbarSchema = (): RJSFSchema => ({
  type: 'object',
  properties: {
    quick_actions: { type: 'string', title: 'Quick actions' },
  },
});

describe('DynamicForm — IconToolbarWidget', () => {
  it('renders one IconButton per action declared in ui:options.actions', () => {
    renderDynamicForm({
      schema: toolbarSchema(),
      uiSchema: {
        quick_actions: {
          'ui:widget': 'iconToolbar',
          'ui:options': {
            actions: [
              { icon: 'move-up', label: 'Move up', variant: 'ghost' },
              { icon: 'copy', label: 'Duplicate', variant: 'ghost' },
              { icon: 'trash', label: 'Delete' },
            ],
          },
        },
      },
      zodSchema: z.object({ quick_actions: z.string().optional() }),
      formData: {},
    });

    const toolbar = document.querySelector('[data-slot="icon-toolbar"]');
    expect(toolbar).toBeInTheDocument();

    const buttons = toolbar?.querySelectorAll('button[data-slot="icon-button"]') ?? [];
    expect(buttons.length).toBe(3);
  });

  it('routes Trash2 actions to the destructive variant automatically', () => {
    renderDynamicForm({
      schema: toolbarSchema(),
      uiSchema: {
        quick_actions: {
          'ui:widget': 'iconToolbar',
          'ui:options': {
            actions: [{ icon: 'trash', label: 'Delete' }],
          },
        },
      },
      zodSchema: z.object({ quick_actions: z.string().optional() }),
      formData: {},
    });

    const trash = document.querySelector('[data-slot="icon-toolbar"] button[data-slot="icon-button"]');
    expect(trash).toHaveAttribute('data-variant', 'destructive');
    expect(trash).toHaveAttribute('aria-label', 'Delete');
  });

  it('disables every button when the form is disabled', () => {
    renderDynamicForm({
      schema: toolbarSchema(),
      uiSchema: {
        quick_actions: {
          'ui:widget': 'iconToolbar',
          'ui:options': {
            actions: [
              { icon: 'copy', label: 'Copy', variant: 'ghost' },
              { icon: 'trash', label: 'Delete' },
            ],
          },
        },
      },
      zodSchema: z.object({ quick_actions: z.string().optional() }),
      formData: {},
      disabled: true,
    });

    const buttons = document.querySelectorAll('[data-slot="icon-toolbar"] button[data-slot="icon-button"]');
    expect(buttons.length).toBe(2);
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });
});
