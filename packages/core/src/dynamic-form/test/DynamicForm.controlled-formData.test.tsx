import * as React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';

import { DynamicForm } from 'dynamic-form';

/**
 * Proves the controlled bridge: when the parent updates `formData`
 * externally, RJSF's rendered input reflects the new value. Previously
 * RJSF held internal state seeded once at mount; external updates were
 * dropped, which blocked derived-state recomputation outside RJSF.
 */
describe('DynamicForm — controlled formData bridge', () => {
  const schema: RJSFSchema = {
    type: 'object',
    required: ['subject'],
    properties: { subject: { type: 'string', title: 'Subject' } },
  };
  const uiSchema: UiSchema = { subject: { 'ui:widget': 'text' } };
  const zodSchema = z.object({ subject: z.string() });

  function Harness({ initial }: { initial: string }) {
    const [formData, setFormData] = React.useState({ subject: initial });
    return (
      <>
        <button type="button" data-testid="parent-reset" onClick={() => setFormData({ subject: 'from-parent' })}>
          reset
        </button>
        <DynamicForm schema={schema} uiSchema={uiSchema} zodSchema={zodSchema} formData={formData} onChange={setFormData} onSubmit={jest.fn()} />
      </>
    );
  }

  it('reflects external formData updates in the rendered input', async () => {
    const user = userEvent.setup();
    render(<Harness initial="initial-value" />);

    const input = screen.getByRole('textbox', { name: /subject/i }) as HTMLInputElement;
    expect(input.value).toBe('initial-value');

    await act(async () => {
      await user.click(screen.getByTestId('parent-reset'));
    });

    expect((screen.getByRole('textbox', { name: /subject/i }) as HTMLInputElement).value).toBe('from-parent');
  });

  it('still flows user keystrokes back through onChange', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    function ControlledHarness() {
      const [formData, setFormData] = React.useState({ subject: '' });
      return (
        <DynamicForm
          schema={schema}
          uiSchema={uiSchema}
          zodSchema={zodSchema}
          formData={formData}
          onChange={(next) => {
            setFormData(next as { subject: string });
            onChange(next);
          }}
          onSubmit={jest.fn()}
        />
      );
    }

    render(<ControlledHarness />);
    await user.type(screen.getByRole('textbox', { name: /subject/i }), 'hi');

    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last.subject).toBe('hi');
  });
});
