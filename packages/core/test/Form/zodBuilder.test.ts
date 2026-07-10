import { buildZodSchema, validators } from '@omnitech/omni-ui-core';

describe('validators preset catalog', () => {
  describe('text', () => {
    it('rejects below `min` with a labelled error message', () => {
      const r = validators.text({ min: 3, label: 'Name' }).safeParse('ab');
      expect(r.success).toBe(false);
      const message = r.success ? '' : r.error.issues[0].message;
      expect(message).toMatch(/at least 3/);
    });
    it('accepts at min and above', () => {
      expect(validators.text({ min: 3 }).safeParse('abc').success).toBe(true);
    });
    it('rejects above `max`', () => {
      expect(validators.text({ max: 2 }).safeParse('abc').success).toBe(false);
    });
  });

  describe('email', () => {
    it('rejects non-emails', () => {
      expect(validators.email().safeParse('not-an-email').success).toBe(false);
    });
    it('accepts valid emails', () => {
      expect(validators.email().safeParse('ada@example.com').success).toBe(true);
    });
  });

  describe('password', () => {
    it('requires min 8, uppercase, and a number by default', () => {
      const v = validators.password();
      expect(v.safeParse('short').success).toBe(false);
      expect(v.safeParse('alllowercase1').success).toBe(false);
      expect(v.safeParse('ALLUPPERCASE1').success).toBe(true);
      expect(v.safeParse('NoNumberHere').success).toBe(false);
      expect(v.safeParse('Goodpass1').success).toBe(true);
    });

    it('honors custom `min`', () => {
      const v = validators.password({ min: 12 });
      expect(v.safeParse('Short1').success).toBe(false);
      expect(v.safeParse('Goodpass12345').success).toBe(true);
    });
  });

  describe('url', () => {
    it('rejects bare hostnames without protocol', () => {
      expect(validators.url().safeParse('example.com').success).toBe(false);
    });
    it('accepts https URLs', () => {
      expect(validators.url().safeParse('https://example.com').success).toBe(true);
    });
  });

  describe('tel', () => {
    it('rejects short numerics', () => {
      expect(validators.tel().safeParse('123').success).toBe(false);
    });
    it('accepts 10+ digit phones with separators', () => {
      expect(validators.tel().safeParse('+1 (555) 010-0123').success).toBe(true);
    });
  });

  describe('number', () => {
    it('coerces strings to numbers', () => {
      expect(validators.number().safeParse('42')).toEqual({ success: true, data: 42 });
    });
    it('rejects below `min`', () => {
      expect(validators.number({ min: 18 }).safeParse('12').success).toBe(false);
    });
    it('rejects above `max`', () => {
      expect(validators.number({ max: 100 }).safeParse('999').success).toBe(false);
    });
    it('allows floats when `int: false`', () => {
      expect(validators.number({ int: false }).safeParse('3.14').success).toBe(true);
    });
    it('rejects floats by default (int=true)', () => {
      expect(validators.number().safeParse('3.14').success).toBe(false);
    });
  });

  describe('postalCode', () => {
    it('US: 5 digits + optional +4', () => {
      const v = validators.postalCode('US');
      expect(v.safeParse('94105').success).toBe(true);
      expect(v.safeParse('94105-1234').success).toBe(true);
      expect(v.safeParse('941').success).toBe(false);
      expect(v.safeParse('M5V 3A8').success).toBe(false);
    });
    it('CA: A1A 1A1 form', () => {
      const v = validators.postalCode('CA');
      expect(v.safeParse('M5V 3A8').success).toBe(true);
      expect(v.safeParse('M5V3A8').success).toBe(true);
      expect(v.safeParse('94105').success).toBe(false);
    });
    it('UK: pattern allowed', () => {
      const v = validators.postalCode('UK');
      expect(v.safeParse('SW1A 1AA').success).toBe(true);
      expect(v.safeParse('not-uk').success).toBe(false);
    });
    it('INTL: permissive alphanumeric 3–10', () => {
      const v = validators.postalCode('INTL');
      expect(v.safeParse('AB-12').success).toBe(true);
      expect(v.safeParse('A').success).toBe(false);
    });
  });

  describe('creditCard', () => {
    it('rejects non-Luhn numbers', () => {
      expect(validators.creditCard().safeParse('1234567890123456').success).toBe(false);
    });
    it('accepts a Luhn-valid number', () => {
      /* 4242 4242 4242 4242 is the canonical Stripe test card, Luhn-valid. */
      expect(validators.creditCard().safeParse('4242 4242 4242 4242').success).toBe(true);
    });
  });

  describe('date', () => {
    it('rejects non-ISO dates', () => {
      expect(validators.date().safeParse('12/25/2024').success).toBe(false);
    });
    it('accepts YYYY-MM-DD', () => {
      expect(validators.date().safeParse('2024-12-25').success).toBe(true);
    });
  });
});

describe('buildZodSchema', () => {
  it('builds a Zod object from FieldDef[] with required + type', () => {
    const schema = buildZodSchema([
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'age', label: 'Age', type: 'number', required: true, validate: validators.number({ min: 18 }) },
      { name: 'website', label: 'Website', type: 'url' },
    ]);
    // Valid input
    expect(schema.safeParse({ email: 'ada@example.com', age: 30, website: 'https://example.com' }).success).toBe(true);
    // Bad email
    expect(schema.safeParse({ email: 'nope', age: 30 }).success).toBe(false);
    // Below min age
    expect(schema.safeParse({ email: 'ada@example.com', age: 12 }).success).toBe(false);
  });

  it('honors per-field `validate` override over the default type validator', () => {
    const schema = buildZodSchema([{ name: 'name', label: 'Name', required: true, validate: validators.text({ min: 5, label: 'Name' }) }]);
    expect(schema.safeParse({ name: 'Hi' }).success).toBe(false);
    expect(schema.safeParse({ name: 'Hello' }).success).toBe(true);
  });

  it('marks non-required fields optional', () => {
    const schema = buildZodSchema([
      { name: 'note', label: 'Note' },
      { name: 'name', label: 'Name', required: true },
    ]);
    expect(schema.safeParse({ name: 'Ada' }).success).toBe(true);
    expect(schema.safeParse({ name: '' }).success).toBe(false);
  });
});
