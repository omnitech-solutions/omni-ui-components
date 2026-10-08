import type * as React from 'react';

/**
 * Why a piece of a line matters. Most of a line is `spoken`; mark the smallest useful phrase otherwise, so the
 * sentence keeps its reading rhythm.
 * - `spoken`: the words to say.
 * - `cue`: the opening phrase that carries the line into the conversation. Heavier, never coloured.
 * - `evidence`: what anchors the claim (an employer, a technology, a figure).
 * - `caution`: a risk or a qualification.
 * - `context`: supporting detail that is not said.
 */
export type CueRole = 'spoken' | 'cue' | 'evidence' | 'caution' | 'context';

/** One piece of a line. Extend it: the segment reaches `onSourceSelect` by reference. */
export interface CueSegment {
  text: string;
  role?: CueRole;
  /** `inferred` marks a claim that is not confirmed, so it is never said unnoticed. */
  grounding?: 'verified' | 'inferred';
  /** Where the claim comes from (an address in the caller's own material). Makes the piece pressable. */
  source?: string;
}

/** One sentence. */
export interface CueLine<S extends CueSegment = CueSegment> {
  segments: readonly S[];
}

/**
 * What a group of lines is for. The card labels and draws each kind itself.
 * - `say`: the response, ready to say, in order.
 * - `anchors`: a few short things to hang the answer on.
 * - `ask`: what to ask the other person.
 * - `caution`: what to avoid or correct; the first line names it, the rest are the way back.
 * - `context`: why, for reading later. Left out of the compact card.
 */
export type CueSectionKind = 'say' | 'anchors' | 'ask' | 'caution' | 'context';

export interface CueSection<S extends CueSegment = CueSegment> {
  kind: CueSectionKind;
  /** A heading in place of the kind's own. An empty string draws no heading. */
  label?: string;
  lines: readonly CueLine<S>[];
}

/** English strings of {@link CueCard}. */
export interface CueCardLabels {
  sections: Record<CueSectionKind, string>;
  /** Shown while a card with no content yet is being prepared. */
  preparing: string;
  /** Shown under the content while a newer revision is being prepared. */
  updating: string;
  /** Tooltip of an unconfirmed claim. */
  inferred: string;
}

export interface CueCardProps<S extends CueSegment = CueSegment>
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  sections: readonly CueSection<S>[];
  /** `compact` keeps the response, a few anchors and any caution: nothing to read. */
  mode?: 'detail' | 'compact';
  /** The most anchors a compact card shows. */
  maxAnchors?: number;
  /** `pending`: a revision is being prepared. What is ready stays on show. */
  status?: 'ready' | 'pending';
  /** A piece with a `source` was pressed. Without it such a piece is plain text. */
  onSourceSelect?: (segment: S) => void;
  /** Icon of a caution section. */
  cautionIcon?: React.ReactNode;
  /** Drawn after the sections in the detail card: a diagram, links. */
  children?: React.ReactNode;
  labels?: Partial<Omit<CueCardLabels, 'sections'>> & {
    sections?: Partial<CueCardLabels['sections']>;
  };
}

/** One run of a heard sentence. `strong` lifts the words that carry it. */
export interface HeardPiece {
  text: string;
  strong?: boolean;
}

export interface HeardLineProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The sentence, in runs. Joined they are the sentence exactly. */
  pieces: readonly HeardPiece[];
  /** Small heading above it: who said it, when. */
  label?: React.ReactNode;
  /** `ask` marks it with the act-now colour (something asked); `plain` does not. */
  tone?: 'ask' | 'plain';
  /** Lines shown before the rest is cut. The whole sentence is in the tooltip. */
  maxLines?: number;
}
