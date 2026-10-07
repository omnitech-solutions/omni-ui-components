import * as React from 'react';
import { ArrowUp, Check, CircleCheck, Copy, EyeOff, Mic, Pencil, RefreshCw, ThumbsDown, ThumbsUp, Wrench, Brain, CircleStop, ChevronDown, ChevronLeft, ChevronRight, Loader, FileText, Image as ImageIcon, LayoutGrid } from 'lucide-react';

import { IconButton } from '@oc-tech/omni-ui-components/IconButton';
import { Input } from '@oc-tech/omni-ui-components/Input';
import { Panel, type PanelProps } from '@oc-tech/omni-ui-components/Panel';
import { highlightLines } from '@oc-tech/omni-ui-components/Highlight';
import {
  buildTurns,
  codeBlockId,
  conversationScroll,
  Transcript,
  type ChatMessage,
  type ChatRun,
  type ConversationTurn,
  type TranscriptEntry,
  type TranscriptProps,
} from '@oc-tech/omni-ui-components/Transcript';
import { ApprovalCard } from '@oc-tech/omni-ui-components/ApprovalCard';
import { ErrorCard } from '@oc-tech/omni-ui-components/ErrorCard';
import { Markdown } from '@oc-tech/omni-ui-components/Markdown';
import { MessageActions } from '@oc-tech/omni-ui-components/MessageActions';
import { Sources } from '@oc-tech/omni-ui-components/Sources';
import { StepTimeline } from '@oc-tech/omni-ui-components/StepTimeline';
import { Suggestions } from '@oc-tech/omni-ui-components/Suggestions';
import { Thinking } from '@oc-tech/omni-ui-components/Thinking';
import { VersionPager } from '@oc-tech/omni-ui-components/VersionPager';
import { ComposerDemo } from '../Composer/Composer.factories';
import type { OnAction } from '../SplitButton/SplitButton.factories';
import type { Variant } from '../../internal/support/makeFactory';

/** Build `<Transcript>` props for standalone stories and tests (icons are nodes, so the factory supplies them). */
export const transcriptPropsFactory = (overrides: Partial<TranscriptProps> = {}): TranscriptProps => ({
  entries: [],
  copyIcon: <Copy />,
  copiedIcon: <Check />,
  ...overrides,
});

/** Board 1d, ready state: two interviewer lines around a "no question found" event chip. */
export const readyEntries = (): TranscriptEntry[] => [
  { id: 'a', kind: 'speech', speaker: 'Mic', time: '08:21', text: "Love to hear why you're interested in the role you're applying for." },
  { id: 'b', kind: 'event', icon: <EyeOff />, text: 'S1 · no question found · 08:33' },
  { id: 'c', kind: 'speech', speaker: 'Mic', time: '08:34', text: 'Just kick things off.' },
];

/** Board 1d, analysing: an interviewer line and the person's own message. */
export const analysingEntries = (): TranscriptEntry[] => [
  { id: 'a', kind: 'speech', speaker: 'Mic', time: '10:56', text: "Let's do a coding one. It's on your screen now." },
  { id: 'b', kind: 'message', text: 'Assume the input is sorted' },
];

/** Board 1d, answer ready: an "answered" event chip, then the next interviewer line. */
export const answeredEntries = (): TranscriptEntry[] => [
  { id: 'a', kind: 'event', icon: <CircleCheck />, text: 'S2 · Two Sum · answered' },
  { id: 'b', kind: 'speech', speaker: 'Mic', time: '10:58', text: 'Walk me through your approach first.' },
];

/** A merged phrase that was flagged edited, with the updated time. */
export const editedEntries = (): TranscriptEntry[] => [
  { id: 'a', kind: 'speech', speaker: 'Mic', time: '08:21', text: "Love to hear why you're interested in the role." },
  {
    id: 'b',
    kind: 'speech',
    speaker: 'Mic',
    time: '08:22',
    edited: true,
    text: "Love to hear why you're interested in the role you're applying for, and what you know about the team.",
  },
  { id: 'c', kind: 'speech', speaker: 'Interviewer', tone: 'accent', time: '08:23', interim: true, text: 'And how did you hear about' },
];

