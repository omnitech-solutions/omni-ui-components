import { z } from 'zod';

import type { FormFixture } from '@omnitech/omni-ui-core/Form/Form.types';
import { NEW_CONTACT_OPTION, SHOWCASE_CONTACTS } from '../../showcase/entities';

/**
 * New Company scenario — canonical source for both Form and RJSF.
 *
 * Mirrors POST /api/v1/connections:
 *   { name, connection_domain_value, primary_contact: { id, name, email, phone_number, role } }
 * Plus the wider connection_params surface (avatar_url, description,
 * linkedin/instagram/twitter/facebook, industry, company_size,
 * source) that the modal does not render today — hidden defaults.
 */
export interface CompanyScenarioFormData {
  /* Visible */
  name: string;
  connectionDomainValue: string;
  primaryContactId: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhoneNumber: string;
  primaryContactRole: string;
  /* Hidden — API payload parity */
  avatarUrl: string;
  description: string;
  linkedin: string;
  instagram: string;
  twitter: string;
  facebook: string;
  industry: string;
  companySize: string;
  source: string;
}

export { NEW_CONTACT_OPTION };

export const companyScenarioInitial: CompanyScenarioFormData = {
  name: '',
  connectionDomainValue: '',
  primaryContactId: '',
  primaryContactName: '',
  primaryContactEmail: '',
  primaryContactPhoneNumber: '',
  primaryContactRole: '',
  avatarUrl: '',
  description: '',
  linkedin: '',
  instagram: '',
  twitter: '',
  facebook: '',
  industry: '',
  companySize: '',
  source: '',
};

export const companyScenarioZod = z
  .object({
    name: z.string().min(1, 'Company Name is required'),
    connectionDomainValue: z.string().optional().default(''),
    primaryContactId: z.string().optional().default(''),
    primaryContactName: z.string().optional().default(''),
    primaryContactEmail: z.string().optional().default(''),
    primaryContactPhoneNumber: z.string().optional().default(''),
    primaryContactRole: z.string().optional().default(''),
    avatarUrl: z.string().optional().default(''),
    description: z.string().optional().default(''),
    linkedin: z.string().optional().default(''),
    instagram: z.string().optional().default(''),
    twitter: z.string().optional().default(''),
    facebook: z.string().optional().default(''),
    industry: z.string().optional().default(''),
    companySize: z.string().optional().default(''),
    source: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.primaryContactId === NEW_CONTACT_OPTION) {
      if (!data.primaryContactName.trim()) ctx.addIssue({ code: 'custom', path: ['primaryContactName'], message: 'Contact Name is required' });
      if (!data.primaryContactEmail.trim()) ctx.addIssue({ code: 'custom', path: ['primaryContactEmail'], message: 'Contact Email is required' });
    }
  }) as unknown as z.ZodType<CompanyScenarioFormData>;

export const companyContactOptions = (): { value: string; label: string }[] => [
  { value: NEW_CONTACT_OPTION, label: '+ New Contact' },
  ...SHOWCASE_CONTACTS.map((c) => ({ value: c.id, label: c.name })),
];

export const companyScenarioFormFactory = (overrides: Partial<CompanyScenarioFormData> = {}): FormFixture<CompanyScenarioFormData> => ({
  title: 'New Company',
  maxWidth: 'max-w-2xl',
  schema: companyScenarioZod,
  initial: { ...companyScenarioInitial, ...overrides },
  rows: [
    [{ name: 'name', label: 'Company Name', placeholder: 'Acme Inc.', required: true }],
    [{ name: 'connectionDomainValue', label: 'Domain', placeholder: 'acme.com' }],
    [{ name: 'primaryContactId', label: 'Primary Contact', type: 'select', placeholder: 'Select or create a contact…', options: companyContactOptions() }],
    [{ name: 'primaryContactName', label: 'Name', placeholder: 'Contact Name', required: true }],
    [{ name: 'primaryContactEmail', label: 'Email', placeholder: 'Email', required: true, type: 'email' }],
    [{ name: 'primaryContactPhoneNumber', label: 'Phone Number', placeholder: '(123) 456-7890', type: 'phone' }],
    [{ name: 'primaryContactRole', label: 'Job Title', placeholder: 'Manager' }],
    /* avatarUrl / description / linkedin / instagram / twitter / facebook /
     * industry / companySize / source are accepted by the API but the
     * modal does not render inputs for them. Their empty defaults
     * still carry in the submit payload. */
  ],
});
