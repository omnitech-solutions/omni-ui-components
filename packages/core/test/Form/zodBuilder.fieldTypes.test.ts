import { buildZodSchema, type FieldType } from '@oc-tech/omni-ui-components';
import { z } from 'zod';

const parse = (type: FieldType, value: unknown, extra: { required?: boolean } = {}) =>
  buildZodSchema([{ name: 'f', label: 'Field', type, ...extra }]).safeParse({ f: value });

const message = (type: FieldType, value: unknown, extra: { required?: boolean } = {}) => {
  const result = parse(type, value, extra);
  return result.success ? null : result.error.issues[0].message;
};

describe('buildZodSchema default validator per field type', () => {
  it.each<[FieldType, unknown, unknown]>([
    ['text', 'hello', 5],
    ['textarea', 'long text', null],
    ['select', 'a', 1],
    ['radio', 'a', 1],
    ['segmented', 'a', 1],
    ['email', 'ada@example.com', 'nope'],
    ['password', 'Passw0rdX', 'weak'],
    ['url', 'https://example.com', 'example.com'],
    ['tel', '+1 (555) 123-4567', '123'],
    ['phone', '+1 (555) 123-4567', '123'],
    ['number', '42', 'abc'],
    ['checkbox', true, 'yes'],
    ['checkboxes', ['a', 'b'], 'a'],
    ['tags', ['x'], 'x'],
    ['range', 7, '7'],
    ['stepper', 3, 3.5],
    ['date', '2026-07-15', '15/07/2026'],
    ['currency', '19.99', -1],
    ['otp', '123456', '12a'],
    ['time', '09:30', '9:30'],
    ['color', '#a1b2c3', '#abc'],
    ['file', 'upload.txt', 42],
  ])('%s accepts a good value and rejects a bad one', (type, good, bad) => {
    expect(parse(type, good, { required: true }).success).toBe(true);
    expect(parse(type, bad, { required: true }).success).toBe(false);
  });

  it('file also accepts a list of names', () => {
    expect(parse('file', ['a.txt', 'b.txt']).success).toBe(true);
  });

  it('falls back to the text validator when the type is missing or unknown', () => {
    const missing = buildZodSchema([{ name: 'f', label: 'F' }]);
    expect(missing.safeParse({ f: 'ok' }).success).toBe(true);
    expect(missing.safeParse({ f: 12 }).success).toBe(false);

    const unknown = buildZodSchema([{ name: 'f', label: 'F', type: 'mystery' as FieldType }]);
    expect(unknown.safeParse({ f: 'ok' }).success).toBe(true);
    expect(unknown.safeParse({ f: 12 }).success).toBe(false);
  });

  it('uses the custom type messages', () => {
    expect(message('otp', 'abc')).toBe('Enter the code');
    expect(message('time', 'noon')).toBe('Pick a time');
    expect(message('color', 'red')).toBe('Pick a color');
    expect(message('date', 'tomorrow')).toBe('Enter a date in YYYY-MM-DD form');
  });
});

describe('buildZodSchema required handling', () => {
  it('required strings reject the empty string with a labelled message', () => {
    expect(message('text', '', { required: true })).toBe('Field is required');
  });

  it('required numbers reject zero (empty input coerces to 0) with the labelled message', () => {
    expect(message('number', '', { required: true })).toBe('Field is required');
    expect(message('number', 0, { required: true })).toBe('Field is required');
    expect(parse('number', 5, { required: true }).success).toBe(true);
  });

  it('uses requiredMessage when given', () => {
    const schema = buildZodSchema([{ name: 'name', label: 'Name', required: true, requiredMessage: 'Tell us your name' }]);
    const result = schema.safeParse({ name: '' });
    expect(result.success ? '' : result.error.issues[0].message).toBe('Tell us your name');

    const numeric = buildZodSchema([{ name: 'n', label: 'N', type: 'number', required: true, requiredMessage: 'Need a count' }]);
    const numericResult = numeric.safeParse({ n: 0 });
    expect(numericResult.success ? '' : numericResult.error.issues[0].message).toBe('Need a count');
  });

  it('leaves non-string, non-number validators unchanged when required', () => {
    expect(parse('checkbox', false, { required: true }).success).toBe(true);
    expect(parse('tags', [], { required: true }).success).toBe(true);
  });

  it('optional fields may be omitted but still validate when present', () => {
    const schema = buildZodSchema([{ name: 'email', label: 'Email', type: 'email' }]);
    expect(schema.safeParse({}).success).toBe(true);
    expect(schema.safeParse({ email: 'bad' }).success).toBe(false);
  });

  it('a custom validate replaces the type default and is also made optional when not required', () => {
    const schema = buildZodSchema([{ name: 'age', label: 'Age', type: 'number', validate: z.coerce.number().min(18, 'Must be 18+') }]);
    expect(schema.safeParse({}).success).toBe(true);
    const result = schema.safeParse({ age: 10 });
    expect(result.success ? '' : result.error.issues[0].message).toBe('Must be 18+');
  });

  it('builds an empty object schema for no fields', () => {
    expect(buildZodSchema([]).safeParse({}).success).toBe(true);
  });
});
