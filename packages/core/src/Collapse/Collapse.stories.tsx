import { Collapse } from '@oc-tech/omni-ui-components/Collapse';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ServiceCards,
  ServicesGroup,
  ServicesSmall,
} from 'factories/omni-ui-components/Collapse/Collapse.factories';
import { expect, userEvent, within } from 'storybook/test';
import { exampleDocs } from 'storybook-helpers/internal/support/exampleDocs';
import factories from './Collapse.factories.tsx?raw';

const meta: Meta<typeof Collapse> = {
  title: 'omni-ui-components/Collapse',
  component: Collapse,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Accordion-style <primary>disclosure group</primary> for <primary>compact settings, FAQs, and secondary details</primary>. Supports multiple open panels or single-panel accordion mode. An item takes a quiet `description` under its label and an `extra` node at the end of its header. `size="small"` tightens it for a narrow column and `tone="accent"` marks a group as the chosen one. The stories from "With description" on show their whole code: a type of the caller\'s own, typed data, and a function that turns one into a `CollapseItem`.',
      },
    },
  },
  args: {
    items: [
      {
        key: '1',
        label: 'General',
        children:
          'Control naming, ownership, and default configuration for the current workspace section.',
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
        children:
          'Profile configuration including owner details, record metadata, and naming conventions.',
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

/** A `description` under each label and a `Tag` in `extra`; the body is a `Descriptions` with no box of its own. */
export const WithDescription: Story = {
  render: () => <ServicesGroup />,
  parameters: exampleDocs(factories, 'ServicesGroup'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole('button', { name: /Search/ });
    await expect(header).toHaveTextContent('Discovery team · us-east-1');
    await expect(header).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(header);
    await expect(header).toHaveAttribute('aria-expanded', 'true');
  },
};

/** `size="small"`: tighter header and body, for a narrow column. */
export const Small: Story = {
  render: () => <ServicesSmall />,
  parameters: exampleDocs(factories, 'ServicesSmall'),
};

/** One `Collapse` an entry makes each its own box; `tone="accent"` marks the pinned one. */
export const AccentTone: Story = {
  render: () => <ServiceCards />,
  parameters: exampleDocs(factories, 'ServiceCards'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pinned = canvas.getByRole('button', { name: /Search/ });
    await expect(pinned).toHaveAttribute('aria-expanded', 'true');
    await expect(pinned.closest('[data-slot="collapse"]')).toHaveAttribute('data-tone', 'accent');
    await userEvent.click(pinned);
    await expect(pinned).toHaveAttribute('aria-expanded', 'false');
  },
};
