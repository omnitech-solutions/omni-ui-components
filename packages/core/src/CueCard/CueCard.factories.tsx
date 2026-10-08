import {
  CueCard,
  type CueCardProps,
  type CueSection,
  type CueSegment,
  HeardLine,
  type HeardLineProps,
} from '@oc-tech/omni-ui-components/CueCard';
import { TriangleAlert } from 'lucide-react';
import * as React from 'react';
import type { Variant } from '../internal/support/makeFactory';

/** A piece of a line plus the caller's own field: what the source is called where it is opened. */
export interface CueSourcedSegment extends CueSegment {
  sourceTitle?: string;
}

/** A closing note: a line that carries itself into the conversation, two employers as evidence, and a question. */
export const cueClosingSections: CueSection<CueSourcedSegment>[] = [
  {
    kind: 'say',
    lines: [
      {
        segments: [
          { text: 'One thing I should have said earlier:', role: 'cue' },
          { text: ' at ' },
          {
            text: 'Relay',
            role: 'evidence',
            source: 'roles/relay',
            sourceTitle: 'Relay · Staff engineer',
          },
          { text: ' I owned the quoting service from the first design to on-call.' },
        ],
      },
      {
        segments: [
          { text: 'At ' },
          {
            text: 'Trufla',
            role: 'evidence',
            source: 'roles/trufla',
            sourceTitle: 'Trufla · Tech lead',
          },
          { text: ' I led the same kind of move out of a monolith, without a release freeze.' },
        ],
      },
    ],
  },
  {
    kind: 'ask',
    lines: [
      { segments: [{ text: 'What would the first ninety days in this role look like?' }] },
      { segments: [{ text: 'Who owns the on-call rota today?' }] },
    ],
  },
  {
    kind: 'context',
    lines: [
      {
        segments: [
          {
            text: 'Ownership came up twice and was only half answered; this closes it.',
            role: 'context',
          },
        ],
      },
    ],
  },
];

/** A technical note: the response, four anchors (a compact card keeps three), a caution and its way back. */
export const cueTechnicalSections: CueSection<CueSourcedSegment>[] = [
  {
    kind: 'say',
    lines: [
      {
        segments: [
          { text: 'I would start from', role: 'cue' },
          { text: ' the consistency each workflow needs, not from the tool.' },
        ],
      },
      {
        segments: [
          { text: 'Payments get an ' },
          { text: 'outbox', role: 'evidence' },
          { text: ' and ' },
          { text: 'idempotent consumers', role: 'evidence' },
          { text: '; search can lag by seconds.' },
        ],
      },
    ],
  },
  {
    kind: 'anchors',
    lines: [
      { segments: [{ text: 'Outbox + idempotent consumers', role: 'evidence' }] },
      {
        segments: [
          { text: 'Saga', role: 'evidence' },
          { text: ' for the order workflow, with compensations' },
        ],
      },
      {
        segments: [
          {
            text: 'Relay',
            role: 'evidence',
            source: 'roles/relay',
            sourceTitle: 'Relay · Staff engineer',
          },
          { text: ': 40 services, no distributed transaction' },
        ],
      },
      { segments: [{ text: 'Nightly reconciliation catches what slips through' }] },
    ],
  },
  {
    kind: 'caution',
    lines: [
      { segments: [{ text: 'Do not promise exactly-once delivery.', role: 'caution' }] },
      { segments: [{ text: 'Say at-least-once, made safe by idempotent handlers.' }] },
    ],
  },
  {
    kind: 'context',
    lines: [
      {
        segments: [
          {
            text: 'The follow-up will likely be about ordering across partitions.',
            role: 'context',
          },
        ],
      },
    ],
  },
];

/** A claim that is not confirmed: it is underlined so it is never said unnoticed. */
export const cueInferredSections: CueSection<CueSourcedSegment>[] = [
  {
    kind: 'say',
    lines: [
      {
        segments: [
          { text: 'After the split, checkout latency ' },
          { text: 'dropped by about 40%', role: 'evidence', grounding: 'inferred' },
          { text: ' at ' },
          { text: 'Relay', role: 'evidence', grounding: 'verified', source: 'roles/relay' },
          { text: '.' },
        ],
      },
    ],
  },
];

/** Build `<CueCard>` props for stories and tests: the technical note, in detail. */
export const cueCardPropsFactory = (
  overrides: Partial<CueCardProps<CueSourcedSegment>> = {},
): CueCardProps<CueSourcedSegment> => ({
  sections: cueTechnicalSections,
  cautionIcon: <TriangleAlert className="size-4" />,
  onSourceSelect: () => undefined,
  ...overrides,
});

/** Build `<HeardLine>` props for stories and tests: the follow-up the card answers. */
export const heardLinePropsFactory = (overrides: Partial<HeardLineProps> = {}): HeardLineProps => ({
  label: 'Follow-up · 11:46',
  tone: 'ask',
  pieces: [
    { text: 'And how do you keep ' },
    { text: 'data consistent across services', strong: true },
    { text: ' when one of them is down?' },
  ],
  ...overrides,
});

/** A card under the sentence it answers; a pressed source is reported and named under the card. */
export const CueCardDemo: React.FC<
  Partial<CueCardProps<CueSourcedSegment>> & {
    /** Draw the heard sentence above the card. */
    heard?: boolean;
    onAction?: (name: string, detail?: unknown) => void;
  }
> = ({ onAction, heard = false, ...props }) => {
  const [opened, setOpened] = React.useState<CueSourcedSegment | null>(null);
  return (
    <div className="flex max-w-[560px] flex-col gap-5">
      {heard && <HeardLine {...heardLinePropsFactory()} />}
      <CueCard<CueSourcedSegment>
        {...cueCardPropsFactory(props)}
        onSourceSelect={(segment) => {
          onAction?.('source', segment);
          setOpened(segment);
        }}
      >
        {opened && (
          <p className="m-0 font-mono text-xs text-[color:var(--oui-panel-meta-fg)]">
            Source: {opened.sourceTitle ?? opened.source}
          </p>
        )}
      </CueCard>
    </div>
  );
};

export const cueCardVariants: Variant<CueCardProps<CueSourcedSegment>>[] = [
  { name: 'Technical note: response, anchors, caution, context', args: {} },
  { name: 'Closing note: a cue, two employers, an ask', args: { sections: cueClosingSections } },
  { name: 'Compact: the response, three anchors, the caution', args: { mode: 'compact' } },
  { name: 'Pending: a revision is on its way', args: { status: 'pending' } },
  { name: 'Pending with nothing ready', args: { sections: [], status: 'pending' } },
  { name: 'An unconfirmed claim', args: { sections: cueInferredSections } },
];

export const heardLineVariants: Variant<HeardLineProps>[] = [
  { name: 'Asked (act-now colour)', args: {} },
  { name: 'Plain', args: { tone: 'plain', label: 'Them · 11:44' } },
  {
    name: 'Cut after one line',
    args: {
      maxLines: 1,
      pieces: [
        { text: 'We moved from a monolith two years ago and the thing that still hurts is ' },
        { text: 'keeping orders and payments in step', strong: true },
        { text: ' when a downstream service times out, so tell me how you would approach that.' },
      ],
    },
  },
  { name: 'No label', args: { label: undefined, tone: 'plain' } },
];
