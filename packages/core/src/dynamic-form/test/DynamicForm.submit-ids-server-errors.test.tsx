import '@testing-library/jest-dom';
import type { RJSFSchema } from '@rjsf/utils';
import { render } from '@testing-library/react';
import * as React from 'react';
import { z } from 'zod';
import type { FormError } from '../appFormSchema';
import { DynamicForm, type DynamicFormHandle } from '../DynamicForm';
import { act, renderDynamicForm, screen } from './testing/renderDynamicForm';

const schema: RJSFSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name', description: 'Your full name' },
    email: { type: 'string', title: 'Email' },
  },
};
const zodSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().optional(),
});

describe('DynamicForm: a failed submit does not block the next one', () => {
  it('submits again once the values are valid', async () => {
    const { user, submit, onSubmit, onError } = renderDynamicForm({
      schema,
      zodSchema,
      formData: { name: '' },
    });
    await submit();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('alert')).toHaveTextContent('Name is required');

    await user.type(screen.getByLabelText('Name'), '  Ada  ');
    expect(screen.queryByRole('alert')).toBeNull();
    await submit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    // The host receives what the schema parsed: the trim is applied.
    expect(onSubmit.mock.calls[0][0]).toEqual({ name: 'Ada' });
  });

  it('reports the error again when the person submits again without changing anything', async () => {
    const { submit, onSubmit, onError } = renderDynamicForm({
      schema,
      zodSchema,
      formData: { name: '' },
    });
    await submit();
    await submit();
    await submit();
    expect(onError).toHaveBeenCalledTimes(3);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('DynamicForm: idPrefix', () => {
  it('keeps root_<field> by default', () => {
    renderDynamicForm({ schema, zodSchema, formData: {} });
    expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'root_name');
  });

  it('threads the prefix to ids, labels, aria-describedby and focusField, so two forms do not collide', () => {
    const first = React.createRef<DynamicFormHandle>();
    const second = React.createRef<DynamicFormHandle>();
    render(
      <>
        <DynamicForm
          apiRef={first}
          idPrefix="profile"
          schema={schema}
          zodSchema={zodSchema}
          formData={{}}
          onSubmit={() => undefined}
        />
        <DynamicForm
          apiRef={second}
          idPrefix="billing"
          schema={schema}
          zodSchema={zodSchema}
          formData={{}}
          onSubmit={() => undefined}
        />
      </>,
    );
    const [a, b] = screen.getAllByLabelText('Name');
    expect(a).toHaveAttribute('id', 'profile_name');
    expect(b).toHaveAttribute('id', 'billing_name');
    expect(a).toHaveAttribute('aria-describedby', 'profile_name__description');
    expect(document.getElementById('billing_name__description')).toHaveTextContent(
      'Your full name',
    );
    expect(document.querySelectorAll('[id="root_name"]')).toHaveLength(0);
    act(() => {
      expect(second.current?.focusField('name')).toBe(true);
    });
    expect(b).toHaveFocus();
    act(() => {
      expect(first.current?.focusField('name')).toBe(true);
    });
    expect(a).toHaveFocus();
  });
});

describe('DynamicForm: serverErrors', () => {
  const errors: FormError[] = [
    { path: [], message: 'The server could not save the form', source: 'api' },
    { path: ['email'], message: 'This address is already in use', source: 'api' },
  ];

  it('draws a form-level error and a field error through the same display, tied to the field', () => {
    renderDynamicForm({ schema, zodSchema, formData: { name: 'Ada' }, serverErrors: errors });
    const alerts = screen.getAllByRole('alert');
    expect(alerts.map((alert) => alert.textContent).sort()).toEqual([
      'The server could not save the form',
      'This address is already in use',
    ]);
    const email = screen.getByLabelText('Email');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email.getAttribute('aria-describedby')).toContain('root_email__error');
    expect(document.getElementById('root_email__error')).toHaveTextContent('already in use');
  });

  it('hides them when a value changes and shows a new array again', async () => {
    const Host = () => {
      const [serverErrors, setServerErrors] = React.useState<FormError[] | undefined>(errors);
      return (
        <DynamicForm
          schema={schema}
          zodSchema={zodSchema}
          formData={{ name: 'Ada' }}
          serverErrors={serverErrors}
          onSubmit={() =>
            setServerErrors([{ path: ['email'], message: 'Still taken', source: 'api' }])
          }
        >
          <button type="submit">Save</button>
        </DynamicForm>
      );
    };
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    render(<Host />);
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    await user.type(screen.getByLabelText('Email'), 'a');
    expect(screen.queryByRole('alert')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Still taken');
  });
});
