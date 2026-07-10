// @ts-nocheck — `@rjsf/utils`'s `UiSchema['ui:rows']` is typed for the
// (legacy) rowsCount number; the `@rjsf/shadcn` theme uses `string[][]` for
// the flat-row layout API. The runtime contract is correct.
import { z } from 'zod';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';

import { COUNTRY_OPTIONS } from '../../Select/countries';

const COUNTRY_ONE_OF = COUNTRY_OPTIONS.map((opt) => ({ const: opt.value, title: opt.label }));

/**
 * Demo form fixture — schema + uiSchema + zod + default values together
 * so stories and tests share one source of truth.
 *
 * @example
 * const fx = addressFormFactory();
 * renderDynamicForm({ schema: fx.schema, uiSchema: fx.uiSchema, zodSchema: fx.zodSchema, formData: fx.defaults });
 */
export interface FormFixture<TFormData = Record<string, unknown>> {
  schema: RJSFSchema;
  uiSchema: UiSchema;
  zodSchema: z.ZodType<TFormData>;
  defaults: TFormData;
}

/**
 * Scenario-grade fixture: {@link FormFixture} plus a pure
 * `derive(formData) → derived` function and the static parts of the
 * `OmniRjsfFormContext` (option sets, actions, locale). The Storybook
 * shell composes `derive(formData)` with the static parts on every
 * render — derived values stay out of `formData` and never reach the
 * submit payload. Existing per-widget fixtures still satisfy
 * {@link FormFixture} alone; the shell defaults `derive` to `() => ({})`
 * and `formContext` to an empty base when only `FormFixture` is passed.
 */
import type { OmniRjsfFormContext } from '../../../../dynamic-form/lib/formContext';

export interface DynamicFormFixture<
  TFormData extends Record<string, unknown> = Record<string, unknown>,
  TDerived extends Record<string, unknown> = Record<string, unknown>,
> extends FormFixture<TFormData> {
  derive: (formData: Readonly<Partial<TFormData>>) => TDerived;
  formContext: Omit<OmniRjsfFormContext<TDerived>, 'derived'>;
}

/* -------------------------------------------------------------------------- */
/* Address fixture                                                             */
/* -------------------------------------------------------------------------- */

export interface AddressFormData {
  label: string;
  address1: string;
  address2: string;
  city: string;
  postal_code: string;
  country: string;
  region: string;
}

const ADDRESS_FIXTURE: FormFixture<AddressFormData> = {
  schema: {
    type: 'object',
    required: ['label', 'city', 'country'],
    properties: {
      label: { type: 'string', title: 'Label' },
      address1: { type: 'string', title: 'Address 1' },
      address2: { type: 'string', title: 'Address 2' },
      city: { type: 'string', title: 'City' },
      postal_code: { type: 'string', title: 'Postal Code' },
      country: { type: 'string', title: 'Country' },
      region: { type: 'string', title: 'Region / State' },
    },
  },
  uiSchema: {
    'ui:rows': [[{ value: 'label', span: 2 }], ['address1', 'address2'], ['city', 'postal_code'], ['country', 'region']],
    label: { 'ui:placeholder': 'Main Office' },
    address1: { 'ui:placeholder': '123 Main St' },
    address2: { 'ui:placeholder': 'Suite 100' },
    city: { 'ui:placeholder': 'San Francisco' },
    postal_code: { 'ui:placeholder': '94105' },
    country: { 'ui:placeholder': 'Country' },
    region: { 'ui:placeholder': 'Region' },
  },
  zodSchema: z.object({
    label: z.string().min(1, 'Label is required'),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    postal_code: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    region: z.string().optional(),
  }) as unknown as z.ZodType<AddressFormData>,
  defaults: {
    label: '',
    address1: '',
    address2: '',
    city: '',
    postal_code: '',
    country: '',
    region: '',
  },
};

export const addressFormFactory = (overrides: Partial<AddressFormData> = {}): FormFixture<AddressFormData> => ({
  ...ADDRESS_FIXTURE,
  defaults: { ...ADDRESS_FIXTURE.defaults, ...overrides },
});

