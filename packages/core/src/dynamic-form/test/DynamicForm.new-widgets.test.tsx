import '@testing-library/jest-dom';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { z } from 'zod';
import { fireEvent, renderDynamicForm, screen, waitFor, within } from './testing/renderDynamicForm';

/**
 * Value in, value out for the widgets added with the contract: RatingWidget, PasswordWidget,
 * AutoCompleteWidget, CalendarWidget, FileUploadWidget (real File values), the second modes of SegmentedWidget
 * and RangeWidget, CascaderWidget, TreeSelectWidget, TransferWidget, MentionsWidget, ComposerWidget,
 * ModelPickerWidget, the `dateRange` field, and the form-level options (sections, size, layout, labels).
 */
const one = (name: string, schema: RJSFSchema, options: Record<string, unknown> = {}) => ({
  schema: { type: 'object', properties: { f: { title: 'Field', ...schema } } } as RJSFSchema,
  uiSchema: { f: { 'ui:widget': name, 'ui:options': options } } as UiSchema,
  zodSchema: z.object({ f: z.any() }),
});

const context = {
  derived: {},
  actions: {},
  locale: 'en',
  optionSets: {},
  optionTrees: {
    places: [
      { value: 'eu', label: 'Europe', children: [{ value: 'fr', label: 'France' }] },
      { value: 'as', label: 'Asia' },
    ],
  },
  modelSets: {
    chat: [
      { id: 'm1', name: 'Model one' },
      { id: 'm2', name: 'Model two' },
    ],
  },
};

describe('RatingWidget', () => {
  it('stores the mark chosen by keyboard as a number', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      ...one('rating', { type: 'integer', minimum: 0, maximum: 5 }),
      formData: { f: 2 },
    });
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    const checked = screen.getByRole('radio', { checked: true });
    checked.focus();
    await user.keyboard('{ArrowRight}');
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ f: 3 });
  });

  it('takes the number of marks from ui:options.count and is named by the field label', () => {
    renderDynamicForm({
      ...one('rating', { type: 'integer' }, { count: 10 }),
      formData: {},
    });
    expect(screen.getAllByRole('radio')).toHaveLength(10);
    expect(screen.getByRole('radiogroup', { name: /Field/ })).toBeInTheDocument();
  });
});

describe('PasswordWidget', () => {
  it('stores what is typed and reveals it with the toggle, keeping focus in the input', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      ...one('password', { type: 'string' }),
      formData: { f: '' },
    });
    const input = screen.getByLabelText('Field') as HTMLInputElement;
    expect(input.type).toBe('password');
    expect(input).toHaveAttribute('autocomplete', 'current-password');
    await user.type(input, 'hunter2');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect((screen.getByLabelText('Field') as HTMLInputElement).type).toBe('text');
    expect(screen.getByLabelText('Field')).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ f: 'hunter2' });
  });

  it('draws the bare box with toggleable: false and new-password when asked', () => {
    renderDynamicForm({
      ...one('password', { type: 'string' }, { toggleable: false, autocomplete: 'new-password' }),
      formData: { f: '' },
    });
    expect(screen.queryByRole('button', { name: 'Show password' })).toBeNull();
    expect(screen.getByLabelText('Field')).toHaveAttribute('autocomplete', 'new-password');
  });
});

describe('AutoCompleteWidget', () => {
  it('accepts free text and offers the schema examples', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      ...one('autocomplete', { type: 'string', examples: ['Alpha', 'Beta'] }),
      formData: { f: '' },
    });
    const input = screen.getByRole('combobox');
    await user.type(input, 'Al');
    expect(screen.getByRole('option', { name: /Alpha/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Beta/ })).toBeNull();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(input).toHaveValue('Alpha');
    await user.clear(input);
    await user.type(input, 'Something new');
    await user.keyboard('{Escape}');
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ f: 'Something new' });
  });
});

