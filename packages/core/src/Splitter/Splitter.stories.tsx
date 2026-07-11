import type { Meta, StoryObj } from '@storybook/react';

import { Splitter, SplitterPanel } from '@omnitech/omni-ui-core/Splitter';

const meta: Meta<typeof Splitter> = {
  title: 'omni-ui-components/Splitter',
  component: Splitter,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Static <primary>split-panel layout primitive</primary> for <primary>side-by-side panes</primary>. Use it for compatibility or simple pane compositions.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Splitter>;
export const Default: Story = {
  render: () => (
    <Splitter className="h-48">
      <SplitterPanel defaultSize="35%" className="p-4">Left panel</SplitterPanel>
      <SplitterPanel className="p-4">Right panel</SplitterPanel>
    </Splitter>
  ),
};

export const ThreePanels: Story = {
  render: () => (
    <Splitter className="h-48">
      <SplitterPanel defaultSize="20%" className="p-4">Nav</SplitterPanel>
      <SplitterPanel defaultSize="40%" className="p-4">Content</SplitterPanel>
      <SplitterPanel className="p-4">Inspector</SplitterPanel>
    </Splitter>
  ),
};
