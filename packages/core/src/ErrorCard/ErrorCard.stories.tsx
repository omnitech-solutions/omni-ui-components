import { ErrorCard, type ErrorCardProps } from '@oc-tech/omni-ui-components/ErrorCard';
import type { Meta, StoryObj } from '@storybook/react';
import { errorCardPropsFactory } from 'factories/omni-ui-components/ErrorCard/ErrorCard.factories';
import { CircleStop } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta: Meta<ErrorCardProps> = {
  title: 'omni-ui-components/ErrorCard',
  component: ErrorCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A failed reply as a <primary>danger card</primary> (`role="alert"`): icon, title, message, a reassurance `note`, <primary>Retry</primary> (shown when `onRetry` is set; disabled with `retryDisabled`) and any extra `actions` (a Switch model button). <primary>variant="stopped"</primary> is the quiet one-line Stopped banner (`role="status"`). Titles per error code are the caller\'s mapping.\n\n**Callbacks**\n\n| Callback | Fires | Arguments |\n|---|---|---|\n| `onRetry` | Retry is chosen (button drawn only with it) | `(error: T)`: the `error` item, or one built from the props |\n| `onDismiss` | the dismiss control is chosen (drawn only with it) | `(error: T)` |',
      },
    },
  },
  args: { ...errorCardPropsFactory(), onRetry: fn() },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['error', 'stopped'],
      description: 'Danger card or Stopped banner.',
    },
    title: { control: 'text' },
    message: { control: 'text' },
    note: { control: 'text' },
    retryLabel: { control: 'text' },
    retryDisabled: { control: 'boolean' },
    onRetry: { action: 'retry' },
  },
  render: (args) => (
    <div className="max-w-[560px]">
      <ErrorCard {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<ErrorCardProps>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await expect(args.onRetry).toHaveBeenCalled();
  },
};
export const RetryDisabled: Story = { args: { retryDisabled: true } };
export const Stopped: Story = {
  args: {
    variant: 'stopped',
    icon: <CircleStop />,
    title: 'Stopped. Nothing has been applied.',
    message: undefined,
    note: undefined,
  },
};
