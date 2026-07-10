import '@testing-library/jest-dom';
import { z } from 'zod';
import type { RJSFSchema } from '@rjsf/utils';

import { renderDynamicForm } from './testing/renderDynamicForm';

const metadataSchema = (): RJSFSchema => ({
  type: 'object',
  properties: {
    metadata: {
      type: 'object',
      title: 'Custom metadata',
      additionalProperties: { type: 'string' },
    },
  },
});

describe('DynamicForm — WrapIfAdditionalTemplate', () => {
  it('renders one wrap-if-additional row per additionalProperties entry', () => {
    renderDynamicForm({
      schema: metadataSchema(),
      uiSchema: {},
      zodSchema: z.object({ metadata: z.record(z.string()).optional() }),
      formData: { metadata: { env: 'prod', team: 'platform' } },
    });
    const rows = document.querySelectorAll('[data-slot="wrap-if-additional"]');
    expect(rows.length).toBe(2);
  });

  it('renders a key-rename input plus the value field per row', () => {
    renderDynamicForm({
      schema: metadataSchema(),
      uiSchema: {},
      zodSchema: z.object({ metadata: z.record(z.string()).optional() }),
      formData: { metadata: { env: 'prod' } },
    });
    /* the wrap renders an `id$="-key"` Omni Input for renaming the key */
    const keyInput = document.querySelector('input[id$="-key"]') as HTMLInputElement;
    expect(keyInput).toBeInTheDocument();
  });

  it('renders a destructive remove button per row (via ButtonTemplates.RemoveButton)', () => {
    renderDynamicForm({
      schema: metadataSchema(),
      uiSchema: {},
      zodSchema: z.object({ metadata: z.record(z.string()).optional() }),
      formData: { metadata: { env: 'prod', team: 'platform' } },
    });
    const removeButtons = document.querySelectorAll('[data-slot="wrap-if-additional"] button[data-slot="icon-button"][data-variant="destructive"]');
    expect(removeButtons.length).toBe(2);
  });

  it('removes a row when the destructive button is clicked', async () => {
    const { user } = renderDynamicForm({
      schema: metadataSchema(),
      uiSchema: {},
      zodSchema: z.object({ metadata: z.record(z.string()).optional() }),
      formData: { metadata: { env: 'prod', team: 'platform' } },
    });
    expect(document.querySelectorAll('[data-slot="wrap-if-additional"]').length).toBe(2);
    const firstRemove = document.querySelector(
      '[data-slot="wrap-if-additional"] button[data-slot="icon-button"][data-variant="destructive"]',
    ) as HTMLButtonElement;
    await user.click(firstRemove);
    expect(document.querySelectorAll('[data-slot="wrap-if-additional"]').length).toBe(1);
  });

  it('does NOT wrap fixed (non-additional) properties', () => {
    renderDynamicForm({
      schema: { type: 'object', properties: { name: { type: 'string', title: 'Name' } } },
      uiSchema: {},
      zodSchema: z.object({ name: z.string() }),
      formData: { name: 'Ada' },
    });
    expect(document.querySelector('[data-slot="wrap-if-additional"]')).not.toBeInTheDocument();
  });
});
