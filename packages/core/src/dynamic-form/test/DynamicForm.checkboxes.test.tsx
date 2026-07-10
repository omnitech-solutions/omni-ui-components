import '@testing-library/jest-dom';
import { z } from 'zod';
import type { RJSFSchema } from '@rjsf/utils';

import { buildSingleFieldUiSchema, renderDynamicForm, screen } from './testing/renderDynamicForm';

const channelsSchema = (required = false): RJSFSchema => ({
  type: 'object',
  ...(required ? { required: ['channels'] } : {}),
  properties: {
    channels: {
      type: 'array',
      title: 'Channels',
      uniqueItems: true,
      items: {
        type: 'string',
        oneOf: [
          { const: 'email', title: 'Email' },
          { const: 'sms', title: 'SMS' },
          { const: 'push', title: 'Push' },
        ],
      },
    },
  },
});

const getGroup = () => document.querySelector<HTMLDivElement>('[data-slot="checkbox-group"]')!;
const getItem = (value: string) => document.querySelector<HTMLButtonElement>(`[data-testid="root_channels-option-${value}"]`)!;

describe('DynamicForm — CheckboxesWidget (array of enum) integration', () => {
  it('renders one checkbox per oneOf entry', () => {
    renderDynamicForm({
      schema: channelsSchema(),
      uiSchema: buildSingleFieldUiSchema('channels', { 'ui:widget': 'checkboxes' }),
      zodSchema: z.object({ channels: z.array(z.string()) }),
      formData: { channels: [] },
    });
    expect(getGroup()).toBeInTheDocument();
    ['email', 'sms', 'push'].forEach((v) => expect(getItem(v)).toBeInTheDocument());
    ['Email', 'SMS', 'Push'].forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
  });

  it('lays out horizontally when ui:options.inline=true', () => {
    renderDynamicForm({
      schema: channelsSchema(),
      uiSchema: buildSingleFieldUiSchema('channels', { 'ui:widget': 'checkboxes', 'ui:options': { inline: true } }),
      zodSchema: z.object({ channels: z.array(z.string()) }),
      formData: { channels: [] },
    });
    expect(getGroup()).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('emits an updated array on toggle and submits it', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      schema: channelsSchema(true),
      uiSchema: buildSingleFieldUiSchema('channels', { 'ui:widget': 'checkboxes' }),
      zodSchema: z.object({ channels: z.array(z.string()).min(1) }),
      formData: { channels: [] },
    });
    await user.click(getItem('email'));
    await user.click(getItem('push'));
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ channels: ['email', 'push'] });
  });

  it('starts with prefilled values checked', () => {
    renderDynamicForm({
      schema: channelsSchema(),
      uiSchema: buildSingleFieldUiSchema('channels', { 'ui:widget': 'checkboxes' }),
      zodSchema: z.object({ channels: z.array(z.string()) }),
      formData: { channels: ['sms'] },
    });
    expect(getItem('sms')).toHaveAttribute('aria-checked', 'true');
    expect(getItem('email')).toHaveAttribute('aria-checked', 'false');
  });

  it('routes Zod failure (min(1)) through onError when nothing is picked', async () => {
    const { onSubmit, onError, submit } = renderDynamicForm({
      schema: channelsSchema(true),
      uiSchema: buildSingleFieldUiSchema('channels', { 'ui:widget': 'checkboxes' }),
      zodSchema: z.object({ channels: z.array(z.string()).min(1, 'pick at least one') }),
      formData: { channels: [] },
    });
    await submit();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ path: ['channels'], source: 'zod', message: 'pick at least one' })]),
    );
  });

  it('honors ui:enumDisabled for specific values', () => {
    renderDynamicForm({
      schema: channelsSchema(),
      uiSchema: buildSingleFieldUiSchema('channels', { 'ui:widget': 'checkboxes', 'ui:enumDisabled': ['push'] }),
      zodSchema: z.object({ channels: z.array(z.string()) }),
      formData: { channels: [] },
    });
    expect(getItem('push')).toBeDisabled();
    expect(getItem('email')).not.toBeDisabled();
  });
});
