import { z } from 'zod';

import type { FormFixture } from '@oc-tech/omni-ui-components/Form/Form.types';
import { NEW_COMPANY_OPTION, SHOWCASE_COMPANIES } from '../../showcase/entities';

/**
 * New Contact scenario — canonical source for both Form and RJSF.
 *
 * Mirrors the production POST /api/v1/contacts payload:
 *   contact: { name, email, phone_number, notes, avatar_url }
 *   top-level: connection_id, role, connection_name, connection_domain_value
 *
 * Visible fields are sourced from screenshots; `notes` and
 * `avatarUrl` are hidden — backend accepts them but the modal does
 * not surface inputs for them today.
 */
export interface ContactScenarioFormData {
  /* Visible inputs */
  name: string;
  email: string;
  phoneNumber: string;
  connectionId: string;
  connectionName: string;
  connectionDomainValue: string;
  role: string;
  /* Hidden by default — included for API parity */
  notes: string;
  avatarUrl: string;
}

export { NEW_COMPANY_OPTION };

export const contactScenarioInitial: ContactScenarioFormData = {
  name: '',
  email: '',
  phoneNumber: '',
  connectionId: '',
  connectionName: '',
  connectionDomainValue: '',
  role: '',
  notes: '',
  avatarUrl: '',
};

export const contactScenarioZod = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Email must be valid'),
    phoneNumber: z.string().optional().default(''),
    connectionId: z.string().optional().default(''),
    connectionName: z.string().optional().default(''),
    connectionDomainValue: z.string().optional().default(''),
    role: z.string().optional().default(''),
    notes: z.string().optional().default(''),
    avatarUrl: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.connectionId === NEW_COMPANY_OPTION && !data.connectionName.trim()) {
      ctx.addIssue({ code: 'custom', path: ['connectionName'], message: 'Company Name is required' });
    }
  }) as unknown as z.ZodType<ContactScenarioFormData>;

/** Form-side select options: just value + label. */
export const contactCompanyOptions = (): { value: string; label: string }[] => [
  { value: NEW_COMPANY_OPTION, label: '+ New Company' },
  ...SHOWCASE_COMPANIES.map((c) => ({ value: c.id, label: c.name })),
];

export const contactScenarioFormFactory = (overrides: Partial<ContactScenarioFormData> = {}): FormFixture<ContactScenarioFormData> => ({
  title: 'New Contact',
  maxWidth: 'max-w-2xl',
  schema: contactScenarioZod,
  initial: { ...contactScenarioInitial, ...overrides },
  rows: [
    [{ name: 'name', label: 'Name', placeholder: 'Name', required: true }],
    [{ name: 'email', label: 'Email', placeholder: 'Email', required: true, type: 'email' }],
    [{ name: 'phoneNumber', label: 'Phone', placeholder: '(123) 456-7890', type: 'phone' }],
    [{ name: 'connectionId', label: 'Company', type: 'select', placeholder: 'Select or create a company…', options: contactCompanyOptions() }],
    [{ name: 'connectionName', label: 'Company Name', placeholder: 'Company name', required: true }],
    [{ name: 'connectionDomainValue', label: 'Domain', placeholder: 'acme.com' }],
    [{ name: 'role', label: 'Job Title', placeholder: 'Manager' }],
    /* Hidden fields are accepted by the API but the modal does not
     * render them. Form has no native hidden FieldType — they live in
     * `initial` + Zod only, so the submit payload still carries them. */
  ],
});
