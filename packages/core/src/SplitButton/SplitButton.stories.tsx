import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SplitButton, type SplitButtonProps } from '@oc-tech/omni-ui-components/SplitButton';
import {
  CaptureSplitButtonDemo,
  MicSplitButtonDemo,
  splitButtonBoardVariants,
  splitButtonCaptureVariants,
  splitButtonMicVariants,
  splitButtonPropsFactory,
  type CaptureState,
  type MicState,
  type OnAction,
} from 'factories/omni-ui-components/SplitButton/SplitButton.factories';

/** Story-only extras: demo state, plus top-level actions for the callbacks nested inside `main` and `menu`. */
type StoryArgs = SplitButtonProps & {
  capture?: CaptureState;
  mic?: MicState;
  onAction?: OnAction;
  onPress?: (event: unknown) => void;
  onSelect?: (itemId: string) => void;
  onNoticeAction?: () => void;
};

/** The toolbar surface the control sits on in the designer boards (story-only chrome). */
const Surface: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={`inline-block rounded-2xl bg-[color:var(--oui-badge-ring)] p-6 ${className ?? ''}`}>{children}</div>
);

/** Raw props with working selection: section values are held here, since the SplitButton and ActionMenu keep none. */
const Playground: React.FC<StoryArgs> = ({ onPress, onSelect, onNoticeAction, capture: _c, mic: _m, onAction: _a, ...props }) => {
  const [values, setValues] = React.useState<Record<string, string>>({});
  const notice = props.menu.notice;
  return (
    <Surface>
      <SplitButton
        {...props}
        main={{ ...props.main, onPress: onPress ?? props.main.onPress }}
        menu={{
          ...props.menu,
          sections: props.menu.sections.map((section) => ({ ...section, value: values[section.id] ?? section.value })),
          onSelect: onSelect ?? props.menu.onSelect,
          onValueChange: (sectionId, itemId) => {
            setValues((current) => ({ ...current, [sectionId]: itemId }));
            props.menu.onValueChange?.(sectionId, itemId);
          },
          notice: notice
            ? { ...notice, action: notice.action ? { ...notice.action, onSelect: onNoticeAction ?? notice.action.onSelect } : undefined }
            : undefined,
        }}
      />
    </Surface>
  );
};

const meta: Meta<StoryArgs> = {
  title: 'omni-ui-components/SplitButton',
  component: SplitButton as unknown as React.ComponentType<StoryArgs>,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A main action and a caret menu sharing <primary>one border</primary> with a 1px divider. The whole control has a <primary>tone</primary> (neutral, accent tint, warning, danger, dim), a <primary>status badge</primary> anchored to the top-right of the icon glyph (a deliberate deviation from the board, which puts it on the outer corner) and an <primary>analysing</primary> state that swaps the icon for the progress ring. The main part can be disabled with a reason while the caret stays usable. The capture and microphone stories are working demos: choosing a menu row updates the tint, label and check.',
      },
    },
  },
  args: splitButtonPropsFactory(),
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: [undefined, 'neutral', 'accent', 'success', 'warning', 'danger', 'dim'],
      description: 'Tone of the whole control.',
    },
    size: {
      control: 'inline-radio',
      options: [undefined, 'control', 'control-labelled'],
      description: 'Default: the enclosing Toolbar size, else control.',
    },
    status: { control: 'object', description: '{ tone, label?, description? } badge at the top-right of the main icon.' },
    main: { control: 'object', description: 'icon, label, state, pressed, tooltip, shortcut, disabled, disabledReason, onPress.' },
    caret: { control: 'object', description: 'label, tooltip, disabledReason.' },
    menu: { control: 'object', description: 'An ActionMenu spec (sections, notice, hint, width, placement, portal, onSelect, onValueChange...).' },
    openMenuOn: { control: 'check', options: ['contextmenu', 'arrowdown'] },
    open: { control: 'boolean' },
    capture: { control: 'object', description: 'Demo stories: { mode, display, analysing, problem, paused }.' },
    mic: { control: 'object', description: 'Demo stories: { status, device }.' },
    onOpenChange: { action: 'menu open changed' },
    onAction: { action: 'interaction', description: 'Story-only: demo interactions (press, select, open, fix, retry).' },
    onPress: { action: 'main pressed', description: 'Story-only: main.onPress (Playground).' },
    onSelect: { action: 'menu row selected', description: 'Story-only: menu.onSelect (Playground).' },
    onNoticeAction: { action: 'notice action', description: 'Story-only: menu.notice.action.onSelect (Playground).' },
  },
  render: (args) => <Playground {...args} />,
};
export default meta;

