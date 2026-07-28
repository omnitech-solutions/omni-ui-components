import type { Meta, StoryObj } from '@storybook/react';
import { notification } from './Notification';

const meta = { title: 'omni-ui-components/Notification' } satisfies Meta;
export default meta;
export const Default: StoryObj<typeof meta> = {
  render: () => <button type="button" onClick={() => notification.success({ message: 'Notification sent', description: 'The operation completed.' })}>Show notification</button>,
};
