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

const volumeSchema = (): RJSFSchema => ({
  type: 'object',
  required: ['volume'],
  properties: {
    volume: { type: 'integer', title: 'Volume', minimum: 0, maximum: 100, multipleOf: 1 },
  },
});

describe('DynamicForm — RangeWidget integration', () => {
  it('renders a Omni slider primitive for ui:widget=range', () => {
    renderDynamicForm({
      schema: volumeSchema(),
      uiSchema: buildSingleFieldUiSchema('volume', { 'ui:widget': 'range' }),
      zodSchema: z.object({ volume: z.number() }),
      formData: { volume: 25 },
    });
    expect(document.querySelector('[data-slot="slider"]')).toBeInTheDocument();
  });

  it('reads min / max from the schema', () => {
    renderDynamicForm({
      schema: volumeSchema(),
      uiSchema: buildSingleFieldUiSchema('volume', { 'ui:widget': 'range' }),
      zodSchema: z.object({ volume: z.number() }),
      formData: { volume: 25 },
    });
    const thumb = document.querySelector('[role="slider"]') as HTMLElement;
    expect(thumb).toHaveAttribute('aria-valuemin', '0');
    expect(thumb).toHaveAttribute('aria-valuemax', '100');
    expect(thumb).toHaveAttribute('aria-valuenow', '25');
  });

  it('disables the slider when DynamicForm.disabled is set', () => {
    renderDynamicForm({
      schema: volumeSchema(),
      uiSchema: buildSingleFieldUiSchema('volume', { 'ui:widget': 'range' }),
      zodSchema: z.object({ volume: z.number() }),
      formData: { volume: 25 },
      disabled: true,
    });
    expect(document.querySelector('[data-slot="slider"]')).toHaveAttribute('data-disabled');
  });
});
