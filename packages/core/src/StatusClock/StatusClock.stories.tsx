import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { StatusClock, type StatusClockProps } from '@oc-tech/omni-ui-components/StatusClock';
import { SessionBarDemo, type SessionBarDemoProps } from 'factories/omni-ui-components/SessionBar/SessionBar.factories';
import { SAMPLE_BUILD_TAG, statusClockPropsFactory } from 'factories/omni-ui-components/StatusClock/StatusClock.factories';

/** The designer gallery's backdrop and bar surface (story-only chrome), so the clock reads as on the board. */
const OnBar: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="w-full p-6">
    <div className="rounded-xl p-3" style={{ background: '#1a4f96' }}>
      <div
        className="flex min-h-[52px] items-center rounded-[14px] border border-solid px-4"
        style={{
          background: 'var(--oui-panel-bg)',
          borderColor: 'var(--oui-panel-border)',
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

const meta: Meta<StatusClockProps> = {
  title: 'omni-ui-components/StatusClock',
  component: StatusClock,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The session status of the footer: a caller-supplied <primary>icon</primary> node, a monospace <primary>elapsed</primary> string the caller formats, and a <primary>live | paused</primary> state. Paused swaps in the amber pause icon, turns the timer amber and adds a <primary>Paused</primary> label; nothing else changes colour. An optional <primary>buildTag</primary> (<primary>sha</primary>, <primary>branch</primary>, <primary>commitIcon</primary>, <primary>branchIcon</primary>, <primary>title</primary>, <primary>onCopy</primary>, controlled <primary>copied</primary>) renders after a divider; pass it in development builds only.',
      },
    },
  },
  args: statusClockPropsFactory(),
  argTypes: {
    state: {
      control: 'inline-radio',
      options: ['live', 'paused'],
      description: 'Live: red record icon and timer. Paused: amber icon and timer plus the label.',
    },
    elapsed: {
      control: 'text',
      description: 'Formatted elapsed time; the library never ticks.',
    },
    icon: {
      control: false,
      description: 'Icon node (the filled record icon).',
    },
    pausedIcon: {
      control: false,
      description: 'Icon node while paused. Default: icon.',
    },
    pausedLabel: {
      control: 'text',
      description: 'Label while paused. Default "Paused"; null hides it.',
    },
    buildTag: {
      control: 'object',
      description: '{ sha, branch, commitIcon, branchIcon, title, onCopy, copied, copiedLabel }. Omit in production builds.',
    },
    label: { control: 'text', description: 'aria-label of the group.' },
  },
  render: (args) => (
    <OnBar>
      <StatusClock {...args} />
    </OnBar>
  ),
};
export default meta;

type Story = StoryObj<StatusClockProps>;

export const Live: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Filled red record icon and a monospace timer. No "Live" text.',
      },
    },
  },
};

export const Paused: Story = {
  args: { state: 'paused' },
  parameters: {
    docs: {
      description: {
        story: 'Amber pause icon, amber timer and the Paused label. Nothing else changes colour.',
      },
    },
  },
};

export const WithDevBuildTag: Story = {
  args: { buildTag: { ...SAMPLE_BUILD_TAG, onCopy: fn() } },
  parameters: {
    docs: {
      description: {
        story: 'Development builds only: the tag after a divider, full SHA in the tooltip, click to copy.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Copy build/ }));
    await expect(args.buildTag?.onCopy).toHaveBeenCalledTimes(1);
  },
};

export const Copied: Story = {
  args: { buildTag: { ...SAMPLE_BUILD_TAG, copied: true } },
  parameters: {
    docs: {
      description: {
        story: 'The controlled `copied` state: the tag reads "Copied" in the success colour.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Copied' })).toHaveTextContent('Copied');
  },
};

export const SeeThrough: Story = {
  args: { state: 'paused', buildTag: SAMPLE_BUILD_TAG },
  render: (args) => (
    <div style={{ ['--oui-panel-see-through' as string]: 0.22 }}>
      <OnBar>
        <StatusClock {...args} />
      </OnBar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'See-through lowers only the surface behind the clock; the icon, timer and label stay at full opacity.',
      },
    },
  },
};

/** The clock inside the footer, with live state (see SessionBar). */
export const InTheFooter: StoryObj<SessionBarDemoProps> = {
  render: () => (
    <div className="w-full p-6">
      <div className="rounded-xl p-3" style={{ background: '#1a4f96' }}>
        <SessionBarDemo devBuild />
      </div>
    </div>
  ),
};
