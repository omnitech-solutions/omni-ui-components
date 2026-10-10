import '@testing-library/jest-dom';
import type { RJSFSchema } from '@rjsf/utils';
import { z } from 'zod';
import type { OmniRjsfAction } from '../lib/formContext';
import { renderDynamicForm, screen } from './testing/renderDynamicForm';

const schema: RJSFSchema = {
  type: 'object',
  properties: { quick_actions: { type: 'string', title: 'Quick actions' } },
};
const zodSchema = z.object({ quick_actions: z.string().optional() });
const uiSchema = {
  quick_actions: {
    'ui:widget': 'iconToolbar',
    'ui:options': {
      // Plain data: a key and a look. No function and no icon name sits in the schema.
      actions: [
        { actionKey: 'duplicate', variant: 'ghost' },
        { actionKey: 'remove' },
        { actionKey: 'help' },
        { actionKey: 'notSupplied' },
      ],
    },
  },
};

const actions = (onSelect: jest.Mock): Record<string, OmniRjsfAction> => ({
  duplicate: {
    actionId: 'duplicate',
    label: 'Duplicate',
    href: null,
    icon: <svg data-testid="duplicate-icon" />,
    onSelect,
  },
  remove: { actionId: 'remove', label: 'Delete', href: null, onSelect },
  help: { actionId: 'help', label: 'Help', href: '/help' },
});

const formContext = (onSelect: jest.Mock) => ({
  optionSets: {},
  locale: 'en',
  derived: {},
  actions: actions(onSelect),
});

describe('DynamicForm: IconToolbarWidget', () => {
  it('draws each action the host supplied, by key: an icon button, a text button and a link', () => {
    renderDynamicForm({
      schema,
      uiSchema,
      zodSchema,
      formData: {},
      formContext: formContext(jest.fn()),
    });
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('data-slot', 'icon-toolbar');
    expect(screen.getByRole('button', { name: 'Duplicate' })).toHaveAttribute(
      'data-slot',
      'icon-button',
    );
    expect(screen.getByTestId('duplicate-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Help' })).toHaveAttribute('href', '/help');
    // A key the host did not supply is not drawn.
    expect(toolbar.querySelectorAll('button, a')).toHaveLength(3);
  });

  it('calls the host with the action by reference and never navigates itself', async () => {
    const onSelect = jest.fn();
    const context = formContext(onSelect);
    const { user } = renderDynamicForm({
      schema,
      uiSchema,
      zodSchema,
      formData: {},
      formContext: context,
    });
    await user.click(screen.getByRole('button', { name: 'Duplicate' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toBe(context.actions.duplicate);
  });

  it('ignores entries that are not plain action data', () => {
    renderDynamicForm({
      schema,
      uiSchema: {
        quick_actions: {
          'ui:widget': 'iconToolbar',
          'ui:options': { actions: [{ icon: 'trash', label: 'Old shape' }, 'nope', null] },
        },
      },
      zodSchema,
      formData: {},
      formContext: formContext(jest.fn()),
    });
    expect(screen.getByRole('toolbar').children).toHaveLength(0);
  });

  it('disables every button when the form is disabled or read-only', () => {
    renderDynamicForm({
      schema,
      uiSchema,
      zodSchema,
      formData: {},
      formContext: formContext(jest.fn()),
      disabled: true,
    });
    for (const button of screen.getAllByRole('button').filter((b) => b.closest('[role="toolbar"]')))
      expect(button).toBeDisabled();
  });
});
