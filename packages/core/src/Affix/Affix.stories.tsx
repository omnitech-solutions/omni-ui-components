import type { Meta, StoryObj } from '@storybook/react';

import { Affix } from '@omnitech/omni-ui-core/Affix';

const meta: Meta<typeof Affix> = {
  title: 'omni-ui-components/Affix',
  component: Affix,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Pins content within a scrolling container using <primary>CSS sticky positioning</primary>. Use for <primary>summaries, filters, and secondary navigation</primary> that should remain visible while nearby content scrolls.',
      },
      signature: '<Affix />',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Affix>;

export const Default: Story = {
  render: () => (
    <div className="h-56 overflow-auto rounded border p-4">
      <div className="h-96 space-y-4">
        <Affix offsetTop={0} className="rounded border bg-background p-3">
          Sticky summary
        </Affix>
        <div className="pt-20 text-sm text-muted-foreground">Scroll container content</div>
      </div>
    </div>
  ),
};

export const WithBottomOffset: Story = {
  render: () => (
    <div className="h-56 overflow-auto rounded border p-4">
      <div className="h-96 space-y-4">
        <div className="pt-60 text-sm text-muted-foreground">Scroll toward the bottom edge</div>
        <Affix offsetBottom={0} className="rounded border bg-background p-3">
          Bottom-pinned actions
        </Affix>
      </div>
    </div>
  ),
};
