import '@testing-library/jest-dom';
import { z } from 'zod';
import type { RJSFSchema } from '@rjsf/utils';

import { buildSingleFieldUiSchema, renderDynamicForm } from './testing/renderDynamicForm';

const toneSchema = (required = false): RJSFSchema => ({
  type: 'object',
  ...(required ? { required: ['tone'] } : {}),
  properties: {
    tone: {
      type: 'string',
      title: 'Tone',
      oneOf: [
        { const: 'casual', title: 'Casual' },
        { const: 'friendly', title: 'Friendly' },
        { const: 'professional', title: 'Professional' },
      ],
    },
  },
});

const getItem = (value: string) => document.querySelector<HTMLButtonElement>(`[data-testid="root_tone-option-${value}"]`)!;

describe('DynamicForm — SegmentedWidget integration', () => {
  it('renders a Omni segmented for ui:widget=segmented', () => {
    renderDynamicForm({
      schema: toneSchema(),
      uiSchema: buildSingleFieldUiSchema('tone', { 'ui:widget': 'segmented' }),
      zodSchema: z.object({ tone: z.string() }),
      formData: { tone: 'friendly' },
    });
    expect(document.querySelector('[data-slot="segmented"]')).toBeInTheDocument();
    expect(getItem('friendly')).toHaveAttribute('data-state', 'on');
  });

  it('switches the selected option when the user clicks another segment', async () => {
    const { user, onSubmit, submit } = renderDynamicForm({
      schema: toneSchema(true),
      uiSchema: buildSingleFieldUiSchema('tone', { 'ui:widget': 'segmented' }),
      zodSchema: z.object({ tone: z.enum(['casual', 'friendly', 'professional']) }),
      formData: { tone: 'friendly' },
    });
    await user.click(getItem('professional'));
    expect(getItem('professional')).toHaveAttribute('data-state', 'on');
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ tone: 'professional' });
  });

  it('routes Zod failure (empty value) through onError', async () => {
    const { onSubmit, onError, submit } = renderDynamicForm({
      schema: toneSchema(true),
      uiSchema: buildSingleFieldUiSchema('tone', { 'ui:widget': 'segmented' }),
      zodSchema: z.object({ tone: z.string().min(1, 'Pick a tone') }),
      formData: { tone: '' },
    });
    await submit();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ path: ['tone'], source: 'zod', message: 'Pick a tone' })]));
  });
});
