import type { Meta, StoryObj } from '@storybook/react';
import { HiddenWidget } from './HiddenWidget';

const meta = {
  title: 'dynamic-form/widgets/HiddenWidget',
  component: HiddenWidget,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Draws nothing visible and keeps its value in the form data: for ids, tokens and computed fields. Chosen with `ui:widget: "hidden"`.',
      },
    },
  },
} satisfies Meta<typeof HiddenWidget>;
export default meta;

/** Nothing is drawn: the value travels with the form as a hidden input. */
export const Default: StoryObj = {
  parameters: {
    docs: {
      source: {
        code: `const schema = { type: 'object', properties: { recordId: { type: 'string' } } };
const uiSchema = { recordId: { 'ui:widget': 'hidden' } };

<DynamicForm schema={schema} uiSchema={uiSchema} formData={{ recordId: 'rec_42' }} />`,
      },
    },
  },
  render: () => (
    <div className="text-sm">
      <HiddenWidget {...({ id: 'record-id', value: 'rec_42' } as never)} />
      <p className="m-0 text-muted-foreground">
        A hidden input named <code>record-id</code> holds <code>rec_42</code>.
      </p>
    </div>
  ),
};
