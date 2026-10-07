import { Suggestions, type SuggestionsProps } from '@oc-tech/omni-ui-components/Suggestions';
import type { Meta, StoryObj } from '@storybook/react';
import { suggestionsPropsFactory } from 'factories/omni-ui-components/Suggestions/Suggestions.factories';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta: Meta<SuggestionsProps> = {
  title: 'omni-ui-components/Suggestions',
  component: Suggestions,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Follow-up chips under a finished reply: items are objects `{ id, label }` (extend them with your own fields: they come back by reference). Choosing one calls <primary>onSelect(item, index)</primary> (the host sends it as the next message). The icon is a node. <primary>layout</primary> is `column` (one chip per line, as in the original) or `wrap`; <primary>disabled</primary> blocks them while a reply runs.\n\n**Callbacks**\n\n| Callback | Fires | Arguments |\n|---|---|---|\n| `onSelect` | a chip is chosen (chips drawn only with it) | `(item: T, index: number)` |',
      },
    },
  },
  args: { ...suggestionsPropsFactory(), onSelect: fn() },
  argTypes: {
    items: {
      control: 'object',
      description: '{ id, label } items; extra fields reach onSelect and renderItem.',
    },
    layout: {
      control: 'inline-radio',
      options: ['column', 'wrap'],
      description: 'Chip flow.',
    },
    disabled: { control: 'boolean', description: 'Disable every chip.' },
    label: { control: 'text', description: 'Accessible name of the group.' },
    onSelect: { action: 'select', description: 'Called with (item, index).' },
  },
  render: (args) => (
    <div className="max-w-[520px]">
      <Suggestions {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<SuggestionsProps>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Explain the complexity',
      }),
    );
    await expect(args.onSelect).toHaveBeenCalledWith(args.items[2], 2);
  },
};
export const Wrapping: Story = { args: { layout: 'wrap' } };
export const Disabled: Story = { args: { disabled: true } };
