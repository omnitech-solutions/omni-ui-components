import { z, type ZodTypeAny } from 'zod';

import type { FieldDef, FieldType } from './Form.types';

/* -------------------------------------------------------------------------- */
/* Reusable named validators                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Catalog of pre-built Zod validators for the common field shapes. Pair with
 * `buildZodSchema` via `ZodFieldDef.validate`:
 *
 * @example
 * buildZodSchema([
 *   { name: 'email', label: 'Email', required: true, validate: validators.email() },
 *   { name: 'zip', label: 'ZIP', required: true, validate: validators.postalCode('US') },
 * ]);
 */
export const validators = {
  text: (opts: { min?: number; max?: number; label?: string } = {}) => {
    let v = z.string();
    if (opts.min != null) v = v.min(opts.min, `${opts.label ?? 'Value'} must be at least ${opts.min} characters`);
    if (opts.max != null) v = v.max(opts.max, `${opts.label ?? 'Value'} must be at most ${opts.max} characters`);
    return v;
  },
  email: (message = 'Enter a valid email') => z.string().email(message),
  password: (opts: { min?: number } = {}) =>
    z
      .string()
      .min(opts.min ?? 8, `Password must be at least ${opts.min ?? 8} characters`)
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/\d/, 'Password must contain a number'),
  url: (message = 'Enter a valid URL') => z.string().url(message),
  tel: (message = 'Enter a valid phone (10+ digits)') => z.string().regex(/^[+\d\s()-]{10,}$/, message),
  number: (opts: { min?: number; max?: number; int?: boolean } = {}) => {
    let v: ZodTypeAny = z.coerce.number({ error: 'Must be a number' });
    if (opts.int !== false) v = (v as z.ZodNumber).int('Must be a whole number');
    if (opts.min != null) v = (v as z.ZodNumber).min(opts.min, `Must be at least ${opts.min}`);
    if (opts.max != null) v = (v as z.ZodNumber).max(opts.max, `Must be at most ${opts.max}`);
    return v;
  },
  /** Postal code by ISO country. `US` → 5 digits, `CA` → A1A 1A1, fallback → 3–10 alphanumerics. */
  postalCode: (country: 'US' | 'CA' | 'UK' | 'INTL' = 'INTL') => {
    const pattern =
      country === 'US'
        ? /^\d{5}(-\d{4})?$/
        : country === 'CA'
          ? /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
          : country === 'UK'
            ? /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i
            : /^[A-Za-z0-9 -]{3,10}$/;
    return z.string().regex(pattern, `Enter a valid ${country === 'INTL' ? '' : `${country} `}postal code`);
  },
  /** Permissive credit-card check: digits + Luhn checksum. */
  creditCard: () =>
    z.string().refine(
      (s) => {
        const digits = s.replace(/\D/g, '');
        if (digits.length < 12 || digits.length > 19) return false;
        let sum = 0;
        let alt = false;
        for (let i = digits.length - 1; i >= 0; i -= 1) {
          let n = Number(digits[i]);
          if (alt) {
            n *= 2;
            if (n > 9) n -= 9;
          }
          sum += n;
          alt = !alt;
        }
        return sum % 10 === 0;
      },
      { message: 'Enter a valid credit card number' },
    ),
  /** Date in ISO `YYYY-MM-DD` form. */
  date: () => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a date in YYYY-MM-DD form'),
} as const;

const TYPE_VALIDATORS: Record<FieldType, () => ZodTypeAny> = {
  text: () => validators.text(),
  email: () => validators.email(),
  password: () => validators.password(),
  url: () => validators.url(),
  tel: () => validators.tel(),
  number: () => validators.number(),
  textarea: () => validators.text(),
  select: () => validators.text(),
  radio: () => validators.text(),
  checkbox: () => z.boolean(),
  checkboxes: () => z.array(z.string()),
  range: () => z.number(),
  segmented: () => validators.text(),
  stepper: () => z.number().int(),
  date: () => validators.date(),
  phone: () => validators.tel(),
  currency: () => z.coerce.number().nonnegative(),
  otp: () => z.string().regex(/^\d+$/, 'Enter the code'),
  tags: () => z.array(z.string()),
  time: () => z.string().regex(/^\d{2}:\d{2}/, 'Pick a time'),
  color: () => z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Pick a color'),
  file: () => z.string().or(z.array(z.string())),
};

/** Field declaration enriched with optional Zod overrides used by `buildZodSchema`. */
export interface ZodFieldDef<TName extends string = string> extends FieldDef<TName> {
  /** Replace the default validator for this field entirely. */
  validate?: ZodTypeAny;
  /** Override the "required" message used when the field is empty. */
  requiredMessage?: string;
}

const requiredOf = (validator: ZodTypeAny, label: string, override?: string): ZodTypeAny => {
  if (validator instanceof z.ZodString) {
    return validator.min(1, override ?? `${label} is required`);
  }
  if (validator instanceof z.ZodNumber) {
    return validator.min(1, override ?? `${label} is required`);
  }
  return validator;
};

/**
 * Build a Zod object schema from a flat array of {@link ZodFieldDef} entries.
 * Honors `field.required` (adds an empty-string / non-positive min) and
 * `field.validate` (full validator override per field).
 *
 * @example
 * const schema = buildZodSchema([
 *   { name: 'email', label: 'Email', type: 'email', required: true },
 *   { name: 'age', label: 'Age', type: 'number', validate: z.coerce.number().min(18, 'Must be 18+') },
 * ]);
 */
export function buildZodSchema<TName extends string>(fields: ZodFieldDef<TName>[]): z.ZodObject<any> {
  const shape: Record<string, ZodTypeAny> = {};
  for (const field of fields) {
    let validator = field.validate ?? (TYPE_VALIDATORS[field.type ?? 'text'] ?? TYPE_VALIDATORS.text)();
    if (field.required) {
      validator = requiredOf(validator, field.label, field.requiredMessage);
    } else {
      validator = (validator as ZodTypeAny).optional();
    }
    shape[field.name] = validator;
  }
  return z.object(shape);
}

/** Flatten a row layout (`FieldDef[][]` / `FormRowDef` / heading rows) into a flat field list. */
export function fieldsFromRows<TName extends string>(
  rows: (ZodFieldDef<TName>[] | { fields: ZodFieldDef<TName>[] } | { kind: 'heading' })[],
): ZodFieldDef<TName>[] {
  const out: ZodFieldDef<TName>[] = [];
  for (const row of rows) {
    if (Array.isArray(row)) out.push(...row);
    else if ('fields' in row) out.push(...row.fields);
  }
  return out;
}
