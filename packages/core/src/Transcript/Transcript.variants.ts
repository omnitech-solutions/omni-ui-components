import { cva, type VariantProps } from 'class-variance-authority';

import type { ControlTone } from '../internal/support/controlTone';

/**
 * Bubble look. Text stays selectable (`select-text`); the tint is the accent token, which is already translucent,
 * so a see-through Panel needs nothing extra.
 */
export const transcriptBubbleVariants = cva(
  'group relative min-w-0 flex-none rounded-[10px] bg-[color:var(--oui-tone-accent-bg)] px-2.5 py-2 text-[13px] leading-[1.45] break-words select-text',
  {
    variants: {
      kind: {
        speech: 'flex flex-col gap-0.5',
        message: 'max-w-[85%] self-end',
      },
      interim: { true: 'italic opacity-70', false: '' },
    },
    defaultVariants: { kind: 'speech', interim: false },
  },
);
export type TranscriptBubbleVariantProps = VariantProps<typeof transcriptBubbleVariants>;

/** Label colour per tone (the speaker line). Written out in full for Tailwind's source scan. */
export const transcriptLabelToneClasses: Record<ControlTone, string> = {
  neutral: 'text-[color:var(--oui-tone-neutral-fg)]',
  accent: 'text-[color:var(--oui-tone-accent-fg)]',
  success: 'text-[color:var(--oui-tone-success-fg)]',
  warning: 'text-[color:var(--oui-tone-warning-fg)]',
  danger: 'text-[color:var(--oui-tone-danger-fg)]',
  dim: 'text-[color:var(--oui-tone-dim-fg)]',
};

/**
 * The copy control: a tiny ghost IconButton that floats on the bubble's top edge. Hidden until the bubble is
 * hovered or holds focus (it stays in the tab order, so keyboard focus reveals it).
 */
export const transcriptCopyClasses = [
  'absolute -top-2.5 right-1.5 size-6 rounded-md border-[color:var(--oui-panel-divider)] bg-[color:var(--oui-panel-bg)] select-none',
  'opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 data-[copied=true]:opacity-100',
].join(' ');

/** A code block inside a bubble: its background is the dock colour mixed with the see-through token (backgrounds only). */
export const transcriptCodeBlockClasses = [
  'my-1 min-w-0 overflow-hidden rounded-lg border border-solid border-[color:var(--oui-panel-divider)]',
  'bg-[color:color-mix(in_srgb,var(--oui-panel-dock-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)]',
].join(' ');

/** Header row of a code block: language or title on the left, the copy control on the right. */
export const transcriptCodeHeaderClasses =
  'flex h-7 items-center justify-between gap-2 border-b border-solid border-[color:var(--oui-panel-divider)] pr-1 pl-2.5 font-mono text-[11px] text-[color:var(--oui-panel-meta-fg)] select-none';

/** The code itself: monospace, keyboard-scrollable, always selectable. */
export const transcriptCodeTextClasses = 'm-0 px-2.5 py-2 font-mono text-[12px] leading-[1.5] select-text';

// ---------------------------------------------------------------------------------------------------------------
// Conversation (turn-oriented) mode
// ---------------------------------------------------------------------------------------------------------------

/** The column of turns: centred, at most `maxWidth` (inline), 16px between parts. */
export const conversationColumnClasses = 'mx-auto mt-auto flex w-full min-w-0 flex-none flex-col gap-4';

/** One turn: question, then the assistant's work, with the original's 8px rhythm inside. */
export const conversationTurnClasses = 'flex min-w-0 flex-col gap-3';

/** The question: right-aligned stack of chips, bubble and hover actions. */
export const conversationUserClasses = 'group flex min-w-0 flex-col items-end gap-1.5 self-end max-w-[85%]';

/** The actions under a question: hidden until hover or focus, always shown when it has versions (`data-shown`). */
export const conversationUserActionsClasses = [
  'flex items-center gap-0.5 opacity-0 transition-opacity',
  'group-hover:opacity-100 group-focus-within:opacity-100 data-[shown=true]:opacity-100',
].join(' ');

/** The assistant's reply: plain text across the column (no bubble), parts stacked. */
export const conversationReplyClasses = 'flex min-w-0 flex-col gap-2.5 text-[13.5px] leading-[1.6] text-[color:var(--oui-foreground)] select-text';

/** The streaming caret after the content. Motion stops under `prefers-reduced-motion` (tokens.css). */
export const conversationCursorClasses =
  'ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] bg-[color:var(--oui-foreground)] animate-[oui-caret-blink_1s_steps(1)_infinite]';

/** The stopped banner under a cancelled reply. */
export const conversationStoppedClasses = 'flex items-center gap-1.5 text-xs text-[color:var(--oui-panel-meta-fg)] [&_svg]:size-3.5';

/** The inline editor under a question. */
export const conversationEditorClasses = [
  'flex w-full min-w-[min(100%,420px)] flex-col gap-2 rounded-xl border border-solid border-[color:var(--oui-panel-divider)] p-2',
  'bg-[color:color-mix(in_srgb,var(--oui-panel-dock-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)]',
  'focus-within:border-[var(--oui-border-interactive)]',
].join(' ');
export const conversationEditorTextareaClasses =
  'block w-full resize-none border-0 bg-transparent p-1 font-[family-name:var(--oui-font-sans)] text-[13.5px] leading-[1.5] text-[color:var(--oui-foreground)] outline-none';