describe('CalendarWidget', () => {
  it('shows the stored day and stores a chosen day as YYYY-MM-DD', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      ...one('calendar', { type: 'string', format: 'date' }),
      formData: { f: '2026-10-09' },
    });
    const grid = screen.getByRole('grid');
    expect(grid).toBeInTheDocument();
    await user.click(within(grid).getByRole('button', { name: /October 15/ }));
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ f: '2026-10-15' });
  });
});

describe('FileUploadWidget', () => {
  const pdf = () => new File(['%PDF'], 'report.pdf', { type: 'application/pdf' });
  const pick = (files: File[]) => {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files } });
  };

  it('stores the real File by default', async () => {
    const { submit, onSubmit } = renderDynamicForm({
      ...one('file', { type: 'string' }),
      formData: {},
    });
    const file = pdf();
    pick([file]);
    expect(await screen.findByText('report.pdf')).toBeInTheDocument();
    await submit();
    expect(onSubmit.mock.calls[0][0].f).toBe(file);
  });

  it('stores an array of Files for an array schema', async () => {
    const { submit, onSubmit } = renderDynamicForm({
      ...one('file', { type: 'array', items: {} }),
      formData: {},
    });
    const first = pdf();
    pick([first]);
    await screen.findByText('report.pdf');
    await submit();
    expect(onSubmit.mock.calls[0][0].f).toEqual([first]);
    expect(onSubmit.mock.calls[0][0].f[0]).toBe(first);
  });

  it('stores the name with mode: name and a data: string with mode: data-url', async () => {
    const named = renderDynamicForm({
      ...one('file', { type: 'string' }, { mode: 'name' }),
      formData: {},
    });
    pick([pdf()]);
    await screen.findByText('report.pdf');
    await named.submit();
    expect(named.onSubmit).toHaveBeenCalledWith({ f: 'report.pdf' });
    named.rtl.unmount();

    const encoded = renderDynamicForm({
      ...one('file', { type: 'string', format: 'data-url' }),
      formData: {},
    });
    pick([pdf()]);
    await screen.findByText('report.pdf');
    await encoded.submit();
    expect(encoded.onSubmit.mock.calls[0][0].f).toMatch(
      /^data:application\/pdf;name=report\.pdf;base64,/,
    );
  });

  it('reports a refused file as the field error and keeps the value', async () => {
    renderDynamicForm({
      ...one('file', { type: 'string' }, { maxSize: 2, accept: '.pdf' }),
      formData: {},
    });
    pick([pdf()]);
    expect(await screen.findByRole('alert')).toHaveTextContent(/report\.pdf exceeds/);
    expect(screen.queryByRole('button', { name: 'Remove report.pdf' })).toBeNull();
  });

  it('opens the picker from the keyboard', async () => {
    const { user } = renderDynamicForm({ ...one('file', { type: 'string' }), formData: {} });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const click = jest.spyOn(input, 'click').mockImplementation(() => undefined);
    const zone = document.querySelector('[data-slot="file-upload"]') as HTMLElement;
    zone.focus();
    await user.keyboard('{Enter}');
    expect(click).toHaveBeenCalledTimes(1);
  });
});

describe('SegmentedWidget and RangeWidget: the second mode, picked by the schema type', () => {
  it('segmented on an array stores several choices and respects minItems', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      ...one('segmented', {
        type: 'array',
        uniqueItems: true,
        minItems: 1,
        items: { type: 'string', enum: ['a', 'b', 'c'] },
      }),
      formData: { f: ['a'] },
    });
    await user.click(screen.getByRole('button', { name: 'b' }));
    await user.click(screen.getByRole('button', { name: 'a' }));
    await user.click(screen.getByRole('button', { name: 'b' }));
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ f: ['b'] });
  });

  it('range on an array of two numbers draws two named thumbs and stores both', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      ...one(
        'range',
        {
          type: 'array',
          minItems: 2,
          maxItems: 2,
          items: { type: 'number', minimum: 0, maximum: 10 },
        },
        { thumbLabels: ['From', 'To'] },
      ),
      formData: { f: [2, 8] },
    });
    const from = screen.getByRole('slider', { name: 'From' });
    expect(from).toHaveAttribute('aria-valuenow', '2');
    expect(screen.getByRole('slider', { name: 'To' })).toHaveAttribute('aria-valuenow', '8');
    from.focus();
    await user.keyboard('{ArrowRight}');
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ f: [3, 8] });
  });
});

