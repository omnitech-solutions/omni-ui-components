import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import { notification } from './Notification';

const meta = {
  title: 'omni-ui-components/Notification',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A notice with a `message` and a `description`, shown from anywhere without rendering a component: `notification.success`, `notification.error`, `notification.info` and `notification.warning`. It is the library <primary>Toast</primary> (role `status`, closed by its timer or Escape), raised at the top right; `duration: 0` keeps it until Escape.',
      },
    },
  },
} satisfies Meta;
export default meta;

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        notification.success({
          message: 'Notification sent',
          description: 'The operation completed.',
        })
      }
    >
      Show notification
    </Button>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Show notification' }));
    await expect(await screen.findByRole('status')).toHaveTextContent('Notification sent');
  },
};