/** Own messages beside interviewer lines. */
export const userMessageEntries = (): TranscriptEntry[] => [
  { id: 'a', kind: 'speech', speaker: 'Mic', time: '10:56', text: "Let's do a coding one. It's on your screen now." },
  { id: 'b', kind: 'message', text: 'Assume the input is sorted' },
  { id: 'c', kind: 'message', text: 'Can the array hold duplicates, or are the values distinct? I want to settle that before I pick a data structure.' },
];

/** The two-sum answer as explicit blocks: your question, then a reply with prose around a TypeScript code block. */
export const codeEntries = (): TranscriptEntry[] => [
  { id: 'q', kind: 'message', text: 'Show me two sum in TypeScript' },
  {
    id: 'a',
    kind: 'speech',
    speaker: 'Assistant',
    tone: 'accent',
    time: '10:59',
    text: 'One pass with a map.\n```ts\nfunction twoSum(nums: number[], target: number) {\n  const seen = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const j = seen.get(target - nums[i]);\n    if (j !== undefined) return [j, i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n```\nO(n) time, O(n) space.',
  },
];

/** Transcript configurations in design order, as plain props, for the overview. */
export const transcriptVariants: Variant<TranscriptProps>[] = [
  { name: 'Ready (board 1d)', args: { entries: readyEntries() } },
  { name: 'Own message', args: { entries: analysingEntries() } },
  { name: 'Answered event', args: { entries: answeredEntries() } },
  { name: 'Edited and interim', args: { entries: editedEntries() } },
  { name: 'Code block (fences)', args: { entries: codeEntries(), fences: true, onCopyCode: () => undefined } },
];

// ---------------------------------------------------------------------------------------------------------------
// Demos (story and overview only): controlled state around the real Transcript, Input, IconButton and Panel.
// ---------------------------------------------------------------------------------------------------------------

export interface ComposerExampleProps {
  /** Text at the start (empty: Send is muted). */
  initialValue?: string;
  /** The mic is listening: it turns red and pressed. */
  dictating?: boolean;
  placeholder?: string;
  onAction?: OnAction;
}

const BOARD_BUTTON = 'size-[34px] rounded-[9px]';

/**
 * The composer of board 1d (M8), built only from `Input` and `IconButton`: the `panel` field with its trailing
 * `actions` slot holding a neutral mic that turns red (danger, pressed) only while dictating and a send that stays
 * muted (disabled) until the field has text. Enter sends. All state lives here; the library parts take props.
 */
export const ComposerExample: React.FC<ComposerExampleProps> = ({
  initialValue = '',
  dictating: dictatingProp = false,
  placeholder = 'Ask anything, or add context',
  onAction,
}) => {
  const [value, setValue] = React.useState(initialValue);
  const [dictating, setDictating] = React.useState(dictatingProp);
  React.useEffect(() => setDictating(dictatingProp), [dictatingProp]);
  const canSend = value.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    onAction?.('send', value.trim());
    setValue('');
  };
  const toggleDictation = () => {
    setDictating((current) => !current);
    onAction?.('mic', !dictating);
  };

  return (
    <Input
      variant="panel"
      aria-label="Message"
      placeholder={placeholder}
      value={value}
      onChange={setValue}
      onKeyDown={(event) => {
        if (event.key === 'Enter') send();
      }}
      className="h-[34px]"
      actions={
        <>
          <IconButton
            variant="ghost"
            iconSize="md"
            icon={<Mic />}
            label="Dictate"
            tone={dictating ? 'danger' : undefined}
            pressed={dictating}
            // Neutral at rest: the board's quiet tinted square, no border; the danger tone replaces it while dictating.
            className={dictating ? BOARD_BUTTON : `${BOARD_BUTTON} bg-[color:var(--oui-tone-accent-bg)]`}
            onClick={toggleDictation}
          />
          <IconButton
            variant="ghost"
            iconSize="md"
            icon={<ArrowUp />}
            label="Send"
            tone={canSend ? 'accent' : undefined}
            disabled={!canSend}
            className={BOARD_BUTTON}
            onClick={send}
          />
        </>
      }
    />
  );
};

/** Writes to the clipboard when the browser lets us; the demo marks the entry copied either way. */
const writeClipboard = (text: string) => {
  // Refused (permissions, insecure context): the copied label is still shown, the callback ran.
  navigator.clipboard?.writeText(text).catch(() => undefined);
};