describe('CascaderWidget, TreeSelectWidget, TransferWidget', () => {
  it('cascader shows the stored path from formContext.optionTrees and submits it', async () => {
    const { submit, onSubmit } = renderDynamicForm({
      ...one('cascader', { type: 'array', items: { type: 'string' } }, { optionTreeKey: 'places' }),
      formData: { f: ['eu', 'fr'] },
      formContext: context,
    });
    expect(screen.getByRole('combobox')).toHaveTextContent('Europe / France');
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ f: ['eu', 'fr'] });
  });

  it('cascader stores a path chosen by keyboard', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      ...one('cascader', { type: 'array', items: { type: 'string' } }, { optionTreeKey: 'places' }),
      formData: {},
      formContext: context,
    });
    screen.getByRole('combobox').focus();
    await user.keyboard('{Enter}{ArrowRight}{Enter}');
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ f: ['eu', 'fr'] });
  });

  it('treeSelect shows one node for a string and several for an array', async () => {
    const single = renderDynamicForm({
      ...one('treeSelect', { type: 'string' }, { optionTreeKey: 'places' }),
      formData: { f: 'as' },
      formContext: context,
    });
    expect(screen.getByRole('combobox')).toHaveTextContent('Asia');
    await single.submit();
    expect(single.onSubmit).toHaveBeenCalledWith({ f: 'as' });
    single.rtl.unmount();

    const many = renderDynamicForm({
      ...one(
        'treeSelect',
        { type: 'array', items: { type: 'string' } },
        { tree: context.optionTrees.places },
      ),
      formData: { f: ['as', 'eu'] },
    });
    expect(screen.getByRole('combobox')).toHaveTextContent('Asia');
    expect(screen.getByRole('combobox')).toHaveTextContent('Europe');
    await many.submit();
    expect(many.onSubmit).toHaveBeenCalledWith({ f: ['as', 'eu'] });
  });

  it('transfer moves a choice by keyboard and stores the keys', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      ...one('transfer', {
        type: 'array',
        uniqueItems: true,
        items: { type: 'string', enum: ['a', 'b', 'c'] },
      }),
      formData: { f: ['c'] },
    });
    const [source, target] = screen.getAllByRole('listbox');
    expect(within(target).getByRole('option', { name: /c/ })).toBeInTheDocument();
    source.focus();
    await user.keyboard(' {Enter}');
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ f: ['c', 'a'] });
  });
});

describe('MentionsWidget, ComposerWidget, ModelPickerWidget', () => {
  it('mentions stores plain text', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      ...one('mentions', { type: 'string' }),
      formData: { f: '' },
    });
    await user.type(screen.getByLabelText('Field'), 'hello');
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ f: 'hello' });
  });

  it('composer stores the draft and draws no send control', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      ...one('composer', { type: 'string' }),
      formData: { f: '' },
    });
    const box = document.getElementById('root_f') as HTMLTextAreaElement;
    await user.type(box, 'a draft');
    expect(screen.queryByRole('button', { name: /send/i })).toBeNull();
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ f: 'a draft' });
  });

  it('modelPicker shows the stored model from formContext.modelSets', () => {
    renderDynamicForm({
      ...one('modelPicker', { type: 'string' }, { modelSetKey: 'chat' }),
      formData: { f: 'm2' },
      formContext: context,
    });
    expect(document.getElementById('root_f')).toHaveTextContent('Model two');
  });
});

