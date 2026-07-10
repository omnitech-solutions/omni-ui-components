import '@testing-library/jest-dom';
import { z } from 'zod';
import type { RJSFSchema } from '@rjsf/utils';

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
  if (!('hasPointerCapture' in Element.prototype)) {
    Element.prototype.hasPointerCapture = jest.fn().mockReturnValue(false);
    Element.prototype.setPointerCapture = jest.fn();
    Element.prototype.releasePointerCapture = jest.fn();
  }
});

import { buildSingleFieldUiSchema, renderDynamicForm } from './testing/renderDynamicForm';

const countrySchema = (): RJSFSchema => ({
  type: 'object',
  properties: {
    country: {
      type: 'string',
      title: 'Country',
      oneOf: [
        { const: 'US', title: 'United States' },
        { const: 'CA', title: 'Canada' },
        { const: 'UK', title: 'United Kingdom' },
      ],
    },
  },
});

describe('DynamicForm — ComboboxWidget integration', () => {
  it('renders a Omni select trigger', () => {
    renderDynamicForm({
      schema: countrySchema(),
      uiSchema: buildSingleFieldUiSchema('country', { 'ui:widget': 'combobox' }),
      zodSchema: z.object({ country: z.string() }),
      formData: { country: '' },
    });
    expect(document.querySelector('button[data-slot="select"]')).toBeInTheDocument();
  });

  it('renders the search input inside the popover (searchable=true by default)', async () => {
    const { user } = renderDynamicForm({
      schema: countrySchema(),
      uiSchema: buildSingleFieldUiSchema('country', { 'ui:widget': 'combobox' }),
      zodSchema: z.object({ country: z.string() }),
      formData: { country: '' },
    });
    await user.click(document.querySelector('button[data-slot="select"]')!);
    const popover = document.querySelector('[data-testid="root_country-popover"]')!;
    expect(popover.querySelector('input[placeholder*="earch"]')).toBeInTheDocument();
  });
});
