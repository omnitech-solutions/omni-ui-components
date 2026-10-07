import { ApprovalCard, type ApprovalStatus } from '@oc-tech/omni-ui-components/ApprovalCard';
import { ErrorCard } from '@oc-tech/omni-ui-components/ErrorCard';
import { FeedbackPanel } from '@oc-tech/omni-ui-components/FeedbackPanel';
import { highlightLines } from '@oc-tech/omni-ui-components/Highlight';
import { Markdown, type MarkdownProps } from '@oc-tech/omni-ui-components/Markdown';
import { MessageActions } from '@oc-tech/omni-ui-components/MessageActions';
import { Sources } from '@oc-tech/omni-ui-components/Sources';
import { StepTimeline } from '@oc-tech/omni-ui-components/StepTimeline';
import { Suggestions } from '@oc-tech/omni-ui-components/Suggestions';
import { SummaryDivider } from '@oc-tech/omni-ui-components/SummaryDivider';
import { Thinking } from '@oc-tech/omni-ui-components/Thinking';
import { VersionPager } from '@oc-tech/omni-ui-components/VersionPager';
import {
  Brain,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleStop,
  Copy,
  CornerDownRight,
  FileText,
  ListCollapse,
  RefreshCw,
  Shield,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  X,
} from 'lucide-react';
import * as React from 'react';
import type { Variant } from '../../internal/support/makeFactory';
import { SAMPLE_REASONS } from '../FeedbackPanel/FeedbackPanel.factories';
import { sampleSources } from '../Sources/Sources.factories';
import { doneSteps, runningSteps } from '../StepTimeline/StepTimeline.factories';
import { SAMPLE_REASONING } from '../Thinking/Thinking.factories';

/** A reply with headings, emphasis, a list, a table, a link, inline code, a TypeScript block and citations `[1]` `[2]`. */
export const SAMPLE_REPLY = [
  '## Two Sum',
  'Use a **hash map** from value to index, so one pass finds the pair `target - x` [1].',
  '',
  '- Walk the array once',
  '- Look up the complement before storing the current value',
  '- Return the two indices',
  '',
  '```ts',
  'export function twoSum(nums: number[], target: number): [number, number] | null {',
  "  // [STRATEGY] Remember each value's index; the complement is a lookup.",
  '  const seen = new Map<number, number>();',
  '  for (const [index, value] of nums.entries()) {',
  '    const at = seen.get(target - value);',
  '    if (at !== undefined) return [at, index];',
  '    seen.set(value, index);',
  '  }',
  '  return null;',
  '}',
  '```',
  '',
  '| Approach | Time | Space |',
  '| --- | --- | --- |',
  '| Brute force | O(n²) | O(1) |',
  '| Hash map | O(n) | O(n) |',
  '',
  'See the [MDN Map docs](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map) [2]. An invented citation like [9] stays text.',
].join('\n');

/** Build `<Markdown>` props for standalone stories and tests (icons are nodes, so the factory supplies them). */
export const markdownPropsFactory = (overrides: Partial<MarkdownProps> = {}): MarkdownProps => ({
  text: SAMPLE_REPLY,
  highlight: highlightLines,
  citations: [1, 2],
  onCite: () => undefined,
  copyIcon: <Copy />,
  copiedIcon: <Check />,
  ...overrides,
});

export type OnMarkdownAction = (name: string, detail?: unknown) => void;

export interface MarkdownDemoProps extends Partial<MarkdownProps> {
  onAction?: OnMarkdownAction;
}

/** Markdown with working copy feedback and a reporting `onCite`. */
export const MarkdownDemo: React.FC<MarkdownDemoProps> = ({ onAction, ...props }) => {
  const [copied, setCopied] = React.useState<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div className="max-w-[640px] rounded-xl border border-solid border-[color:var(--oui-panel-border)] bg-[color:var(--oui-panel-bg)] p-4 text-[color:var(--oui-tone-neutral-fg)]">
      <Markdown
        {...markdownPropsFactory(props)}
        copiedCode={copied}
        onCite={(source) => onAction?.('cite', source.n)}
        onCopy={(code, language) => {
          onAction?.('copy', { code, language });
          void navigator.clipboard?.writeText(code)?.catch(() => undefined);
          setCopied(code);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(null), 1500);
        }}
      />
    </div>
  );
};

export const markdownVariants: Variant<MarkdownDemoProps>[] = [
  { name: 'Full reply with code and citations', args: {} },
  {
    name: 'Streaming, open fence closed for display',
    args: {
      streaming: true,
      text: 'Try this:\n\n```ts\nconst seen = new Map<number, number>();\nfor (const value of',
    },
  },
  {
    name: 'Line numbers, wrapped',
    args: { codeLineNumbers: true, wrapCode: true },
  },
];

/** ---- Showcase: a full assistant reply composed only from the message-part components ---- */

export interface ChatReplyShowcaseProps {
  /** `done` is the finished reply; `streaming` shows the thinking spinner, running steps and a cursor. */
  phase?: 'done' | 'streaming';
  /** Steps variant. */
  timeline?: 'summary' | 'rail';
  onAction?: OnMarkdownAction;
}

