import '@testing-library/jest-dom';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { render } from '@testing-library/react';
import * as React from 'react';
import { z } from 'zod';
import { DynamicForm } from '../DynamicForm';
import {
  appFields,
  appWidgets,
  type DynamicFormHandle,
  fieldCatalog,
  widgetCatalog,
} from '../index';
import { act, renderDynamicForm, screen } from './testing/renderDynamicForm';

/**
 * The contract EVERY value-holding widget shares, checked the same way for each one:
 * help and error tied to the control (`aria-describedby`), an error drawn with `role="alert"`, disabled drawn
 * as disabled, read-only drawn as read-only (focusable, not disabled), the required mark, and focus by key.
 *
 * Widgets covered, by registered component: TextWidget, PasswordWidget, TextareaWidget, SelectWidget,
 * ComboboxWidget, MultiSelectWidget, RadioWidget, CheckboxesWidget, SwitchWidget, SegmentedWidget, RangeWidget,
 * StepperWidget, NumberInputWidget, CurrencyWidget, PhoneWidget, InputOTPWidget, TagInputWidget, DateWidget,
 * CalendarWidget, DateTimeWidget, TimeWidget, ColorWidget, FileUploadWidget, RichTextWidget, RatingWidget,
 * AutoCompleteWidget, MentionsWidget, CascaderWidget, TreeSelectWidget, TransferWidget, ComposerWidget,
 * ModelPickerWidget, FeedbackReasonsWidget. CheckboxWidget draws its own label and is covered in its own file; HiddenWidget,
 * DerivedTextWidget and IconToolbarWidget hold no editable value (rendering only, at the end).
 */
interface Case {
  widget: string;
  name: string;
  schema: RJSFSchema;
  options?: Record<string, unknown>;
  value: unknown;
  /** The one widget that cannot be read-only: its rule is "drawn disabled". */
  readOnlyIsDisabled?: boolean;
  /** Controls that cannot be described (they hold several controls and describe none). */
  noDescribedBy?: boolean;
}

const ENUM = { type: 'string', enum: ['a', 'b', 'c'] } as const;
const ENUM_ARRAY = { type: 'array', uniqueItems: true, items: ENUM } as const;
const TREE = [
  { value: 'eu', label: 'Europe', children: [{ value: 'fr', label: 'France' }] },
  { value: 'as', label: 'Asia' },
];

const CASES: Case[] = [
  { widget: 'TextWidget', name: 'text', schema: { type: 'string' }, value: 'hello' },
  { widget: 'PasswordWidget', name: 'password', schema: { type: 'string' }, value: 'secret' },
  { widget: 'TextareaWidget', name: 'textarea', schema: { type: 'string' }, value: 'hello' },
  { widget: 'SelectWidget', name: 'select', schema: ENUM, value: 'a' },
  { widget: 'ComboboxWidget', name: 'combobox', schema: ENUM, value: 'a' },
  { widget: 'MultiSelectWidget', name: 'multiSelect', schema: ENUM_ARRAY, value: ['a'] },
  { widget: 'RadioWidget', name: 'radio', schema: ENUM, value: 'a' },
  { widget: 'CheckboxesWidget', name: 'checkboxes', schema: ENUM_ARRAY, value: ['a'] },
  { widget: 'SwitchWidget', name: 'switch', schema: { type: 'boolean' }, value: true },
  { widget: 'SegmentedWidget', name: 'segmented', schema: ENUM, value: 'a' },
  {
    widget: 'RangeWidget',
    name: 'range',
    schema: { type: 'number', minimum: 0, maximum: 10 },
    value: 4,
  },
  {
    widget: 'StepperWidget',
    name: 'stepper',
    schema: { type: 'integer', minimum: 0, maximum: 10 },
    value: 4,
  },
  { widget: 'NumberInputWidget', name: 'numberInput', schema: { type: 'number' }, value: 4 },
  { widget: 'CurrencyWidget', name: 'currency', schema: { type: 'number' }, value: 4 },
  { widget: 'PhoneWidget', name: 'phone', schema: { type: 'string' }, value: '+15551234567' },
  { widget: 'InputOTPWidget', name: 'otp', schema: { type: 'string', maxLength: 4 }, value: '12' },
  {
    widget: 'TagInputWidget',
    name: 'tags',
    schema: { type: 'array', items: { type: 'string' } },
    value: ['x'],
  },
  {
    widget: 'DateWidget',
    name: 'date',
    schema: { type: 'string', format: 'date' },
    value: '2026-10-09',
  },
  {
    widget: 'CalendarWidget',
    name: 'calendar',
    schema: { type: 'string', format: 'date' },
    value: '2026-10-09',
  },
  {
    widget: 'DateTimeWidget',
    name: 'dateTime',
    schema: { type: 'string', format: 'date-time' },
    value: '2026-10-09T10:30',
  },
  { widget: 'TimeWidget', name: 'time', schema: { type: 'string' }, value: '10:30' },
  { widget: 'ColorWidget', name: 'color', schema: { type: 'string' }, value: '#112233' },
  {
    widget: 'FileUploadWidget',
    name: 'file',
    schema: { type: 'string' },
    options: { mode: 'name' },
    value: 'report.pdf',
  },
  { widget: 'RichTextWidget', name: 'richText', schema: { type: 'string' }, value: '<p>Hi</p>' },
  {
    widget: 'RatingWidget',
    name: 'rating',
    schema: { type: 'integer', minimum: 0, maximum: 5 },
    value: 3,
  },
  {
    widget: 'AutoCompleteWidget',
    name: 'autocomplete',
    schema: { type: 'string', examples: ['Alpha', 'Beta'] },
    value: 'Al',
  },
  {
    widget: 'MentionsWidget',
    name: 'mentions',
    schema: { type: 'string' },
    options: { optionSetKey: 'people' },
    value: 'hi',
  },
  {
    widget: 'CascaderWidget',
    name: 'cascader',
    schema: { type: 'array', items: { type: 'string' } },
    options: { optionTreeKey: 'places' },
    value: ['eu', 'fr'],
  },
  {
    widget: 'TreeSelectWidget',
    name: 'treeSelect',
    schema: { type: 'string' },
    options: { optionTreeKey: 'places' },
    value: 'as',
  },
  { widget: 'TransferWidget', name: 'transfer', schema: ENUM_ARRAY, value: ['a'] },
  { widget: 'FeedbackReasonsWidget', name: 'feedbackReasons', schema: ENUM_ARRAY, value: ['a'] },
  { widget: 'ComposerWidget', name: 'composer', schema: { type: 'string' }, value: 'draft' },
  {
    widget: 'ModelPickerWidget',
    name: 'modelPicker',
    schema: { type: 'string' },
    options: { modelSetKey: 'chat' },
    value: 'm1',
    readOnlyIsDisabled: true,
  },
];

