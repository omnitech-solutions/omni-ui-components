import type * as React from 'react';
import type { Components } from 'react-markdown';

import type { HighlightFn } from '../Highlight';

/**
 * Every visible or spoken string of the Markdown renderer. Defaults are English
 * ({@link DEFAULT_MARKDOWN_LABELS}); `{n}` is replaced by the source number.
 */
export interface MarkdownLabels {
  /** Header of a code block without a language. Default `text`. */
  codeFallbackLanguage: string;
  /** Copy control of a code block. Default `Copy`. */
  copy: string;
  /** Copy control once `copiedCode` matches the block. Default `Copied`. */
  copied: string;
  /** Accessible name and tooltip of a citation pill; `{n}` is the source number. Default `Open source {n}`. */
  cite: string;
}

/** What a citation resolves to: at least its number. Pass full source items (e.g. `SourceItem`) in `sources` and they reach `onCite` by reference. */
export interface CitationSource {
  n: number;
}

export interface MarkdownProps<T extends CitationSource = CitationSource>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onCopy'> {
  /** The markdown source: GitHub-flavoured (tables, task lists, strikethrough). */
  text: string;
  /**
   * Syntax highlighting for code blocks: a pure `(code, language) => lines of tokens` function, e.g. the library's
   * `highlightLines`. Not set: plain monospace text, and the grammars are never imported.
   */
  highlight?: HighlightFn;
  /** Number the lines of code blocks. Default false. */
  codeLineNumbers?: boolean;
  /**
   * Source numbers the reply may cite. Only `[n]` for a number in this list becomes a pill; any other `[n]` (and
   * anything inside code) stays text, so an invented number cites nothing.
   */
  citations?: readonly number[];
  /**
   * The sources the reply may cite, as full items (each has `n`). When set it replaces `citations` (their numbers are the
   * citable ones) and `onCite` receives the matching item itself, by reference.
   */
  sources?: readonly T[];
  /**
   * Fires when a citation pill is chosen, with the full source item from `sources` (or `{ n }` when only `citations`
   * numbers were given). Without it a citation stays plain `[n]` text.
   */
  onCite?: (source: T) => void | Promise<void>;
  /** Icon node of a code block's copy control. Without it (or without `onCopy`) code blocks have no copy control. */
  copyIcon?: React.ReactNode;
  /** Icon node shown while a block is `copiedCode`. Default: `copyIcon`. */
  copiedIcon?: React.ReactNode;
  /**
   * Fires when a code block's copy control is chosen, with the block's code and its language (when the fence names
   * one). The caller writes the clipboard and sets `copiedCode`. Without it code blocks have no copy control.
   */
  onCopy?: (code: string, language?: string) => void | Promise<void>;
  /** Fires when a link is clicked, with its `href`. The link still opens in a new tab; informational only. */
  onLinkClick?: (href: string) => void;
  /** The `code` of the block just copied: its control shows `copied`. Controlled, no timer here. */
  copiedCode?: string | null;
  /**
   * The text is still arriving: unclosed fences, backticks and `**` are closed for display (see
   * `closeOpenMarkdown`), so the reply never flickers between prose and a half-open code block, and the `cursor`
   * follows the last line. Default false.
   */
  streaming?: boolean;
  /** Node drawn after the last block while `streaming`. Default a blinking bar; `null` hides it. */
  cursor?: React.ReactNode;
  /** Wrap long code lines instead of scrolling sideways. Default false. */
  wrapCode?: boolean;
  /** Partial overrides of any react-markdown element renderer (`a`, `table`, `pre`, ...). They win over the built-in ones. */
  components?: Components;
  labels?: Partial<MarkdownLabels>;
}
