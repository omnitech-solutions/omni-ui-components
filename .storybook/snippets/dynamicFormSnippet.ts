import type { FormFixture } from 'factories/dynamic-form/DynamicForm/DynamicForm.factories';
import { formatValue } from './formatValue';

/**
 * Build a runnable JSX snippet from a `DynamicForm` fixture (schema +
 * uiSchema + defaults). Emits a single `rjsfSchemas` const so the consuming
 * code passes the bundle through with spread — keeping the snippet
 * compact regardless of fixture size.
 */
export function buildDynamicFormSnippet<T>(fixture: FormFixture<T>, opts: { submitLabel?: string } = {}): string {
  const submit = opts.submitLabel ?? 'Save';
  const fixtureLiteral = formatValue({
    schema: fixture.schema,
    uiSchema: fixture.uiSchema,
    defaults: fixture.defaults,
  });
  return [
    "import { DynamicForm } from 'dynamic-form';",
    '',
    `const rjsfSchemas = ${fixtureLiteral};`,
    '',
    '<DynamicForm',
    '  schema={rjsfSchemas.schema}',
    '  uiSchema={rjsfSchemas.uiSchema}',
    '  zodSchema={zodSchema}',
    '  formData={rjsfSchemas.defaults}',
    '  onSubmit={(parsed) => save(parsed)}',
    '  onError={(errors) => setErrors(errors)}',
    '>',
    `  <button type="submit">${submit}</button>`,
    '</DynamicForm>',
  ].join('\n');
}
