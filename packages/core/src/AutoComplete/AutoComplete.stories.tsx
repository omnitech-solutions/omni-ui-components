import { AutoComplete, type AutoCompleteProps } from '@oc-tech/omni-ui-components/AutoComplete';
import type { Meta, StoryObj } from '@storybook/react';
import {
  autoCompletePropsFactory,
  autoCompleteVariants,
  type PersonOption,
  SAMPLE_PEOPLE,
} from 'factories/omni-ui-components/AutoComplete/AutoComplete.factories';
import { UserRound } from 'lucide-react';
import * as React from 'react';
import { expect, userEvent, within } from 'storybook/test';

type Props = AutoCompleteProps<PersonOption>;

const Renderer: React.FC<Props> = (args) => {
  const [value, setValue] = React.useState(args.value ?? '');
  React.useEffect(() => setValue(args.value ?? ''), [args.value]);
  return (
    <AutoComplete<PersonOption>
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

/** The host narrows the list itself (as it would for a list it loads): the library never fetches. */
const HostFiltered: React.FC<Props> = (args) => {
  const [value, setValue] = React.useState('');
  const options = SAMPLE_PEOPLE.filter((person) =>
    person.team.toLowerCase().startsWith(value.toLowerCase()),
  ).map((person) => ({ ...person, label: `${person.value} (${person.team})` }));
  return (
    <AutoComplete<PersonOption> {...args} value={value} onChange={setValue} options={options} />
  );
};

const meta: Meta<Props> = {
  title: 'omni-ui-components/AutoComplete',
  component: AutoComplete,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Free text with suggestions: the value is the <primary>typed string</primary>, and a value outside `options` is valid. Options are typed data, generic over `AutoCompleteOption`; a picked option reaches `onSelect` by reference. `filter={false}` hands the narrowing to the host. `AutoCompletePrimitive` is the same control without the label, description and error rows.',
      },
    },
  },
  args: autoCompletePropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: {
    variant: { control: 'inline-radio', options: ['bordered', 'panel', 'ghost'] },
    inputSize: { control: 'inline-radio', options: ['sm', 'default', 'md', 'lg'] },
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    filter: { control: 'boolean' },
    onChange: { action: 'changed' },
    onSelect: { action: 'selected' },
  },
  render: (args) => <Renderer {...args} />,
};
export default meta;

type Story = StoryObj<Props>;

export const Default: Story = {};

export const Prefilled: Story = { args: { value: 'Jam' } };

export const Required: Story = { args: { required: true } };

export const WithError: Story = { args: { error: 'Pick an assignee' } };

export const Disabled: Story = { args: { disabled: true, value: 'Alex Morgan' } };

export const ReadOnly: Story = { args: { readOnly: true, value: 'Alex Morgan' } };

export const CustomIcon: Story = { args: { icon: <UserRound /> } };

export const NoIcon: Story = { args: { icon: null } };

export const CustomLabels: Story = {
  args: { labels: { placeholder: 'Find a person', noResults: 'Nobody by that name.' } },
};

export const HostFilters: Story = {
  name: 'filter={false}: the host narrows the list',
  args: { filter: false, description: 'Type a team name: Design, Platform, Research, Support.' },
  render: (args) => <HostFiltered {...args} />,
};

export const Sizes: Story = {
  render: (args) => (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      {(['sm', 'default', 'md', 'lg'] as const).map((inputSize) => (
        <Renderer
          key={inputSize}
          {...args}
          id={`demo-autocomplete-${inputSize}`}
          label={inputSize}
          description={undefined}
          inputSize={inputSize}
        />
      ))}
    </div>
  ),
};

export const Matrix: Story = {
  render: (args) => (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      {autoCompleteVariants.map((variant) => (
        <Renderer
          key={variant.name}
          {...args}
          description={undefined}
          {...variant.args}
          id={`demo-autocomplete-${variant.name.replace(/\s+/g, '-').toLowerCase()}`}
        />
      ))}
    </div>
  ),
};

export const KeyboardPick: Story = {
  name: 'Keyboard: type, arrow, Enter',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: /Assignee/ });
    await userEvent.click(input);
    await userEvent.keyboard('ja');
    await expect(canvas.getAllByRole('option')).toHaveLength(3);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await expect(input).toHaveValue('James Brooks');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toHaveFocus();
  },
};
