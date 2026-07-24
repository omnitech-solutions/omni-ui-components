import type { Meta, StoryObj } from '@storybook/react';

import { Col, Row } from '@oc-tech/omni-ui-components/Grid';

const meta: Meta<typeof Row> = {
  title: 'omni-ui-components/Grid',
  component: Row,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '<primary>24-column row and column grid</primary>. Use it for <primary>traditional span-based layouts</primary> where Flex or Space are not expressive enough.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Row>;
export const Default: Story = {
  render: () => (
    <Row gutter={12}>
      <Col span={8}><div className="rounded border p-3">8</div></Col>
      <Col span={8}><div className="rounded border p-3">8</div></Col>
      <Col span={8}><div className="rounded border p-3">8</div></Col>
    </Row>
  ),
};

export const MixedSpans: Story = {
  render: () => (
    <Row gutter={12}>
      <Col span={6}><div className="rounded border p-3">6</div></Col>
      <Col span={12}><div className="rounded border p-3">12</div></Col>
      <Col span={6}><div className="rounded border p-3">6</div></Col>
    </Row>
  ),
};
