import { Panel, type PanelProps } from '@oc-tech/omni-ui-components/Panel';
import { Steps } from '@oc-tech/omni-ui-components/Steps';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AnswerBody,
  analysingSteps,
  ComplexityChips,
  NativePanelsDemo,
  type NativePanelsDemoProps,
  PANEL_BACKDROP,
  panelVariants,
  StopAction,
  ToApplyDock,
  TranscriptDemo,
  type TranscriptDemoProps,
} from 'factories/omni-ui-components/Panel/Panel.factories';
import type * as React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { OnAction } from '../SplitButton/SplitButton.factories';

/** Story-only extras: the see-through level, the demo state and the callback every control reports through (Actions panel). */
type StoryArgs = PanelProps & {
  seeThrough?: number;
  state?: NativePanelsDemoProps['state'];
  initial?: TranscriptDemoProps['initial'];
  onAction?: OnAction;
};

/** One panel on the designer gallery's backdrop, in a row 340px tall (story-only chrome). */
const Stage: React.FC<
  React.PropsWithChildren<{
    seeThrough?: number;
    height?: number;
    rowWidth?: number;
  }>
> = ({ seeThrough = 1, height = 340, rowWidth = 480, children }) => (
  <div className="p-6">
    <div
      className="box-border flex rounded-xl p-3.5"
      style={{
        background: PANEL_BACKDROP,
        height,
        width: rowWidth,
        ['--oui-panel-see-through' as string]: seeThrough,
      }}
    >
      {children}
    </div>
  </div>
);

const meta: Meta<StoryArgs> = {
  title: 'omni-ui-components/Panel',
  component: Panel as unknown as React.ComponentType<StoryArgs>,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A flex-column <primary>panel shell</primary>: a <primary>40px header</primary> (title, subtitle, right-aligned meta, actions), a body that fills the rest and <primary>scrolls inside</primary>, and an optional <primary>dock</primary> pinned at the bottom. Nothing is positioned against the window. `scroll` adds a top fade, a thin scrollbar and stick-to-bottom with a <primary>Jump to latest</primary> pill (the `useFollowLatest` hook). `width` / `minWidth` / `flex` let a parent do the reflow rule. See-through is the <primary>--oui-panel-see-through</primary> token (0-1): only the panel, header and dock backgrounds follow it; text and icons stay opaque.',
      },
    },
  },
  args: { title: 'Answer', seeThrough: 1, bodyPadding: 'none' },
  argTypes: {
    title: {
      control: 'text',
      description: 'Header title; also the region name.',
    },
    subtitle: {
      control: 'text',
      description: 'Muted text right after the title.',
    },
    meta: {
      control: 'text',
      description: 'Right-aligned meta: text or nodes (Tag chips).',
    },
    actions: {
      control: false,
      description: 'Header actions: Buttons with their own callbacks.',
    },
    dock: {
      control: false,
      description: 'Pinned under the body; rendered only when provided.',
    },
    empty: {
      control: 'object',
      description:
        'Empty tile config: { icon, title, description, action: { label, onClick, shortcut } }.',
    },
    scroll: {
      control: 'object',
      description:
        '{ fade, thinScrollbar, stickToBottom, lines, activity, onJumpToLatest, jumpLabel, missedLabel }.',
    },
    bodyPadding: { control: 'inline-radio', options: ['none', 'sm', 'md'] },
    width: {
      control: { type: 'inline-radio' },
      options: [undefined, 330, 480],
      description: 'Fixed width in px (`flex: 0 0 width`). Unset: share the row.',
    },
    minWidth: { control: 'number' },
    flex: { control: 'text' },
    as: {
      control: 'inline-radio',
      options: ['section', 'div', 'aside', 'article'],
    },
    seeThrough: {
      control: 'inline-radio',
      options: [1, 0.6, 0.22],
      description:
        'Story-only: sets --oui-panel-see-through on the stage. Backgrounds only; text stays opaque.',
    },
    onAction: {
      action: 'panel',
      description:
        'Story-only: reports Capture, Stop, Apply, Clear, Add screenshot, Jump to latest, composer and message events.',
    },
    state: {
      control: 'inline-radio',
      options: ['ready', 'analysing', 'answer'],
      description: 'Story-only: the board-1d state of the three-panel row.',
    },
    initial: {
      control: 'number',
      description: 'Story-only: messages in the transcript demo at the start.',
    },
  },
  render: (args) => {
    const { seeThrough, onAction: _onAction, state: _state, initial: _initial, ...panel } = args;
    return (
      <Stage seeThrough={seeThrough}>
        <Panel {...panel} />
      </Stage>
    );
  },
};
export default meta;

type Story = StoryObj<StoryArgs>;

/** Board 1d, state 1: the Answer panel with nothing analysed. The Capture action sits inside the body; the meta is right-aligned. */
export const ReadyNothingAnalysed: Story = {
  render: (args) => (
    <Stage seeThrough={args.seeThrough} rowWidth={640}>
      <Panel
        title="Answer"
        meta="Last capture 08:33 · no question found"
        empty={{
          ...panelVariants[0].args.empty,
          action: {
            ...panelVariants[0].args.empty!.action!,
            onClick: () => args.onAction?.('capture'),
          },
        }}
      />
    </Stage>
  ),
};

/** Board 1d: the Code panel while it waits (hourglass tile, one line of copy). */
export const CodeWaiting: Story = {
  args: { ...panelVariants[1].args },
};