describe('FeedbackReasonsWidget', () => {
  it('stores the chosen reason ids and draws no note box and no submit of its own', async () => {
    const { user, submit, onSubmit } = renderDynamicForm({
      ...one('feedbackReasons', {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'string',
          oneOf: [
            { const: 'slow', title: 'Too slow' },
            { const: 'wrong', title: 'Wrong' },
          ],
        },
      }),
      formData: { f: ['slow'] },
    });
    const field = document.getElementById('root_f') as HTMLElement;
    expect(within(field).queryByRole('textbox')).toBeNull();
    await user.click(within(field).getByText('Wrong'));
    expect(within(field).getAllByRole('button')).toHaveLength(2);
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ f: ['slow', 'wrong'] });
  });
});

describe('dateRange field', () => {
  const schema: RJSFSchema = {
    type: 'object',
    properties: {
      period: {
        type: 'object',
        title: 'Period',
        description: 'First and last day',
        properties: {
          from: { type: 'string', format: 'date' },
          to: { type: 'string', format: 'date' },
        },
      },
    },
  };

  it('draws one labelled control and submits both ends as YYYY-MM-DD', async () => {
    const { submit, onSubmit } = renderDynamicForm({
      schema,
      uiSchema: { period: { 'ui:field': 'dateRange' } },
      zodSchema: z.object({ period: z.object({ from: z.string(), to: z.string() }) }),
      formData: { period: { from: '2026-10-05', to: '2026-10-09' } },
    });
    const trigger = document.getElementById('root_period') as HTMLElement;
    expect(trigger).toHaveAttribute('data-slot', 'date-picker');
    expect(trigger).toHaveAccessibleName(/Period/);
    expect(trigger.getAttribute('aria-describedby')).toContain('root_period__description');
    expect(trigger.textContent).toMatch(/5.*–.*9/);
    await submit();
    expect(onSubmit).toHaveBeenCalledWith({ period: { from: '2026-10-05', to: '2026-10-09' } });
  });

  it('clears to undefined, and is read-only when the form is', async () => {
    const editable = renderDynamicForm({
      schema,
      uiSchema: { period: { 'ui:field': 'dateRange' } },
      zodSchema: z.object({ period: z.any() }),
      formData: { period: { from: '2026-10-05', to: '2026-10-09' } },
    });
    await editable.user.click(screen.getByRole('button', { name: 'Clear date' }));
    await editable.submit();
    await waitFor(() => expect(editable.onSubmit).toHaveBeenCalled());
    expect(editable.onSubmit.mock.calls[0][0].period).toBeUndefined();
    editable.rtl.unmount();

    renderDynamicForm({
      schema,
      uiSchema: { period: { 'ui:field': 'dateRange' } },
      zodSchema: z.object({ period: z.any() }),
      formData: { period: { from: '2026-10-05', to: '2026-10-09' } },
      readOnly: true,
    });
    const trigger = document.getElementById('root_period') as HTMLElement;
    expect(trigger).not.toBeDisabled();
    expect(trigger).toHaveAttribute('data-readonly');
    expect(screen.queryByRole('button', { name: 'Clear date' })).toBeNull();
  });
});

