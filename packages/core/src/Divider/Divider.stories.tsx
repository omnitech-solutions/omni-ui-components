import { Button } from '@oc-tech/omni-ui-components/Button';
import { Divider } from '@oc-tech/omni-ui-components/Divider';
import type { Meta, StoryObj } from '@storybook/react';
import { CONTROL_SEPARATOR_CLASS } from 'factories/omni-ui-components/Divider/Divider.factories';
import { Camera, Mic } from 'lucide-react';

const meta: Meta<typeof Divider> = {
  title: 'omni-ui-components/Divider',
  component: Divider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal or vertical <primary>separator</primary> for <primary>grouping adjacent content</primary>, with optional centered label text.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Divider>;

/** A rule between two blocks of content. */
export const Default: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <p className="m-0">Billing details</p>
      <Divider {...args} />
      <p className="m-0">Payment history</p>
    </div>
  ),
};
export const WithLabel: Story = { args: { children: 'OR' } };
export const Vertical: Story = {
  render: () => (
    <div className="flex h-20 items-center gap-4">
      <span>Left</span>
      <Divider orientation="vertical" className="h-full" />
      <span>Right</span>
    </div>
  ),
};

export const ControlSeparator: Story = {
  name: 'Control separator (20px)',
  parameters: {
    docs: {
      description: {
        story:
          'No extra prop: a vertical Divider with `h-[var(--oui-control-separator)]` (20px) and the neutral tone border separates control groups on a 36px row.',
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-[var(--oui-control-gap)]">
      <Button buttonSize="control" tone="neutral" icon={<Camera />}>
        Capture
      </Button>
      <Divider orientation="vertical" className={CONTROL_SEPARATOR_CLASS} />
      <Button buttonSize="control" tone="neutral" icon={<Mic />}>
        Mic
      </Button>
    </div>
  ),
};
