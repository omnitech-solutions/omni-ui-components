import { z } from 'zod';

import { validators } from '@oc-tech/omni-ui-components';
import type { FormFixture } from '@oc-tech/omni-ui-components/Form/Form.types';
import { COUNTRY_OPTIONS } from '../Select/countries';
import { SHOWCASE_EXPENSE_CATEGORIES, SHOWCASE_MEMBERS, SHOWCASE_PROJECTS, SHOWCASE_TAX_RATES } from '../../showcase/entities';
import { project } from '../../helpers/optionMappers';

export type { FieldDef, FieldType, FormFixture, FormRow, FormRowDef, FormSectionHeading } from '@oc-tech/omni-ui-components/Form/Form.types';

/* -------------------------------------------------------------------------- */
/* Address fixture                                                             */
/* -------------------------------------------------------------------------- */

/** Simple address-only form — used by the regression tests. */
export interface AddressFormData {
  label: string;
  address1: string;
  address2: string;
  city: string;
  postal_code: string;
  country: string;
  region: string;
}

export const addressFormFactory = (overrides: Partial<AddressFormData> = {}): FormFixture<AddressFormData> => ({
  title: 'Add Address',
  maxWidth: 'max-w-2xl',
  schema: z.object({
    label: validators.text({ min: 2, label: 'Label' }),
    address1: validators.text({ min: 5, label: 'Address 1' }),
    address2: z.string().optional().default(''),
    city: validators.text({ min: 2, label: 'City' }),
    postal_code: validators.postalCode('US'),
    country: validators.text({ min: 2, label: 'Country' }),
    region: z.string().optional().default(''),
  }) as unknown as z.ZodType<AddressFormData>,
  initial: {
    label: '',
    address1: '',
    address2: '',
    city: '',
    postal_code: '',
    country: '',
    region: '',
    ...overrides,
  },
  rows: [
    [{ name: 'label', label: 'Label', placeholder: 'Main Office', required: true }],
    [
      { name: 'address1', label: 'Address 1', placeholder: '123 Main St', required: true },
      { name: 'address2', label: 'Address 2', placeholder: 'Suite 100' },
    ],
    [
      { name: 'city', label: 'City', placeholder: 'San Francisco', required: true },
      { name: 'postal_code', label: 'Postal Code', placeholder: '94105', required: true },
    ],
    [
      { name: 'country', label: 'Country', placeholder: 'Country', required: true },
      { name: 'region', label: 'Region / State', placeholder: 'Region' },
    ],
  ],
  submitLabel: 'Save Address',
});

/* -------------------------------------------------------------------------- */
/* Kitchen-sink fixture — every Input variant, section headings, full Zod      */
/* validation. Matched 1:1 by `dynamic-form`'s kitchenSinkFormFactory       */
/* so the Form vs. DynamicForm stories render the same form.                  */
/* -------------------------------------------------------------------------- */

export interface KitchenSinkFormData {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  plan: string;
  monthly_budget: number;
  notifications: string[];
  tos: boolean;
  volume: number;
  tone: string;
  pages: number;
  due_date: string;
  verification_code: string;
  skill_tags: string[];
  daily_start: string;
  brand_color: string;
  /* Platform enhancements section — grouped + decorated select options. */
  category: string;
  tax_rate_id: string;
  project_id: string;
  member_id: string;
  label: string;
  address1: string;
  address2: string;
  city: string;
  postal_code: string;
  country: string;
  region: string;
  website: string;
  notes: string;
}

const PLAN_OPTIONS = [
  { value: 'free', label: 'Free', description: 'Up to 3 projects.' },
  { value: 'pro', label: 'Pro', description: '$15 / month. Unlimited projects.' },
  { value: 'team', label: 'Team', description: '$30 / month. Seats + permissions.' },
];

const NOTIFICATION_OPTIONS = [
  { value: 'email', label: 'Email', description: 'Daily digest at 9am.' },
  { value: 'sms', label: 'SMS', description: 'Mobile alerts for urgent items.' },
  { value: 'push', label: 'Push notifications', description: 'Browser + desktop.' },
  { value: 'slack', label: 'Slack' },
];

/* Grouped + decorated option lists for the Platform Enhancements section. */
const KS_CATEGORY_OPTIONS = project(SHOWCASE_EXPENSE_CATEGORIES, { value: 'id' as const, label: 'label' as const, group: 'group' as const });
const KS_TAX_OPTIONS = project(SHOWCASE_TAX_RATES, { value: 'id' as const, label: 'label' as const });
const KS_PROJECT_OPTIONS = project(SHOWCASE_PROJECTS, {
  value: 'id' as const,
  label: (p) => `${p.icon} ${p.name}`,
  description: 'organization' as const,
  color: 'color' as const,
});
const KS_MEMBER_OPTIONS = project(SHOWCASE_MEMBERS, { value: 'id' as const, label: 'name' as const, group: 'group' as const, initials: 'initials' as const });