describe('form-level options and sections', () => {
  const schema: RJSFSchema = {
    type: 'object',
    title: 'Profile',
    properties: {
      name: { type: 'string', title: 'Name' },
      plan: { type: 'string', title: 'Plan', enum: ['free', 'pro'] },
      contact: {
        type: 'object',
        title: 'Contact info',
        description: 'How we reach you',
        properties: { email: { type: 'string', title: 'Email', format: 'email' } },
      },
    },
  };
  const zodSchema = z.object({}).passthrough();

  it('draws a section title and description as a fieldset legend; the root title only when asked', () => {
    const plain = renderDynamicForm({ schema, zodSchema, formData: {} });
    const section = screen.getByRole('group', { name: 'Contact info' });
    expect(section.tagName).toBe('FIELDSET');
    expect(section).toHaveAccessibleDescription('How we reach you');
    expect(screen.queryByText('Profile')).toBeNull();
    plain.rtl.unmount();

    renderDynamicForm({
      schema,
      uiSchema: {
        'ui:options': { heading: true },
        contact: { 'ui:options': { heading: false, section: 'card' } },
      },
      zodSchema,
      formData: {},
    });
    expect(screen.getByRole('group', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.queryByText('Contact info')).toBeNull();
  });

  it('takes size, variant and layout for the whole form from ui:globalOptions, and per field from ui:options', () => {
    renderDynamicForm({
      schema,
      uiSchema: {
        'ui:globalOptions': { size: 'sm', variant: 'ghost', layout: 'horizontal' },
        plan: { 'ui:widget': 'select', 'ui:options': { size: 'lg', layout: 'vertical' } },
      },
      zodSchema,
      formData: {},
    });
    const name = screen.getByLabelText('Name');
    expect(name.className).toContain('--oui-field-height-sm');
    expect(name.className).toContain('border-transparent');
    expect(name.closest('[data-layout]')).toHaveAttribute('data-layout', 'horizontal');
    const plan = document.getElementById('root_plan') as HTMLElement;
    expect(plan).toHaveAttribute('data-select-size', 'lg');
    expect(plan.closest('[data-layout]')).toHaveAttribute('data-layout', 'vertical');
  });

  it('follows the JSON Schema format for email and takes its words from formContext.labels', () => {
    renderDynamicForm({
      schema: { ...schema, required: ['plan'] },
      uiSchema: { plan: { 'ui:widget': 'select' } },
      zodSchema,
      formData: {},
      formContext: {
        derived: {},
        actions: {},
        optionSets: {},
        locale: 'en',
        labels: { required: 'Obligatoire', selectPlaceholder: 'Choisir {title}' },
      },
    });
    const email = screen.getByLabelText('Email');
    expect(email).toHaveAttribute('type', 'email');
    expect(email).toHaveAttribute('inputmode', 'email');
    expect(email).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByText('Obligatoire')).toBeInTheDocument();
    expect(document.getElementById('root_plan')).toHaveTextContent('Choisir plan');
  });
});

describe('ui:options.testId', () => {
  it('lands on the control as data-testid', () => {
    renderDynamicForm({
      ...one('text', { type: 'string' }, { testId: 'company-name' }),
      formData: { f: 'Acme' },
    });
    expect(screen.getByTestId('company-name')).toHaveValue('Acme');
  });
});

describe('the Select footer action never navigates', () => {
  const schema: RJSFSchema = {
    type: 'object',
    properties: { tax: { type: 'string', title: 'Tax', enum: ['a', 'b'] } },
  };
  const base = { derived: {}, optionSets: {}, locale: 'en' };

  it('draws a link element for an action with an href', async () => {
    const assign = jest.fn();
    const original = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...original, assign },
    });
    const { user } = renderDynamicForm({
      schema,
      uiSchema: { tax: { 'ui:widget': 'select', 'ui:options': { footerActionKey: 'manage' } } },
      zodSchema: z.object({}).passthrough(),
      formData: {},
      formContext: {
        ...base,
        actions: { manage: { actionId: 'manage', label: 'Manage rates', href: '/rates' } },
      },
    });
    await user.click(document.getElementById('root_tax') as HTMLElement);
    expect(await screen.findByRole('link', { name: 'Manage rates' })).toHaveAttribute(
      'href',
      '/rates',
    );
    expect(assign).not.toHaveBeenCalled();
    Object.defineProperty(window, 'location', { configurable: true, value: original });
  });

  it('calls the host with the action by reference when it has onSelect', async () => {
    const onSelect = jest.fn();
    const manage = { actionId: 'manage', label: 'Manage rates', href: null, onSelect };
    const { user } = renderDynamicForm({
      schema,
      uiSchema: { tax: { 'ui:widget': 'select', 'ui:options': { footerActionKey: 'manage' } } },
      zodSchema: z.object({}).passthrough(),
      formData: {},
      formContext: { ...base, actions: { manage } },
    });
    await user.click(document.getElementById('root_tax') as HTMLElement);
    await user.click(await screen.findByText('Manage rates'));
    expect(onSelect).toHaveBeenCalledWith(manage);
  });
});