type Story = StoryObj<StoryArgs>;

const captureStory = (capture: CaptureState): Story => ({
  args: { capture },
  render: (args) => (
    <Surface>
      <CaptureSplitButtonDemo initial={args.capture} size={args.size} onAction={args.onAction} />
    </Surface>
  ),
});

const micStory = (mic: MicState): Story => ({
  args: { mic },
  render: (args) => (
    <Surface>
      <MicSplitButtonDemo initial={args.mic} size={args.size} onAction={args.onAction} />
    </Surface>
  ),
});

export const Default: Story = {};
export const CaptureManual: Story = captureStory({ mode: 'manual' });
export const CaptureAuto: Story = captureStory({ mode: 'auto' });
export const Analysing: Story = captureStory({ mode: 'manual', analysing: true });
export const ScreenPermissionLost: Story = captureStory({ mode: 'manual', problem: true });
export const PausedCapture: Story = captureStory({ mode: 'manual', paused: true });
export const MicListening: Story = micStory({ status: 'listening' });
export const MicMuted: Story = micStory({ status: 'muted' });
export const MicLostRetrying: Story = micStory({ status: 'lost' });
export const PausedMic: Story = micStory({ status: 'paused' });

/** Board 1c, C2: the mode word sits on the main button (`main.labelInline` with `main.caption`). */
export const ModeWordOnButton: Story = { args: splitButtonBoardVariants[0].args };

/** Board 1c, C3: a third segment toggles Auto (`segments`, `pressed`); its `onPress` receives the segment, then the event. */
export const AutoToggleSegment: Story = {
  args: splitButtonBoardVariants[1].args,
  render: (args) => {
    const [auto, setAuto] = React.useState(true);
    return (
      <Surface>
        <SplitButton
          {...args}
          segments={args.segments?.map((segment) => ({
            ...segment,
            pressed: auto,
            onPress: () => {
              setAuto((value) => !value);
              args.onAction?.('capture:auto', !auto);
            },
          }))}
        />
      </Surface>
    );
  },
};

export const Labelled: Story = { ...captureStory({ mode: 'manual' }), args: { capture: { mode: 'manual' }, size: 'control-labelled' } };

export const MenuOpen: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <div className="min-h-[560px]">
      <Playground {...args} />
    </div>
  ),
};

export const OpenFromRightClickAndArrowDown: Story = { args: { openMenuOn: ['contextmenu', 'arrowdown'] } };

export const StateMatrix: Story = {
  render: () => (
    <Surface className="m-6">
      <div className="flex flex-wrap items-start gap-x-8 gap-y-5">
        {[...splitButtonCaptureVariants, ...splitButtonMicVariants].map((variant) => (
          <div key={variant.name} className="flex flex-col items-start gap-2">
            <span className="font-mono text-[11.5px] text-[var(--oui-foreground-muted)]">{variant.name}</span>
            <SplitButton {...splitButtonPropsFactory(variant.args)} />
          </div>
        ))}
      </div>
    </Surface>
  ),
};

/** Interaction: pick Auto from the caret menu; the whole control turns blue, the check moves and nothing stays focused. */
export const PickAutoWithMouse: Story = {
  ...captureStory({ mode: 'manual' }),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const root = canvasElement.querySelector('[data-slot="split-button"]') as HTMLElement;
    await expect(root).toHaveAttribute('data-tone', 'neutral');
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'More options' }));
    await userEvent.click(await body.findByRole('menuitemradio', { name: /^Auto/ }));
    await waitFor(() => expect(root).toHaveAttribute('data-tone', 'accent'));
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull());
    await expect(canvasElement.ownerDocument.activeElement).not.toBe(within(canvasElement).getByRole('button', { name: 'More options' }));
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'More options' }));
    await expect(await body.findByRole('menuitemradio', { name: /^Auto/ })).toHaveAttribute('aria-checked', 'true');
    await expect(body.getByRole('menuitemradio', { name: /^Manual/ })).toHaveAttribute('aria-checked', 'false');
    await userEvent.keyboard('{Escape}');
  },
};

/** Interaction: the same choice from the keyboard returns focus to the caret, with one ring around the whole control. */
export const PickAutoWithKeyboard: Story = {
  ...captureStory({ mode: 'manual' }),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const caret = within(canvasElement).getByRole('button', { name: 'More options' });
    caret.focus();
    await userEvent.keyboard('{Enter}');
    await body.findByRole('menu');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(canvasElement.querySelector('[data-slot="split-button"]')).toHaveAttribute('data-tone', 'accent'));
    await waitFor(() => expect(canvasElement.ownerDocument.activeElement).toBe(caret));
  },
};
