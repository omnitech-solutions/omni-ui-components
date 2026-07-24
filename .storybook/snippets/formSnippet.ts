import type { FieldDef, FormFixture, FormRow, FormSectionHeading, FormToolbarRow } from '@oc-tech/omni-ui-components/Form/Form.types';
import { formatValue } from './formatValue';

const isSectionHeading = (r: unknown): r is FormSectionHeading =>
  !Array.isArray(r) && typeof r === 'object' && r !== null && (r as { kind?: string }).kind === 'heading';
const isToolbarRow = (r: unknown): r is FormToolbarRow =>
  !Array.isArray(r) && typeof r === 'object' && r !== null && (r as { kind?: string }).kind === 'toolbar';

const renderField = (field: FieldDef, indent: string): string => {
  const typeAttr = field.type && field.type !== 'text' ? ` type="${field.type}"` : '';
  const reqAttr = field.required ? ' required' : '';
  return [
    `${indent}<FormField name="${field.name}"${reqAttr}>`,
    `${indent}  {(p) => <Input id={p.id}${typeAttr} label=${JSON.stringify(field.label)} value={(p.value as string) ?? ""} onChange={p.onChange} error={p.error} required={p.required} />}`,
    `${indent}</FormField>`,
  ].join('\n');
};

/** Build a runnable JSX snippet from a `FormFixture` and optional `formData` override. */
export function buildFormSnippet<T>(fixture: FormFixture<T>, opts: { formData?: Partial<T>; submitLabel?: string } = {}): string {
  const rows = (fixture.rows as FormRow[]).map((r) => {
    if (isSectionHeading(r)) {
      const desc = r.description ? ` ${JSON.stringify(r.description)}` : '';
      return `  {/* section: ${r.title}${desc} */}`;
    }
    if (isToolbarRow(r)) {
      const actions = r.actions
        .map((a) => `{ icon: ${JSON.stringify(a.icon)}, label: ${JSON.stringify(a.label)}${a.variant ? `, variant: ${JSON.stringify(a.variant)}` : ''} }`)
        .join(', ');
      return `  {/* toolbar: [${actions}] */}`;
    }
    const fields = Array.isArray(r) ? r : (r as { fields: FieldDef[] }).fields;
    const cols = !Array.isArray(r) && (r as { cols?: number }).cols ? ` cols={${(r as { cols?: number }).cols}}` : '';
    const inner = fields.map((f) => renderField(f, '    ')).join('\n');
    return `  <FormRow${cols}>\n${inner}\n  </FormRow>`;
  });
  const formData = opts.formData ?? fixture.initial;
  const submit = opts.submitLabel ?? fixture.submitLabel ?? 'Save';
  return [
    "import { Form, FormActions, FormField, FormRow, Input } from '@oc-tech/omni-ui-components';",
    '',
    `const formData = ${formatValue(formData)};`,
    '',
    '<Form',
    '  zodSchema={schema}',
    '  formData={formData}',
    '  onSubmit={(parsed) => save(parsed)}',
    '  onError={(errors) => setErrors(errors)}',
    '>',
    ...rows,
    '  <FormActions>',
    `    <button type="submit">${submit}</button>`,
    '  </FormActions>',
    '</Form>',
  ].join('\n');
}
