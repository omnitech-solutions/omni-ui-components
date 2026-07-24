import type { RJSFSchema, UiSchema } from '@rjsf/utils';

import type { InputProps } from '@oc-tech/omni-ui-components/Input/Input.types';
import { makeFactory, type Variant } from '../../internal/support/makeFactory';

/**
 * Build `<Input>` props for standalone (non-RJSF) stories and unit tests.
 *
 * @example
 * render(<Input {...inputPropsFactory({ value: 'a', invalid: true })} />);
 */
export const inputPropsFactory = makeFactory<InputProps>({
  id: 'project-title',
  label: 'Project Title',
  placeholder: 'Project Title',
  value: '',
  variant: 'bordered',
  inputSize: 'default',
  disabled: false,
  readOnly: false,
});

/** Ordered variant matrix used by the cheatsheet + kitchen-sink stories. */
export const inputVariants: Variant<InputProps>[] = [
  { name: 'Default', args: { label: 'Default', placeholder: 'Type something…' } },
  { name: 'Required', args: { label: 'Required', placeholder: 'Required value', required: true } },
  { name: 'With description', args: { label: 'With description', placeholder: 'Hello', description: 'Helper text below the field.' } },
  { name: 'Read only', args: { label: 'Read only', readOnly: true, value: 'Locked in' } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: 'Greyed out' } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'This field is required' } },
];

/** Fixture shape returned by {@link inputSchemaFactory}. */
export interface InputSchemaFixture {
  schema: RJSFSchema;
  uiSchema: UiSchema;
  formData: Record<string, unknown>;
}

/**
 * Build a single-string-field RJSF fixture (schema + uiSchema + formData) so
 * the same Input can be exercised through the RJSF stack via DynamicForm.
 */
export const inputSchemaFactory = makeFactory<InputSchemaFixture>({
  schema: {
    type: 'object',
    required: ['subject'],
    properties: {
      subject: { type: 'string', title: 'Email Subject', maxLength: 200 },
    },
  },
  uiSchema: {
    subject: { 'ui:widget': 'text', 'ui:placeholder': 'New message from …' },
  },
  formData: { subject: '' },
});
