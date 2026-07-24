import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@oc-tech/omni-ui-components/Button';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@oc-tech/omni-ui-components/Drawer';

const meta: Meta<typeof Drawer> = {
  title: 'omni-ui-components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Side-sheet dialog for <primary>settings, inspectors, and longer contextual workflows</primary> that should not fully block the page.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent side="right">
        <DrawerHeader>
          <DrawerTitle>Project settings</DrawerTitle>
          <DrawerDescription>Adjust access, notifications, and workflow preferences.</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 space-y-4 px-6 py-5">
          <div className="rounded-lg border border-[var(--oui-border-field)] bg-background/70 p-4">
            <div className="text-sm font-semibold">Visibility</div>
            <div className="mt-1 text-sm text-[var(--oui-foreground-muted)]">Control who can access this project and how changes are reviewed.</div>
          </div>
          <div className="rounded-lg border border-[var(--oui-border-field)] bg-background/70 p-4">
            <div className="text-sm font-semibold">Notifications</div>
            <div className="mt-1 text-sm text-[var(--oui-foreground-muted)]">Choose who receives updates for edits, approvals, and escalations.</div>
          </div>
        </div>
        <DrawerFooter>
          <Button variant="secondary">Cancel</Button>
          <Button>Save changes</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const LeftSide: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open left drawer</Button>
      </DrawerTrigger>
      <DrawerContent side="left">
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Choose a workspace section.</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 space-y-2 px-6 py-5">
          {['Overview', 'Accounts', 'Billing', 'Audit trail'].map((item) => (
            <button
              key={item}
              type="button"
              className="flex w-full items-center rounded-lg border border-transparent px-3 py-2 text-left text-sm hover:border-[var(--oui-border-field)] hover:bg-muted/30"
            >
              {item}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  ),
};

export const DetailInspector: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open inspector</Button>
      </DrawerTrigger>
      <DrawerContent side="right">
        <DrawerHeader>
          <DrawerTitle>Account details</DrawerTitle>
          <DrawerDescription>Inspect key metadata without leaving the current screen.</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 space-y-4 px-6 py-5">
          <div className="rounded-lg border border-[var(--oui-border-field)] bg-background/70 p-4">
            <div className="text-xs uppercase tracking-wide text-[var(--oui-foreground-muted)]">Owner</div>
            <div className="mt-1 text-sm font-medium">Alex Morgan</div>
          </div>
          <div className="rounded-lg border border-[var(--oui-border-field)] bg-background/70 p-4">
            <div className="text-xs uppercase tracking-wide text-[var(--oui-foreground-muted)]">Plan</div>
            <div className="mt-1 text-sm font-medium">Enterprise</div>
          </div>
        </div>
        <DrawerFooter>
          <Button variant="secondary">Close</Button>
          <Button>Open record</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
