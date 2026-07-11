import type { Meta, StoryObj } from '@storybook/react';

import { QRCode } from '@omnitech/omni-ui-core/QRCode';

const meta: Meta<typeof QRCode> = {
  title: 'omni-ui-components/QRCode',
  component: QRCode,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Compact <primary>QR-like rendered grid</primary> for <primary>compatibility-driven sharing and preview flows</primary>. Suitable for local demos and lightweight internal use.',
      },
    },
  },
  args: { value: 'https://omnitech.example.com' },
};
export default meta;

type Story = StoryObj<typeof QRCode>;
export const Default: Story = {};

export const Large: Story = { args: { value: 'otpauth://demo', size: 220 } };
