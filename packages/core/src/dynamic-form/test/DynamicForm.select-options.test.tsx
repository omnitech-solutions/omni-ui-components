import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';

import { DynamicForm } from 'dynamic-form';
import { buildFormContext } from 'dynamic-form/lib/formContext';

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

describe('DynamicForm — SelectWidget / ComboboxWidget option sources', () => {
  const schema: RJSFSchema = { type: 'object', properties: { project: { type: 'string', title: 'Project' } } };
  const zodSchema = z.object({ project: z.string().optional() }) as never;

  it('SelectWidget reads grouped options from formContext.optionSets via ui:options.optionSetKey', async () => {
    const uiSchema: UiSchema = { project: { 'ui:widget': 'select', 'ui:options': { optionSetKey: 'projects' } } };
    const formContext = buildFormContext(
      {
        optionSets: {
          projects: [
            {
              value: 'p1',
              label: 'Bugs - Week 27',
              group: 'Omni Product Development',
              description: null,
              avatarUrl: null,
              initials: null,
              color: null,
              disabled: false,
            },
            {
              value: 'p2',
              label: 'Bugs - Week 30',
              group: 'Omni Product Development',
              description: null,
              avatarUrl: null,
              initials: null,
              color: null,
              disabled: false,
            },
            { value: 'p3', label: 'Security Items', group: 'Internal', description: null, avatarUrl: null, initials: null, color: null, disabled: false },
          ],
        },
        actions: {},
        locale: 'en',
      },
      {},
    );

    const user = userEvent.setup();
    render(<DynamicForm schema={schema} uiSchema={uiSchema} zodSchema={zodSchema} formData={{ project: '' }} formContext={formContext} onSubmit={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /Project/ }));
    expect(screen.getByTestId('root_project-group-Omni Product Development')).toBeInTheDocument();
    expect(screen.getByTestId('root_project-group-Internal')).toBeInTheDocument();
  });

  it('SelectWidget falls back to schema.enum when no optionSetKey is supplied', () => {
    const enumSchema: RJSFSchema = {
      type: 'object',
      properties: { currency: { type: 'string', title: 'Currency', enum: ['GBP', 'ETB'] } },
    };
    const uiSchema: UiSchema = { currency: { 'ui:widget': 'select' } };
    render(
      <DynamicForm
        schema={enumSchema}
        uiSchema={uiSchema}
        zodSchema={z.object({ currency: z.string() }) as never}
        formData={{ currency: 'GBP' }}
        onSubmit={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /Currency/ })).toBeInTheDocument();
  });

  it('SelectWidget renders a footer action when ui:options.footerActionKey resolves in formContext.actions', async () => {
    const taxSchema: RJSFSchema = { type: 'object', properties: { taxRateId: { type: 'string', title: 'Tax' } } };
    const uiSchema: UiSchema = { taxRateId: { 'ui:widget': 'select', 'ui:options': { optionSetKey: 'taxRates', footerActionKey: 'manageTaxRates' } } };
    const formContext = buildFormContext(
      {
        optionSets: {
          taxRates: [
            { value: 'state_5', label: '5% (State Tax)', group: null, description: null, avatarUrl: null, initials: null, color: null, disabled: false },
          ],
        },
        actions: { manageTaxRates: { label: 'Manage Tax Rates', href: null, actionId: 'manageTaxRates' } },
        locale: 'en',
      },
      {},
    );

    const user = userEvent.setup();
    render(
      <DynamicForm
        schema={taxSchema}
        uiSchema={uiSchema}
        zodSchema={z.object({ taxRateId: z.string().optional() }) as never}
        formData={{ taxRateId: '' }}
        formContext={formContext}
        onSubmit={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Tax/ }));
    expect(screen.getByTestId('root_taxRateId-footer-action')).toHaveTextContent('Manage Tax Rates');
  });

  it('ComboboxWidget reads option sets through formContext too', async () => {
    const uiSchema: UiSchema = { project: { 'ui:widget': 'combobox', 'ui:options': { optionSetKey: 'projects' } } };
    const formContext = buildFormContext(
      {
        optionSets: {
          projects: [{ value: 'p1', label: 'Bugs - Week 27', group: 'PD', description: null, avatarUrl: null, initials: null, color: null, disabled: false }],
        },
        actions: {},
        locale: 'en',
      },
      {},
    );
    const user = userEvent.setup();
    render(<DynamicForm schema={schema} uiSchema={uiSchema} zodSchema={zodSchema} formData={{ project: '' }} formContext={formContext} onSubmit={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /Project/ }));
    expect(screen.getByTestId('root_project-option-p1')).toBeInTheDocument();
  });
});
