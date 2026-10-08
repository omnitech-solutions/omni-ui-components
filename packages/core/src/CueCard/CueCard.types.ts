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

/** A piece written the short way: a plain string is a `spoken` piece. */
export type CuePieceInput<S extends CueSegment = CueSegment> = string | S;

/**
 * A line written the short way. `toCueLine` turns any of them into a {@link CueLine}.
 * - a string: one sentence with its key words marked, `**cue**`, `==evidence==`, `!!caution!!`.
 * - a list of strings and segments: a string is spoken text taken exactly as written; use a segment for a
 *   `source`, a `grounding` or a field of your own.
 * - a full {@link CueLine}.
 */
export type CueLineInput<S extends CueSegment = CueSegment> =
  | string
  | readonly CuePieceInput<S>[]
  | CueLine<S>;

export interface CueSection<S extends CueSegment = CueSegment> {
  kind: CueSectionKind;
  /** A heading in place of the kind's own. An empty string draws no heading. */
  label?: string;
  /** Each line is a string, a list of strings and segments, or a `CueLine`. */
  lines: readonly CueLineInput<S>[];
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

/** `sm` for a narrow side pane, `md` the default, `lg` and `xl` for reading at a glance or from a distance. */
export type CueCardSize = 'sm' | 'md' | 'lg' | 'xl';

export interface CueCardProps<S extends CueSegment = CueSegment>
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  sections: readonly CueSection<S>[];
  /** A quiet line above the sections: what kind of note, when. */
  meta?: React.ReactNode;
  /** Indent the card to the text column of a `HeardLine` above it. */
  inset?: boolean;
  /** How large the card reads. Every part scales together. Default `md`. */
  size?: CueCardSize;
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

export interface HeardLineProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  /** The sentence: a string, or runs (a plain string is a run that is not lifted). Joined they are the sentence exactly. */
  pieces?: string | readonly (string | HeardPiece)[];
  /** The short name of what was heard, drawn large above the sentence. */
  title?: React.ReactNode;
  /** A small line under it: what is happening about it ("Preparing…"). */
  status?: React.ReactNode;
  /** `line` (default): a bar at the left when it has a tone. `boxed`: a tinted notice. */
  variant?: 'line' | 'boxed';
  /** Scales with a `CueCard` of the same size. Default `md`. */
  size?: CueCardSize;
  /** Small heading above it: who said it, when. */
  label?: React.ReactNode;
  /** `ask` marks it with the act-now colour (something asked), `accent` with the chosen colour; `plain` does not. */
  tone?: 'ask' | 'accent' | 'plain';
  /** Lines shown before the rest is cut. The whole sentence is in the tooltip. */
  maxLines?: number;
}
