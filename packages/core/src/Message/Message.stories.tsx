import type { Meta, StoryObj } from '@storybook/react';
import { message } from './Message';

const meta = { title: 'omni-ui-components/Message' } satisfies Meta;
export default meta;
export const Default: StoryObj<typeof meta> = {
  render: () => <button type="button" onClick={() => message.success('Message sent')}>Show message</button>,
};
