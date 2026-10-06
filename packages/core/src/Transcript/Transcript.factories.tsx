import * as React from 'react';
import { ArrowUp, Check, CircleCheck, Copy, EyeOff, Mic } from 'lucide-react';

import { IconButton } from '@oc-tech/omni-ui-components/IconButton';
import { Input } from '@oc-tech/omni-ui-components/Input';
import { Panel, type PanelProps } from '@oc-tech/omni-ui-components/Panel';
import { highlightLines } from '@oc-tech/omni-ui-components/Highlight';
import { codeBlockId, Transcript, type TranscriptEntry, type TranscriptProps } from '@oc-tech/omni-ui-components/Transcript';
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
