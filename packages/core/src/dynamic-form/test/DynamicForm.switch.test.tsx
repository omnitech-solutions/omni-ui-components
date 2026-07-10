import '@testing-library/jest-dom';
import { z } from 'zod';
import type { RJSFSchema } from '@rjsf/utils';

import { buildSingleFieldUiSchema, renderDynamicForm } from './testing/renderDynamicForm';

const boolSchema = (): RJSFSchema => ({
  type: 'object',
  properties: { notify: { type: 'boolean', title: 'Notify me' } },
});

describe('DynamicForm — SwitchWidget integration', () => {
  it('renders a Omni switch when ui:widget=switch', () => {
    renderDynamicForm({
      schema: boolSchema(),
      uiSchema: buildSingleFieldUiSchema('notify', { 'ui:widget': 'switch' }),
      zodSchema: z.object({ notify: z.boolean() }),
      formData: { notify: false },
    });
    expect(document.querySelector('[data-slot="switch"]')).toBeInTheDocument();
  });

  it('toggles + submits the boolean value', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      schema: boolSchema(),
      uiSchema: buildSingleFieldUiSchema('notify', { 'ui:widget': 'switch' }),
      zodSchema: z.object({ notify: z.boolean() }),
      formData: { notify: false },
    });
    const sw = document.querySelector('[data-slot="switch"]') as HTMLButtonElement;
    await user.click(sw);
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ notify: true });
  });
});
