import '@testing-library/jest-dom';
import { z } from 'zod';
import type { RJSFSchema } from '@rjsf/utils';

import { buildSingleFieldUiSchema, renderDynamicForm } from './testing/renderDynamicForm';

const boolSchema = (required = false): RJSFSchema => ({
  type: 'object',
  ...(required ? { required: ['agreed'] } : {}),
  properties: {
    agreed: { type: 'boolean', title: 'I agree' },
  },
});

const getBox = () => document.querySelector<HTMLButtonElement>('button[data-slot="checkbox"]')!;

describe('DynamicForm — CheckboxWidget (boolean) integration', () => {
  it('renders a Omni checkbox primitive for type=boolean', () => {
    renderDynamicForm({
      schema: boolSchema(),
      uiSchema: buildSingleFieldUiSchema('agreed', { 'ui:widget': 'checkbox' }),
      zodSchema: z.object({ agreed: z.boolean() }),
      formData: { agreed: false },
    });
    expect(getBox()).toBeInTheDocument();
    expect(getBox()).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles to checked when clicked and submits the boolean value', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      schema: boolSchema(true),
      uiSchema: buildSingleFieldUiSchema('agreed', { 'ui:widget': 'checkbox' }),
      zodSchema: z.object({ agreed: z.boolean() }),
      formData: { agreed: false },
    });
    await user.click(getBox());
    expect(getBox()).toHaveAttribute('aria-checked', 'true');
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ agreed: true });
  });

  it('routes Zod failure (must be true) through onError', async () => {
    const { onSubmit, onError, submit } = renderDynamicForm({
      schema: boolSchema(true),
      uiSchema: buildSingleFieldUiSchema('agreed', { 'ui:widget': 'checkbox' }),
      zodSchema: z.object({
        agreed: z.literal(true, { error: 'You must agree' }),
      }),
      formData: { agreed: false },
    });
    await submit();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ path: ['agreed'], source: 'zod', message: 'You must agree' })]));
  });

  it('disables the box when DynamicForm.disabled is set', () => {
    renderDynamicForm({
      schema: boolSchema(),
      uiSchema: buildSingleFieldUiSchema('agreed', { 'ui:widget': 'checkbox' }),
      zodSchema: z.object({ agreed: z.boolean() }),
      formData: { agreed: false },
      disabled: true,
    });
    expect(getBox()).toBeDisabled();
  });
});
