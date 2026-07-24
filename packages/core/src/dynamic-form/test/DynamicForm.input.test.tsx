import '@testing-library/jest-dom';
import { z } from 'zod';

import { Input } from '@oc-tech/omni-ui-components/Input';
import { buildSingleFieldSchema, buildSingleFieldUiSchema, renderDynamicForm, screen } from './testing/renderDynamicForm';

describe('DynamicForm — Input widget integration', () => {
  describe('rendering attribute matrix (data-driven, one assertion per case)', () => {
    const baseSchema = (overrides = {}) => buildSingleFieldSchema('subject', { type: 'string', title: 'Subject', ...overrides });
    const baseUi = (overrides = {}) => buildSingleFieldUiSchema('subject', { 'ui:widget': 'text', ...overrides });
    const baseZod = z.object({ subject: z.string() });

    it.each([
      { name: 'empty', formData: { subject: '' }, expected: '' },
      { name: 'populated', formData: { subject: 'Hello' }, expected: 'Hello' },
    ])('value: $name → input value matches formData', ({ formData, expected }) => {
      renderDynamicForm({ schema: baseSchema(), uiSchema: baseUi(), zodSchema: baseZod, formData });
      expect(screen.getByRole('textbox')).toHaveValue(expected);
    });

    it('label: schema title is rendered when ui:title is not overridden', () => {
      renderDynamicForm({
        schema: baseSchema(),
        uiSchema: baseUi(),
        zodSchema: baseZod,
        formData: { subject: '' },
      });
      expect(screen.getByText('Subject')).toBeInTheDocument();
    });

    it('label: ui:label=false suppresses the label', () => {
      renderDynamicForm({
        schema: baseSchema(),
        uiSchema: baseUi({ 'ui:label': false }),
        zodSchema: baseZod,
        formData: { subject: '' },
      });
      expect(screen.queryByText('Subject')).not.toBeInTheDocument();
    });

    it('placeholder: ui:placeholder is forwarded', () => {
      renderDynamicForm({
        schema: baseSchema(),
        uiSchema: baseUi({ 'ui:placeholder': 'New message from …' }),
        zodSchema: baseZod,
        formData: { subject: '' },
      });
      expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'New message from …');
    });

    it('maxLength: schema maxLength flows to the DOM', () => {
      renderDynamicForm({
        schema: baseSchema({ maxLength: 50 }),
        uiSchema: baseUi(),
        zodSchema: baseZod,
        formData: { subject: '' },
      });
      expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '50');
    });
  });

  describe('user typing → onChange propagation', () => {
    it('updates the underlying RJSF formData and shows the new value', async () => {
      const { user } = renderDynamicForm({
        schema: buildSingleFieldSchema('subject', { type: 'string', title: 'Subject' }),
        uiSchema: buildSingleFieldUiSchema('subject', { 'ui:widget': 'text' }),
        zodSchema: z.object({ subject: z.string() }),
        formData: { subject: '' },
      });
      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello');
      expect(input).toHaveValue('Hello');
    });
  });

  describe('submit → Zod parse pipeline', () => {
    it('calls onSubmit with the parsed value on valid input', async () => {
      const { user, onSubmit, submit } = renderDynamicForm({
        schema: buildSingleFieldSchema('subject', { type: 'string', title: 'Subject' }, true),
        uiSchema: buildSingleFieldUiSchema('subject', { 'ui:widget': 'text' }),
        zodSchema: z.object({ subject: z.string().min(1) }),
        formData: { subject: '' },
      });
      await user.type(screen.getByRole('textbox'), 'Welcome');
      await submit();
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith({ subject: 'Welcome' });
    });

    it('does NOT call onSubmit when Zod rejects; injects extraErrors', async () => {
      const { onSubmit, onError, submit } = renderDynamicForm({
        schema: buildSingleFieldSchema('subject', { type: 'string', title: 'Subject' }),
        uiSchema: buildSingleFieldUiSchema('subject', { 'ui:widget': 'text' }),
        zodSchema: z.object({ subject: z.string().min(1, 'subject is required') }),
        formData: { subject: '' },
      });
      await submit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0][0][0]).toMatchObject({
        path: ['subject'],
        message: 'subject is required',
        source: 'zod',
      });
      expect(await screen.findByText('subject is required')).toBeInTheDocument();
    });

    it('clears extraErrors as the user re-edits', async () => {
      const { user, submit } = renderDynamicForm({
        schema: buildSingleFieldSchema('subject', { type: 'string', title: 'Subject' }),
        uiSchema: buildSingleFieldUiSchema('subject', { 'ui:widget': 'text' }),
        zodSchema: z.object({ subject: z.string().min(1, 'subject is required') }),
        formData: { subject: '' },
      });
      await submit();
      expect(await screen.findByText('subject is required')).toBeInTheDocument();
      await user.type(screen.getByRole('textbox'), 'X');
      expect(screen.queryByText('subject is required')).not.toBeInTheDocument();
    });
  });

  describe('disabled flag flows through the stack', () => {
    const renderWith = (disabled: boolean) =>
      renderDynamicForm({
        schema: buildSingleFieldSchema('subject', { type: 'string', title: 'Subject' }),
        uiSchema: buildSingleFieldUiSchema('subject', { 'ui:widget': 'text' }),
        zodSchema: z.object({ subject: z.string() }),
        formData: { subject: '' },
        disabled,
      });

    it('disabled=true → input disabled', () => {
      renderWith(true);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('disabled=false → input enabled', () => {
      renderWith(false);
      expect(screen.getByRole('textbox')).not.toBeDisabled();
    });
  });

  describe('readOnly flag flows through the stack', () => {
    const renderWith = (readOnly: boolean) =>
      renderDynamicForm({
        schema: buildSingleFieldSchema('subject', { type: 'string', title: 'Subject' }),
        uiSchema: buildSingleFieldUiSchema('subject', { 'ui:widget': 'text' }),
        zodSchema: z.object({ subject: z.string() }),
        formData: { subject: '' },
        readOnly,
      });

    it('readOnly=true → input readonly', () => {
      renderWith(true);
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    it('readOnly=false → no readonly attr', () => {
      renderWith(false);
      expect(screen.getByRole('textbox')).not.toHaveAttribute('readonly');
    });

    it('forwards required marker from JSON Schema required[]', () => {
      renderDynamicForm({
        schema: buildSingleFieldSchema('subject', { type: 'string', title: 'Subject' }, true),
        uiSchema: buildSingleFieldUiSchema('subject', { 'ui:widget': 'text' }),
        zodSchema: z.object({ subject: z.string() }),
        formData: { subject: '' },
      });
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('render isolation', () => {
    it('typing in one field does not re-render a sibling TextWidget more than once', async () => {
      const renderCounts: Record<string, number> = { a: 0, b: 0 };
      const makeCountingWidget = (id: 'a' | 'b') => {
        const Widget = (props: { id: string; value?: string; onChange: (v: string) => void }) => {
          renderCounts[id] += 1;
          return <Input id={props.id} value={props.value ?? ''} onChange={(next: string) => props.onChange(next)} />;
        };
        Widget.displayName = `CountingWidget_${id}`;
        return Widget;
      };
      const widgets = { aWidget: makeCountingWidget('a'), bWidget: makeCountingWidget('b') };
      const { user } = renderDynamicForm({
        schema: {
          type: 'object',
          properties: {
            a: { type: 'string', title: 'A' },
            b: { type: 'string', title: 'B' },
          },
        },
        uiSchema: {
          a: { 'ui:widget': 'aWidget' },
          b: { 'ui:widget': 'bWidget' },
        },
        zodSchema: z.object({ a: z.string(), b: z.string() }),
        formData: { a: '', b: '' },
        widgets,
      });
      const initialB = renderCounts.b;
      const [aInput] = screen.getAllByRole('textbox');
      await user.type(aInput, 'xyz');
      const deltaB = renderCounts.b - initialB;
      expect(deltaB).toBeLessThanOrEqual(1);
    });
  });

  describe('onSubmit callback rejection', () => {
    it('routes the thrown error through onError', async () => {
      const onSubmit = jest.fn().mockRejectedValue(new Error('boom'));
      const { onError, submit } = renderDynamicForm({
        schema: buildSingleFieldSchema('subject', { type: 'string', title: 'Subject' }),
        uiSchema: buildSingleFieldUiSchema('subject', { 'ui:widget': 'text' }),
        zodSchema: z.object({ subject: z.string() }),
        formData: { subject: 'x' },
        onSubmit,
      });
      await submit();
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0][0][0]).toMatchObject({
        message: 'boom',
        source: 'api',
      });
    });
  });
});