/**
 * A whole assistant turn from the library's message parts only: summary divider, your message is out of scope
 * (Transcript), then thinking, steps, markdown with code and citations, sources, an approval, actions with a
 * version pager, the feedback panel (thumbs down) and follow-ups. A citation pill opens its source.
 */
export const ChatReplyShowcase: React.FC<ChatReplyShowcaseProps> = ({
  phase = 'done',
  timeline = 'summary',
  onAction,
}) => {
  const streaming = phase === 'streaming';
  const [openSource, setOpenSource] = React.useState<number | null>(null);
  const [rating, setRating] = React.useState<'up' | 'down' | null>(null);
  const [feedback, setFeedback] = React.useState(false);
  const [reasonIds, setReasonIds] = React.useState<string[]>([]);
  const [version, setVersion] = React.useState(1);
  const [speaking, setSpeaking] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [approval, setApproval] = React.useState<ApprovalStatus>('pending');
  const text = streaming
    ? SAMPLE_REPLY.slice(0, SAMPLE_REPLY.indexOf('return null;') + 4)
    : SAMPLE_REPLY;

  return (
    <div className="flex max-w-[680px] flex-col gap-3 rounded-xl border border-solid border-[color:var(--oui-panel-border)] bg-[color:var(--oui-panel-bg)] p-4 text-[color:var(--oui-tone-neutral-fg)]">
      <SummaryDivider
        count={6}
        text="You asked for a Two Sum solution and agreed on a hash map."
        icon={<ListCollapse />}
        chevron={<ChevronDown />}
      />
      <StepTimeline
        variant={timeline}
        steps={streaming ? runningSteps() : doneSteps()}
        seconds={4.2}
        icons={{ done: <Check />, chevron: <ChevronDown /> }}
      />
      <Thinking
        streaming={streaming}
        seconds={4}
        text={SAMPLE_REASONING}
        icon={<Brain />}
        chevron={<ChevronDown />}
      />
      <Markdown
        text={text}
        streaming={streaming}
        highlight={highlightLines}
        sources={sampleSources()}
        onCite={(source) => setOpenSource((current) => (current === source.n ? null : source.n))}
        copyIcon={<Copy />}
        copiedIcon={<Check />}
        onCopy={(code) => {
          onAction?.('copy', code);
          setCopied(code);
        }}
        copiedCode={copied}
      />
      {streaming ? null : (
        <>
          <Sources
            items={sampleSources().slice(0, 2)}
            openN={openSource}
            onToggle={(source, open) => setOpenSource(open ? source.n : null)}
            cardIcon={<FileText />}
            closeIcon={<X />}
          />
          <ApprovalCard
            title="Save this solution to your notes?"
            description="The assistant wants to write to the Notes surface."
            tool="writeNotes"
            tags={['writeNotes', 'Notes']}
            status={approval}
            icons={{ badge: <Shield /> }}
            onDecide={(decision) => {
              onAction?.('approval', decision);
              setApproval(decision === 'deny' ? 'denied' : decision);
            }}
          />
          <MessageActions
            actions={[
              {
                id: 'copy',
                icon: <Copy />,
                label: 'Copy',
                onClick: () => onAction?.('copy-reply'),
              },
              {
                id: 'regenerate',
                icon: <RefreshCw />,
                label: 'Regenerate',
                onClick: () => onAction?.('regenerate'),
              },
              {
                id: 'pager',
                node: (
                  <VersionPager
                    index={version}
                    count={3}
                    previousIcon={<ChevronLeft />}
                    nextIcon={<ChevronRight />}
                    onMove={(step) => setVersion((current) => current + step)}
                  />
                ),
              },
              {
                id: 'up',
                icon: <ThumbsUp />,
                label: 'Good reply',
                pressed: rating === 'up',
                onClick: () => {
                  setFeedback(false);
                  setRating((current) => (current === 'up' ? null : 'up'));
                },
              },
              {
                id: 'down',
                icon: <ThumbsDown />,
                label: 'Bad reply',
                pressed: rating === 'down',
                onClick: () => {
                  const on = rating !== 'down';
                  setRating(on ? 'down' : null);
                  setFeedback(on);
                },
              },
              {
                id: 'speak',
                icon: <Volume2 />,
                label: speaking ? 'Stop reading' : 'Read aloud',
                pressed: speaking,
                onClick: () => setSpeaking((current) => !current),
              },
            ]}
            meta="Claude · 842 tokens"
          />
          {feedback ? (
            <FeedbackPanel
              reasons={SAMPLE_REASONS}
              selected={reasonIds}
              onSelectedChange={(chosen) => setReasonIds(chosen.map((reason) => reason.id))}
              onCancel={() => setFeedback(false)}
              onSubmit={(feedback) => {
                onAction?.('feedback', feedback);
                setFeedback(false);
              }}
            />
          ) : null}
          <Suggestions
            items={[
              { id: 'test', label: 'Show me a test for it' },
              { id: 'sorted', label: 'What if the array is sorted?' },
            ]}
            icon={<CornerDownRight />}
            onSelect={(suggestion) => onAction?.('follow-up', suggestion.label)}
          />
          <ErrorCard
            variant="stopped"
            icon={<CircleStop />}
            title="Stopped. Nothing has been applied."
          />
        </>
      )}
    </div>
  );
};
