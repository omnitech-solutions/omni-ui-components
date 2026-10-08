import {
  CueCard,
  type CueCardProps,
  CueLineText,
  type CueSection,
  type CueSegment,
  HeardLine,
  type HeardLineProps,
} from '@oc-tech/omni-ui-components/CueCard';
import { Panel } from '@oc-tech/omni-ui-components/Panel';
import { TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import type { Variant } from '../internal/support/makeFactory';

// The examples below are written exactly as a consumer writes them. The docs "Show code" of each story and the
// Component Overview rows are read from this file, so the code shown is the code that runs.

/** A piece of a line plus the caller's own field: where its source opens. */
export interface Cited extends CueSegment {
  href?: string;
}

/** A heard sentence as the caller keeps it: the HeardLine props it draws, and an id. */
export interface HeardSentence
  extends Pick<HeardLineProps, 'label' | 'tone' | 'maxLines' | 'pieces'> {
  id: string;
}

/**
 * A technical note: the response, four anchors (a compact card keeps three), a caution and its way back.
 * A line is a string with its key words marked; the one line with a source is a list holding a segment.
 */
export const technicalNote: CueSection<Cited>[] = [
  {
    kind: 'say',
    lines: [
      '**I would start from** the consistency each workflow needs, not from the tool.',
      'Payments get an ==outbox== and ==idempotent consumers==; search can lag by seconds.',
    ],
  },
  {
    kind: 'anchors',
    lines: [
      '==Outbox + idempotent consumers==',
      '==Saga== for the order workflow, with compensations',
      [
        { text: 'Changelog', role: 'evidence', source: 'docs/changelog', href: '/docs/changelog' },
        ': 40 fixes, no breaking change',
      ],
      'Nightly reconciliation catches what slips through',
    ],
  },
  {
    kind: 'caution',
    lines: [
      '!!Do not promise exactly-once delivery.!!',
      'Say at-least-once, made safe by idempotent handlers.',
    ],
  },
  {
    kind: 'context',
    lines: ['The follow-up will likely be about ordering across partitions.'],
  },
];

/** A closing note: a line that carries itself into the conversation, two documents as evidence, and a question. */
export const closingNote: CueSection<Cited>[] = [
  {
    kind: 'say',
    lines: [
      [
        { text: 'One thing I should have said earlier:', role: 'cue' },
        ' the ',
        { text: 'Changelog', role: 'evidence', source: 'docs/changelog', href: '/docs/changelog' },
        ' lists every fix in this release.',
      ],
      [
        'The ',
        {
          text: 'Migration guide',
          role: 'evidence',
          source: 'docs/migration',
          href: '/docs/migration',
        },
        ' covers the move from version 1, without downtime.',
      ],
    ],
  },
  {
    kind: 'ask',
    lines: ['Which version are you running today?', 'Who owns the upgrade on your side?'],
  },
  {
    kind: 'context',
    lines: ['Upgrades came up twice and were only half answered; this closes it.'],
  },
];

/** A claim that is not confirmed: it is underlined so it is never said unnoticed. */
export const unconfirmedNote: CueSection<Cited>[] = [
  {
    kind: 'say',
    lines: [
      [
        'After the upgrade, sync time ',
        { text: 'dropped by about 40%', role: 'evidence', grounding: 'inferred' },
        ' according to the ',
        {
          text: 'Changelog',
          role: 'evidence',
          grounding: 'verified',
          source: 'docs/changelog',
          href: '/docs/changelog',
        },
        '.',
      ],
    ],
  },
];

/** The follow-up the technical note answers, with the words that carry it lifted. */
export const followUp: HeardLineProps['pieces'] = [
  'And how do you keep ',
  { text: 'data consistent across services', strong: true },
  ' when one of them is down?',
];

/** What was heard, oldest first: a plain string, a sentence cut after a line, and the question asked. */
export const heardSentences: HeardSentence[] = [
  { id: 'h1', label: 'Them · 11:44', pieces: 'We split the order workflow out last year.' },
  {
    id: 'h2',
    label: 'Them · 11:45',
    maxLines: 1,
    pieces: [
      'The thing that still hurts is ',
      { text: 'keeping orders and payments in step', strong: true },
      ' when a downstream service times out, so tell me how you would do it.',
    ],
  },
  { id: 'h3', label: 'Follow-up · 11:46', tone: 'ask', pieces: followUp },
];

/** Build `<CueCard>` props for tests: the technical note, in detail. */
export const cueCardPropsFactory = (
  overrides: Partial<CueCardProps<Cited>> = {},
): CueCardProps<Cited> => ({
  sections: technicalNote,
  cautionIcon: <TriangleAlert className="size-4" />,
  onSourceSelect: () => undefined,
  ...overrides,
});

/** Build `<HeardLine>` props for tests: the follow-up the card answers. */
export const heardLinePropsFactory = (overrides: Partial<HeardLineProps> = {}): HeardLineProps => ({
  label: 'Follow-up · 11:46',
  tone: 'ask',
  pieces: followUp,
  ...overrides,
});

export const cueCardVariants: Variant<CueCardProps<Cited>>[] = [
  { name: 'Technical note: response, anchors, caution, context', args: {} },
  { name: 'Closing note: a cue, two documents, an ask', args: { sections: closingNote } },
  { name: 'Compact: the response, three anchors, the caution', args: { mode: 'compact' } },
  { name: 'Pending: a revision is on its way', args: { status: 'pending' } },
  { name: 'Pending with nothing ready', args: { sections: [], status: 'pending' } },
  { name: 'An unconfirmed claim', args: { sections: unconfirmedNote } },
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

/** The card under the sentence it answers, in a `Panel`; pressing a source reads the segment's own field. */
export const AnswerPanel = () => {
  const [href, setHref] = useState<string | null>(null);
  return (
    <Panel
      title="Answer"
      meta={href ? `open: ${href}` : 'press a source'}
      bodyPadding="md"
      bodyClassName="gap-8"
      style={{ maxWidth: 600 }}
    >
      <HeardLine label="Follow-up · 11:46" tone="ask" pieces={followUp} />
      <CueCard<Cited>
        sections={technicalNote}
        cautionIcon={<TriangleAlert className="size-4" />}
        // `segment` is a Cited: the field added to CueSegment is typed here.
        onSourceSelect={(segment) => setHref(segment.href ?? null)}
      />
    </Panel>
  );
};

/** A closing note: the opening phrase is a `cue`, the documents are `evidence`, and there is something to ask. */
export const ClosingNotePanel = () => {
  const [href, setHref] = useState<string | null>(null);
  return (
    <Panel
      title="Before you finish"
      meta={href ? `open: ${href}` : 'press a source'}
      bodyPadding="md"
      style={{ maxWidth: 600 }}
    >
      <CueCard<Cited>
        sections={closingNote}
        onSourceSelect={(segment) => setHref(segment.href ?? null)}
      />
    </Panel>
  );
};

/** Compact, for a glance: the response, `maxAnchors` anchors (three by default) and the caution. */
export const CompactNotePanel = () => (
  <Panel title="Answer" meta="compact" bodyPadding="md" style={{ maxWidth: 600 }}>
    <CueCard<Cited>
      sections={technicalNote}
      mode="compact"
      cautionIcon={<TriangleAlert className="size-4" />}
    />
  </Panel>
);

/** Compact with two anchors. No `onSourceSelect`, so a piece with a `source` is plain text. */
export const CompactTwoAnchorsPanel = () => (
  <Panel title="Answer" meta="compact · 2 anchors" bodyPadding="md" style={{ maxWidth: 600 }}>
    <CueCard<Cited>
      sections={technicalNote}
      mode="compact"
      maxAnchors={2}
      cautionIcon={<TriangleAlert className="size-4" />}
    />
  </Panel>
);

/** A newer revision is being prepared: what is ready stays on show, with a polite status under it. */
export const PendingNotePanel = () => (
  <Panel title="Answer" meta="revision 2 of 3" bodyPadding="md" style={{ maxWidth: 600 }}>
    <CueCard<Cited>
      sections={technicalNote}
      status="pending"
      cautionIcon={<TriangleAlert className="size-4" />}
    />
  </Panel>
);

/** Nothing is ready yet: the card says it is preparing. */
export const PreparingNotePanel = () => {
  const nothingYet: CueSection<Cited>[] = [];
  return (
    <Panel title="Answer" meta="revision 1" bodyPadding="md" style={{ maxWidth: 600 }}>
      <CueCard<Cited> sections={nothingYet} status="pending" />
    </Panel>
  );
};

/** A claim with `grounding: 'inferred'` is underlined and says so in its tooltip. */
export const UnconfirmedNotePanel = () => {
  const [href, setHref] = useState<string | null>(null);
  return (
    <Panel
      title="Answer"
      meta={href ? `open: ${href}` : '1 claim to check'}
      bodyPadding="md"
      style={{ maxWidth: 600 }}
    >
      <CueCard<Cited>
        sections={unconfirmedNote}
        onSourceSelect={(segment) => setHref(segment.href ?? null)}
      />
    </Panel>
  );
};

/** Headings and status text come from `labels`; an empty string draws no heading. */
export const GermanNotePanel = () => (
  <Panel title="Antwort" meta="Revision 2" bodyPadding="md" style={{ maxWidth: 600 }}>
    <CueCard<Cited>
      sections={technicalNote}
      status="pending"
      cautionIcon={<TriangleAlert className="size-4" />}
      labels={{
        sections: { say: 'Sag das', anchors: 'Anker', caution: 'Vorsicht', context: '' },
        updating: 'Wird aktualisiert…',
      }}
    />
  </Panel>
);

/** HeardLine on its own: typed sentences drawn in a `Panel`: a plain string, one cut after a line, and one asked. */
export const HeardPanel = () => (
  <Panel
    title="Heard"
    meta={`${heardSentences.length} sentences`}
    bodyPadding="md"
    bodyClassName="gap-6"
    style={{ maxWidth: 600 }}
  >
    {heardSentences.map(({ id, ...sentence }) => (
      <HeardLine key={id} {...sentence} />
    ))}
  </Panel>
);

/** One line on its own, outside a card: `CueLineText` takes any short form of a line. */
export const LineOnItsOwn = () => (
  <Panel title="Next line" bodyPadding="md" style={{ maxWidth: 600 }}>
    <p style={{ margin: 0 }}>
      <CueLineText line="**Start with** the ==result==, !!not the method!!." />
    </p>
  </Panel>
);
