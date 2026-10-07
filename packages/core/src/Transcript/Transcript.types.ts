import type * as React from 'react';

import type { HighlightFn } from '../Highlight';
import type { ControlTone } from '../internal/support/controlTone';
import type {
  ChatAttachmentPart,
  ChatVersion,
  ConversationTurn,
  TranscriptConversationProps,
} from './Transcript.conversation.types';

/** A paragraph of plain text inside a bubble. */
export interface TranscriptTextBlock {
  type: 'text';
  text: string;
}

/** A code block inside a bubble: a header with the language and a copy control, then monospace code. */
export interface TranscriptCodeBlock {
  type: 'code';
  code: string;
  /** Shown in the header, e.g. `ts`, `python`. Without it the header shows only the copy control. */
  language?: string;
  /** Optional file name or caption shown instead of the language, e.g. `two-sum.ts`. */
  title?: string;
}

export type TranscriptBlock = TranscriptTextBlock | TranscriptCodeBlock;

interface TranscriptEntryBase {
  /** Stable id: the React key, and what `onCopy` and `copiedId` refer to. */
  id: string;
}

/** What the interviewer or the microphone said: a tinted bubble with a `speaker · time` label. */
export interface TranscriptSpeech extends TranscriptEntryBase {
  kind: 'speech';
  /** Label text, e.g. `Mic` or `Interviewer`. */
  speaker: string;
  /** Colour token of the label (`success` green for the mic, as in the board). Default `success`. */
  tone?: ControlTone;
  /** Plain string, e.g. `08:21`. No date formatting happens in the component. */
  time: string;
  text: string;
  /** Shows the quiet edited tag next to the time (a merged or corrected phrase). */
  edited?: boolean;
  /** Still being recognised: dimmed and italic. */
  interim?: boolean;
  /** Explicit content blocks (text and code). When set they are drawn instead of `text`, which stays the raw copy text. */
  blocks?: TranscriptBlock[];
}

/** The person's own chat message: a right-aligned bubble, at most 85% wide, no label. */
export interface TranscriptMessage extends TranscriptEntryBase {
  kind: 'message';
  text: string;
  /** Explicit content blocks (text and code). When set they are drawn instead of `text`, which stays the raw copy text. */
  blocks?: TranscriptBlock[];
}

/** A centred, muted one-line chip with a caller-supplied icon node, e.g. `S1 · no question found · 08:33`. */
export interface TranscriptEvent extends TranscriptEntryBase {
  kind: 'event';
  icon?: React.ReactNode;
  text: string;
}

export type TranscriptEntry = TranscriptSpeech | TranscriptMessage | TranscriptEvent;

/** Entries that carry text a person can copy. */
export type TranscriptBubbleEntry = TranscriptSpeech | TranscriptMessage;

/**
 * Props of the Transcript. `T` is your entry type (extend `TranscriptEntry`), `U` your turn, `V` your version and `A` your
 * attachment part type: callbacks and slots receive the SAME objects you passed in (by reference), with your extra fields.
 */
export interface TranscriptProps<
  T extends TranscriptEntry = TranscriptEntry,
  U extends ConversationTurn = ConversationTurn,
  V extends ChatVersion = ChatVersion,
  A extends ChatAttachmentPart = ChatAttachmentPart,
> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onCopy'>,
    TranscriptConversationProps<U, V, A> {
  /** Flat entries (speech, message, event). Not needed in conversation mode (`turns`). */
  entries?: T[];
  /** Called with the entry when its copy control is chosen. The caller writes to the clipboard and sets `copiedId`. */
  onCopy?: (entry: Extract<T, TranscriptBubbleEntry>) => void;
  /** Id of the entry just copied: its control shows `copiedLabel` (and `copiedIcon`). Controlled, no internal timer. */
  copiedId?: string | null;
  /** Icon node of the copy control. Without it (or without `onCopy`) bubbles have no copy control. */
  copyIcon?: React.ReactNode;
  /** Icon node shown while an entry is `copiedId`. Default: `copyIcon`. */
  copiedIcon?: React.ReactNode;
  /** Accessible name and tooltip of the copy control. Default `Copy`. */
  copyLabel?: string;
  /** Name of the control once copied. Default `Copied`. */
  copiedLabel?: string;
  /**
   * Draw fenced code (three backticks) found in an entry's `text` as code blocks. Ignored for entries with
   * explicit `blocks`. Default false: text stays plain.
   */
  fences?: boolean;
  /** Called with the block, its entry and its index when a code block's copy control is chosen. Set `copiedId` to `codeBlockId(entry.id, index)`. */
  onCopyCode?: (
    block: TranscriptCodeBlock,
    entry: Extract<T, TranscriptBubbleEntry>,
    index: number,
  ) => void;
  /** Accessible name of a code block's copy control. Default `Copy code`. */
  copyCodeLabel?: string;
  /** Name of a code block's control once copied. Default `Copied`. */
  copiedCodeLabel?: string;
  /** Wrap long code lines instead of scrolling sideways. Default false (scroll). */
  wrapCode?: boolean;
  /**
   * Syntax highlighting for code blocks: a pure `(code, language) => lines of tokens` function, e.g. the library's
   * `highlightLines` (lowlight / highlight.js grammars) or `createHighlighter({ auto: true })`. Colours come from the
   * `--oui-code-*` tokens, so light and dark follow the theme. Not set: plain monospace text, and the grammars are
   * never imported. `renderCode` wins over this when both are set.
   */
  highlight?: HighlightFn;
  /** Number the lines of highlighted code blocks. Default false. */
  codeLineNumbers?: boolean;
  /**
   * Slot for a highlighter (CodeMirror, Shiki, ...): return the node that replaces the plain `<code>` text.
   * The library ships none, so the bubble stays light.
   */
  renderCode?: (block: TranscriptCodeBlock) => React.ReactNode;
  /** Text of the quiet tag on an edited speech entry. Default `edited`. */
  editedLabel?: string;
  /** Accessible name of the log. Default `Transcript` (`Conversation` in conversation mode, from `labels.conversation`). */
  'aria-label'?: string;
}
