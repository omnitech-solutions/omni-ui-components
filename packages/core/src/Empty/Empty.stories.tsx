import { Empty, type EmptyProps } from '@oc-tech/omni-ui-components/Empty';
import type { Meta, StoryObj } from '@storybook/react';
import { emptyVariants } from 'factories/omni-ui-components/Empty/Empty.factories';

const meta: Meta<typeof Empty> = {
  title: 'omni-ui-components/Empty',
  component: Empty,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Empty state surface for <primary>blank tables, filters with no matches, and initial setup states</primary>. Supports a <primary>custom image/icon, description, and actions</primary>.',
      },
    },
  },
  args: { description: 'No matching records' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['dashed', 'tile'] },
    title: { control: 'text', description: 'Tile variant: optional bold title.' },
    action: {
      control: 'object',
      description:
        'Tile variant: { label, onClick, tone?, icon?, shortcut? } rendered with the library Button.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Empty>;
export const Default: Story = {};

export const WithAction: Story = {
  render: () => (
    <Empty description="No projects yet">
      <button className="rounded border px-3 py-1.5 text-sm">Create project</button>
    </Empty>
  ),
};

export const Tile: Story = { args: emptyVariants[2].args };
export const TileWithTitleAndAction: Story = {
  args: emptyVariants[1].args,
  // The action's callback is a plain prop; here it forwards to the root `onClick` Storybook action.
  argTypes: { onClick: { action: 'action clicked' } },
  render: ({ onClick, ...args }) => (
    <div className="flex h-80 w-[420px] flex-col rounded-xl border">
      <Empty
        {...(args as EmptyProps)}
        action={{
          ...(args.action as NonNullable<EmptyProps['action']>),
          onClick: () => (onClick as (() => void) | undefined)?.(),
        }}
      />
    </div>
  ),
};
export const TileMatrix: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {emptyVariants.slice(1).map((variant) => (
        <div key={variant.name} className="flex h-72 flex-col rounded-xl border">
          <Empty {...(variant.args as EmptyProps)} />
        </div>
      ))}
    </div>
  ),
};
