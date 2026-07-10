import '@testing-library/jest-dom';
import { z } from 'zod';
import type { RJSFSchema } from '@rjsf/utils';

import { buildSingleFieldUiSchema, renderDynamicForm, screen } from './testing/renderDynamicForm';

const pagesSchema = (): RJSFSchema => ({
  type: 'object',
  required: ['pages'],
  properties: {
    pages: { type: 'integer', title: 'Number of pages', minimum: 1, maximum: 50 },
  },
});

describe('DynamicForm — StepperWidget integration', () => {
  it('renders a stepper for ui:widget=stepper', () => {
    renderDynamicForm({
      schema: pagesSchema(),
      uiSchema: buildSingleFieldUiSchema('pages', { 'ui:widget': 'stepper', 'ui:options': { unit: 'page' } }),
      zodSchema: z.object({ pages: z.number() }),
      formData: { pages: 7 },
    });
    expect(document.querySelector('[data-slot="stepper"]')).toBeInTheDocument();
    expect(screen.getByText('7 pages')).toBeInTheDocument();
  });

  it('reads min / max from the schema and disables at bounds', () => {
    renderDynamicForm({
      schema: pagesSchema(),
      uiSchema: buildSingleFieldUiSchema('pages', { 'ui:widget': 'stepper' }),
      zodSchema: z.object({ pages: z.number() }),
      formData: { pages: 1 },
    });
    const decrement = document.querySelector('[data-slot="stepper-decrement"]') as HTMLButtonElement;
    const increment = document.querySelector('[data-slot="stepper-increment"]') as HTMLButtonElement;
    expect(decrement).toBeDisabled();
    expect(increment).not.toBeDisabled();
  });

  it('emits the new value on increment and submits it', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      schema: pagesSchema(),
      uiSchema: buildSingleFieldUiSchema('pages', { 'ui:widget': 'stepper' }),
      zodSchema: z.object({ pages: z.number() }),
      formData: { pages: 7 },
    });
    const increment = document.querySelector('[data-slot="stepper-increment"]') as HTMLButtonElement;
    await user.click(increment);
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ pages: 8 });
  });

  it('disables both buttons when DynamicForm.disabled is set', () => {
    renderDynamicForm({
      schema: pagesSchema(),
      uiSchema: buildSingleFieldUiSchema('pages', { 'ui:widget': 'stepper' }),
      zodSchema: z.object({ pages: z.number() }),
      formData: { pages: 7 },
      disabled: true,
    });
    expect(document.querySelector('[data-slot="stepper-decrement"]')).toBeDisabled();
    expect(document.querySelector('[data-slot="stepper-increment"]')).toBeDisabled();
  });
});