/** Board 1d, state 2: Stop in the header, the step list in the body and the To apply dock. */
export const AnalysingWithStopAndDock: Story = {
  render: (args) => (
    <Stage seeThrough={args.seeThrough} rowWidth={640}>
      <Panel
        title="Answer"
        subtitle="S2 · 10:57"
        actions={<StopAction onStop={() => args.onAction?.('stop')} />}
        dock={
          <ToApplyDock
            onAdd={() => args.onAction?.('add-screenshot')}
            onClear={() => args.onAction?.('clear')}
            onApply={() => args.onAction?.('apply')}
          />
        }
        bodyPadding="md"
        bodyClassName="justify-center px-7"
      >
        <Steps variant="checklist" items={analysingSteps()} />
      </Panel>
    </Stage>
  ),
  /** Interaction: Stop, Add screenshot, Clear and Apply are the caller's callbacks; focus runs header action, then body, then dock. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = canvas.getByRole('region', { name: /Answer/ });
    await expect(panel.querySelector('[data-slot="panel-dock"]')).not.toBeNull();
    await expect(
      within(panel.querySelector('[data-slot="panel-header"]') as HTMLElement).getByRole('button', {
        name: /Stop/,
      }),
    ).toBeVisible();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /Stop/ })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Add screenshot' })).toHaveFocus();
  },
};

/** Board 1d, state 3: a ready answer with complexity chips in the meta slot, right-aligned. */
export const AnswerReadyWithMetaChips: Story = {
  render: (args) => (
    <Stage seeThrough={args.seeThrough} rowWidth={760} height={320}>
      <Panel
        title="Answer"
        subtitle="S2 · Two Sum"
        meta={<ComplexityChips />}
        bodyPadding="md"
        bodyClassName="gap-2.5 text-sm leading-[1.55]"
      >
        <AnswerBody />
      </Panel>
    </Stage>
  ),
};

/** The three panels of board 1d in a row (transcript 330 min 300, the others share the rest). Controls: state, width 900 / 1180, see-through. */
export const ThreePanels: StoryObj<NativePanelsDemoProps & StoryArgs> = {
  args: { state: 'ready', width: 1180, seeThrough: 1 },
  argTypes: {
    width: {
      control: 'inline-radio',
      options: [900, 1180],
      description: 'Row width in px (the window the panels must fit).',
    },
  },
  render: (args) => (
    <div className="overflow-x-auto p-6">
      <NativePanelsDemo
        state={args.state}
        seeThrough={args.seeThrough}
        width={Number(args.width ?? 1180)}
        onAction={args.onAction}
      />
    </div>
  ),
};
export const ThreePanelsAnalysing: StoryObj<NativePanelsDemoProps & StoryArgs> = {
  ...ThreePanels,
  args: { ...ThreePanels.args, state: 'analysing' },
};
export const TwoPanelsCodeHidden: StoryObj<NativePanelsDemoProps & StoryArgs> = {
  ...ThreePanels,
  args: { ...ThreePanels.args, state: 'answer' },
};

/** The same row at 900px: nothing is cropped. */
export const ThreePanelsAt900: StoryObj<NativePanelsDemoProps & StoryArgs> = {
  ...ThreePanels,
  args: { ...ThreePanels.args, state: 'analysing', width: 900 },
};

/** See-through at 22%: only the surfaces become transparent; titles, messages, icons and buttons stay fully opaque. */
export const SeeThrough22: StoryObj<NativePanelsDemoProps & StoryArgs> = {
  ...ThreePanels,
  args: { ...ThreePanels.args, state: 'analysing', seeThrough: 0.22 },
};
export const SeeThrough60: StoryObj<NativePanelsDemoProps & StoryArgs> = {
  ...ThreePanels,
  args: { ...ThreePanels.args, state: 'analysing', seeThrough: 0.6 },
};

/** Board 1d, transcript: fade, thin scrollbar, stick to the bottom. Scroll up, press "New message arrives", then choose "Jump to latest". */
export const TranscriptScrolling: StoryObj<TranscriptDemoProps & StoryArgs> = {
  args: { initial: 12 },
  render: (args) => (
    <div className="p-6">
      <TranscriptDemo initial={args.initial} onAction={args.onAction} />
    </div>
  ),
  /** Interaction: scroll up, a message arrives (pill with the count), Jump to latest returns and follows again. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = canvasElement.querySelector('[data-slot="panel-body"]') as HTMLElement;
    await waitFor(() =>
      expect(body.scrollHeight - body.scrollTop - body.clientHeight).toBeLessThan(5),
    );
    body.dispatchEvent(new WheelEvent('wheel', { deltaY: -200, bubbles: true }));
    body.scrollTop = 0;
    await waitFor(() => expect(body).toHaveAttribute('data-following', 'false'));
    await userEvent.click(canvas.getByTestId('add-message'));
    const pill = await canvas.findByRole('button', { name: /Jump to latest/ });
    await expect(pill).toHaveTextContent('1 new');
    await userEvent.click(pill);
    await waitFor(() =>
      expect(canvas.queryByRole('button', { name: /Jump to latest/ })).toBeNull(),
    );
    await waitFor(() =>
      expect(body.scrollHeight - body.scrollTop - body.clientHeight).toBeLessThan(5),
    );
    await userEvent.click(canvas.getByTestId('add-message'));
    await waitFor(() =>
      expect(body.scrollHeight - body.scrollTop - body.clientHeight).toBeLessThan(5),
    );
  },
};

/** Layout props: a fixed 330px (min 300) panel next to one that shares the rest. */
export const WidthAndFlex: Story = {
  render: (args) => (
    <Stage seeThrough={args.seeThrough} rowWidth={760} height={200}>
      <div className="flex w-full gap-2.5">
        <Panel title="Fixed 330" width={330} minWidth={300} bodyPadding="sm">
          width=330 minWidth=300
        </Panel>
        <Panel title="Shares the rest" bodyPadding="sm">
          flex 1 1 0
        </Panel>
      </div>
    </Stage>
  ),
};
