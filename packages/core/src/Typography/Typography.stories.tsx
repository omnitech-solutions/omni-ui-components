import type { Meta, StoryObj } from '@storybook/react';

import { Typography } from '@omnitech/omni-ui-core/Typography';

const meta: Meta<typeof Typography.Title> = {
  title: 'omni-ui-components/Typography',
  component: Typography.Title,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Text primitives for headings, body copy, inline text, and links with semantic tone treatments. Typography should define hierarchy and reading rhythm, not just output raw HTML tags.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Typography.Title>;
export const Default: Story = {
  render: () => (
    <div className="max-w-2xl space-y-4 rounded-2xl border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-6 shadow-xs">
      <Typography.Title>Quarterly pipeline</Typography.Title>
      <Typography.Paragraph type="secondary">
        Secondary supporting text explains the current section and gives the user enough context to continue without adding visual noise.
      </Typography.Paragraph>
      <Typography.Paragraph>
        This paragraph represents the default reading rhythm for product surfaces, detail panels, and long-form supporting copy inside cards, drawers, and modal content.
      </Typography.Paragraph>
      <Typography.Link href="https://example.com">Reference link</Typography.Link>
    </div>
  ),
};

export const ToneVariants: Story = {
  render: () => (
    <div className="max-w-xl space-y-2 rounded-2xl border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-6 shadow-xs">
      <Typography.Text>Default text</Typography.Text>
      <Typography.Text type="secondary">Secondary text</Typography.Text>
      <Typography.Text type="success">Success text</Typography.Text>
      <Typography.Text type="warning">Warning text</Typography.Text>
      <Typography.Text type="danger">Danger text</Typography.Text>
    </div>
  ),
};

export const EditorialBlock: Story = {
  render: () => (
    <div className="max-w-3xl rounded-2xl border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-8 shadow-xs">
      <Typography.Title>Launch readiness review</Typography.Title>
      <div className="mt-3 space-y-4">
        <Typography.Paragraph>
          Typography needs to establish hierarchy immediately. Titles should anchor the section, paragraphs should maintain a comfortable reading measure, and links should feel intentional rather
          than default-browser styled.
        </Typography.Paragraph>
        <Typography.Paragraph type="secondary">
          Use the secondary tone for supporting detail, timestamps, helper copy, and explanatory notes that should remain legible without competing with the main narrative.
        </Typography.Paragraph>
        <Typography.Text type="warning">Two approvals are still pending before this release can be published.</Typography.Text>
      </div>
    </div>
  ),
};
