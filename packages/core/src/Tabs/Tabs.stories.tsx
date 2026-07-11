import type { Meta, StoryObj } from '@storybook/react';

import { Tab, TabPanel, Tabs, TabsBar } from '@omnitech/omni-ui-core/Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'omni-ui-components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tabbed navigation and content panels for switching between sibling views without leaving the current context. Use Tabs for peer sections that should feel lighter than page routing and more structured than stacked cards.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="max-w-xl">
      <TabsBar>
        <Tab value="overview">Overview</Tab>
        <Tab value="activity">Activity</Tab>
        <Tab value="settings">Settings</Tab>
      </TabsBar>
      <TabPanel value="overview">
        <div className="space-y-3">
          <div className="text-sm font-semibold">Workspace summary</div>
          <div className="text-sm text-[var(--oui-foreground-muted)]">Track rollout health, release timing, and blockers without leaving the current record view.</div>
        </div>
      </TabPanel>
      <TabPanel value="activity">
        <div className="space-y-3">
          <div className="text-sm font-semibold">Recent activity</div>
          <div className="text-sm text-[var(--oui-foreground-muted)]">Review approvals, comment threads, and publishing events in one continuous timeline.</div>
        </div>
      </TabPanel>
      <TabPanel value="settings">
        <div className="space-y-3">
          <div className="text-sm font-semibold">Workspace settings</div>
          <div className="text-sm text-[var(--oui-foreground-muted)]">Manage notifications, review policy, and ownership defaults for future changes.</div>
        </div>
      </TabPanel>
    </Tabs>
  ),
};

export const ThreePanels: Story = {
  render: () => (
    <Tabs defaultValue="details" className="max-w-xl">
      <TabsBar>
        <Tab value="details">Details</Tab>
        <Tab value="activity">Activity</Tab>
        <Tab value="files">Files</Tab>
      </TabsBar>
      <TabPanel value="details">
        <div className="space-y-3">
          <div className="text-sm font-semibold">Account details</div>
          <div className="text-sm text-[var(--oui-foreground-muted)]">Primary owner, billing plan, and lifecycle status for the selected account.</div>
        </div>
      </TabPanel>
      <TabPanel value="activity">
        <div className="space-y-3">
          <div className="text-sm font-semibold">Activity</div>
          <div className="text-sm text-[var(--oui-foreground-muted)]">See inbound events, workflow transitions, and external sync status.</div>
        </div>
      </TabPanel>
      <TabPanel value="files">
        <div className="space-y-3">
          <div className="text-sm font-semibold">Files</div>
          <div className="text-sm text-[var(--oui-foreground-muted)]">Store statements of work, attachments, and exported reports alongside the account.</div>
        </div>
      </TabPanel>
    </Tabs>
  ),
};

export const FullWidthBar: Story = {
  render: () => (
    <Tabs defaultValue="open" className="max-w-2xl">
      <TabsBar className="grid w-full grid-cols-3">
        <Tab value="open">Open</Tab>
        <Tab value="review">In review</Tab>
        <Tab value="closed">Closed</Tab>
      </TabsBar>
      <TabPanel value="open">
        <div className="text-sm text-[var(--oui-foreground-muted)]">Open work includes new requests, active coordination, and pending assignments.</div>
      </TabPanel>
      <TabPanel value="review">
        <div className="text-sm text-[var(--oui-foreground-muted)]">Items in review are waiting on approval, QA, or policy validation before release.</div>
      </TabPanel>
      <TabPanel value="closed">
        <div className="text-sm text-[var(--oui-foreground-muted)]">Closed work remains available for audit history, export, and retrospective analysis.</div>
      </TabPanel>
    </Tabs>
  ),
};
