import { SessionBar } from '@oc-tech/omni-ui-components/SessionBar';
import type { Meta, StoryObj } from '@storybook/react';
import {
  SessionBarDemo,
  type SessionBarDemoProps,
  sessionBarPropsFactory,
} from 'factories/omni-ui-components/SessionBar/SessionBar.factories';
import type * as React from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

type StoryArgs = SessionBarDemoProps;

/** The designer gallery's backdrop behind the footer (story-only chrome). */
const Backdrop: React.FC<React.PropsWithChildren<{ seeThrough?: number; width?: number }>> = ({
  children,
  seeThrough,
  width,
}) => (
  <div className="w-full p-6">
    <div
      className="rounded-xl p-3"
      style={{
        background: '#1a4f96',
        width,
        ...(seeThrough !== undefined
          ? { ['--oui-panel-see-through' as string]: seeThrough }
          : null),
      }}
    >
      {children}
    </div>
  </div>
);

const meta: Meta<StoryArgs> = {
  title: 'omni-ui-components/SessionBar',
  component: SessionBar as unknown as React.ComponentType<StoryArgs>,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The live-session footer: the Toolbar <primary>bar</primary> variant with the panel surface, a <primary>leading</primary> slot (the StatusClock) and right-aligned actions built from config. <primary>pause</primary> (outline, filled icon) and <primary>resume</primary> (green solid, filled icon) share one slot and swap with <primary>status</primary>; <primary>end</primary> is an outlined red button whose optional <primary>confirm</primary> opens a Popconfirm. Labels, icon nodes and callbacks are props. The background never changes with the state, wraps instead of overflowing, and nothing is absolutely positioned.',
      },
    },
  },
  args: {
    initial: 'live',
    elapsed: '2:18:20',
    devBuild: false,
    confirmEnd: false,
    onAction: fn(),
  },
  argTypes: {
    initial: {
      control: 'inline-radio',
      options: ['live', 'paused'],
      description: 'Initial status; the buttons toggle it.',
    },
    elapsed: { control: 'text', description: 'Formatted elapsed time.' },
    devBuild: {
      control: 'boolean',
      description: 'Show the development build tag (caller decision).',
    },
    confirmEnd: {
      control: 'boolean',
      description: 'Ask before ending (Popconfirm).',
    },
    width: { control: 'number', description: 'Story-only: fixed width in px.' },
    onAction: {
      action: 'session',
      description: 'Story-only: reports pause, resume, end, end:cancel, build:copy.',
    },
  },
  render: (args) => (
    <Backdrop>
      <SessionBarDemo {...args} />
    </Backdrop>
  ),
};
export default meta;

type Story = StoryObj<StoryArgs>;

export const Live: Story = {
  args: { devBuild: false },
  parameters: {
    docs: {
      description: {
        story:
          'Live: Pause session (outline, filled pause icon) and End session (outlined red). Pause toggles to Resume and back.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Pause session' }));
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Resume session' })).toBeVisible(),
    );
    await expect(canvas.getByText('Paused')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Resume session' }));
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Pause session' })).toBeVisible(),
    );
    await expect(args.onAction).toHaveBeenCalledWith('pause');
    await expect(args.onAction).toHaveBeenCalledWith('resume');
  },
};

export const Paused: Story = {
  args: { initial: 'paused', devBuild: true },
  parameters: {
    docs: {
      description: {
        story:
          'Paused: amber icon, timer and label; the same slot shows Resume session (green, filled play icon). The bar background is exactly the Live one: no tint.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Resume session' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Pause session' })).toBeNull();
  },
};

export const WithDevBuildTag: Story = {
  args: { devBuild: true },
  parameters: {
    docs: {
      description: {
        story:
          'Development builds: `<short sha> · <branch>` in mono after a divider, full SHA in the tooltip. Choosing it copies and reads "Copied" for a moment.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Copy build/ }));
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Copied' })).toBeVisible());
    await expect(args.onAction).toHaveBeenCalledWith('build:copy', expect.any(String));
  },
};

export const EndConfirm: Story = {
  args: { confirmEnd: true },
  parameters: {
    docs: {
      description: {
        story:
          'End with `confirm` config: the button opens a Popconfirm; the End callback runs only on confirm.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'End session' }));
    const dialog = within(await within(document.body).findByRole('dialog'));
    await expect(args.onAction).not.toHaveBeenCalledWith('end');
    await userEvent.click(dialog.getByRole('button', { name: 'End now' }));
    await waitFor(() => expect(args.onAction).toHaveBeenCalledWith('end'));
  },
};

export const Narrow: Story = {
  args: { devBuild: true },
  render: (args) => (
    <div className="flex flex-col gap-6">
      {[330, 300, 900].map((width) => (
        <div key={width}>
          <span className="px-6 font-mono text-xs text-muted-foreground">{width}px</span>
          <Backdrop width={width}>
            <SessionBarDemo {...args} />
          </Backdrop>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'At 330, 300 and 900px the bar wraps (clock row, then actions) and truncates the build tag; it never overflows and nothing is absolutely positioned.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    for (const bar of canvasElement.querySelectorAll<HTMLElement>('[role="toolbar"]')) {
      await expect(bar.scrollWidth).toBeLessThanOrEqual(bar.clientWidth);
    }
  },
};

export const SeeThrough: Story = {
  args: { devBuild: true },
  render: (args) => (
    <Backdrop seeThrough={0.22}>
      <SessionBarDemo {...args} />
    </Backdrop>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'See-through (token 0.22) lowers the bar surface only; icon, timer, labels and buttons stay fully opaque.',
      },
    },
  },
};

/** The component alone, props only (no state): the building blocks a host composes. */
export const PropsOnly: StoryObj = {
  render: () => (
    <Backdrop>
      <SessionBar
        {...sessionBarPropsFactory({ status: 'paused' })}
        leading={<span className="text-sm">Custom leading slot</span>}
      />
    </Backdrop>
  ),
};
