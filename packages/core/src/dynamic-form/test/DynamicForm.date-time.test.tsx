import '@testing-library/jest-dom';
import type { RJSFSchema } from '@rjsf/utils';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { DynamicForm } from '../DynamicForm';
import { instantToLocal, localToInstant } from '../widgets/DateTimeWidget';
import { fireEvent, renderDynamicForm, screen } from './testing/renderDynamicForm';

const schema: RJSFSchema = {
  type: 'object',
  properties: { when: { type: 'string', title: 'When', format: 'date-time' } },
};
const zodSchema = z.object({ when: z.string().optional() });

describe('DynamicForm: DateTimeWidget', () => {
  it('shows and submits a local ISO string by default', async () => {
    const { submit, onSubmit } = renderDynamicForm({
      schema,
      uiSchema: { when: { 'ui:widget': 'dateTime' } },
      zodSchema,
      formData: { when: '2026-10-09T10:30' },
    });
    expect(document.getElementById('root_when-time')).toHaveValue('10:30');
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ when: '2026-10-09T10:30' });
  });

  it('clears to undefined with the clear control', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      schema,
      uiSchema: { when: { 'ui:widget': 'dateTime' } },
      zodSchema,
      formData: { when: '2026-10-09T10:30' },
    });
    await user.click(screen.getByRole('button', { name: 'Clear date' }));
    await submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].when).toBeUndefined();
  });

  it('a clear is not overwritten when the host re-renders with its old formData', async () => {
    const host = { when: '2026-10-09T10:30' };
    const onSubmit = jest.fn();
    const tree = (n: number) => (
      <DynamicForm
        schema={schema}
        uiSchema={{ when: { 'ui:widget': 'dateTime' } }}
        zodSchema={zodSchema}
        formData={host}
        onSubmit={onSubmit}
        onChange={() => n}
      >
        <button type="submit">Save</button>
      </DynamicForm>
    );
    const view = render(tree(0));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Clear date' }));
    view.rerender(tree(1));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].when).toBeUndefined();
  });

  it('storage: instant shows an instant in local time and stores an instant', async () => {
    const stored = new Date(2026, 9, 9, 10, 30).toISOString();
    const { submit, onSubmit } = renderDynamicForm({
      schema,
      uiSchema: { when: { 'ui:widget': 'dateTime', 'ui:options': { storage: 'instant' } } },
      zodSchema,
      formData: { when: stored },
    });
    const time = document.getElementById('root_when-time') as HTMLInputElement;
    expect(time).toHaveValue('10:30');
    fireEvent.change(time, { target: { value: '11:45' } });
    await submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith({ when: new Date(2026, 9, 9, 11, 45).toISOString() });
  });

  it('converts between an instant and the local value both ways', () => {
    const instant = new Date(2026, 0, 2, 3, 4).toISOString();
    expect(instantToLocal(instant)).toBe('2026-01-02T03:04');
    expect(localToInstant('2026-01-02T03:04')).toBe(instant);
    expect(localToInstant('2026-01-02')).toBe(new Date(2026, 0, 2).toISOString());
    expect(instantToLocal('nonsense')).toBe('');
    expect(localToInstant('nonsense')).toBeUndefined();
  });
});
