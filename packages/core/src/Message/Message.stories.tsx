import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import { message } from './Message';

const meta = {
  title: 'omni-ui-components/Message',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A short message shown from anywhere, without rendering a component: `message.success`, `message.error`, `message.info` and `message.warning` each take the text. It is the library <primary>Toast</primary> (role `status`, closed by its timer or Escape), raised at the top centre; one message is on screen at a time. Inside React, prefer `useToast` and your own `Toast`.',
      },
    },
  },
} satisfies Meta;
export default meta;

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <Button variant="outline" onClick={() => message.success('Message sent')}>
      Show message
    </Button>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Show message' }));
    await expect(await screen.findByRole('status')).toHaveTextContent('Message sent');
  },
};
