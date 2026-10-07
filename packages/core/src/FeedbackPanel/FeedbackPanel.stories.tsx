import { FeedbackPanel, type FeedbackPanelProps } from '@oc-tech/omni-ui-components/FeedbackPanel';
import type { Meta, StoryObj } from '@storybook/react';
import { feedbackPanelPropsFactory } from 'factories/omni-ui-components/FeedbackPanel/FeedbackPanel.factories';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta: Meta<FeedbackPanelProps> = {
  title: 'omni-ui-components/FeedbackPanel',
  component: FeedbackPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "What a thumbs-down opens: a heading, <primary>reason chips</primary> (`aria-pressed` toggles; the list is data) and Cancel / Send. The chosen reasons are controlled (`selected`) or kept inside; <primary>onSubmit(selected)</primary> gets them in the order chosen. Showing the panel and the thanks toast are the caller's.\n\n**Callbacks**\n\n| Callback | Fires | Arguments |\n|---|---|---|\n| `onToggle` | one reason chip toggles | `(reason: T, selected: boolean)` |\n| `onSelectedChange` | the chosen list changes, controlled or not | `(selected: T[])` |\n| `onSubmit` | Send is chosen (drawn only with it) | `(feedback: { reasons: T[]; note?: string })` |\n| `onCancel` | Cancel is chosen (drawn only with it) | none |\n\n`selected` / `defaultSelected` stay reason ids; callbacks emit the items.",
      },
    },
  },
  args: { ...feedbackPanelPropsFactory(), onSubmit: fn(), onCancel: fn() },
  argTypes: {
    reasons: { control: 'object', description: 'Reason items { id, label }.' },
    selected: {
      control: 'object',
      description: 'Ids of the chosen reasons (controlled).',
    },
    defaultSelected: { control: 'object' },
    submitDisabled: { control: 'boolean' },
    onSubmit: { action: 'submit' },
    onCancel: { action: 'cancel' },
    onSelectedChange: { action: 'selectedChange' },
  },
  render: (args) => (
    <div className="max-w-[520px]">
      <FeedbackPanel {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<FeedbackPanelProps>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Too long' }));
    await expect(canvas.getByRole('button', { name: 'Too long' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }));
    await expect(args.onSubmit).toHaveBeenCalledWith({ reasons: [args.reasons[2]] });
  },
};
export const TwoChosen: Story = {
  args: { defaultSelected: ['incorrect', 'too-long'] },
};
export const SendDisabled: Story = { args: { submitDisabled: true } };
