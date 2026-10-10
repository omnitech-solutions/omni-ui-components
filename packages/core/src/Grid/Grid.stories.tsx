import { Col, Row } from '@oc-tech/omni-ui-components/Grid';
import type { Meta, StoryObj } from '@storybook/react';

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
      <Col span={8}>
        <div className="rounded border p-3">8</div>
      </Col>
      <Col span={8}>
        <div className="rounded border p-3">8</div>
      </Col>
      <Col span={8}>
        <div className="rounded border p-3">8</div>
      </Col>
    </Row>
  ),
};

export const MixedSpans: Story = {
  render: () => (
    <Row gutter={12}>
      <Col span={6}>
        <div className="rounded border p-3">6</div>
      </Col>
      <Col span={12}>
        <div className="rounded border p-3">12</div>
      </Col>
      <Col span={6}>
        <div className="rounded border p-3">6</div>
      </Col>
    </Row>
  ),
};

const cells = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];

/** `minItemWidth`: as many tracks of at least 180px as fit; the children are the cells, no `Col` needed. */
export const CardGrid: Story = {
  render: () => (
    <Row minItemWidth={180} gutter={16}>
      {cells.map((cell) => (
        <div key={cell} className="rounded border p-3">
          {cell}
        </div>
      ))}
    </Row>
  ),
};

/** `columns` per width of the row itself (container queries): the same grid folds inside the narrow box. */
export const ResponsiveColumns: Story = {
  render: () => (
    <div className="space-y-6">
      {[undefined, 700, 320].map((width) => (
        <div key={width ?? 'full'} style={{ width }}>
          <Row columns={{ base: 1, sm: 2, lg: 3 }} gutter={[16, 12]}>
            {cells.map((cell) => (
              <div key={cell} className="rounded border p-3">
                {cell}
              </div>
            ))}
          </Row>
        </div>
      ))}
    </div>
  ),
};
