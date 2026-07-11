import type { Meta, StoryObj } from '@storybook/react';

import { Content, Footer, Header, Layout, Sider } from '@omnitech/omni-ui-core/Layout';

const meta: Meta<typeof Layout> = {
  title: 'omni-ui-components/Layout',
  component: Layout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Composable <primary>page shell primitives</primary> for <primary>header, sider, content, and footer regions</primary>. Useful for dashboards and full-page admin layouts.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Layout>;
export const Default: Story = {
  render: () => (
    <div className="overflow-hidden rounded border">
      <Header>Header</Header>
      <div className="flex min-h-48">
        <Sider>Sidebar</Sider>
        <Content>Main content</Content>
      </div>
      <Footer>Footer</Footer>
    </div>
  ),
};

export const WithoutSidebar: Story = {
  render: () => (
    <div className="overflow-hidden rounded border">
      <Header>Header</Header>
      <Content>Single-column content</Content>
      <Footer>Footer</Footer>
    </div>
  ),
};
