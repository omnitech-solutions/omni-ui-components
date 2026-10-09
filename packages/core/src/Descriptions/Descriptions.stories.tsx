import { Descriptions } from '@oc-tech/omni-ui-components/Descriptions';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ReleaseRowsOnly,
  ReleaseSmall,
} from 'factories/omni-ui-components/Descriptions/Descriptions.factories';
import { expect, within } from 'storybook/test';
import { exampleDocs } from 'storybook-helpers/internal/support/sourceSnippet';
import factories from './Descriptions.factories.tsx?raw';

const meta: Meta<typeof Descriptions> = {
  title: 'omni-ui-components/Descriptions',
  component: Descriptions,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Structured <primary>key-value display</primary> for <primary>record summaries, profile details, and readonly metadata</primary>. Use columns to tune density, `size="small"` for a narrow column and `bordered={false}` inside a part that already draws a box. A value is any node: text, a `Tag`, a list of lines. The "Small" and "Rows only" stories show their whole code: a type of the caller\'s own, typed data, and a function that turns it into `DescriptionItem`s.',
      },
    },
  },
  args: {
    title: 'Record summary',
    items: [
      { label: 'Owner', children: 'Alex Morgan' },
      { label: 'Status', children: 'Active' },
      { label: 'Region', children: 'North America' },
      { label: 'Renewal', children: '2026-10-01' },
    ],
  },
};
export default meta;

type Story = StoryObj<typeof Descriptions>;
export const Default: Story = {};

export const SingleColumn: Story = {
  args: {
    columns: 1,
    items: [
      { label: 'Account owner', children: 'Alex Morgan' },
      { label: 'Plan', children: 'Enterprise' },
      { label: 'Next renewal', children: 'October 1, 2026' },
    ],
  },
};

/** `size="small"`: one column with tighter padding and gaps. */
export const Small: Story = {
  render: () => <ReleaseSmall />,
  parameters: exampleDocs(factories, 'ReleaseSmall'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Checksum')).toBeVisible();
    await expect(canvas.getByText('Fixes a crash on export')).toBeVisible();
  },
};

/** `bordered={false}`: the rows only, with no box or padding of their own. */
export const RowsOnly: Story = {
  render: () => <ReleaseRowsOnly />,
  parameters: exampleDocs(factories, 'ReleaseRowsOnly'),
};
