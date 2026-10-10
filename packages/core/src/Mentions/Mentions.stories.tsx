import { Mentions, type MentionsProps } from '@oc-tech/omni-ui-components/Mentions';
import type { Meta, StoryObj } from '@storybook/react';
import {
  type MemberOption,
  mentionsPropsFactory,
  mentionsVariants,
  SAMPLE_MEMBERS,
  SAMPLE_TOPICS,
} from 'factories/omni-ui-components/Mentions/Mentions.factories';
import * as React from 'react';
import { expect, userEvent, within } from 'storybook/test';

type Props = MentionsProps<MemberOption>;

const Renderer: React.FC<Props> = (args) => {
  const [value, setValue] = React.useState(args.value ?? '');
  React.useEffect(() => setValue(args.value ?? ''), [args.value]);
  return (
    <Mentions<MemberOption>
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

/** Two triggers, and the host supplies the list for each from `onSearch`: the library never fetches. */
const HostSearch: React.FC<Props> = (args) => {
  const [value, setValue] = React.useState('');
  const [options, setOptions] = React.useState<MemberOption[]>([]);
  return (
    <Mentions<MemberOption>
      {...args}
      value={value}
      onChange={setValue}
      options={options}
      onSearch={(query, trigger) => {
        const source = trigger === '#' ? SAMPLE_TOPICS : SAMPLE_MEMBERS;
        setOptions(source.filter((option) => option.value.startsWith(query.toLowerCase())));
      }}
    />
  );
};

const meta: Meta<Props> = {
  title: 'omni-ui-components/Mentions',
  component: Mentions,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A textarea that suggests `options` while a mention is typed. The value is <primary>plain text</primary>. A `trigger` (default `@`) at the start of the text or after a space opens the list; picking writes the trigger, the option `value` and a space, and the option reaches `onMention` by reference. `onSearch` and `filter={false}` let the host supply the list. `MentionsPrimitive` is the same control without the label, description and error rows.',
      },
    },
  },
  args: mentionsPropsFactory({ wrapperClassName: 'mx-auto max-w-md pb-48' }),
  argTypes: {
    variant: { control: 'inline-radio', options: ['bordered', 'ghost'] },
    textareaSize: { control: 'inline-radio', options: ['sm', 'default', 'md', 'lg'] },
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    filter: { control: 'boolean' },
    onChange: { action: 'changed' },
    onMention: { action: 'mentioned' },
    onSearch: { action: 'searched' },
  },
  render: (args) => <Renderer {...args} />,
};
export default meta;

type Story = StoryObj<Props>;

export const Default: Story = {};

export const Prefilled: Story = { args: { value: '@alex please review this' } };

export const Required: Story = { args: { required: true } };

export const WithError: Story = { args: { error: 'Write a comment' } };

export const Disabled: Story = { args: { disabled: true, value: '@jamie done' } };

export const ReadOnly: Story = { args: { readOnly: true, value: '@jamie done' } };

export const HashTrigger: Story = {
  name: 'trigger="#"',
  args: { trigger: '#', options: SAMPLE_TOPICS, description: 'Type # to link a topic.' },
};

export const HostSuppliesOptions: Story = {
  name: 'filter={false}: two triggers, the host supplies the list',
  args: {
    trigger: ['@', '#'],
    filter: false,
    description: 'Type @ for a person or # for a topic.',
  },
  render: (args) => <HostSearch {...args} />,
};

export const Sizes: Story = {
  render: (args) => (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      {(['sm', 'default', 'md', 'lg'] as const).map((textareaSize) => (
        <Renderer
          key={textareaSize}
          {...args}
          id={`demo-mentions-${textareaSize}`}
          label={textareaSize}
          description={undefined}
          wrapperClassName={undefined}
          rows={2}
          textareaSize={textareaSize}
        />
      ))}
    </div>
  ),
};

export const Matrix: Story = {
  render: (args) => (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      {mentionsVariants.map((variant) => (
        <Renderer
          key={variant.name}
          {...args}
          description={undefined}
          wrapperClassName={undefined}
          {...variant.args}
          id={`demo-mentions-${variant.name.replace(/\s+/g, '-').toLowerCase()}`}
        />
      ))}
    </div>
  ),
};

export const KeyboardMention: Story = {
  name: 'Keyboard: @, arrow, Enter',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: /Comment/ });
    await userEvent.click(textarea);
    await userEvent.keyboard('Ask @ja');
    await expect(canvas.getAllByRole('option')).toHaveLength(3);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(textarea).toHaveValue('Ask @james ');
    await expect(textarea).not.toHaveAttribute('data-open');
    await userEvent.keyboard('today');
    await expect(textarea).toHaveValue('Ask @james today');
  },
};
