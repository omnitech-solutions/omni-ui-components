import '@testing-library/jest-dom';
import type { RJSFSchema } from '@rjsf/utils';
import { z } from 'zod';
import { renderDynamicForm, screen, within } from './testing/renderDynamicForm';

const schema: RJSFSchema = {
  type: 'object',
  properties: {
    people: {
      type: 'array',
      title: 'People',
      description: 'Who takes part.',
      items: { type: 'string', title: 'Name' },
    },
  },
};
const zodSchema = z.object({ people: z.array(z.string()).optional() });

describe('DynamicForm: arrays are drawn from library parts', () => {
  it('draws a title that is not a heading, the rows as a list and a library add button', () => {
    renderDynamicForm({ schema, zodSchema, formData: { people: ['Ada', 'Grace'] } });
    expect(screen.queryByRole('heading')).toBeNull();
    const list = screen.getByRole('list', { name: 'People' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Who takes part.')).toBeInTheDocument();
    const add = screen.getByRole('button', { name: 'Add item' });
    expect(add).toHaveAttribute('data-slot', 'form-array-add');
  });

  it('adds and removes a row, and submits the rows', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      schema,
      zodSchema,
      formData: { people: ['Ada'] },
    });
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    await user.type(within(rows[1]).getByRole('textbox'), 'Grace');
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ people: ['Ada', 'Grace'] });
    await user.click(
      within(screen.getAllByRole('listitem')[0]).getByRole('button', { name: /remove/i }),
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('takes its words from ui:options.addLabel or formContext.labels, and a heading level when asked', () => {
    const first = renderDynamicForm({
      schema,
      uiSchema: { people: { 'ui:options': { addLabel: 'Add person', headingLevel: 3 } } },
      zodSchema,
      formData: {},
    });
    expect(screen.getByRole('button', { name: 'Add person' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'People' })).toBeInTheDocument();
    first.rtl.unmount();
    renderDynamicForm({
      schema,
      zodSchema,
      formData: {},
      formContext: {
        derived: {},
        optionSets: {},
        actions: {},
        locale: 'en',
        labels: { addItem: 'Ajouter' },
      },
    });
    expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument();
  });

  it('disables the add button when the form is read-only', () => {
    renderDynamicForm({ schema, zodSchema, formData: { people: ['Ada'] }, readOnly: true });
    expect(screen.getByRole('button', { name: 'Add item' })).toBeDisabled();
  });
});
