import { Button } from '@oc-tech/omni-ui-components';
import { DynamicForm, type OmniUiSchema } from '@oc-tech/omni-ui-components/dynamic-form';
import type { RJSFSchema } from '@rjsf/utils';
import { z } from 'zod';

interface Booking {
  name?: string;
  plan?: string;
  seats?: number;
  contact?: { email?: string; phone?: string };
  people?: string[];
}

const schema: RJSFSchema = {
  type: 'object',
  title: 'Booking',
  properties: {
    name: { type: 'string', title: 'Name' },
    plan: { type: 'string', title: 'Plan', enum: ['Free', 'Pro', 'Team'] },
    seats: { type: 'integer', title: 'Seats', minimum: 1, maximum: 50 },
    contact: {
      type: 'object',
      title: 'Contact',
      description: 'How we reach you about this booking.',
      properties: {
        email: { type: 'string', title: 'Email', format: 'email' },
        phone: { type: 'string', title: 'Phone' },
      },
    },
    people: { type: 'array', title: 'People', items: { type: 'string', title: 'Name' } },
  },
};

const bookingSchema = z.object({}).passthrough() as unknown as z.ZodType<Booking>;

/**
 * The look of a whole form is data: `ui:globalOptions` sets the size, the variant and the side of the label for
 * every field, and one field overrides it in its own `ui:options`. A section draws its title and description as
 * a `fieldset` legend; `section: 'card'` puts it in a card; an array is rows with a named add button.
 */
const uiSchema: OmniUiSchema = {
  'ui:globalOptions': { size: 'sm', layout: 'horizontal' },
  'ui:options': { heading: true },
  'ui:rows': [['name'], ['plan'], ['seats'], ['contact'], ['people']],
  plan: { 'ui:widget': 'segmented' },
  seats: { 'ui:widget': 'numberInput', 'ui:options': { size: 'md' } },
  contact: {
    'ui:options': { section: 'card' },
    'ui:rows': [['email', 'phone']],
    email: { 'ui:options': { layout: 'vertical' } },
    phone: { 'ui:widget': 'phone', 'ui:options': { layout: 'vertical' } },
  },
  people: { 'ui:options': { addLabel: 'Add person' } },
};

export function FormLookExample() {
  return (
    <div className="max-w-xl">
      <DynamicForm<Booking & Record<string, unknown>, Booking>
        idPrefix="booking"
        schema={schema}
        uiSchema={uiSchema}
        zodSchema={bookingSchema}
        formData={{ name: 'Ada', plan: 'Pro', seats: 3, people: ['Grace'] }}
        onSubmit={() => undefined}
      >
        <Button type="submit">Save</Button>
      </DynamicForm>
    </div>
  );
}
