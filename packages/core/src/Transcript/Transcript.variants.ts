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
