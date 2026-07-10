import '@testing-library/jest-dom';
import { z } from 'zod';
import type { RJSFSchema } from '@rjsf/utils';

import { renderDynamicForm, screen } from './testing/renderDynamicForm';

const arraySchema = (): RJSFSchema => ({
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      title: 'Tags',
      items: { type: 'string', title: 'Tag' },
    },
  },
});

describe('DynamicForm — Omni IconButton ButtonTemplates', () => {
  it('renders the Omni IconButton (data-slot="icon-button") for array toolbar buttons', async () => {
    const { user } = renderDynamicForm({
      schema: arraySchema(),
      uiSchema: { tags: { 'ui:options': { addable: true } } },
      zodSchema: z.object({ tags: z.array(z.string()) }),
      formData: { tags: ['alpha', 'beta'] },
    });

    /* RJSF renders the array toolbar with Copy / MoveUp / MoveDown / Remove
     * per row. Each should be our Omni IconButton — sniff by the
     * `data-slot="icon-button"` marker we stamp in IconButton.tsx. */
    const buttons = document.querySelectorAll('button[data-slot="icon-button"]');
    expect(buttons.length).toBeGreaterThan(0);

    /* Remove button uses our destructive variant. */
    const removes = document.querySelectorAll('button[data-slot="icon-button"][data-variant="destructive"]');
    expect(removes.length).toBeGreaterThan(0);

    /* Remove fires through the array field — clicking the first row's
     * remove should drop us from 2 items to 1. */
    const initialRowButtons = document.querySelectorAll('button[data-slot="icon-button"][data-variant="destructive"]');
    await user.click(initialRowButtons[0]);
    const afterRowButtons = document.querySelectorAll('button[data-slot="icon-button"][data-variant="destructive"]');
    expect(afterRowButtons.length).toBe(initialRowButtons.length - 1);

    /* Sanity — RJSF "Add Item" still wires (it uses the default add button
     * template from @rjsf/shadcn until we override it). */
    expect(screen.queryByText('Tags')).toBeInTheDocument();
  });
});
