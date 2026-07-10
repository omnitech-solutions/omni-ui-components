import '@testing-library/jest-dom';
import * as React from 'react';
import { z } from 'zod';
import type { RJSFSchema } from '@rjsf/utils';

beforeAll(() => {
  if (!('hasPointerCapture' in Element.prototype)) {
    Element.prototype.hasPointerCapture = jest.fn().mockReturnValue(false);
    Element.prototype.setPointerCapture = jest.fn();
    Element.prototype.releasePointerCapture = jest.fn();
  }
});

import { buildSingleFieldUiSchema, renderDynamicForm, screen } from './testing/renderDynamicForm';

const planSchema = (required = false): RJSFSchema => ({
  type: 'object',
  ...(required ? { required: ['plan'] } : {}),
  properties: {
    plan: {
      type: 'string',
      title: 'Billing plan',
      oneOf: [
        { const: 'free', title: 'Free' },
        { const: 'pro', title: 'Pro' },
        { const: 'team', title: 'Team' },
      ],
    },
  },
});

const getGroup = () => document.querySelector<HTMLDivElement>('[data-slot="radio-group"]')!;
const getItem = (value: string) => document.querySelector<HTMLButtonElement>(`[data-testid="root_plan-option-${value}"]`)!;

describe('DynamicForm — RadioWidget integration', () => {
  describe('render shape', () => {
    it('renders a RadioGroup (not native inputs) when ui:widget=radio', () => {
      renderDynamicForm({
        schema: planSchema(),
        uiSchema: buildSingleFieldUiSchema('plan', { 'ui:widget': 'radio' }),
        zodSchema: z.object({ plan: z.string() }),
        formData: { plan: '' },
      });
      expect(getGroup()).toBeInTheDocument();
      expect(getGroup()).toHaveAttribute('data-orientation', 'vertical');
    });

    it('lists one radio item per `schema.oneOf` entry', () => {
      renderDynamicForm({
        schema: planSchema(),
        uiSchema: buildSingleFieldUiSchema('plan', { 'ui:widget': 'radio' }),
        zodSchema: z.object({ plan: z.string() }),
        formData: { plan: '' },
      });
      ['free', 'pro', 'team'].forEach((v) => expect(getItem(v)).toBeInTheDocument());
      ['Free', 'Pro', 'Team'].forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
    });

    it('lays out horizontally when ui:options.inline=true', () => {
      renderDynamicForm({
        schema: planSchema(),
        uiSchema: buildSingleFieldUiSchema('plan', { 'ui:widget': 'radio', 'ui:options': { inline: true } }),
        zodSchema: z.object({ plan: z.string() }),
        formData: { plan: '' },
      });
      expect(getGroup()).toHaveAttribute('data-orientation', 'horizontal');
    });
  });

  describe('user interaction', () => {
    it('checks the option the user clicks', async () => {
      const { user } = renderDynamicForm({
        schema: planSchema(),
        uiSchema: buildSingleFieldUiSchema('plan', { 'ui:widget': 'radio' }),
        zodSchema: z.object({ plan: z.string() }),
        formData: { plan: '' },
      });
      await user.click(getItem('pro'));
      expect(getItem('pro')).toHaveAttribute('aria-checked', 'true');
      expect(getItem('free')).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('submit → Zod parse pipeline', () => {
    it('calls onSubmit with the picked value', async () => {
      const { user, onSubmit, submit } = renderDynamicForm({
        schema: planSchema(true),
        uiSchema: buildSingleFieldUiSchema('plan', { 'ui:widget': 'radio' }),
        zodSchema: z.object({ plan: z.enum(['free', 'pro', 'team']) }),
        formData: { plan: '' },
      });
      await user.click(getItem('pro'));
      await submit();
      expect(onSubmit).toHaveBeenCalledWith({ plan: 'pro' });
    });

    it('does NOT call onSubmit when Zod rejects empty value; routes through onError', async () => {
      const { onSubmit, onError, submit } = renderDynamicForm({
        schema: planSchema(true),
        uiSchema: buildSingleFieldUiSchema('plan', { 'ui:widget': 'radio' }),
        zodSchema: z.object({ plan: z.string().min(1, 'pick a plan') }),
        formData: { plan: '' },
      });
      await submit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ path: ['plan'], source: 'zod', message: 'pick a plan' })]));
    });
  });

  describe('prefilled value', () => {
    it('marks the matching option as checked on mount', () => {
      renderDynamicForm({
        schema: planSchema(),
        uiSchema: buildSingleFieldUiSchema('plan', { 'ui:widget': 'radio' }),
        zodSchema: z.object({ plan: z.string() }),
        formData: { plan: 'team' },
      });
      expect(getItem('team')).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('disabled / readOnly propagation', () => {
    it('disables every option when DynamicForm.disabled is set', () => {
      renderDynamicForm({
        schema: planSchema(),
        uiSchema: buildSingleFieldUiSchema('plan', { 'ui:widget': 'radio' }),
        zodSchema: z.object({ plan: z.string() }),
        formData: { plan: '' },
        disabled: true,
      });
      ['free', 'pro', 'team'].forEach((v) => expect(getItem(v)).toBeDisabled());
    });

    it('disables every option when DynamicForm.readOnly is set', () => {
      renderDynamicForm({
        schema: planSchema(),
        uiSchema: buildSingleFieldUiSchema('plan', { 'ui:widget': 'radio' }),
        zodSchema: z.object({ plan: z.string() }),
        formData: { plan: '' },
        readOnly: true,
      });
      ['free', 'pro', 'team'].forEach((v) => expect(getItem(v)).toBeDisabled());
    });

    it('honors ui:enumDisabled for specific values', () => {
      renderDynamicForm({
        schema: planSchema(),
        uiSchema: buildSingleFieldUiSchema('plan', { 'ui:widget': 'radio', 'ui:enumDisabled': ['team'] }),
        zodSchema: z.object({ plan: z.string() }),
        formData: { plan: '' },
      });
      expect(getItem('team')).toBeDisabled();
      expect(getItem('free')).not.toBeDisabled();
    });
  });
});