const formContext = {
  derived: {},
  actions: {},
  locale: 'en',
  optionSets: {
    people: [
      {
        value: 'alex',
        label: 'Alex',
        description: null,
        avatarUrl: null,
        initials: null,
        color: null,
        group: null,
        disabled: false,
      },
    ],
  },
  optionTrees: { places: TREE },
  modelSets: { chat: [{ id: 'm1', name: 'Model one' }] },
};

const ID = 'root_f';
const field = () => document.querySelector<HTMLElement>(`[data-field-id="${ID}"]`) as HTMLElement;

const setup = (
  c: Case,
  extra: {
    ui?: Record<string, unknown>;
    required?: boolean;
    description?: string;
    fail?: boolean;
  } = {},
  form: { disabled?: boolean; readOnly?: boolean } = {},
) => {
  const schema: RJSFSchema = {
    type: 'object',
    ...(extra.required ? { required: ['f'] } : {}),
    properties: {
      f: {
        title: 'Field',
        ...c.schema,
        ...(extra.description ? { description: extra.description } : {}),
      },
    },
  };
  const uiSchema: UiSchema = {
    f: { 'ui:widget': c.name, 'ui:options': { ...c.options }, ...extra.ui },
  };
  const zodSchema = z.object({
    f: extra.fail ? z.any().refine(() => false, 'Not allowed') : z.any(),
  });
  return renderDynamicForm({
    schema,
    uiSchema,
    zodSchema,
    formData: { f: c.value },
    formContext,
    ...form,
  });
};

describe('the catalog and the registries', () => {
  it('lists every registered widget name, and only those', () => {
    const listed = widgetCatalog.flatMap((entry) => [entry.name, ...entry.aliases]).sort();
    expect(listed).toEqual(Object.keys(appWidgets).sort());
    for (const entry of widgetCatalog) {
      expect(appWidgets[entry.name], entry.name).toBe(appWidgets[entry.widget]);
      for (const alias of entry.aliases)
        expect(appWidgets[alias], alias).toBe(appWidgets[entry.widget]);
    }
  });

  it('lists every registered field name, and only those', () => {
    const listed = fieldCatalog.flatMap((entry) => [entry.name, ...entry.aliases]).sort();
    expect(listed).toEqual(Object.keys(appFields).sort());
  });

  it('has a contract case for every value-holding widget', () => {
    const covered = new Set([...CASES.map((c) => c.widget), 'CheckboxWidget']);
    const valueless = ['HiddenWidget', 'DerivedTextWidget', 'IconToolbarWidget'];
    for (const entry of widgetCatalog)
      if (!valueless.includes(entry.widget))
        expect(covered.has(entry.widget), entry.widget).toBe(true);
  });
});