/* -------------------------------------------------------------------------- */
/* Kitchen-sink fixture — every Input variant + section headings.              */
/* Mirrors `omni-ui-components/Form`'s `kitchenSinkFormFactory` so the       */
/* Form vs. DynamicForm stories render the same artefact.                     */
/* -------------------------------------------------------------------------- */

export interface KitchenSinkFormData {
  contact_info: {
    full_name: string;
    email: string;
    password: string;
    phone: string;
    recovery_emails: string[];
  };
  billing: {
    plan: string;
    monthly_budget: number;
  };
  notifications: {
    channels: string[];
    tos: boolean;
    marketing: boolean;
  };
  preferences: {
    volume: number;
    tone: string;
    pages: number;
    due_date: string;
  };
  address: {
    label: string;
    address1: string;
    address2: string;
    city: string;
    postal_code: number | string;
    country: string;
    region: string;
    website: string;
    notes: string;
  };
  extras?: {
    verification_code?: string;
    skill_tags?: string[];
    daily_start?: string;
    brand_color?: string;
    portfolio?: string;
  };
  metadata?: Record<string, string>;
  quick_actions?: string;
  enhancements?: {
    category: string;
    taxRateId: string;
    projectId: string;
    memberId: string;
    taskUuid: string;
    salesPriceLabel: string;
    panelHeader: string;
    hiddenId: string;
    additionalFields: { extraNote: string };
  };
}

/* Imports for Kitchen Sink enhancements section — grouped options, footer
 * action, derivedText, staticPanel, labelAction, collapsible, hidden. */
import { SHOWCASE_EXPENSE_CATEGORIES, SHOWCASE_MEMBERS, SHOWCASE_PROJECTS, SHOWCASE_TAX_RATES, SHOWCASE_TASKS } from '../../../showcase/entities';
import { selectOptions } from '../../../helpers/optionMappers';

