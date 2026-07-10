import '@testing-library/jest-dom';
import * as React from 'react';
import { within } from '@testing-library/react';
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

import { buildSingleFieldUiSchema, renderDynamicForm, screen } from './testing/renderDynamicForm';

const countrySchema = (required = false): RJSFSchema => ({
  type: 'object',
  ...(required ? { required: ['country'] } : {}),
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

/* The combobox renders a <button> trigger (data-testid prefixed by the
 * field id) + a Popover with one CommandItem per option. RJSF's field id
 * is `root_country`, so we resolve children by that prefix. */
const getTrigger = () => document.querySelector<HTMLButtonElement>('button[data-slot="select"]')!;
const getPopover = () => screen.queryByTestId('root_country-popover');

describe('DynamicForm — SelectWidget integration', () => {
  describe('render shape', () => {
    it('renders a Omni combobox trigger (not native <select>) when ui:widget=select', () => {
      renderDynamicForm({
        schema: countrySchema(),
        uiSchema: buildSingleFieldUiSchema('country', { 'ui:widget': 'select' }),
        zodSchema: z.object({ country: z.string() }),
        formData: { country: '' },
      });
      expect(getTrigger()).toBeInTheDocument();
      expect(getTrigger().tagName).toBe('BUTTON');
    });

    it('lists one CommandItem per `schema.oneOf` entry inside the popover', async () => {
      const { user } = renderDynamicForm({
        schema: countrySchema(),
        uiSchema: buildSingleFieldUiSchema('country', { 'ui:widget': 'select' }),
        zodSchema: z.object({ country: z.string() }),
        formData: { country: '' },
      });
      await user.click(getTrigger());
      ['United States', 'Canada', 'United Kingdom'].forEach((label) => {
        expect(within(getPopover()!).getByText(label)).toBeInTheDocument();
      });
    });

    it('does NOT render the search input by default', async () => {
      const { user } = renderDynamicForm({
        schema: countrySchema(),
        uiSchema: buildSingleFieldUiSchema('country', { 'ui:widget': 'select' }),
        zodSchema: z.object({ country: z.string() }),
        formData: { country: '' },
      });
      await user.click(getTrigger());
      expect(within(getPopover()!).queryByPlaceholderText(/search/i)).not.toBeInTheDocument();
    });

    it('renders the search input when ui:options.searchable=true', async () => {
      const { user } = renderDynamicForm({
        schema: countrySchema(),
        uiSchema: buildSingleFieldUiSchema('country', { 'ui:widget': 'select', 'ui:options': { searchable: true } }),
        zodSchema: z.object({ country: z.string() }),
        formData: { country: '' },
      });
      await user.click(getTrigger());
      expect(within(getPopover()!).getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('shows the placeholder text on the trigger when value is empty', () => {
      renderDynamicForm({
        schema: countrySchema(),
        uiSchema: buildSingleFieldUiSchema('country', { 'ui:widget': 'select', 'ui:placeholder': 'Pick a country' }),
        zodSchema: z.object({ country: z.string() }),
        formData: { country: '' },
      });
      expect(getTrigger()).toHaveTextContent('Pick a country');
    });
  });

  describe('user interaction', () => {
    it('opens the popover when the trigger is clicked', async () => {
      const { user } = renderDynamicForm({
        schema: countrySchema(),
        uiSchema: buildSingleFieldUiSchema('country', { 'ui:widget': 'select' }),
        zodSchema: z.object({ country: z.string() }),
        formData: { country: '' },
      });
      await user.click(getTrigger());
      expect(getPopover()).toBeInTheDocument();
    });

    it('emits change events when the user picks an option', async () => {
      const { user } = renderDynamicForm({
        schema: countrySchema(),
        uiSchema: buildSingleFieldUiSchema('country', { 'ui:widget': 'select' }),
        zodSchema: z.object({ country: z.string() }),
        formData: { country: '' },
      });
      await user.click(getTrigger());
      await user.click(screen.getByTestId('root_country-option-CA'));
      expect(getTrigger()).toHaveTextContent('Canada');
    });

    it('closes the popover after a pick', async () => {
      const { user } = renderDynamicForm({
        schema: countrySchema(),
        uiSchema: buildSingleFieldUiSchema('country', { 'ui:widget': 'select' }),
        zodSchema: z.object({ country: z.string() }),
        formData: { country: '' },
      });
      await user.click(getTrigger());
      await user.click(screen.getByTestId('root_country-option-CA'));
      expect(getPopover()).not.toBeInTheDocument();
    });
  });

  describe('submit → Zod parse pipeline', () => {
    it('calls onSubmit with the parsed value when a valid option is selected', async () => {
      const { user, onSubmit, submit } = renderDynamicForm({
        schema: countrySchema(true),
        uiSchema: buildSingleFieldUiSchema('country', { 'ui:widget': 'select' }),
        zodSchema: z.object({ country: z.enum(['US', 'CA', 'UK']) }),
        formData: { country: '' },
      });
      await user.click(getTrigger());
      await user.click(screen.getByTestId('root_country-option-CA'));
      await submit();
      expect(onSubmit).toHaveBeenCalledWith({ country: 'CA' });
    });

    it('does NOT call onSubmit when Zod rejects empty value; routes through onError', async () => {
      const { onSubmit, onError, submit } = renderDynamicForm({
        schema: countrySchema(true),
        uiSchema: buildSingleFieldUiSchema('country', { 'ui:widget': 'select' }),
        zodSchema: z.object({ country: z.string().min(1, 'pick a country') }),
        formData: { country: '' },
      });
      await submit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ path: ['country'], source: 'zod', message: 'pick a country' })]));
    });
  });

  describe('prefilled value', () => {
    it('shows the selected option label on the trigger', () => {
      renderDynamicForm({
        schema: countrySchema(),
        uiSchema: buildSingleFieldUiSchema('country', { 'ui:widget': 'select' }),
        zodSchema: z.object({ country: z.string() }),
        formData: { country: 'UK' },
      });
      expect(getTrigger()).toHaveTextContent('United Kingdom');
    });

    it('marks the currently-selected option with data-current when popover opens', async () => {
      const { user } = renderDynamicForm({
        schema: countrySchema(),
        uiSchema: buildSingleFieldUiSchema('country', { 'ui:widget': 'select' }),
        zodSchema: z.object({ country: z.string() }),
        formData: { country: 'UK' },
      });
      await user.click(getTrigger());
      expect(screen.getByTestId('root_country-option-UK')).toHaveAttribute('data-current', 'true');
      expect(screen.getByTestId('root_country-option-US')).not.toHaveAttribute('data-current');
    });
  });

  describe('disabled / readOnly propagation', () => {
    it('disables the trigger when DynamicForm.disabled is set', () => {
      renderDynamicForm({
        schema: countrySchema(),
        uiSchema: buildSingleFieldUiSchema('country', { 'ui:widget': 'select' }),
        zodSchema: z.object({ country: z.string() }),
        formData: { country: '' },
        disabled: true,
      });
      expect(getTrigger()).toBeDisabled();
    });

    it('disables the trigger when DynamicForm.readOnly is set (native <select> has no readonly)', () => {
      renderDynamicForm({
        schema: countrySchema(),
        uiSchema: buildSingleFieldUiSchema('country', { 'ui:widget': 'select' }),
        zodSchema: z.object({ country: z.string() }),
        formData: { country: '' },
        readOnly: true,
      });
      expect(getTrigger()).toBeDisabled();
    });
  });
});