export interface TranscriptPanelProps {
  entries: TranscriptEntry[];
  /** Panel surface opacity, 0-1 (`--oui-panel-see-through`). */
  seeThrough?: number;
  composer?: boolean;
  /** Id shown as already copied, to render that state without interaction. */
  copiedId?: string | null;
  onAction?: OnAction;
  panel?: Partial<PanelProps>;
  width?: number;
  height?: number;
  /** Draw fenced code in the entries' text as code blocks. */
  fences?: boolean;
  /** Wrap long code lines instead of scrolling sideways. */
  wrapCode?: boolean;
  /** Highlight code blocks with the library's lowlight highlighter. */
  highlight?: boolean;
  /** Number the lines of highlighted code. */
  codeLineNumbers?: boolean;
}

/**
 * The "Transcript & chat" panel of board 1d: the Transcript as the Panel's body and the composer as its dock.
 * Copy is wired like a host would: callback, then `copiedId` (cleared after 1.5s by this demo, not the component).
 */
export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  entries,
  seeThrough = 1,
  composer = true,
  copiedId: copiedProp = null,
  onAction,
  panel,
  width = 330,
  height = 340,
  fences = false,
  wrapCode = false,
  highlight = false,
  codeLineNumbers = false,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(copiedProp);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const copy = (entry: { id: string; text: string }) => {
    writeClipboard(entry.text);
    onAction?.('copy', entry.id);
    setCopiedId(entry.id);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopiedId(null), 1500);
  };
  const copyCode = (block: { code: string }, entry: { id: string }, index: number) => {
    writeClipboard(block.code);
    onAction?.('copy-code', codeBlockId(entry.id, index));
    setCopiedId(codeBlockId(entry.id, index));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopiedId(null), 1500);
  };
  return (
    <div
      className="box-border flex rounded-xl p-3.5"
      style={{ background: '#1a4f96', height, ['--oui-panel-see-through' as string]: seeThrough }}
    >
      <Panel
        title="Transcript & chat"
        width={width}
        minWidth={300}
        bodyPadding="sm"
        scroll={{ fade: true, thinScrollbar: true, stickToBottom: true, lines: entries.length }}
        dock={composer ? <ComposerExample onAction={onAction} /> : undefined}
        dockClassName="bg-transparent px-3 py-2.5"
        {...panel}
      >
        <Transcript
          entries={entries}
          copyIcon={<Copy />}
          copiedIcon={<Check />}
          onCopy={copy}
          onCopyCode={copyCode}
          copiedId={copiedId}
          fences={fences}
          wrapCode={wrapCode}
          highlight={highlight ? highlightLines : undefined}
          codeLineNumbers={codeLineNumbers}
        />
      </Panel>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Conversation mode (turns): messages -> buildTurns -> Transcript, with the other library parts in the slots.
// ---------------------------------------------------------------------------------------------------------------

const at = (minute: number, second = 0) => new Date(Date.UTC(2026, 9, 6, 9, minute, second)).toISOString();

/** A finished exchange with a tool call, thinking, a cited answer, sources, follow-ups, two versions of the question. */
export const chatMessages = (): ChatMessage[] => [
  {
    id: 'u1',
    role: 'user',
    createdAt: at(0),
    siblings: [{ id: 'u1' }, { id: 'u1b' }],
    parts: [
      { type: 'attachment', kind: 'file', id: 'att-1', name: 'two-sum-notes.md' },
      { type: 'text', text: 'Explain two sum in TypeScript and why a hash map beats the nested loop.' },
    ],
  },
  { id: 'a1', role: 'assistant', createdAt: at(0, 2), parts: [{ type: 'tool-call', id: 'call-1', name: 'searchEvidence', input: { query: 'two sum' } }] },
  { id: 't1', role: 'tool', createdAt: at(0, 3), parts: [{ type: 'tool-result', id: 'call-1', output: { passages: 3 } }] },
  {
    id: 'a2',
    role: 'assistant',
    createdAt: at(0, 9),
    siblings: [{ id: 'a2' }, { id: 'a2b' }],
    parts: [
      { type: 'reasoning', text: 'The hash map stores each value with its index, so each lookup is O(1).', seconds: 4 },
      {
        type: 'text',
        text: 'Keep a **map** of value to index and look up the complement as you scan [1].\n\n```ts\nfunction twoSum(nums: number[], target: number) {\n  const seen = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const j = seen.get(target - nums[i]);\n    if (j !== undefined) return [j, i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n```\n\nTime is **O(n)** and space is **O(n)**.',
      },
      { type: 'sources', items: [{ n: 1, id: 'src-1', title: 'Two Sum, the hash map pass', meta: 'two-sum-notes.md', quote: 'Store each number with its index and check target - n before inserting it.' }] },
      { type: 'suggestions', items: ['What if the input is sorted?', 'Show the two pointer version'] },
      { type: 'usage', usage: { total: 1280 } },
    ],
  },
  { id: 'u2', role: 'user', createdAt: at(1), parts: [{ type: 'text', text: 'What changes if the array holds duplicates?' }] },
];

/** The second answer, finished (used for the fully answered conversation). */
const secondAnswer = (): ChatMessage => ({
  id: 'a3',
  role: 'assistant',
  createdAt: at(1, 6),
  parts: [{ type: 'text', text: 'Nothing: the map keeps the **latest** index for a value, and the complement check runs before the insert, so `[3, 3]` with target `6` still returns `[0, 1]`.' }],
});

export const chatRuns = (): ChatRun[] => [
  { id: 'r1', userMessageId: 'u1', status: 'completed' },
  { id: 'r2', userMessageId: 'u2', status: 'completed' },
];

/** The answered conversation as turns. */
/** A long history of `count` finished turns (a question and a short answer each), for windowing demos and tests. */
export const longHistoryTurns = (count = 3000): ConversationTurn[] =>
  buildTurns(
    Array.from({ length: count }, (_, n): ChatMessage[] => [
      { id: `lu${n}`, role: 'user', createdAt: '2026-10-06T09:00:00Z', parts: [{ type: 'text', text: `Question ${n + 1}: how does case ${n + 1} behave?` }] },
      { id: `la${n}`, role: 'assistant', createdAt: '2026-10-06T09:00:05Z', parts: [{ type: 'text', text: `Answer ${n + 1}: a short reply for case ${n + 1}.` }] },
    ]).flat(),
    [],
  );

export const answeredTurns = (): ConversationTurn[] => buildTurns([...chatMessages(), secondAnswer()], chatRuns());
/** The same conversation with the last question still waiting for its answer (streams when `busy`). */
export const streamingTurns = (): ConversationTurn[] => buildTurns(chatMessages(), [chatRuns()[0], { id: 'r2', userMessageId: 'u2', status: 'running' }]);
/** The last run failed: the error slot shows. */
export const failedTurns = (): ConversationTurn[] =>
  buildTurns(chatMessages(), [chatRuns()[0], { id: 'r2', userMessageId: 'u2', status: 'failed', error: { code: 'model-unavailable', message: 'The model did not answer in time.' } }]);
/** The last run was cancelled. */
export const stoppedTurns = (): ConversationTurn[] => buildTurns([...chatMessages(), { ...secondAnswer(), status: 'partial' }], [chatRuns()[0], { id: 'r2', userMessageId: 'u2', status: 'cancelled' }]);

const kindIcons = { file: <FileText />, image: <ImageIcon />, surface: <LayoutGrid /> };

export interface ConversationDemoProps {
  turns?: ConversationTurn[];
  /** A reply is running; the last turn streams `liveText` word by word. */
  busy?: boolean;
  waiting?: boolean;
  liveText?: string;
  /** Show the composer dock. Default true. */
  composer?: boolean;
  readOnly?: boolean;
  hasEarlier?: boolean;
  /** Draw only the newest N turns (`windowSize`). */
  windowSize?: number;
  windowStep?: number;
  empty?: boolean;
  /** Start editing this turn's question. */
  editingId?: string | null;
  seeThrough?: number;
  width?: number;
  height?: number;
  /** Add a pending approval after the last turn. */
  approval?: boolean;
  onAction?: OnAction;
}

const LIVE_TEXT = 'Duplicates are fine: the map keeps the latest index for a value, and the complement check runs before the insert.';

/**
 * A whole chat: `Panel` + conversation `Transcript` + `ComposerDemo` dock. The parts built elsewhere plug into the
 * Transcript's slots (Markdown through `renderMarkdown`, StepTimeline, Thinking, Sources, MessageActions, VersionPager,
 * Suggestions, ErrorCard, ApprovalCard). All state (edit, copy, streaming text) lives here; the library parts take props.
 */
export const ConversationDemo: React.FC<ConversationDemoProps> = ({
  turns = answeredTurns(),
  busy = false,
  waiting = false,
  liveText,
  composer = true,
  readOnly = false,
  hasEarlier = false,
  windowSize,
  windowStep,
  empty = false,
  editingId: editingProp = null,
  seeThrough = 1,
  width = 440,
  height = 620,
  approval = false,
  onAction,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(editingProp);
  const [editValue, setEditValue] = React.useState('');
  const [copied, setCopied] = React.useState<string | null>(null);
  const [live, setLive] = React.useState('');
  const [version, setVersion] = React.useState<Record<string, number>>({});
  const [sent, setSent] = React.useState<'up' | 'down' | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  React.useEffect(() => setEditingId(editingProp), [editingProp]);
  React.useEffect(() => {
    if (editingProp) {
      const turn = turns.find((candidate) => candidate.id === editingProp);
      if (turn) setEditValue(turn.user.parts.flatMap((part) => (part.type === 'text' ? [part.text] : [])).join('\n'));
    }
  }, [editingProp, turns]);

  // A stand-in stream: one word every 120ms of the live text.
  const target = liveText ?? LIVE_TEXT;
  React.useEffect(() => {
    if (!busy) return setLive('');
    const words = target.split(' ');
    let n = 0;
    const id = setInterval(() => {
      n = Math.min(words.length, n + 1);
      setLive(words.slice(0, n).join(' '));
      if (n >= words.length) clearInterval(id);
    }, 120);
    return () => clearInterval(id);
  }, [busy, target]);

  const copy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text).catch(() => undefined);
    setCopied(id);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1500);
  };
  const promptOfTurn = (turn: ConversationTurn) => turn.user.parts.flatMap((part) => (part.type === 'text' ? [part.text] : [])).join('\n');

  const pager = (message: ChatMessage | undefined) => {
    const siblings = message?.siblings ?? [];
    if (!message || siblings.length < 2) return null;
    const index = version[message.id] ?? siblings.findIndex((candidate) => candidate.id === message.id);
    return (
      <VersionPager
        index={index}
        count={siblings.length}
        disabled={busy}
        previousIcon={<ChevronLeft />}
        nextIcon={<ChevronRight />}
        onMove={(step) => {
          setVersion((all) => ({ ...all, [message.id]: index + step }));
          onAction?.('version', step);
        }}
      />
    );
  };

  return (
    <div className="box-border flex rounded-xl p-3.5" style={{ background: '#1a4f96', height, ['--oui-panel-see-through' as string]: seeThrough }}>
      <Panel
        title="Chat"
        width={width}
        minWidth={320}
        bodyPadding="sm"
        scroll={conversationScroll(turns, live)}
        dock={composer ? <ComposerDemo streaming={busy} onAction={onAction} /> : undefined}
        dockClassName="bg-transparent px-3 py-2.5"
      >
        <Transcript
          turns={empty ? [] : turns}
          busy={busy}
          waiting={waiting}
          live={busy ? { text: live, reasoning: 'Comparing the nested loop with a map lookup…' } : undefined}
          hasEarlier={hasEarlier}
          windowSize={windowSize}
          windowStep={windowStep}
          onLoadEarlier={(oldest) => onAction?.('load-earlier', oldest?.id)}
          readOnly={readOnly}
          empty={<div className="py-10 text-center text-sm text-[color:var(--oui-panel-meta-fg)]">What are we working on?</div>}
          copyIcon={<Copy />}
          editIcon={<Pencil />}
          stoppedIcon={<CircleStop />}
          attachmentIcons={kindIcons}
          editingId={editingId}
          editValue={editValue}
          onEditChange={setEditValue}
          onEditStart={(turn) => {
            setEditValue(promptOfTurn(turn));
            setEditingId(turn.id);
            onAction?.('edit-start', turn.id);
          }}
          onEditSubmit={(turn, text) => {
            onAction?.('edit-submit', { id: turn.id, text });
            setEditingId(null);
          }}
          onEditCancel={(turn) => {
            setEditingId(null);
            onAction?.('edit-cancel', turn.id);
          }}
          onRetry={(turn) => onAction?.('retry', turn.id)}
          onRegenerate={(turn) => onAction?.('regenerate', turn.id)}
          onSelectVersion={(turn, version) => onAction?.('select-version', { turn: turn.id, version: version.id })}
          onAttachmentClick={(attachment) => onAction?.('attachment', attachment.id)}
          onCopyUser={(turn) => copy(promptOfTurn(turn), `u-${turn.id}`)}
          renderMarkdown={(text, context) => (
            <Markdown
              text={text}
              streaming={context.streaming}
              citations={context.running ? [] : [1]}
              copyIcon={<Copy />}
              copiedIcon={<Check />}
              copiedCode={copied}
              onCopy={(code) => copy(code, code)}
              highlight={highlightLines}
            />
          )}
          slots={{
            timeline: (turn, context) =>
              turn.answer && turn.answer.steps.length > 0 ? (
                <StepTimeline
                  steps={turn.answer.steps.map((step) => ({
                    id: step.id,
                    icon: <Wrench />,
                    label: 'Searched evidence',
                    activeLabel: 'Searching evidence',
                    detail: step.done ? '3 passages' : undefined,
                    state: step.failed ? 'failed' : step.done ? 'done' : 'running',
                  }))}
                  status={context.waiting ? 'waiting' : context.running ? 'running' : context.stopped ? 'stopped' : 'done'}
                  seconds={turn.answer.seconds}
                  icons={{ done: <Check />, chevron: <ChevronDown />, spinner: <Loader /> }}
                />
              ) : null,
            thinking: (turn, context) =>
              turn.answer?.reasoning || context.liveReasoning ? (
                <Thinking
                  text={context.liveReasoning ?? turn.answer?.reasoning?.text}
                  streaming={context.running && !context.text}
                  seconds={turn.answer?.reasoning?.seconds}
                  icon={<Brain />}
                  spinner={<Loader />}
                  chevron={<ChevronDown />}
                />
              ) : null,
            sources: (turn) => (turn.answer?.sources.length ? <Sources items={turn.answer.sources} cardIcon={<FileText />} /> : null),
            actions: (turn, context) => (
              <MessageActions
                meta={turn.answer?.usage ? 'Sonnet · 1.3k tokens' : undefined}
                actions={[
                  { id: 'copy', icon: copied === turn.id ? <Check /> : <Copy />, label: copied === turn.id ? 'Copied' : 'Copy', onClick: () => copy(turn.answer?.text ?? '', turn.id) },
                  ...(context.regenerate ? [{ id: 'regen', icon: <RefreshCw />, label: 'Regenerate', disabled: context.running, onClick: context.regenerate }] : []),
                  ...(turn.answer?.final?.siblings && turn.answer.final.siblings.length > 1 ? [{ id: 'versions', node: pager(turn.answer.final) }] : []),
                  { id: 'up', icon: <ThumbsUp />, label: 'Good answer', pressed: sent === 'up', onClick: () => setSent('up') },
                  { id: 'down', icon: <ThumbsDown />, label: 'Bad answer', pressed: sent === 'down', onClick: () => setSent('down') },
                ]}
              />
            ),
            suggestions: (turn) => (turn.answer?.suggestions.length ? <Suggestions items={turn.answer.suggestions.map((label) => ({ id: label, label }))} onSelect={(item) => onAction?.('suggestion', item.label)} /> : null),
            approvalsAfter: (_turn, context) =>
              approval && context.last ? (
                <ApprovalCard title="Allow the assistant to run the tests?" tool="runTests" tags={['runTests', 'sandbox']} status="pending" onDecide={(decision) => onAction?.('approval', decision)} />
              ) : null,
            error: (turn, context) => (
              <ErrorCard
                title="Couldn’t reach the model"
                message={turn.run?.error?.message}
                note="Your message is saved and nothing has been applied."
                onRetry={context.retry}
              />
            ),
          }}
        />
      </Panel>
    </div>
  );
};

/** Conversation configurations for the overview. */
export const conversationVariants: Variant<TranscriptProps>[] = [
  { name: 'Conversation (turns)', args: { turns: answeredTurns(), copyIcon: <Copy /> } },
  { name: 'Streaming', args: { turns: streamingTurns(), busy: true, live: { text: 'Duplicates are fine: the map keeps the latest index' } } },
  { name: 'Read only', args: { turns: answeredTurns(), readOnly: true } },
];