export const kitchenSinkFormFactory = (overrides: Partial<KitchenSinkFormData> = {}): FormFixture<KitchenSinkFormData> => ({
  title: 'Account & address',
  maxWidth: 'max-w-2xl',
  schema: z.object({
    full_name: validators.text({ min: 2, label: 'Name' }),
    email: validators.email(),
    password: validators.password(),
    phone: validators.tel(),
    plan: z.enum(['free', 'pro', 'team'], { errorMap: () => ({ message: 'Pick a billing plan' }) }),
    monthly_budget: z.coerce.number().nonnegative('Budget must be ≥ 0'),
    notifications: z.array(z.string()).min(1, 'Pick at least one notification channel'),
    tos: z.literal(true, { errorMap: () => ({ message: 'You must agree to the Terms of Service' }) }),
    volume: z.number().int().min(0).max(100),
    tone: z.enum(['casual', 'friendly', 'professional'], { errorMap: () => ({ message: 'Pick a tone' }) }),
    pages: z.number().int().min(1).max(50),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a due date'),
    verification_code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
    skill_tags: z.array(z.string()).min(1, 'Add at least one tag'),
    daily_start: z.string().regex(/^\d{2}:\d{2}/, 'Pick a start time'),
    brand_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Pick a color'),
    label: validators.text({ min: 2, label: 'Label' }),
    address1: validators.text({ min: 5, label: 'Address 1' }),
    address2: z.string().optional().default(''),
    city: validators.text({ min: 2, label: 'City' }),
    postal_code: validators.postalCode('CA'),
    country: validators.text({ min: 2, label: 'Country' }),
    region: validators.text({ min: 2, label: 'Region / State' }),
    website: validators.url(),
    notes: z.string().min(10, 'Notes must be at least 10 characters'),
    category: z.string().optional().default(''),
    tax_rate_id: z.string().optional().default(''),
    project_id: z.string().optional().default(''),
    member_id: z.string().optional().default(''),
  }) as unknown as z.ZodType<KitchenSinkFormData>,
  initial: {
    full_name: '',
    email: '',
    password: '',
    phone: '',
    plan: '',
    monthly_budget: 0,
    notifications: [],
    tos: false,
    volume: 35,
    tone: 'friendly',
    pages: 7,
    due_date: '',
    verification_code: '',
    skill_tags: [],
    daily_start: '09:00',
    brand_color: '#22c55e',
    label: '',
    address1: '',
    address2: '',
    city: '',
    postal_code: '',
    country: '',
    region: '',
    website: '',
    notes: '',
    category: '',
    tax_rate_id: '',
    project_id: '',
    member_id: '',
    ...overrides,
  },
  rows: [
    {
      kind: 'heading',
      title: 'Contact info',
      description: 'How we reach you. Email + password create an account.',
    },
    [
      { name: 'full_name', label: 'Full name', placeholder: 'Ada Lovelace', required: true },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'ada@example.com', required: true },
    ],
    [
      { name: 'password', label: 'Password', type: 'password', placeholder: 'At least 8 chars, 1 uppercase, 1 number', required: true },
      { name: 'phone', label: 'Phone', type: 'phone', placeholder: '(555) 555-0100', required: true },
    ],
    { kind: 'heading', title: 'Billing plan', description: 'Pick the plan that fits your team.' },
    [{ name: 'plan', label: 'Billing plan', type: 'radio', required: true, options: PLAN_OPTIONS }],
    [{ name: 'monthly_budget', label: 'Monthly budget', type: 'currency', placeholder: '0.00', required: true }],
    { kind: 'heading', title: 'Notifications', description: 'How should we reach you?' },
    [{ name: 'notifications', label: 'Channels', type: 'checkboxes', required: true, options: NOTIFICATION_OPTIONS }],
    [{ name: 'tos', label: 'I agree to the Terms of Service', description: 'Required to create an account.', type: 'checkbox', required: true }],
    { kind: 'heading', title: 'Preferences', description: 'A couple of knobs to tune your account.' },
    [{ name: 'volume', label: 'Notification volume', type: 'range', min: 0, max: 100, step: 5, valueSuffix: '%', required: true }],
    [{ name: 'pages', label: 'Number of pages', type: 'stepper', min: 1, max: 50, step: 1, valueSuffix: 'page', required: true }],
    [{ name: 'due_date', label: 'Due date', type: 'date', placeholder: 'Pick a due date', required: true }],
    { kind: 'heading', title: 'Extras', description: 'A few more bits to round out the form.' },
    [{ name: 'verification_code', label: 'Verification code', type: 'otp', required: true }],
    [{ name: 'skill_tags', label: 'Skill tags', type: 'tags', required: true, placeholder: 'Type and press Enter or Space' }],
    [
      { name: 'daily_start', label: 'Daily start', type: 'time', required: true },
      { name: 'brand_color', label: 'Brand color', type: 'color', required: true },
    ],
    [
      {
        name: 'tone',
        label: 'Tone',
        type: 'segmented',
        required: true,
        options: [
          { value: 'casual', label: 'Casual' },
          { value: 'friendly', label: 'Friendly' },
          { value: 'professional', label: 'Professional' },
        ],
      },
    ],
    {
      kind: 'heading',
      title: 'Platform enhancements',
      description: 'Grouped Select sections, footer action, Combobox with color + description, decorated member options.',
    },
    [
      { name: 'category', label: 'Category', type: 'select', placeholder: 'Select…', options: KS_CATEGORY_OPTIONS },
      { name: 'tax_rate_id', label: 'Tax', type: 'select', placeholder: 'Select…', options: KS_TAX_OPTIONS },
    ],
    [
      { name: 'project_id', label: 'Project', type: 'select', placeholder: 'Select project…', options: KS_PROJECT_OPTIONS },
      { name: 'member_id', label: 'Member', type: 'select', placeholder: 'Select member…', options: KS_MEMBER_OPTIONS },
    ],
    { kind: 'heading', title: 'Address', description: 'Where this location lives.' },
    [{ name: 'label', label: 'Label', placeholder: 'Main Office', required: true }],
    [
      { name: 'address1', label: 'Address 1', placeholder: '123 Main St', required: true },
      { name: 'address2', label: 'Address 2', placeholder: 'Suite 100' },
    ],
    [
      { name: 'city', label: 'City', placeholder: 'San Francisco', required: true },
      { name: 'postal_code', label: 'Postal Code', type: 'number', placeholder: '94105', required: true },
    ],
    [
      {
        name: 'country',
        label: 'Country',
        type: 'select',
        placeholder: 'Select country…',
        required: true,
        options: COUNTRY_OPTIONS,
      },
      { name: 'region', label: 'Region / State', placeholder: 'Region', required: true },
    ],
    [{ name: 'website', label: 'Website', type: 'url', placeholder: 'https://example.com', required: true, layout: 'horizontal' }],
    [{ name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Anything we should know?', required: true, rows: 6 }],
    {
      kind: 'toolbar',
      label: 'Quick actions',
      description: 'Omni IconButtons — variant auto-routes (Trash2 → destructive).',
      actions: [
        { icon: 'move-up', label: 'Move up', variant: 'ghost' },
        { icon: 'move-down', label: 'Move down', variant: 'ghost' },
        { icon: 'copy', label: 'Duplicate', variant: 'ghost' },
        { icon: 'x', label: 'Clear', variant: 'ghost' },
        { icon: 'trash', label: 'Delete' },
      ],
    },
  ],
  submitLabel: 'Save',
});

/* -------------------------------------------------------------------------- */
/* Contact fixture                                                             */
/* -------------------------------------------------------------------------- */

export interface ContactFormData {
  name: string;
  email: string;
}

export const contactFormFactory = (overrides: Partial<ContactFormData> = {}): FormFixture<ContactFormData> => ({
  title: 'Contact',
  maxWidth: 'max-w-md',
  schema: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Enter a valid email'),
  }) as unknown as z.ZodType<ContactFormData>,
  initial: { name: '', email: '', ...overrides },
  rows: [
    [{ name: 'name', label: 'Name', required: true, placeholder: 'Ada Lovelace' }],
    [{ name: 'email', label: 'Email', required: true, type: 'email', placeholder: 'ada@example.com' }],
  ],
  submitLabel: 'Send',
});

