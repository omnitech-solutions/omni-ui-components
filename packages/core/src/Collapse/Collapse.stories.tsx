import type { Meta, StoryObj } from '@storybook/react';

import { Collapse } from '@omnitech/omni-ui-core/Collapse';

const meta: Meta<typeof Collapse> = {
  title: 'omni-ui-components/Collapse',
  component: Collapse,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Accordion-style <primary>disclosure group</primary> for <primary>compact settings, FAQs, and secondary details</primary>. Supports multiple open panels or single-panel accordion mode.',
      },
    },
  },
  args: {
    items: [
      {
        key: '1',
        label: 'General',
        children: 'Control naming, ownership, and default configuration for the current workspace section.',
      },
      {
        key: '2',
        label: 'Access',
        children: 'Manage who can view, comment on, and edit this workspace area.',
      },
    ],
  },
};
export default meta;

type Story = StoryObj<typeof Collapse>;
export const Default: Story = {};

export const Accordion: Story = {
  args: {
    accordion: true,
    items: [
      {
        key: '1',
        label: 'Profile',
        children: 'Profile configuration including owner details, record metadata, and naming conventions.',
      },
      {
        key: '2',
        label: 'Notifications',
        children: 'Notification configuration including digests, alerts, and escalation routing.',
      },
    ],
  },
};

export const WithExtras: Story = {
  args: {
    items: [
      {
        key: '1',
        label: 'Billing',
        extra: <span className="text-xs text-[var(--oui-foreground-muted)]">Required</span>,
        children: 'Billing addresses, tax configuration, and invoice delivery settings.',
      },
      {
        key: '2',
        label: 'Retention',
        extra: <span className="text-xs text-[var(--oui-foreground-muted)]">90 days</span>,
        children: 'Data retention policies for logs, records, and exported artifacts.',
      },
    ],
  },
};
