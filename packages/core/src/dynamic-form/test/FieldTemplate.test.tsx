import '@testing-library/jest-dom';
import { z } from 'zod';

import { buildSingleFieldSchema, buildSingleFieldUiSchema, renderDynamicForm, screen } from './testing/renderDynamicForm';

/**
 * Omni overrides @rjsf/shadcn's FieldTemplate to:
 *  - render the required asterisk in `text-destructive`
 *  - keep label + description + error rows in the same `flex-col gap-2` chrome
 * These tests exercise it through the full DynamicForm ancestry.
 */
describe('FieldTemplate (RJSF chrome)', () => {
  describe('required marker', () => {
    it('renders an asterisk in text-destructive when required', () => {
      renderDynamicForm({
        schema: buildSingleFieldSchema('subject', { type: 'string', title: 'Subject' }, true),
        uiSchema: buildSingleFieldUiSchema('subject', { 'ui:widget': 'text' }),
        zodSchema: z.object({ subject: z.string().min(1) }),
        formData: { subject: '' },
      });
      const label = screen.getByText('Subject').closest('label')!;
      const star = label.querySelector('span');
      expect(star).not.toBeNull();
      expect(star).toHaveTextContent('*');
      expect(star).toHaveClass('text-[var(--oui-foreground-required)]');
    });

    it('omits the asterisk when not required', () => {
      renderDynamicForm({
        schema: buildSingleFieldSchema('subject', { type: 'string', title: 'Subject' }),
        uiSchema: buildSingleFieldUiSchema('subject', { 'ui:widget': 'text' }),
        zodSchema: z.object({ subject: z.string() }),
        formData: { subject: '' },
      });
      const label = screen.getByText('Subject').closest('label')!;
      expect(label.querySelector('span')).toBeNull();
    });
  });

  describe('label / input binding', () => {
    it('binds <label htmlFor> to the rendered input id', () => {
      renderDynamicForm({
        schema: buildSingleFieldSchema('subject', { type: 'string', title: 'Subject' }),
        uiSchema: buildSingleFieldUiSchema('subject', { 'ui:widget': 'text' }),
        zodSchema: z.object({ subject: z.string() }),
        formData: { subject: '' },
      });
      const input = screen.getByLabelText('Subject');
      expect(input).toBeInTheDocument();
      expect(input.tagName).toMatch(/^(INPUT|TEXTAREA)$/);
    });
  });

  describe('description', () => {
    it('renders the description text from the schema', () => {
      renderDynamicForm({
        schema: buildSingleFieldSchema('subject', {
          type: 'string',
          title: 'Subject',
          description: 'Recipients see this in inbox preview',
        }),
        uiSchema: buildSingleFieldUiSchema('subject', { 'ui:widget': 'text' }),
        zodSchema: z.object({ subject: z.string() }),
        formData: { subject: '' },
      });
      expect(screen.getByText(/inbox preview/i)).toBeInTheDocument();
    });
  });
});
