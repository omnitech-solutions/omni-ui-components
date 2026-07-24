import type { Meta, StoryObj } from '@storybook/react';

import { App } from '@oc-tech/omni-ui-components/App';

const meta: Meta<typeof App> = {
  title: 'omni-ui-components/App',
  component: App,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Top-level passthrough container for <primary>app-wide composition</primary>. Keep this at the root when an <primary>Ant-style App wrapper</primary> is needed for API compatibility.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof App>;
export const Default: Story = {
  render: () => <App><div className="rounded border p-4">Application shell passthrough</div></App>,
};

export const NestedLayout: Story = {
  render: () => (
    <App>
      <div className="space-y-3 rounded border p-4">
        <div className="text-sm font-semibold">Workspace</div>
        <div className="text-sm text-muted-foreground">The wrapper does not alter nested content structure.</div>
      </div>
    </App>
  ),
};