describe.each(CASES)('$widget ($name): the shared widget contract', (c) => {
  it('draws the label and the value, and ties the description to the control', () => {
    setup(c, { description: 'Help for this field' });
    expect(screen.getByText('Field')).toBeInTheDocument();
    const description = document.getElementById(`${ID}__description`);
    expect(description).toHaveTextContent('Help for this field');
    expect(field().querySelector(`[aria-describedby~="${ID}__description"]`)).not.toBeNull();
  });

  it('draws a validation error with role="alert" and ties it to the control', async () => {
    const { submit, onSubmit } = setup(c, { fail: true, description: 'Help for this field' });
    await submit();
    const error = await screen.findByRole('alert');
    expect(error).toHaveTextContent('Not allowed');
    expect(error).toHaveAttribute('id', `${ID}__error`);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(field().querySelector(`[aria-describedby~="${ID}__error"]`)).not.toBeNull();
    // The error replaces the description; the control no longer points at a description that is not drawn.
    expect(document.getElementById(`${ID}__description`)).toBeNull();
    expect(field().querySelector(`[aria-describedby~="${ID}__description"]`)).toBeNull();
    expect(field().querySelector('[aria-invalid="true"], [data-state="invalid"]')).not.toBeNull();
  });

  it('ties ui:help to the control', () => {
    setup(c, { ui: { 'ui:help': 'A hint that stays' } });
    expect(document.getElementById(`${ID}__help`)).toHaveTextContent('A hint that stays');
    expect(field().querySelector(`[aria-describedby~="${ID}__help"]`)).not.toBeNull();
  });

  it('marks a required field', () => {
    setup(c, { required: true });
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    expect(document.getElementById(`${ID}__required`)).toHaveTextContent('Required');
  });

  it('draws a disabled field as disabled', () => {
    setup(c, { ui: { 'ui:disabled': true } });
    expect(
      field().querySelector(':disabled, [aria-disabled="true"], [data-disabled]'),
    ).not.toBeNull();
  });

  it(
    c.readOnlyIsDisabled
      ? 'draws a read-only field disabled (the documented rule for this control)'
      : 'draws a read-only field as read-only: focusable, not disabled',
    () => {
      const ref = React.createRef<DynamicFormHandle>();
      render(
        <DynamicForm
          apiRef={ref}
          schema={{ type: 'object', properties: { f: { title: 'Field', ...c.schema } } }}
          uiSchema={{ f: { 'ui:widget': c.name, 'ui:options': { ...c.options } } }}
          zodSchema={z.object({ f: z.any() })}
          formData={{ f: c.value }}
          formContext={formContext}
          readOnly
          onSubmit={() => undefined}
        />,
      );
      if (c.readOnlyIsDisabled) {
        expect(field().querySelector(':disabled')).not.toBeNull();
        return;
      }
      expect(
        field().querySelector(
          '[readonly], [aria-readonly="true"], [data-readonly], [data-state="readonly"], [contenteditable="false"]',
        ),
      ).not.toBeNull();
      let focused = false;
      act(() => {
        focused = ref.current?.focusField('f') ?? false;
      });
      expect(focused).toBe(true);
      expect(field().contains(document.activeElement)).toBe(true);
      expect(document.activeElement).not.toBeDisabled();
    },
  );

  it('moves focus to the field by its key', () => {
    const ref = React.createRef<DynamicFormHandle>();
    render(
      <DynamicForm
        apiRef={ref}
        schema={{
          type: 'object',
          properties: {
            first: { type: 'string', title: 'First' },
            f: { title: 'Field', ...c.schema },
          },
        }}
        uiSchema={{ f: { 'ui:widget': c.name, 'ui:options': { ...c.options } } }}
        zodSchema={z.object({ f: z.any() })}
        formData={{ f: c.value }}
        formContext={formContext}
        onSubmit={() => undefined}
      />,
    );
    let focused = false;
    act(() => {
      focused = ref.current?.focusField('f') ?? false;
    });
    expect(focused).toBe(true);
    expect(field().contains(document.activeElement)).toBe(true);
    act(() => {
      expect(ref.current?.focusField('missing')).toBe(false);
    });
  });
});

describe('widgets that hold no editable value', () => {
  it('HiddenWidget carries its value and draws nothing', async () => {
    const { submit, onSubmit } = renderDynamicForm({
      schema: { type: 'object', properties: { f: { type: 'string' } } },
      uiSchema: { f: { 'ui:widget': 'hidden' } },
      zodSchema: z.object({ f: z.string() }),
      formData: { f: 'kept' },
    });
    expect(document.querySelector('[data-slot="hidden-widget"]')).toHaveValue('kept');
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ f: 'kept' });
  });

  it('DerivedTextWidget draws formContext.derived and its tone from tokens', () => {
    renderDynamicForm({
      schema: { type: 'object', properties: { f: { type: 'string', title: 'Total' } } },
      uiSchema: {
        f: { 'ui:widget': 'derivedText', 'ui:options': { derivedKey: 'total', tone: 'success' } },
      },
      zodSchema: z.object({ f: z.any() }),
      formData: {},
      formContext: { ...formContext, derived: { total: '42.00' } },
    });
    const text = screen.getByText('42.00');
    expect(text.className).toContain('--oui-tone-success-fg');
  });
});
