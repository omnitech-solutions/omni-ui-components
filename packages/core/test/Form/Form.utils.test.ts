import { z } from 'zod';

import { zodIssuesToFormErrors } from '@omnitech/omni-ui-core';

/** Helper — force a Zod parse failure for the given schema/value and return the issues. */
const failedParse = <T>(schema: z.ZodType<T>, value: unknown): z.ZodError => {
  const result = schema.safeParse(value);
  if (result.success) throw new Error('Expected schema.safeParse to fail but it succeeded.');
  return result.error;
};

describe('zodIssuesToFormErrors', () => {
  it('maps each Zod issue to a FormError with source: "zod"', () => {
    const schema = z.object({ name: z.string().min(1, 'name required') });
    const err = failedParse(schema, { name: '' });
    expect(zodIssuesToFormErrors(err)).toEqual([{ path: ['name'], message: 'name required', source: 'zod' }]);
  });

  it('stringifies numeric path segments (Zod uses raw numbers for array indices)', () => {
    const schema = z.object({ items: z.array(z.string().min(1, 'cannot be blank')) });
    const err = failedParse(schema, { items: ['ok', ''] });
    const out = zodIssuesToFormErrors(err);
    expect(out).toEqual([{ path: ['items', '1'], message: 'cannot be blank', source: 'zod' }]);
    expect(typeof out[0].path[1]).toBe('string');
  });

  it('preserves multiple issues with source: "zod"', () => {
    const schema = z.object({
      name: z.string().min(2, 'name >= 2'),
      email: z.string().email('bad email'),
    });
    const err = failedParse(schema, { name: 'A', email: 'nope' });
    const out = zodIssuesToFormErrors(err);
    const paths = out.map((e) => e.path.join('.'));
    expect(paths).toEqual(expect.arrayContaining(['name', 'email']));
    expect(out.every((e) => e.source === 'zod')).toBe(true);
  });

  it('returns an empty array when the ZodError has no issues', () => {
    const fakeErr = { issues: [] as z.ZodIssue[] } as z.ZodError;
    expect(zodIssuesToFormErrors(fakeErr)).toEqual([]);
  });
});
