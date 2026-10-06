/** One run of code text. `className` is the highlight.js class list (`hljs-keyword`, `hljs-title function_`, ...). */
export interface CodeToken {
  text: string;
  className?: string;
}

/** A highlighter: code and an optional language in, one token list per line out. Pure, so hosts can swap it. */
export type HighlightFn = (code: string, language?: string) => CodeToken[][];

export interface HighlightOptions {
  /** Extra language aliases on top of the built-ins (`ts`, `js`, `sh`, `py`, `yml`, ...). Keys are lower case. */
  aliases?: Record<string, string>;
  /**
   * Guess the language when none is given or it is unknown. Default `false`: unknown stays plain text, because a
   * wrong guess colours prose as code.
   */
  auto?: boolean;
}