const KITCHEN_SINK_FIXTURE: DynamicFormFixture<KitchenSinkFormData, Record<string, string>> = {
  schema: {
    type: 'object',
    required: ['contact_info', 'billing', 'notifications', 'preferences', 'address'],
    properties: {
      contact_info: {
        type: 'object',
        title: 'Contact info',
        description: 'How we reach you. Email + password create an account.',
        required: ['full_name', 'email', 'password', 'phone'],
        properties: {
          full_name: { type: 'string', title: 'Full name' },
          email: { type: 'string', title: 'Email', format: 'email' },
          password: { type: 'string', title: 'Password' },
          phone: { type: 'string', title: 'Phone' },
          recovery_emails: {
            type: 'array',
            title: 'Recovery emails',
            description: 'Up to 3. Reorder or remove with the row toolbar.',
            maxItems: 3,
            items: { type: 'string', title: 'Email', format: 'email' },
          },
        },
      },
      billing: {
        type: 'object',
        title: 'Billing plan',
        description: 'Pick the plan that fits your team.',
        required: ['plan', 'monthly_budget'],
        properties: {
          plan: {
            type: 'string',
            title: 'Billing plan',
            oneOf: [
              { const: 'free', title: 'Free' },
              { const: 'pro', title: 'Pro' },
              { const: 'team', title: 'Team' },
            ],
          },
          monthly_budget: { type: 'number', title: 'Monthly budget', minimum: 0 },
        },
      },
      notifications: {
        type: 'object',
        title: 'Notifications',
        description: 'How should we reach you?',
        required: ['channels', 'tos'],
        properties: {
          channels: {
            type: 'array',
            title: 'Channels',
            uniqueItems: true,
            items: {
              type: 'string',
              oneOf: [
                { const: 'email', title: 'Email' },
                { const: 'sms', title: 'SMS' },
                { const: 'push', title: 'Push notifications' },
                { const: 'slack', title: 'Slack' },
              ],
            },
          },
          tos: { type: 'boolean', title: 'I agree to the Terms of Service' },
          marketing: { type: 'boolean', title: 'Marketing emails', description: 'Occasional product updates + tips.' },
        },
      },
      preferences: {
        type: 'object',
        title: 'Preferences',
        description: 'A couple of knobs to tune your account.',
        required: ['volume', 'tone', 'pages', 'due_date'],
        properties: {
          volume: { type: 'integer', title: 'Notification volume', minimum: 0, maximum: 100, multipleOf: 5 },
          pages: { type: 'integer', title: 'Number of pages', minimum: 1, maximum: 50 },
          due_date: { type: 'string', format: 'date', title: 'Due date' },
          tone: {
            type: 'string',
            title: 'Tone',
            oneOf: [
              { const: 'casual', title: 'Casual' },
              { const: 'friendly', title: 'Friendly' },
              { const: 'professional', title: 'Professional' },
            ],
          },
        },
      },
      extras: {
        type: 'object',
        title: 'Extras',
        description: 'A few more bits: verification code, tags, daily start time, brand color, portfolio file.',
        properties: {
          verification_code: { type: 'string', title: 'Verification code', maxLength: 6 },
          skill_tags: { type: 'array', title: 'Skill tags', items: { type: 'string' } },
          daily_start: { type: 'string', format: 'time', title: 'Daily start' },
          brand_color: { type: 'string', format: 'color', title: 'Brand color' },
          portfolio: { type: 'string', title: 'Portfolio attachment' },
        },
      },
      metadata: {
        type: 'object',
        title: 'Custom metadata',
        description: 'Add arbitrary key/value pairs. Rename the key inline, remove rows with the trash button.',
        additionalProperties: { type: 'string' },
      },
      quick_actions: {
        type: 'string',
        title: 'Quick actions',
        description: 'Omni IconButtons surfaced via the iconToolbar widget. Trash2 auto-defaults to destructive.',
      },
      enhancements: {
        type: 'object',
        title: 'Platform enhancements',
        description:
          'Every PR 3/4 widget + template variant in one place: grouped Select options, footer action, Combobox with option-set metadata, derivedText, StaticPanelField, FieldTemplate labelAction, collapsible ObjectFieldTemplate, hidden widget.',
        properties: {
          panelHeader: { type: 'string', title: '', readOnly: true },
          category: { type: 'string', title: 'Category' },
          taxRateId: { type: 'string', title: 'Tax' },
          projectId: { type: 'string', title: 'Project' },
          memberId: { type: 'string', title: 'Member' },
          taskUuid: { type: 'string', title: 'Task' },
          salesPriceLabel: { type: 'string', title: '' },
          hiddenId: { type: 'string', title: 'Hidden Id' },
          additionalFields: {
            type: 'object',
            title: 'Additional Fields',
            properties: { extraNote: { type: 'string', title: 'Extra Note' } },
          },
        },
      },
      address: {
        type: 'object',
        title: 'Address',
        description: 'Where this location lives.',
        required: ['label', 'address1', 'city', 'postal_code', 'country', 'region', 'website', 'notes'],
        properties: {
          label: { type: 'string', title: 'Label' },
          address1: { type: 'string', title: 'Address 1' },
          address2: { type: 'string', title: 'Address 2' },
          city: { type: 'string', title: 'City' },
          postal_code: { type: 'integer', title: 'Postal Code' },
          country: { type: 'string', title: 'Country', oneOf: COUNTRY_ONE_OF },
          region: { type: 'string', title: 'Region / State' },
          website: { type: 'string', title: 'Website', format: 'uri' },
          notes: { type: 'string', title: 'Notes' },
        },
      },
    },
  },
  uiSchema: {
    contact_info: {
      'ui:rows': [['full_name', 'email'], ['password', 'phone'], [{ value: 'recovery_emails', span: 2 }]],
      full_name: { 'ui:placeholder': 'Ada Lovelace' },
      email: { 'ui:placeholder': 'ada@example.com' },
      password: { 'ui:widget': 'password', 'ui:placeholder': 'At least 8 chars, 1 uppercase, 1 number' },
      phone: { 'ui:placeholder': '+1 555 0100' },
      recovery_emails: {
        'ui:options': { orderable: true, addable: true, removable: true },
        items: { 'ui:placeholder': 'backup@example.com' },
      },
    },
    billing: {
      'ui:rows': [[{ value: 'plan', span: 2 }], [{ value: 'monthly_budget', span: 2 }]],
      monthly_budget: { 'ui:widget': 'currency', 'ui:options': { currency: 'USD' } },
      plan: {
        'ui:widget': 'radio',
        'ui:options': {
          optionDescriptions: {
            free: 'Up to 3 projects.',
            pro: '$15 / month. Unlimited projects.',
            team: '$30 / month. Seats + permissions.',
          },
        },
      },
    },
    notifications: {
      'ui:rows': [[{ value: 'channels', span: 2 }], [{ value: 'tos', span: 2 }]],
      channels: {
        'ui:widget': 'checkboxes',
        'ui:options': {
          optionDescriptions: {
            email: 'Daily digest at 9am.',
            sms: 'Mobile alerts for urgent items.',
            push: 'Browser + desktop.',
            slack: 'Routed to your default channel.',
          },
        },
      },
      tos: { 'ui:widget': 'checkbox' },
      marketing: { 'ui:widget': 'switch' },
    },
    preferences: {
      'ui:rows': [[{ value: 'volume', span: 2 }], [{ value: 'pages', span: 2 }], [{ value: 'tone', span: 2 }], [{ value: 'due_date', span: 2 }]],
      volume: { 'ui:widget': 'range' },
      pages: { 'ui:widget': 'stepper', 'ui:options': { unit: 'page', icon: 'fileText' } },
      tone: { 'ui:widget': 'segmented' },
      due_date: { 'ui:widget': 'date' },
    },
    extras: {
      'ui:rows': [
        [{ value: 'verification_code', span: 2 }],
        ['daily_start', 'brand_color'],
        [{ value: 'skill_tags', span: 2 }],
        [{ value: 'portfolio', span: 2 }],
      ],
      verification_code: { 'ui:widget': 'otp' },
      skill_tags: { 'ui:widget': 'tags' },
      daily_start: { 'ui:widget': 'time' },
      brand_color: { 'ui:widget': 'color' },
      portfolio: { 'ui:widget': 'file', 'ui:options': { accept: 'image/*,.pdf', maxSize: 5_000_000 } },
    },
    quick_actions: {
      'ui:widget': 'iconToolbar',
      'ui:options': {
        actions: [
          { icon: 'move-up', label: 'Move up', variant: 'ghost' },
          { icon: 'move-down', label: 'Move down', variant: 'ghost' },
          { icon: 'copy', label: 'Duplicate', variant: 'ghost' },
          { icon: 'x', label: 'Clear', variant: 'ghost' },
          { icon: 'trash', label: 'Delete' },
        ],
      },
    },
    enhancements: {
      'ui:rows': [
        [{ value: 'panelHeader', span: 2 }],
        ['category', 'taxRateId'],
        ['projectId', 'memberId'],
        [{ value: 'taskUuid', span: 2 }],
        [{ value: 'salesPriceLabel', span: 2 }],
        [{ value: 'additionalFields', span: 2 }],
      ],
      panelHeader: { 'ui:field': 'staticPanel', 'ui:options': { panelKey: 'durationLabel', lines: ['dateLabel', 'statusLabel'] } },
      category: { 'ui:widget': 'select', 'ui:options': { optionSetKey: 'categories', searchable: true } },
      taxRateId: { 'ui:widget': 'select', 'ui:options': { optionSetKey: 'taxRates', footerActionKey: 'manageTaxRates' } },
      projectId: { 'ui:widget': 'combobox', 'ui:options': { optionSetKey: 'projects', placeholder: 'Add project' } },
      memberId: { 'ui:widget': 'combobox', 'ui:options': { optionSetKey: 'members', placeholder: 'Select…' } },
      taskUuid: { 'ui:widget': 'text', 'ui:options': { labelActionKey: 'viewTask' } },
      salesPriceLabel: { 'ui:widget': 'derivedText', 'ui:options': { derivedKey: 'salesPriceLabel', tone: 'default' } },
      hiddenId: { 'ui:widget': 'hidden' },
      additionalFields: {
        'ui:options': { collapsible: { title: 'Additional Fields', defaultOpen: false } },
        extraNote: { 'ui:widget': 'textarea', 'ui:placeholder': 'Anything else…' },
      },
    },
    address: {
      'ui:rows': [
        [{ value: 'label', span: 2 }],
        ['address1', 'address2'],
        ['city', 'postal_code'],
        ['country', 'region'],
        [{ value: 'website', span: 2 }],
        [{ value: 'notes', span: 2 }],
      ],
      label: { 'ui:placeholder': 'Main Office' },
      address1: { 'ui:placeholder': '123 Main St' },
      address2: { 'ui:placeholder': 'Suite 100' },
      city: { 'ui:placeholder': 'San Francisco' },
      postal_code: { 'ui:placeholder': '94105' },
      country: { 'ui:widget': 'select', 'ui:placeholder': 'Select country…' },
      region: { 'ui:placeholder': 'Region' },
      website: { 'ui:placeholder': 'https://example.com' },
      notes: { 'ui:widget': 'textarea', 'ui:placeholder': 'Anything we should know?', 'ui:options': { rows: 6 } },
    },
  },
  zodSchema: z.object({
    contact_info: z.object({
      full_name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Enter a valid email'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/\d/, 'Password must contain a number'),
      phone: z.string().regex(/^[+\d\s()-]{10,}$/, 'Enter a valid phone (10+ digits)'),
      recovery_emails: z.array(z.string().email('Enter a valid email')).max(3, 'At most 3 recovery emails'),
    }),
    billing: z.object({
      plan: z.enum(['free', 'pro', 'team'], { errorMap: () => ({ message: 'Pick a billing plan' }) }),
      monthly_budget: z.coerce.number().nonnegative(),
    }),
    notifications: z.object({
      channels: z.array(z.string()).min(1, 'Pick at least one channel'),
      tos: z.literal(true, { errorMap: () => ({ message: 'You must agree to the Terms of Service' }) }),
      marketing: z.boolean(),
    }),
    preferences: z.object({
      volume: z.number().int().min(0).max(100),
      tone: z.enum(['casual', 'friendly', 'professional'], { errorMap: () => ({ message: 'Pick a tone' }) }),
      pages: z.number().int().min(1).max(50),
      due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a due date'),
    }),
    address: z.object({
      label: z.string().min(1, 'Label is required'),
      address1: z.string().min(1, 'Address line 1 is required'),
      address2: z.string().optional().default(''),
      city: z.string().min(1, 'City is required'),
      postal_code: z.coerce
        .number({ invalid_type_error: 'Postal code must be a number' })
        .int('Postal code must be a whole number')
        .min(1, 'Postal code is required'),
      country: z.string().min(1, 'Country is required'),
      region: z.string().min(1, 'Region / State is required'),
      website: z.string().url('Enter a valid URL'),
      notes: z.string().min(10, 'Notes must be at least 10 characters'),
    }),
    extras: z
      .object({
        verification_code: z.string().optional(),
        skill_tags: z.array(z.string()).optional(),
        daily_start: z.string().optional(),
        brand_color: z.string().optional(),
        portfolio: z.string().optional(),
      })
      .optional(),
    metadata: z.record(z.string()).optional(),
    quick_actions: z.string().optional(),
    enhancements: z
      .object({
        category: z.string().optional().default(''),
        taxRateId: z.string().optional().default(''),
        projectId: z.string().optional().default(''),
        memberId: z.string().optional().default(''),
        taskUuid: z.string().optional().default(''),
        salesPriceLabel: z.string().optional().default(''),
        panelHeader: z.string().optional().default(''),
        hiddenId: z.string().optional().default(''),
        additionalFields: z.object({ extraNote: z.string().optional().default('') }).optional(),
      })
      .optional(),
  }) as unknown as z.ZodType<KitchenSinkFormData>,
  defaults: {
    contact_info: { full_name: '', email: '', password: '', phone: '', recovery_emails: ['backup@example.com'] },
    billing: { plan: '', monthly_budget: 0 },
    notifications: { channels: [], tos: false, marketing: false },
    preferences: { volume: 35, tone: 'friendly', pages: 7, due_date: '' },
    extras: { verification_code: '', skill_tags: ['react', 'typescript'], daily_start: '09:00', brand_color: '#22c55e', portfolio: '' },
    metadata: { environment: 'production', team: 'platform' },
    enhancements: {
      category: '',
      taxRateId: '',
      projectId: '',
      memberId: '',
      taskUuid: 'res-eval',
      salesPriceLabel: '',
      panelHeader: '',
      hiddenId: 'hidden-default',
      additionalFields: { extraNote: '' },
    },
    address: {
      label: '',
      address1: '',
      address2: '',
      city: '',
      postal_code: '' as unknown as number,
      country: '',
      region: '',
      website: '',
      notes: '',
    },
  },
  derive: () => ({
    salesPriceLabel: '£5,948.81 Sales Price',
    durationLabel: '12h 21m 32s',
    dateLabel: 'Thu, Jun 11, 2026',
    statusLabel: 'Unbilled',
  }),
  formContext: {
    optionSets: {
      categories: selectOptions(SHOWCASE_EXPENSE_CATEGORIES, { value: 'id', label: 'label', group: 'group' }),
      taxRates: selectOptions(SHOWCASE_TAX_RATES, { value: 'id', label: 'label', group: () => 'SET TAX' }),
      projects: selectOptions(SHOWCASE_PROJECTS, { value: 'id', label: (p) => `${p.icon} ${p.name}`, description: 'organization', color: 'color' }),
      members: selectOptions(SHOWCASE_MEMBERS, { value: 'id', label: 'name', group: 'group', color: 'color', initials: 'initials' }),
      tasks: selectOptions(SHOWCASE_TASKS, { value: 'id', label: 'name' }),
    },
    actions: {
      manageTaxRates: { label: 'Manage Tax Rates', href: '/settings/tax_rates', actionId: 'manageTaxRates' },
      viewTask: { label: 'View Task', href: '/tasks/res-eval', actionId: 'viewTask' },
    },
    locale: 'en-GB',
  },
};

