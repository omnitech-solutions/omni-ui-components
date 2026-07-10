import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';

import { DynamicForm } from 'dynamic-form';

describe('DynamicForm — collapsible ObjectFieldTemplate', () => {
  const schema: RJSFSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', title: 'Name' },
      additionalFields: {
        type: 'object',
        title: 'Additional Fields',
        properties: {
          project: { type: 'string', title: 'Project' },
          note: { type: 'string', title: 'Note' },
        },
      },
    },
  };
  const zodSchema = z.object({
    name: z.string().optional(),
    additionalFields: z.object({ project: z.string().optional(), note: z.string().optional() }).optional(),
  }) as never;

  function renderForm({ defaultOpen, title }: { defaultOpen?: boolean; title?: string } = {}) {
    const uiSchema: UiSchema = {
      additionalFields: {
        'ui:options': {
          collapsible: { defaultOpen: defaultOpen ?? false, ...(title ? { title } : {}) },
        },
      },
    };
    return render(<DynamicForm schema={schema} uiSchema={uiSchema} zodSchema={zodSchema} formData={{}} onSubmit={jest.fn()} />);
  }

  it('renders the toggle button and uses the schema title by default', () => {
    renderForm();
    const toggle = screen.getByTestId('oui-collapsible-toggle');
    expect(toggle).toHaveTextContent('Additional Fields');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('honors ui:options.collapsible.title when provided', () => {
    renderForm({ title: 'More Options' });
    expect(screen.getByTestId('oui-collapsible-toggle')).toHaveTextContent('More Options');
  });

  it('hides the children when defaultOpen is false', () => {
    renderForm({ defaultOpen: false });
    const content = screen.getByTestId('oui-collapsible-content');
    expect(content).toHaveAttribute('hidden');
  });

  it('reveals the children when defaultOpen is true', () => {
    renderForm({ defaultOpen: true });
    const content = screen.getByTestId('oui-collapsible-content');
    expect(content).not.toHaveAttribute('hidden');
    expect(screen.getByLabelText(/Project/)).toBeInTheDocument();
  });

  it('toggles open and closed on click and updates aria-expanded', async () => {
    const user = userEvent.setup();
    renderForm({ defaultOpen: false });
    const toggle = screen.getByTestId('oui-collapsible-toggle');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('oui-collapsible-content')).not.toHaveAttribute('hidden');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('oui-collapsible-content')).toHaveAttribute('hidden');
  });

  it('renders the grid normally when collapsible option is absent', () => {
    render(<DynamicForm schema={schema} uiSchema={{}} zodSchema={zodSchema} formData={{}} onSubmit={jest.fn()} />);
    expect(screen.queryByTestId('oui-collapsible')).toBeNull();
    expect(screen.getByLabelText(/Project/)).toBeInTheDocument();
  });
});
