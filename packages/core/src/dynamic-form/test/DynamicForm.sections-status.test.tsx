import '@testing-library/jest-dom';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { z } from 'zod';
import { DynamicForm } from '../DynamicForm';
import type { OmniRjsfFormContext } from '../lib/formContext';

const schema: RJSFSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string', title: 'Summary' },
    experience: {
      type: 'object',
      title: 'Experience',
      properties: { role: { type: 'string', title: 'Role' } },
    },
  },
};
const uiSchema: UiSchema = { experience: { 'ui:options': { collapsible: true } } };
const zodSchema = z.object({}).passthrough();
const base = { derived: {}, optionSets: {}, actions: {}, locale: 'en' };

const Form = ({ formContext }: { formContext: Partial<OmniRjsfFormContext> }) => (
  <DynamicForm
    schema={schema}
    uiSchema={uiSchema}
    zodSchema={zodSchema}
    formData={{}}
    formContext={{ ...base, ...formContext }}
    onSubmit={() => undefined}
  />
);

describe('DynamicForm: sections the host controls, and status as data', () => {
  it('opens and closes a controlled section only when the host answers', async () => {
    const user = userEvent.setup();
    const seen: [string, boolean][] = [];
    const Host = () => {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <Form
            formContext={{
              sections: { experience: { open } },
              onSectionOpenChange: (key, next) => {
                seen.push([key, next]);
                if (key === 'experience' && next) setOpen(true);
              },
            }}
          />
          <button type="button" onClick={() => setOpen(false)}>
            Close from outside
          </button>
        </>
      );
    };
    render(<Host />);
    const toggle = screen.getByRole('button', { name: 'Experience' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(seen).toEqual([['experience', true]]);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    // The host refuses to close: the section stays open, and the host was still told.
    await user.click(toggle);
    expect(seen[1]).toEqual(['experience', false]);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: 'Close from outside' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps its own open state when the host gives none, and still reports it', async () => {
    const user = userEvent.setup();
    const onSectionOpenChange = jest.fn();
    render(<Form formContext={{ onSectionOpenChange }} />);
    const toggle = screen.getByRole('button', { name: 'Experience' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(onSectionOpenChange).toHaveBeenCalledWith('experience', false);
  });

  it('draws the header slot and status of a section, and a status beside a field label', () => {
    render(
      <Form
        formContext={{
          sections: {
            experience: { meta: '3 entries', status: { tone: 'warning', label: 'Incomplete' } },
          },
          fieldStatus: {
            summary: { tone: 'success', label: 'Saved' },
            'experience.role': { tone: 'danger', label: 'Missing' },
          },
        }}
      />,
    );
    expect(screen.getByText('3 entries')).toBeInTheDocument();
    expect(screen.getByText('Incomplete').closest('[data-slot="form-status"]')).toHaveAttribute(
      'data-tone',
      'warning',
    );
    const saved = screen.getByText('Saved').closest('[data-slot="form-status"]') as HTMLElement;
    expect(saved).toHaveAttribute('data-tone', 'success');
    expect(saved.closest('[data-field-key]')).toHaveAttribute('data-field-key', 'summary');
    expect(screen.getByText('Missing').closest('[data-field-key]')).toHaveAttribute(
      'data-field-key',
      'experience.role',
    );
    // The label still names its input alone.
    expect(screen.getByLabelText('Summary')).toHaveAttribute('id', 'root_summary');
  });
});
