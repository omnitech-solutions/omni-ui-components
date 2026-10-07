import { Button } from '@oc-tech/omni-ui-components/Button';
import { Panel, type PanelProps, type PanelScroll } from '@oc-tech/omni-ui-components/Panel';
import { Steps } from '@oc-tech/omni-ui-components/Steps';
import { Tag } from '@oc-tech/omni-ui-components/Tag';
import { Transcript, type TranscriptEntry } from '@oc-tech/omni-ui-components/Transcript';
import {
  analysingEntries,
  answeredEntries,
  ComposerExample,
  readyEntries,
} from 'factories/omni-ui-components/Transcript/Transcript.factories';
import { Check, Code, Copy, Hourglass, MonitorUp, Plus } from 'lucide-react';
import * as React from 'react';
import type { Variant } from '../../internal/support/makeFactory';
import type { OnAction } from '../SplitButton/SplitButton.factories';

/** Build `<Panel>` props for standalone stories and tests. */
export const panelPropsFactory = (overrides: Partial<PanelProps> = {}): PanelProps => ({
  title: 'Answer',
  ...overrides,
});

const CAPTURE_SHORTCUT = ['⌘', '⇧', 'S'];

/** A filled circle with a cut-out square: the board's filled stop glyph (a plain fill of lucide's stop-circle would hide the square). */
const StopGlyph: React.FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <rect x="9" y="9" width="6" height="6" rx="1" fill="var(--oui-panel-bg)" />
  </svg>
);

/** The Stop button of the Answer header (board 1d, analysing): outlined, filled stop icon, shortcut. */
export const StopAction: React.FC<{ onStop?: () => void }> = ({ onStop }) => (
  <Button
    buttonSize="sm"
    variant="outline"
    tone="neutral"
    soft
    icon={<StopGlyph />}
    shortcut={CAPTURE_SHORTCUT}
    className="h-7 rounded-lg px-2.5 text-[12.5px]"
    onClick={onStop}
  >
    Stop
  </Button>
);

/** The "To apply" dock of the Answer panel (board 1d, analysing): count, thumbnail, Add screenshot, Clear, Apply. */
export const ToApplyDock: React.FC<{
  onAdd?: () => void;
  onClear?: () => void;
  onApply?: () => void;
}> = ({ onAdd, onClear, onApply }) => (
  <>
    <span className="text-[12.5px] font-medium whitespace-nowrap">To apply · 1</span>
    <span
      aria-hidden="true"
      data-slot="dock-thumbnail"
      className="h-8 w-12 rounded-md border border-solid border-[color:var(--oui-tone-neutral-border)] bg-[color:var(--oui-tone-accent-bg)]"
    />
    <Button
      buttonSize="sm"
      variant="outline"
      icon={<Plus />}
      className="h-7 rounded-[7px] border-dashed bg-transparent px-2 text-[12.5px]"
      onClick={onAdd}
    >
      Add screenshot
    </Button>
    <Button
      buttonSize="sm"
      variant="ghost"
      className="ml-auto h-7 px-1.5 text-[12.5px] text-[color:var(--oui-panel-meta-fg)]"
      onClick={onClear}
    >
      Clear
    </Button>
    <Button
      buttonSize="sm"
      tone="accent"
      className="h-7 rounded-[7px] px-2.5 text-[12.5px]"
      onClick={onApply}
    >
      Apply
    </Button>
  </>
);

export const analysingSteps = () => [
  { key: 'captured', label: 'Captured the screen', state: 'done' as const },
  { key: 'reading', label: 'Reading the problem', state: 'current' as const },
  { key: 'drafting', label: 'Drafting an answer', state: 'pending' as const },
];

/** Complexity chips for the meta slot of an answer that is ready. */
export const ComplexityChips: React.FC = () => (
  <>
    <Tag mono variant="filled">
      O(n) time
    </Tag>
    <Tag mono variant="filled">
      O(n) space
    </Tag>
  </>
);

const Heading: React.FC<React.PropsWithChildren> = ({ children }) => (
  <span className="mt-1 text-xs tracking-[0.05em] text-[color:var(--oui-panel-meta-fg)] uppercase first:mt-0">
    {children}
  </span>
);

/** The reading body of a ready answer. */
export const AnswerBody: React.FC = () => (
  <>
    <Heading>Say this first</Heading>
    <span>
      "I'll scan once and keep a hash map from value to index, so each lookup for the complement is
      constant time."
    </span>
    <Heading>Approach</Heading>
    <span>
      1. For each number, compute target − n.
      <br />
      2. If it's in the map, return both indices.
      <br />
      3. Otherwise store n → i and continue.
    </span>
  </>
);

