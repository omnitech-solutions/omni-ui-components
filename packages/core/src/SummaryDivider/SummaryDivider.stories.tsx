import {
  SummaryDivider,
  type SummaryDividerProps,
} from '@oc-tech/omni-ui-components/SummaryDivider';
import type { Meta, StoryObj } from '@storybook/react';
import { summaryDividerPropsFactory } from 'factories/omni-ui-components/SummaryDivider/SummaryDivider.factories';
import { expect, userEvent, within } from 'storybook/test';

const meta: Meta<SummaryDividerProps> = {
  title: 'omni-ui-components/SummaryDivider',
  component: SummaryDivider,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "A rule in the conversation where the model's full view begins, with a disclosure (`aria-expanded`) <primary>N earlier messages summarised</primary> that reveals the summary text and a note that the full history is kept. `labels.summarised(count)` handles plurals; icon and chevron are nodes; open state is controlled or kept inside.\n\n**Callbacks**\n\n| Callback | Fires | Arguments |\n|---|---|---|\n| `onOpenChange` | the disclosure opens or closes, controlled or not | `(open: boolean)` |",
      },
    },
  },
  args: summaryDividerPropsFactory(),
  argTypes: {
    count: {
      control: 'number',
      description: 'Messages the summary stands for.',
    },
    text: { control: 'text', description: 'The summary text.' },
    open: { control: 'boolean', description: 'Expanded (controlled).' },
    defaultOpen: { control: 'boolean' },
    onOpenChange: { action: 'openChange' },
  },
  render: (args) => (
    <div className="max-w-[560px]">
      <SummaryDivider {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<SummaryDividerProps>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '12 earlier messages summarised' }));
    await expect(canvas.getByText(/only the model sees this summary/)).toBeVisible();
  },
};
export const Open: Story = { args: { defaultOpen: true } };
export const OneMessage: Story = { args: { count: 1 } };
