import { z } from 'zod';
import type { UiSchema, RJSFSchema } from '@rjsf/utils';

import type { DynamicFormFixture, FormFixture } from '../../DynamicForm/DynamicForm.factories';
import { SHOWCASE_EXPENSE_CATEGORIES, SHOWCASE_TAX_RATES } from '../../../../showcase/entities';
import { selectOptions } from '../../../../helpers/optionMappers';

export interface CountryFormData {
  country: string;
}

const COUNTRY_SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['country'],
  properties: {
    country: {
      type: 'string',
      title: 'Country',
      oneOf: [
        { const: 'US', title: 'United States' },
        { const: 'CA', title: 'Canada' },
        { const: 'UK', title: 'United Kingdom' },
        { const: 'AU', title: 'Australia' },
        { const: 'DE', title: 'Germany' },
        { const: 'FR', title: 'France' },
        { const: 'JP', title: 'Japan' },
        { const: 'BR', title: 'Brazil' },
        { const: 'IN', title: 'India' },
        { const: 'MX', title: 'Mexico' },
      ],
    },
  },
};

const COUNTRY_ZOD = z.object({ country: z.string() }) as unknown as z.ZodType<CountryFormData>;
const COUNTRY_ZOD_REQUIRED = z.object({
  country: z.string().min(1, 'Pick a country'),
}) as unknown as z.ZodType<CountryFormData>;

const fixtureFor = (uiSchema: UiSchema, opts: { initial?: string; required?: boolean } = {}): FormFixture<CountryFormData> => ({
  schema: COUNTRY_SCHEMA,
  uiSchema,
  zodSchema: opts.required ? COUNTRY_ZOD_REQUIRED : COUNTRY_ZOD,
  defaults: { country: opts.initial ?? '' },
});

export const plainCountryFixture = (): FormFixture<CountryFormData> => fixtureFor({ country: { 'ui:widget': 'select' } });

export const placeholderCountryFixture = (): FormFixture<CountryFormData> =>
  fixtureFor({ country: { 'ui:widget': 'select', 'ui:placeholder': 'Pick a country' } });

export const descriptionCountryFixture = (): FormFixture<CountryFormData> =>
  fixtureFor({
    country: {
      'ui:widget': 'select',
      'ui:description': 'Used for tax + shipping calculations.',
    },
  });

export const prefilledCountryFixture = (): FormFixture<CountryFormData> => fixtureFor({ country: { 'ui:widget': 'select' } }, { initial: 'CA' });

export const validationCountryFixture = (): FormFixture<CountryFormData> => fixtureFor({ country: { 'ui:widget': 'select' } }, { required: true });

export const searchableCountryFixture = (): FormFixture<CountryFormData> =>
  fixtureFor({ country: { 'ui:widget': 'select', 'ui:options': { searchable: true } } });

/* -------------------------------------------------------------------------- */
/* New variant fixtures — grouped options + footer action sourced from         */
/* formContext.optionSets/actions instead of schema enums.                     */
/* -------------------------------------------------------------------------- */

export interface CategoryFormData {
  category: string;
}

const CATEGORY_SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['category'],
  properties: { category: { type: 'string', title: 'Category' } },
};

const CATEGORY_ZOD = z.object({ category: z.string() }) as unknown as z.ZodType<CategoryFormData>;

export const groupedSelectFixture = (): DynamicFormFixture<CategoryFormData, Record<string, string>> => ({
  schema: CATEGORY_SCHEMA,
  uiSchema: { category: { 'ui:widget': 'select', 'ui:options': { optionSetKey: 'categories', searchable: true } } },
  zodSchema: CATEGORY_ZOD,
  defaults: { category: '' },
  derive: () => ({}),
  formContext: {
    optionSets: { categories: selectOptions(SHOWCASE_EXPENSE_CATEGORIES, { value: 'id', label: 'label', group: 'group' }) },
    actions: {},
    locale: 'en-GB',
  },
});

export interface TaxRateFormData {
  taxRateId: string;
}

const TAX_RATE_SCHEMA: RJSFSchema = {
  type: 'object',
  required: ['taxRateId'],
  properties: { taxRateId: { type: 'string', title: 'Tax' } },
};

const TAX_RATE_ZOD = z.object({ taxRateId: z.string() }) as unknown as z.ZodType<TaxRateFormData>;

export const withFooterActionSelectFixture = (): DynamicFormFixture<TaxRateFormData, Record<string, string>> => ({
  schema: TAX_RATE_SCHEMA,
  uiSchema: { taxRateId: { 'ui:widget': 'select', 'ui:options': { optionSetKey: 'taxRates', footerActionKey: 'manageTaxRates' } } },
  zodSchema: TAX_RATE_ZOD,
  defaults: { taxRateId: '' },
  derive: () => ({}),
  formContext: {
    optionSets: { taxRates: selectOptions(SHOWCASE_TAX_RATES, { value: 'id', label: 'label', group: () => 'SET TAX' }) },
    actions: { manageTaxRates: { label: 'Manage Tax Rates', href: '/settings/tax_rates', actionId: 'manageTaxRates' } },
    locale: 'en-GB',
  },
});
