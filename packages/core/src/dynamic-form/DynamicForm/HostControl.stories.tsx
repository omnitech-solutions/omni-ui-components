import type { Meta, StoryObj } from '@storybook/react';
import { FormLookExample } from 'factories/dynamic-form/DynamicForm/FormLook.factories';
import { HostControlExample } from 'factories/dynamic-form/DynamicForm/HostControl.factories';
import { expect, userEvent, within } from 'storybook/test';

const meta: Meta = {
  title: 'dynamic-form/DynamicForm/Host control',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'What a host does around a schema form: `formData` it may change at any time (also after an edit), `idPrefix` so two forms on one screen do not share ids, `apiRef` with `focusField(key)`, `onFieldFocus` / `onFieldBlur`, `serverErrors` drawn like validation errors and hidden on change, and per section and per field state as data in `formContext` (`sections`, `onSectionOpenChange`, `fieldStatus`).',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

/** The host owns the values, the open section, the statuses and the server errors; the schema holds none of it. */
export const Default: Story = { render: () => <HostControlExample /> };

/** By keyboard and by key: focus a field from outside, edit, submit, read the server error, change the value. */
export const Keyboard: Story = {
  render: () => <HostControlExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Focus email' }));
    const email = canvas.getByLabelText('Email');
    await expect(email).toHaveFocus();
    await expect(email).toHaveAttribute('id', 'profile_email');
    await expect(canvas.getByTestId('focused-field')).toHaveTextContent('email');
    await userEvent.keyboard('ada@example.com{Enter}');
    const error = await canvas.findByRole('alert');
    await expect(error).toHaveTextContent('already in use');
    await userEvent.keyboard('x');
    await expect(canvas.queryByRole('alert')).toBeNull();
    // The host loads a value and opens the section after the person has edited: the form takes both.
    await userEvent.click(canvas.getByRole('button', { name: 'Load a role' }));
    await expect(canvas.getByLabelText('Role')).toHaveValue('Engineer');
    await expect(canvas.getByText('Complete')).toBeInTheDocument();
    await expect(canvas.getByLabelText('Email')).toHaveValue('ada@example.comx');
  },
};

/**
 * Size, variant and label side for the whole form from `ui:globalOptions`, overridden per field in `ui:options`;
 * a section as a `fieldset` with its legend, plain or as a card; an array as rows with a named add button.
 */
export const FormLook: Story = {
  render: () => <FormLookExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByLabelText('Name');
    await expect(name.closest('[data-layout]')).toHaveAttribute('data-layout', 'horizontal');
    await expect(canvas.getByLabelText('Email').closest('[data-layout]')).toHaveAttribute(
      'data-layout',
      'vertical',
    );
    await expect(canvas.getByRole('group', { name: /Contact/ })).toBeInTheDocument();
    name.focus();
    await userEvent.keyboard('!');
    await expect(name).toHaveValue('Ada!');
    const add = canvas.getByRole('button', { name: 'Add person' });
    add.focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
  },
};
