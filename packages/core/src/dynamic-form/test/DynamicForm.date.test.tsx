import '@testing-library/jest-dom';
import { z } from 'zod';
import type { RJSFSchema } from '@rjsf/utils';

beforeAll(() => {
  if (!('hasPointerCapture' in Element.prototype)) {
    Element.prototype.hasPointerCapture = jest.fn().mockReturnValue(false);
    Element.prototype.setPointerCapture = jest.fn();
    Element.prototype.releasePointerCapture = jest.fn();
  }
});

import { buildSingleFieldUiSchema, renderDynamicForm } from './testing/renderDynamicForm';

const dateSchema = (): RJSFSchema => ({
  type: 'object',
  required: ['due_date'],
  properties: { due_date: { type: 'string', format: 'date', title: 'Due date' } },
});

describe('DynamicForm — DateWidget integration', () => {
  it('renders a Omni date-picker trigger', () => {
    renderDynamicForm({
      schema: dateSchema(),
      uiSchema: buildSingleFieldUiSchema('due_date', { 'ui:widget': 'date' }),
      zodSchema: z.object({ due_date: z.string() }),
      formData: { due_date: '' },
    });
    expect(document.querySelector('[data-slot="date-picker"]')).toBeInTheDocument();
  });

  it('renders the formatted value when an ISO date string is set', () => {
    renderDynamicForm({
      schema: dateSchema(),
      uiSchema: buildSingleFieldUiSchema('due_date', { 'ui:widget': 'date' }),
      zodSchema: z.object({ due_date: z.string() }),
      formData: { due_date: '2026-07-15' },
    });
    const trigger = document.querySelector('[data-slot="date-picker"]') as HTMLButtonElement;
    expect(trigger.textContent).toMatch(/2026/);
  });

  it('disables the picker when DynamicForm.disabled is set', () => {
    renderDynamicForm({
      schema: dateSchema(),
      uiSchema: buildSingleFieldUiSchema('due_date', { 'ui:widget': 'date' }),
      zodSchema: z.object({ due_date: z.string() }),
      formData: { due_date: '2026-07-15' },
      disabled: true,
    });
    expect(document.querySelector('[data-slot="date-picker"]')).toBeDisabled();
  });
});
