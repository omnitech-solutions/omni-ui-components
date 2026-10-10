import '@testing-library/jest-dom';
import type { RJSFSchema } from '@rjsf/utils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { z } from 'zod';
import { DynamicForm } from '../DynamicForm';

const schema: RJSFSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', title: 'Title' },
    body: { type: 'string', title: 'Body' },
    address: {
      type: 'object',
      title: 'Address',
      properties: { city: { type: 'string', title: 'City' } },
    },
  },
};
const zodSchema = z.object({}).passthrough();

describe('DynamicForm: the host can change the values after the person has edited', () => {
  const Host = ({ onRender }: { onRender?: () => void }) => {
    const [data, setData] = React.useState<Record<string, unknown>>({ title: 'One', body: '' });
    onRender?.();
    return (
      <>
        <DynamicForm
          schema={schema}
          zodSchema={zodSchema}
          formData={data}
          onChange={setData}
          onSubmit={() => undefined}
        />
        <button type="button" onClick={() => setData((d) => ({ ...d, title: 'From the host' }))}>
          Load
        </button>
        <output>{JSON.stringify(data)}</output>
      </>
    );
  };

  it('takes new formData after an edit, without remounting the field being typed in', async () => {
    const user = userEvent.setup();
    render(<Host />);
    const body = screen.getByLabelText('Body');
    await user.type(body, 'typed');
    await user.click(screen.getByRole('button', { name: 'Load' }));
    expect(screen.getByLabelText('Title')).toHaveValue('From the host');
    // The edited field kept its value and is the same element (no remount).
    expect(screen.getByLabelText('Body')).toBe(body);
    expect(body).toHaveValue('typed');
  });

  it('keeps focus and the caret while the host echoes each change back', async () => {
    const user = userEvent.setup();
    render(<Host />);
    const title = screen.getByLabelText('Title') as HTMLInputElement;
    await user.click(title);
    title.setSelectionRange(1, 1);
    await user.keyboard('x');
    expect(title).toHaveValue('Oxne');
    expect(title).toHaveFocus();
    expect(title.selectionStart).toBe(2);
  });

  it('does not write values back when the host passes equal content in a new object', async () => {
    const user = userEvent.setup();
    const Inline = () => {
      const [, force] = React.useState(0);
      return (
        <>
          <DynamicForm
            schema={schema}
            zodSchema={zodSchema}
            formData={{ title: 'Start' }}
            onSubmit={() => undefined}
          />
          <button type="button" onClick={() => force((n) => n + 1)}>
            Rerender
          </button>
        </>
      );
    };
    render(<Inline />);
    await user.type(screen.getByLabelText('Title'), '!');
    await user.click(screen.getByRole('button', { name: 'Rerender' }));
    expect(screen.getByLabelText('Title')).toHaveValue('Start!');
  });
});

describe('DynamicForm: onFieldFocus and onFieldBlur', () => {
  it('reports the key of the field focus enters and leaves, once per field', async () => {
    const user = userEvent.setup();
    const onFieldFocus = jest.fn();
    const onFieldBlur = jest.fn();
    render(
      <DynamicForm
        schema={schema}
        zodSchema={zodSchema}
        formData={{}}
        onFieldFocus={onFieldFocus}
        onFieldBlur={onFieldBlur}
        onSubmit={() => undefined}
      />,
    );
    await user.click(screen.getByLabelText('Title'));
    expect(onFieldFocus).toHaveBeenLastCalledWith('title');
    await user.click(screen.getByLabelText('City'));
    expect(onFieldBlur).toHaveBeenCalledWith('title');
    expect(onFieldFocus).toHaveBeenLastCalledWith('address.city');
    await user.tab();
    expect(onFieldBlur).toHaveBeenLastCalledWith('address.city');
    expect(onFieldFocus.mock.calls.map(([key]) => key)).toEqual(['title', 'address.city']);
  });
});