export const kitchenSinkFormFactory = (overrides: Partial<KitchenSinkFormData> = {}): DynamicFormFixture<KitchenSinkFormData, Record<string, string>> => ({
  ...KITCHEN_SINK_FIXTURE,
  defaults: { ...KITCHEN_SINK_FIXTURE.defaults, ...overrides },
});

/* -------------------------------------------------------------------------- */
/* Automation fixture                                                          */
/* -------------------------------------------------------------------------- */

export interface AutomationFormData {
  name: string;
  trigger: string;
  action: string;
  subject: string;
  message: string;
}

const AUTOMATION_FIXTURE: FormFixture<AutomationFormData> = {
  schema: {
    type: 'object',
    required: ['name', 'subject', 'message'],
    properties: {
      name: { type: 'string', title: 'Name', maxLength: 200 },
      trigger: { type: 'string', title: 'Trigger' },
      action: { type: 'string', title: 'Action' },
      subject: { type: 'string', title: 'Email Subject', maxLength: 200 },
      message: { type: 'string', title: 'Email Message' },
    },
  },
  uiSchema: {
    'ui:rows': [[{ value: 'name', span: 2 }], ['trigger', 'action'], [{ value: 'subject', span: 2 }], [{ value: 'message', span: 2 }]],
    name: { 'ui:placeholder': 'Internal name for this automation' },
    trigger: { 'ui:placeholder': 'Agreement_countersigned' },
    action: { 'ui:placeholder': 'send_message' },
    subject: { 'ui:placeholder': 'New message from Omni' },
    message: { 'ui:placeholder': "We're looking forward to working together." },
  },
  zodSchema: z.object({
    name: z.string().min(1, 'Name is required'),
    trigger: z.string().optional(),
    action: z.string().optional(),
    subject: z.string().min(1, "Subject can't be blank"),
    message: z.string().min(1, "Message can't be blank"),
  }) as unknown as z.ZodType<AutomationFormData>,
  defaults: {
    name: '',
    trigger: 'Agreement_countersigned',
    action: 'send_message',
    subject: '',
    message: '',
  },
};

export const automationFormFactory = (overrides: Partial<AutomationFormData> = {}): FormFixture<AutomationFormData> => ({
  ...AUTOMATION_FIXTURE,
  defaults: { ...AUTOMATION_FIXTURE.defaults, ...overrides },
});
