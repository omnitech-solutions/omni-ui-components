import { Content, Footer, Header, Layout, Sider } from '@oc-tech/omni-ui-components/Layout';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AppShell as AppShellExample,
  CentredContent as CentredContentExample,
  PageHeader as PageHeaderExample,
} from 'factories/omni-ui-components/Layout/Layout.factories';
import { expect, fn, userEvent, within } from 'storybook/test';
import { exampleDocs } from 'storybook-helpers/internal/support/exampleDocs';
import factories from './Layout.factories.tsx?raw';

const meta: Meta<typeof Layout> = {
  title: 'omni-ui-components/Layout',
  component: Layout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Composable <primary>page shell primitives</primary> for <primary>header, sider, content, and footer regions</primary>. Without options each is its plain element. `Layout direction="row"` lays a `Sider` beside the rest and `fill` makes the frame the height of the viewport. `Header` with `title` is a page header: `eyebrow`, a heading of `level`, `description`, then `meta` and `actions`. `Content` is the page container: `maxWidth`, `padding`, `center`, `scroll`, `as`. `Sider` takes a pinned `header` and `footer` (a node or a function of `{ collapsed }`), `scroll`, `width` and `collapsedWidth`, and collapses controlled or uncontrolled; the control is drawn only with `collapsible`, and <primary>onCollapsedChange(collapsed)</primary> fires in both modes. The frame of an app is these parts plus a `Menu`; there is no separate shell component.',
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

const onCreate = fn();
const onSave = fn();
const fullPage = { example: { frame: false } };

/** The whole frame: a collapsing Sider (header, Menu, footer), a page Header and a scrolling Content. */
export const AppShell: Story = {
  render: () => <AppShellExample onCreate={onCreate} />,
  parameters: { ...exampleDocs(factories, 'AppShell'), ...fullPage },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sider = canvas.getByRole('complementary', { name: 'Main navigation' });
    await expect(sider).not.toHaveAttribute('data-collapsed');
    await userEvent.click(canvas.getByRole('button', { name: 'Collapse sidebar' }));
    await expect(sider).toHaveAttribute('data-collapsed', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'Expand sidebar' }));
    await expect(sider).not.toHaveAttribute('data-collapsed');
    await userEvent.click(canvas.getByRole('button', { name: 'People' }));
    await expect(canvas.getByRole('heading', { level: 1, name: 'People' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /New/ }));
    await expect(onCreate).toHaveBeenCalled();
  },
};

/** The same frame starting collapsed: icons only, labels as tooltips. */
export const Collapsed: Story = {
  render: () => <AppShellExample defaultCollapsed onCreate={onCreate} />,
  parameters: { ...exampleDocs(factories, 'AppShell'), ...fullPage },
};

export const CentredContent: Story = {
  render: () => <CentredContentExample />,
  parameters: { ...exampleDocs(factories, 'CentredContent'), ...fullPage },
};

export const PageHeader: Story = {
  render: () => <PageHeaderExample onSave={onSave} />,
  parameters: exampleDocs(factories, 'PageHeader'),
};