/* -------------------------------------------------------------------------- */
/* Signup fixture — demonstrates every Input `type` variant + diverse Zod      */
/* failures (required, format, number range, URL parse, tel pattern).          */
/* -------------------------------------------------------------------------- */

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  age: number;
  website: string;
  phone: string;
}

export const signupFormFactory = (overrides: Partial<SignupFormData> = {}): FormFixture<SignupFormData> => ({
  title: 'Create Account',
  maxWidth: 'max-w-2xl',
  schema: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/\d/, 'Password must contain a number'),
    age: z.coerce
      .number({ invalid_type_error: 'Age must be a number' })
      .int('Age must be a whole number')
      .min(18, 'Must be 18 or older')
      .max(120, 'Must be 120 or younger'),
    website: z.string().url('Enter a valid URL'),
    phone: z.string().regex(/^[+\d\s()-]{10,}$/, 'Enter a valid phone (10+ digits)'),
  }) as unknown as z.ZodType<SignupFormData>,
  initial: {
    name: '',
    email: '',
    password: '',
    age: 0 as unknown as number,
    website: '',
    phone: '',
    ...overrides,
  },
  rows: [
    [
      { name: 'name', label: 'Name', required: true, placeholder: 'Ada Lovelace' },
      { name: 'email', label: 'Email', required: true, type: 'email', placeholder: 'ada@example.com' },
    ],
    [{ name: 'password', label: 'Password', required: true, type: 'password', placeholder: 'At least 8 chars, 1 uppercase, 1 number' }],
    [
      { name: 'age', label: 'Age', required: true, type: 'number', placeholder: '30' },
      { name: 'phone', label: 'Phone', required: true, type: 'tel', placeholder: '+1 555 0100' },
    ],
    [
      {
        name: 'website',
        label: 'Website',
        required: true,
        type: 'url',
        placeholder: 'https://example.com',
        layout: 'horizontal',
      },
    ],
  ],
  submitLabel: 'Sign Up',
});