/** Panel configurations of board 1d, in design order, as plain props. */
export const panelVariants: Variant<PanelProps>[] = [
  {
    name: 'Answer · nothing analysed',
    args: {
      title: 'Answer',
      meta: 'Last capture 08:33 · no question found',
      empty: {
        icon: <MonitorUp />,
        title: 'Nothing analysed yet',
        description:
          'Open the problem in your browser and capture it. Spoken questions are answered automatically.',
        action: {
          label: 'Capture screen',
          icon: <MonitorUp />,
          shortcut: CAPTURE_SHORTCUT,
          onClick: () => undefined,
        },
      },
    },
  },
  {
    name: 'Code · waiting',
    args: {
      title: 'Code',
      empty: {
        icon: <Hourglass />,
        description: 'Starts automatically after the approach.',
      },
    },
  },
  {
    name: 'Answer · analysing (Stop + dock)',
    args: {
      title: 'Answer',
      subtitle: 'S2 · 10:57',
      actions: <StopAction />,
      dock: <ToApplyDock />,
      dockClassName: 'gap-x-1.5 px-2',
      bodyPadding: 'md',
      bodyClassName: 'justify-center px-7',
      children: <Steps variant="checklist" items={analysingSteps()} />,
    },
  },
  {
    name: 'Answer · ready (meta chips)',
    args: {
      title: 'Answer',
      subtitle: 'S2 · Two Sum',
      meta: <ComplexityChips />,
      bodyPadding: 'md',
      bodyClassName: 'gap-2.5 text-sm leading-[1.55]',
      children: <AnswerBody />,
    },
  },
  {
    name: 'Code · empty',
    args: {
      title: 'Code',
      empty: {
        icon: <Code />,
        description: 'Code appears once the approach is drafted.',
      },
    },
  },
];

// ---------------------------------------------------------------------------------------------------------------
// Demos (story and overview only): controlled state around the Panel, all from library parts.
// ---------------------------------------------------------------------------------------------------------------

/** The designer gallery's blue backdrop behind the panels (story-only chrome). */
export const PANEL_BACKDROP = '#1a4f96';

const SAMPLE_LINES = [
  "Love to hear why you're interested in the role you're applying for.",
  'Just kick things off.',
  "Let's do a coding one. It's on your screen now.",
  'Assume the input is sorted.',
  'Walk me through your approach first.',
  'What is the time complexity?',
  'Could the array hold duplicates?',
  'How would this change for a stream of numbers?',
  'Can you walk through an example by hand?',
  'Which edge cases would you test first?',
];

/** `n` sample entries, alternating the interviewer (Mic) and the candidate (own message). */
export const sampleMessages = (count: number, from = 0): TranscriptEntry[] =>
  Array.from({ length: count }, (_, index): TranscriptEntry => {
    const id = from + index;
    const text = SAMPLE_LINES[id % SAMPLE_LINES.length];
    if (id % 4 === 3) return { id: String(id), kind: 'message', text };
    return {
      id: String(id),
      kind: 'speech',
      speaker: 'Mic',
      time: `08:${String((21 + id) % 60).padStart(2, '0')}`,
      text,
    };
  });

export interface TranscriptDemoProps {
  /** Messages present at the start. */
  initial?: number;
  scroll?: PanelScroll;
  width?: number;
  height?: number;
  /** Reports "message:add", "jump" and the composer controls. Storybook wires it to the Actions panel. */
  onAction?: OnAction;
}

/**
 * A transcript-style scrolling Panel with a controlled message list. "New message arrives" appends one,
 * which is what the stick-to-bottom behaviour reacts to (follow while at the end; pill and count while scrolled up).
 */
export const TranscriptDemo: React.FC<TranscriptDemoProps> = ({
  initial = 12,
  scroll = { fade: true, thinScrollbar: true, stickToBottom: true },
  width = 330,
  height = 340,
  onAction,
}) => {
  const [messages, setMessages] = React.useState(() => sampleMessages(initial));
  const nextId = React.useRef(initial);
  const add = (count = 1) => {
    setMessages((current) => [...current, ...sampleMessages(count, nextId.current)]);
    nextId.current += count;
    onAction?.('message:add', count);
  };
  return (
    <div className="flex flex-col items-start gap-2.5">
      <div className="flex gap-2">
        <Button buttonSize="sm" variant="outline" data-testid="add-message" onClick={() => add(1)}>
          New message arrives
        </Button>
        <Button buttonSize="sm" variant="outline" data-testid="add-messages" onClick={() => add(3)}>
          3 arrive
        </Button>
      </div>
      <div
        className="box-border flex rounded-xl p-3.5"
        style={{ background: PANEL_BACKDROP, height }}
      >
        <Panel
          title="Transcript & chat"
          width={width}
          minWidth={300}
          bodyPadding="sm"
          scroll={{
            ...scroll,
            lines: messages.length,
            onJumpToLatest: () => onAction?.('jump'),
          }}
          dock={<ComposerExample onAction={onAction} />}
          dockClassName="bg-transparent px-3 py-2.5"
        >
          <Transcript entries={messages} copyIcon={<Copy />} copiedIcon={<Check />} />
        </Panel>
      </div>
    </div>
  );
};

