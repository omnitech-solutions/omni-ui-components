import { Button } from '@oc-tech/omni-ui-components/Button';
import { Content, Header, Layout, Sider } from '@oc-tech/omni-ui-components/Layout';
import type { MenuItem } from '@oc-tech/omni-ui-components/Menu';
import { Menu } from '@oc-tech/omni-ui-components/Menu';
import { Typography } from '@oc-tech/omni-ui-components/Typography';
import { BarChart3, FileText, Home, Plus, Users } from 'lucide-react';
import * as React from 'react';

/** A page of the example: the menu item, plus what the page header says. */
export interface PageItem extends MenuItem {
  summary: string;
}

const icon = 'h-4 w-4';

export const pages: PageItem[] = [
  {
    key: 'home',
    label: 'Home',
    icon: <Home className={icon} />,
    summary: 'What changed since the last visit.',
  },
  {
    key: 'people',
    label: 'People',
    icon: <Users className={icon} />,
    summary: 'Everyone with access.',
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: <FileText className={icon} />,
    summary: 'Files shared with the team.',
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: <BarChart3 className={icon} />,
    summary: 'Totals by month.',
  },
];

const paragraphs = Array.from({ length: 24 }, (_, index) => `Row ${index + 1} of the page.`);

/**
 * A whole app frame from the layout parts: a collapsing `Sider` with a header, a `Menu` and a footer, a page
 * `Header` with a title and actions, and a `Content` that scrolls. The host owns the collapsed state and the
 * current page, and hands the same `collapsed` to the `Menu`.
 */
export const AppShell: React.FC<{
  defaultCollapsed?: boolean;
  onCreate?: (page: PageItem) => void;
}> = ({ defaultCollapsed = false, onCreate }) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [page, setPage] = React.useState<PageItem>(pages[0]);
  return (
    <Layout direction="row" fill>
      <Sider
        collapsible
        scroll
        label="Main navigation"
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        header={({ collapsed: narrow }) => (
          <Typography.Text strong>{narrow ? 'A' : 'Acme'}</Typography.Text>
        )}
        footer={({ collapsed: narrow }) => (
          <Typography.Text type="secondary" size="compact">
            {narrow ? 'v2' : 'Version 2.4'}
          </Typography.Text>
        )}
      >
        <Menu<PageItem>
          appearance="plain"
          collapsed={collapsed}
          items={pages}
          selectedKeys={[page.key]}
          onSelect={setPage}
        />
      </Sider>
      <Layout>
        <Header
          level={1}
          title={page.label}
          description={page.summary}
          meta={`${paragraphs.length} rows`}
          actions={
            <Button buttonSize="sm" onClick={() => onCreate?.(page)}>
              <Plus className={icon} /> New
            </Button>
          }
        />
        <Content scroll maxWidth="lg">
          {paragraphs.map((text) => (
            <Typography.Paragraph key={text}>{text}</Typography.Paragraph>
          ))}
        </Content>
      </Layout>
    </Layout>
  );
};

/** One child centred both ways in the space: a sign-in card, an empty page. */
export const CentredContent: React.FC = () => (
  <Layout fill>
    <Content center as="div">
      <div style={{ maxWidth: 320, textAlign: 'center' }}>
        <Typography.Title level={2} size="compact">
          Nothing here yet
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          Create a first record to see it listed.
        </Typography.Paragraph>
      </div>
    </Content>
  </Layout>
);

/** The page header on its own: eyebrow, heading level, description, meta and actions, with children under the row. */
export const PageHeader: React.FC<{ onSave?: () => void }> = ({ onSave }) => (
  <Layout>
    <Header
      level={1}
      eyebrow="Settings"
      title="Notifications"
      description="Choose what is sent and where."
      meta="Saved a minute ago"
      actions={
        <>
          <Button variant="outline" buttonSize="sm">
            Discard
          </Button>
          <Button buttonSize="sm" onClick={() => onSave?.()}>
            Save
          </Button>
        </>
      }
    />
    <Header
      level={3}
      bordered={false}
      padding="sm"
      title="Email"
      description="A quieter heading for a section."
    />
    <Content padding="sm">
      <Typography.Paragraph>The page goes here.</Typography.Paragraph>
    </Content>
  </Layout>
);
