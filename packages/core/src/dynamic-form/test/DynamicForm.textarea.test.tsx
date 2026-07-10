import '@testing-library/jest-dom';
import * as React from 'react';
import { z } from 'zod';

import { buildSingleFieldSchema, buildSingleFieldUiSchema, renderDynamicForm, screen } from './testing/renderDynamicForm';

/**
 * TextareaWidget through the full DynamicForm ancestry — mirrors the
 * TextWidget integration suite. Every story-level claim about textarea
 * behaviour gets a regression test here.
 */
describe('DynamicForm — TextareaWidget integration', () => {
  const subjectSchema = buildSingleFieldSchema('notes', { type: 'string', title: 'Notes' });

  describe('render shape', () => {
    it('renders a <textarea> (not <input>) when ui:widget=textarea', () => {
      renderDynamicForm({
        schema: subjectSchema,
        uiSchema: buildSingleFieldUiSchema('notes', { 'ui:widget': 'textarea' }),
        zodSchema: z.object({ notes: z.string() }),
        formData: { notes: '' },
      });
      const tas = document.querySelectorAll('textarea');
      expect(tas).toHaveLength(1);
      expect(screen.queryByRole('textbox')).toBe(tas[0]);
    });

    it('defaults rows to 5 when ui:options.rows is not provided', () => {
      renderDynamicForm({
        schema: subjectSchema,
        uiSchema: buildSingleFieldUiSchema('notes', { 'ui:widget': 'textarea' }),
        zodSchema: z.object({ notes: z.string() }),
        formData: { notes: '' },
      });
      expect(document.querySelector('textarea')).toHaveAttribute('rows', '5');
    });

    it('respects ui:options.rows when provided', () => {
      renderDynamicForm({
        schema: subjectSchema,
        uiSchema: buildSingleFieldUiSchema('notes', { 'ui:widget': 'textarea', 'ui:options': { rows: 9 } }),
        zodSchema: z.object({ notes: z.string() }),
        formData: { notes: '' },
      });
      expect(document.querySelector('textarea')).toHaveAttribute('rows', '9');
    });

    it('forwards ui:placeholder', () => {
      renderDynamicForm({
        schema: subjectSchema,
        uiSchema: buildSingleFieldUiSchema('notes', { 'ui:widget': 'textarea', 'ui:placeholder': "What's on your mind?" }),
        zodSchema: z.object({ notes: z.string() }),
        formData: { notes: '' },
      });
      expect(document.querySelector('textarea')).toHaveAttribute('placeholder', "What's on your mind?");
    });
  });

  describe('user typing', () => {
    it('accepts multiple characters (regression: single-char bug)', async () => {
      const { user } = renderDynamicForm({
        schema: subjectSchema,
        uiSchema: buildSingleFieldUiSchema('notes', { 'ui:widget': 'textarea' }),
        zodSchema: z.object({ notes: z.string() }),
        formData: { notes: '' },
      });
      const ta = document.querySelector('textarea')!;
      await user.type(ta, 'hello world');
      expect(ta).toHaveValue('hello world');
    });

    it('preserves newlines typed by the user', async () => {
      const { user } = renderDynamicForm({
        schema: subjectSchema,
        uiSchema: buildSingleFieldUiSchema('notes', { 'ui:widget': 'textarea' }),
        zodSchema: z.object({ notes: z.string() }),
        formData: { notes: '' },
      });
      const ta = document.querySelector('textarea')!;
      await user.type(ta, 'line 1{Enter}line 2');
      expect(ta).toHaveValue('line 1\nline 2');
    });
  });

  describe('submit → Zod parse pipeline', () => {
    it('calls onSubmit with the parsed value on valid input', async () => {
      const { user, onSubmit, submit } = renderDynamicForm({
        schema: buildSingleFieldSchema('notes', { type: 'string', title: 'Notes' }, true),
        uiSchema: buildSingleFieldUiSchema('notes', { 'ui:widget': 'textarea' }),
        zodSchema: z.object({ notes: z.string().min(1) }),
        formData: { notes: '' },
      });
      await user.type(document.querySelector('textarea')!, 'A long message');
      await submit();
      expect(onSubmit).toHaveBeenCalledWith({ notes: 'A long message' });
    });

    it('does NOT call onSubmit when Zod rejects; routes errors through onError', async () => {
      const { onSubmit, onError, submit } = renderDynamicForm({
        schema: subjectSchema,
        uiSchema: buildSingleFieldUiSchema('notes', { 'ui:widget': 'textarea' }),
        zodSchema: z.object({ notes: z.string().min(10, 'notes must be at least 10 chars') }),
        formData: { notes: '' },
      });
      await submit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ path: ['notes'], source: 'zod', message: 'notes must be at least 10 chars' })]),
      );
    });
  });

  describe('disabled / readOnly propagation', () => {
    it('renders disabled when DynamicForm.disabled is set', () => {
      renderDynamicForm({
        schema: subjectSchema,
        uiSchema: buildSingleFieldUiSchema('notes', { 'ui:widget': 'textarea' }),
        zodSchema: z.object({ notes: z.string() }),
        formData: { notes: '' },
        disabled: true,
      });
      expect(document.querySelector('textarea')).toBeDisabled();
    });

    it('renders read-only when DynamicForm.readOnly is set', () => {
      renderDynamicForm({
        schema: subjectSchema,
        uiSchema: buildSingleFieldUiSchema('notes', { 'ui:widget': 'textarea' }),
        zodSchema: z.object({ notes: z.string() }),
        formData: { notes: '' },
        readOnly: true,
      });
      expect(document.querySelector('textarea')).toHaveAttribute('readonly');
    });
  });
});