/**
 * Header meta that never crops: the full text when the panel is wide enough (container query on the panel),
 * the part before the first dot otherwise. The full text is always the hover title.
 */
const AnswerMeta: React.FC<{ text: string }> = ({ text }) => (
  <span title={text} data-testid="answer-meta">
    <span className="hidden @[340px]:inline">{text}</span>
    <span className="@[340px]:hidden">{text.split(' · ')[0]}</span>
  </span>
);

export type NativePanelsState = 'ready' | 'analysing' | 'answer';

export type NativePanelId = 'chat' | 'answer' | 'code';
export type NativePanelsVisible = Record<NativePanelId, boolean>;

export interface NativePanelsDemoProps {
  /** What the Answer and Code panels show. `answer` without `visible` also hides Code (the board's third state). */
  state?: NativePanelsState;
  /** Which panels are on. The last visible one cannot be turned off (an all-false value keeps Chat). */
  visible?: Partial<NativePanelsVisible>;
  /** Panel surface opacity, 0-1 (the `--oui-panel-see-through` token). Text and icons stay opaque. */
  seeThrough?: number;
  /** Width of the row in px (the window width the panels have to fit). */
  width?: number;
  onAction?: OnAction;
}

const TRANSCRIPT = {
  ready: readyEntries,
  analysing: analysingEntries,
  answer: answeredEntries,
};

/**
 * The three panels of board 1d in a row: transcript 330px (min 300), the others share the rest equally.
 * All content is passed to the library Panel as configuration; the row is a plain flex container.
 */
export const NativePanelsDemo: React.FC<NativePanelsDemoProps> = ({
  state = 'ready',
  visible,
  seeThrough = 1,
  width = 1180,
  onAction,
}) => {
  const act = (name: string) => () => onAction?.(name);
  const transcript = TRANSCRIPT[state]();
  const shown: NativePanelsVisible = {
    chat: true,
    answer: true,
    code: state !== 'answer',
    ...visible,
  };
  if (!shown.chat && !shown.answer && !shown.code) shown.chat = true;
  const count = Number(shown.chat) + Number(shown.answer) + Number(shown.code);
  return (
    <div
      data-testid="native-panels"
      className="box-border flex gap-2.5 rounded-xl p-3.5"
      style={{
        background: PANEL_BACKDROP,
        width,
        height: state === 'answer' ? 320 : 340,
        ['--oui-panel-see-through' as string]: seeThrough,
      }}
    >
      {shown.chat ? (
        <Panel
          title="Transcript & chat"
          width={count === 1 ? undefined : 330}
          minWidth={count === 1 ? undefined : 300}
          bodyPadding="sm"
          scroll={{
            fade: state === 'analysing',
            thinScrollbar: true,
            stickToBottom: true,
            lines: transcript.length,
          }}
          dock={<ComposerExample onAction={onAction} />}
          dockClassName="bg-transparent px-3 py-2.5"
        >
          <Transcript entries={transcript} copyIcon={<Copy />} copiedIcon={<Check />} />
        </Panel>
      ) : null}
      {shown.answer && state === 'ready' ? (
        <Panel
          {...panelVariants[0].args}
          title="Answer"
          className="@container"
          meta={<AnswerMeta text={String(panelVariants[0].args.meta)} />}
          empty={{
            ...panelVariants[0].args.empty,
            action: {
              label: 'Capture screen',
              icon: <MonitorUp />,
              shortcut: CAPTURE_SHORTCUT,
              onClick: act('capture'),
            },
          }}
        />
      ) : null}
      {shown.answer && state === 'analysing' ? (
        <Panel
          title="Answer"
          subtitle="S2 · 10:57"
          actions={<StopAction onStop={act('stop')} />}
          dock={
            <ToApplyDock
              onAdd={act('add-screenshot')}
              onClear={act('clear')}
              onApply={act('apply')}
            />
          }
          dockClassName="gap-x-1.5 px-2"
          bodyPadding="md"
          bodyClassName="justify-center px-7"
        >
          <Steps variant="checklist" items={analysingSteps()} />
        </Panel>
      ) : null}
      {shown.answer && state === 'answer' ? (
        <Panel
          title="Answer"
          subtitle="S2 · Two Sum"
          meta={<ComplexityChips />}
          bodyPadding="md"
          bodyClassName="gap-2.5 text-sm leading-[1.55]"
        >
          <AnswerBody />
        </Panel>
      ) : null}
      {shown.code ? (
        <Panel
          {...(state === 'ready' ? panelVariants[4].args : panelVariants[1].args)}
          title="Code"
        />
      ) : null}
    </div>
  );
};
