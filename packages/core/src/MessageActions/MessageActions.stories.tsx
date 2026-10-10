import {
  MessageActions,
  type MessageActionsProps,
} from '@oc-tech/omni-ui-components/MessageActions';
import type { Meta, StoryObj } from '@storybook/react';
import {
  MessageActionsDemo,
  messageActionsPropsFactory,
  sampleActions,
} from 'factories/omni-ui-components/MessageActions/MessageActions.factories';
import { expect, userEvent, within } from 'storybook/test';
import { exampleDocs } from 'storybook-helpers/internal/support/exampleDocs';
import exampleSource from './MessageActions.factories.tsx?raw';

const meta: Meta<MessageActionsProps> = {
  title: 'omni-ui-components/MessageActions',
  component: MessageActions,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The bar under a finished reply: icon buttons from <primary>actions</primary> config (`key, icon, label, onClick, pressed, disabled`), custom nodes (a VersionPager) in the same row, and quiet <primary>meta</primary> text. A `toolbar`: Left / Right / Home / End move focus between the enabled buttons. Toggles (`pressed`) carry `aria-pressed`.\n\n**Callbacks**\n\n| Callback | Fires | Arguments |\n|---|---|---|\n| `actions[].onClick` | that action's button is chosen (button drawn only with it) | `(action: T)`: the action item itself |",
      },
    },
  },
  args: messageActionsPropsFactory(),
  argTypes: {
    actions: { control: 'object', description: 'Buttons and custom nodes.' },
    meta: {
      control: 'text',
      description: 'Quiet trailing text, e.g. model and tokens.',
    },
    label: { control: 'text', description: 'Accessible name of the toolbar.' },
  },
  render: (args) => <MessageActions {...args} />,
};
export default meta;
type Story = StoryObj<MessageActionsProps>;

export const Default: Story = {};
export const ThumbsUp: Story = {
  args: { actions: sampleActions({ rating: 'up' }) },
};
export const Busy: Story = { args: { actions: sampleActions({ busy: true }) } };
export const Working: Story = {
  render: () => <MessageActionsDemo />,
  parameters: {
    ...exampleDocs(exampleSource, 'MessageActionsDemo'),
    docs: {
      description: {
        story: 'With state: thumbs are mutually exclusive, read aloud toggles.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Good reply' }));
    await expect(canvas.getByRole('button', { name: 'Good reply' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Bad reply' }));
    await expect(canvas.getByRole('button', { name: 'Good reply' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    canvas.getByRole('button', { name: 'Copy' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: 'Regenerate' })).toHaveFocus();
  },
};
