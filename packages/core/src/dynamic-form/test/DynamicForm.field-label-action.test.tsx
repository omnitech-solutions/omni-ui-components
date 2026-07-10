import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { z } from 'zod';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';

import { DynamicForm } from 'dynamic-form';
import { buildFormContext } from 'dynamic-form/lib/formContext';

describe('DynamicForm — FieldTemplate label action slot', () => {
  const schema: RJSFSchema = { type: 'object', properties: { taskId: { type: 'string', title: 'Task' } } };
  const zodSchema = z.object({ taskId: z.string().optional() }) as never;

  it('renders an anchor when labelAction has an href', () => {
    const uiSchema: UiSchema = { taskId: { 'ui:widget': 'text', 'ui:options': { labelActionKey: 'viewTask' } } };
    const formContext = buildFormContext(
      { optionSets: {}, actions: { viewTask: { label: 'View Task', href: '/tasks/abc', actionId: 'viewTask' } }, locale: 'en' },
      {},
    );

    render(
      <DynamicForm schema={schema} uiSchema={uiSchema} zodSchema={zodSchema} formData={{ taskId: 'abc' }} formContext={formContext} onSubmit={jest.fn()} />,
    );

    const action = screen.getByTestId('root_taskId-label-action');
    expect(action.tagName).toBe('A');
    expect(action).toHaveAttribute('href', '/tasks/abc');
    expect(action).toHaveTextContent('View Task');
  });

  it('renders a span when labelAction has no href', () => {
    const uiSchema: UiSchema = { taskId: { 'ui:widget': 'text', 'ui:options': { labelActionKey: 'viewTask' } } };
    const formContext = buildFormContext({ optionSets: {}, actions: { viewTask: { label: 'View Task', href: null, actionId: 'viewTask' } }, locale: 'en' }, {});

    render(
      <DynamicForm schema={schema} uiSchema={uiSchema} zodSchema={zodSchema} formData={{ taskId: 'abc' }} formContext={formContext} onSubmit={jest.fn()} />,
    );

    const action = screen.getByTestId('root_taskId-label-action');
    expect(action.tagName).toBe('SPAN');
    expect(action).toHaveTextContent('View Task');
  });

  it('renders no label action when no labelActionKey is set', () => {
    const uiSchema: UiSchema = { taskId: { 'ui:widget': 'text' } };
    render(<DynamicForm schema={schema} uiSchema={uiSchema} zodSchema={zodSchema} formData={{ taskId: 'abc' }} onSubmit={jest.fn()} />);
    expect(screen.queryByTestId('root_taskId-label-action')).toBeNull();
  });

  it('renders no label action when key is set but action is missing from formContext', () => {
    const uiSchema: UiSchema = { taskId: { 'ui:widget': 'text', 'ui:options': { labelActionKey: 'missing' } } };
    const formContext = buildFormContext({ optionSets: {}, actions: {}, locale: 'en' }, {});
    render(
      <DynamicForm schema={schema} uiSchema={uiSchema} zodSchema={zodSchema} formData={{ taskId: 'abc' }} formContext={formContext} onSubmit={jest.fn()} />,
    );
    expect(screen.queryByTestId('root_taskId-label-action')).toBeNull();
  });
});
