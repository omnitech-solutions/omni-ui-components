import { Thinking, type ThinkingProps } from '@oc-tech/omni-ui-components/Thinking';
import type { Meta, StoryObj } from '@storybook/react';
import {
  SAMPLE_REASONING,
  thinkingPropsFactory,
} from 'factories/omni-ui-components/Thinking/Thinking.factories';
import { expect, userEvent, within } from 'storybook/test';

const meta: Meta<ThinkingProps> = {
  title: 'omni-ui-components/Thinking',
  component: Thinking,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The model's reasoning as a <primary>disclosure</primary> (`aria-expanded`). While <primary>streaming</primary>: a spinner (still under reduced motion) and `Thinking…`. After: your `icon` and `Thought for Ns` (rounded, at least 1; `Thought` without a duration). The text opens in a muted body. Open state is controlled (`open`) or kept inside; strings are in `labels` (`{n}` template); the chevron and icon are nodes.\n\n**Callbacks**\n\n| Callback | Fires | Arguments |\n|---|---|---|\n| `onOpenChange` | the disclosure opens or closes, controlled or not | `(open: boolean)` |",
      },
    },
  },
  args: thinkingPropsFactory(),
  argTypes: {
    streaming: { control: 'boolean', description: 'Still thinking.' },
    seconds: {
      control: 'number',
      description: 'Duration of the finished thought.',
    },
    text: { control: 'text', description: 'The reasoning text.' },
    open: { control: 'boolean', description: 'Expanded (controlled).' },
    defaultOpen: {
      control: 'boolean',
      description: 'Initially expanded when uncontrolled.',
    },
    labels: {
      control: 'object',
      description: 'Partial { thinking, thought, thoughtFor }.',
    },
    onOpenChange: { action: 'openChange' },
  },
  render: (args) => (
    <div className="max-w-[560px]">
      <Thinking {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<ThinkingProps>;

export const Default: Story = {
  parameters: {
    docs: {
      description: { story: 'Finished thought: collapsed, click to read it.' },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Thought for 4s' }));
    await expect(canvas.getByText(SAMPLE_REASONING)).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Thought for 4s' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  },
};
export const Streaming: Story = {
  args: {
    streaming: true,
    seconds: undefined,
    defaultOpen: true,
    text: 'The input is unsorted, so two pointers do not apply. A hash map…',
  },
};
export const Expanded: Story = { args: { defaultOpen: true } };
export const NoDuration: Story = { args: { seconds: undefined } };
