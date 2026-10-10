import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';
import { message } from './Message';

const meta = {
  title: 'omni-ui-components/Message',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A short message shown from anywhere, without rendering a component: `message.success`, `message.error`, `message.info` and `message.warning` each take the text.',
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
};
