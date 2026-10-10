import type { Meta, StoryObj } from '@storybook/react';
import {
  type AddressFormData,
  type AutomationFormData,
  addressFormFactory,
  automationFormFactory,
  type KitchenSinkFormData,
  kitchenSinkFormFactory,
} from 'factories/dynamic-form/DynamicForm/DynamicForm.factories';
import {
  fieldCatalog,
  type WidgetCatalogEntry,
  widgetCatalog,
} from 'factories/dynamic-form/registries/widgetCatalog';
import {
  type DynamicFormStoryArgs,
  defineDynamicFormStories,
} from 'storybook-helpers/defineDynamicFormStories';

type AnyFormData = AddressFormData | AutomationFormData | KitchenSinkFormData;
type Args = DynamicFormStoryArgs<AnyFormData>;

const config = defineDynamicFormStories<AnyFormData>({
  title: 'dynamic-form/DynamicForm',
  fixtures: {
    kitchenSink: kitchenSinkFormFactory as () => any,
    address: addressFormFactory as () => any,
    automation: automationFormFactory as () => any,
  },
  titles: {
    kitchenSink: 'Account & address',
    address: 'Add Address',
    automation: 'Automation',
  },
  submitLabels: {
    address: 'Save Address',
    automation: 'Save automation',
  },
  defaultArgs: { fixture: 'kitchenSink' },
  docs: {
    name: 'DynamicForm',
    whenToUse: [
      'Omni RJSF facade — AJV runs at render-time, Zod runs at submit. Feature widgets / fields / templates',
      'layer over the app registries; submit chrome is feature-owned via `children`. Two-column layouts use',
      'the flat `ui:rows: string[][]` API in the uiSchema.',
    ].join(' '),
  },
  stories: {
    KitchenSink: { fixture: 'kitchenSink' },
    AddAddress: { fixture: 'address' },
    AutomationTextFields: { fixture: 'automation' },
    Disabled: { fixture: 'automation', prefilled: true, disabled: true },
    ReadOnly: {
      fixture: 'automation',
      prefilled: true,
      formData: {
        name: 'Welcome email automation',
        subject: 'Welcome aboard',
        message: "We're looking forward to working with you.",
      } as any,
      readOnly: true,
    },
    ValidationErrors: {
      fixture: 'automation',
      submitLabel: 'Try to save (will fail)',
      autoSubmit: true,
    },
    ApiError: {
      fixture: 'kitchenSink',
      prefilled: true,
      onSubmitMode: 'reject',
      autoSubmit: true,
    },
    AsyncSubmit: {
      fixture: 'kitchenSink',
      prefilled: true,
      onSubmitMode: 'slow',
    },
  },
});

const meta: Meta<Args> = {
  title: 'dynamic-form/DynamicForm',
  tags: ['autodocs'],
  parameters: config.parameters,
  argTypes: config.argTypes,
  args: config.defaultArgs,
  render: config.render,
};
export default meta;

type Story = StoryObj<Args>;

export const KitchenSink: Story = { args: config.stories.KitchenSink };
export const AddAddress: Story = { args: config.stories.AddAddress };
export const AutomationTextFields: Story = { args: config.stories.AutomationTextFields };
export const Disabled: Story = { args: config.stories.Disabled };
export const ReadOnly: Story = { args: config.stories.ReadOnly };
export const ValidationErrors: Story = { args: config.stories.ValidationErrors };
export const ApiError: Story = { args: config.stories.ApiError };
export const AsyncSubmit: Story = { args: config.stories.AsyncSubmit };

const REFERENCE_COLUMNS = [
  ['name', 'ui:widget'],
  ['aliases', 'Also registered as'],
  ['control', 'Control'],
  ['schema', 'Schema type / format'],
  ['options', 'ui:options'],
  ['value', 'Stored value'],
] as const;

const ReferenceTable = ({ caption, rows }: { caption: string; rows: WidgetCatalogEntry[] }) => (
  <table className="w-full border-collapse text-left font-[family-name:var(--oui-font-sans)] text-xs text-[var(--oui-foreground)]">
    <caption className="pb-2 text-left text-sm font-semibold">{caption}</caption>
    <thead>
      <tr>
        {REFERENCE_COLUMNS.map(([key, heading]) => (
          <th
            key={key}
            scope="col"
            className="border-b border-[var(--oui-border-field)] px-2 py-1.5 font-semibold"
          >
            {heading}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => (
        <tr key={row.name}>
          {REFERENCE_COLUMNS.map(([key]) =>
            key === 'name' ? (
              <th
                key={key}
                scope="row"
                className="border-b border-[var(--oui-border-field)] px-2 py-1.5 align-top font-semibold"
              >
                <code>{row.name}</code>
              </th>
            ) : (
              <td
                key={key}
                className="border-b border-[var(--oui-border-field)] px-2 py-1.5 align-top text-[var(--oui-foreground-muted)]"
              >
                {key === 'aliases' ? row.aliases.join(', ') : row[key]}
              </td>
            ),
          )}
        </tr>
      ))}
    </tbody>
  </table>
);

/**
 * Every widget and field the library registers: the name to write in `ui:widget` (or `ui:field`), its aliases,
 * the control it adapts, the schema it binds to, the options it reads and the value it stores. Drawn from
 * `widgetCatalog` and `fieldCatalog`, which a test keeps in step with the registries. Every widget also reads
 * `size`, `variant`, `layout`, `labelActionKey`, `description`, `help` and `placeholder`; set them once for the
 * whole form in `ui:globalOptions`.
 */
export const WidgetReference: Story = {
  parameters: { example: { frame: false } },
  render: () => (
    <div className="flex flex-col gap-8 overflow-x-auto">
      <ReferenceTable caption="Widgets (ui:widget)" rows={widgetCatalog} />
      <ReferenceTable caption="Fields (ui:field)" rows={fieldCatalog} />
    </div>
  ),
};
