import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';
import { notification } from './Notification';

const meta = {
  title: 'omni-ui-components/Notification',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A notice with a `message` and a `description`, shown from anywhere without rendering a component: `notification.success`, `notification.error`, `notification.info` and `notification.warning`.',
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
};
