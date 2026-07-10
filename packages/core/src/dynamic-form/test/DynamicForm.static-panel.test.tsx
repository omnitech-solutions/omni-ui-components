import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { z } from 'zod';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';

import { DynamicForm } from 'dynamic-form';
import { buildFormContext } from 'dynamic-form/lib/formContext';

describe('DynamicForm — StaticPanelField (non-input display)', () => {
  const schema: RJSFSchema = {
    type: 'object',
    properties: {
      timer: { type: 'string', title: '', readOnly: true },
      name: { type: 'string', title: 'Name' },
    },
  };
  const zodSchema = z.object({ name: z.string().optional() }) as never;

  it('renders the panelKey value from formContext.derived as the heading block', () => {
    const uiSchema: UiSchema = {
      timer: { 'ui:field': 'staticPanel', 'ui:options': { panelKey: 'duration' } },
    };
    const formContext = buildFormContext({ optionSets: {}, actions: {}, locale: 'en' }, { duration: '12h 21m 32s' });

    render(
      <DynamicForm
        schema={schema}
        uiSchema={uiSchema}
        zodSchema={zodSchema}
        formData={{ timer: '', name: '' }}
        formContext={formContext}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByTestId('root_timer-panel-duration')).toHaveTextContent('12h 21m 32s');
  });

  it('renders an ordered list of derived lines via ui:options.lines', () => {
    const uiSchema: UiSchema = {
      timer: { 'ui:field': 'staticPanel', 'ui:options': { panelKey: 'duration', lines: ['dateLabel', 'statusLabel'] } },
    };
    const formContext = buildFormContext(
      { optionSets: {}, actions: {}, locale: 'en' },
      { duration: '12h 21m 32s', dateLabel: 'Thu, Jun 11, 2026', statusLabel: 'Unbilled' },
    );

    render(
      <DynamicForm
        schema={schema}
        uiSchema={uiSchema}
        zodSchema={zodSchema}
        formData={{ timer: '', name: '' }}
        formContext={formContext}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByTestId('root_timer-panel-duration')).toHaveTextContent('12h 21m 32s');
    expect(screen.getByTestId('root_timer-panel-dateLabel')).toHaveTextContent('Thu, Jun 11, 2026');
    expect(screen.getByTestId('root_timer-panel-statusLabel')).toHaveTextContent('Unbilled');
  });

  it('renders empty content when the panelKey is missing from formContext.derived', () => {
    const uiSchema: UiSchema = {
      timer: { 'ui:field': 'staticPanel', 'ui:options': { panelKey: 'missing' } },
    };
    const formContext = buildFormContext({ optionSets: {}, actions: {}, locale: 'en' }, {});
    render(
      <DynamicForm
        schema={schema}
        uiSchema={uiSchema}
        zodSchema={zodSchema}
        formData={{ timer: '', name: '' }}
        formContext={formContext}
        onSubmit={jest.fn()}
      />,
    );
    expect(screen.getByTestId('root_timer-panel-missing')).toHaveTextContent('');
  });

  it('never includes the panel field in the submit payload (no input rendered)', () => {
    const uiSchema: UiSchema = { timer: { 'ui:field': 'staticPanel', 'ui:options': { panelKey: 'duration' } } };
    const formContext = buildFormContext({ optionSets: {}, actions: {}, locale: 'en' }, { duration: '00h 00m 00s' });
    render(
      <DynamicForm
        schema={schema}
        uiSchema={uiSchema}
        zodSchema={zodSchema}
        formData={{ timer: '', name: '' }}
        formContext={formContext}
        onSubmit={jest.fn()}
      />,
    );
    // Only the name field should be a textbox; timer must not render as an input.
    const textboxes = screen.getAllByRole('textbox');
    expect(textboxes).toHaveLength(1);
    expect(textboxes[0]).toHaveAccessibleName(/Name/);
  });
});
