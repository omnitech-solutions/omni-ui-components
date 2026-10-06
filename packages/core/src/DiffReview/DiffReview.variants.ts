import { cva, type VariantProps } from 'class-variance-authority';

import type { DiffReviewStatus } from './DiffReview.types';

/** The card: a bordered panel surface. */
export const diffReviewClasses =
  'min-w-0 overflow-hidden rounded-xl border border-solid border-[color:var(--oui-panel-border)] bg-[color:var(--oui-panel-bg)] text-[13px] text-[color:var(--oui-foreground)]';

/** The status pill, tinted from the tone tokens. Written out in full for Tailwind's source scan. */
export const diffReviewPillVariants = cva('ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11.5px] leading-4 font-medium', {
  variants: {
    status: {
      pending: 'bg-[color:var(--oui-tone-warning-bg)] text-[color:var(--oui-tone-warning-fg)]',
      preview: 'bg-[color:var(--oui-tone-accent-bg)] text-[color:var(--oui-tone-accent-fg)]',
      applied: 'bg-[color:var(--oui-tone-success-bg)] text-[color:var(--oui-tone-success-fg)]',
      rejected: 'bg-[color:var(--oui-panel-dock-bg)] text-[color:var(--oui-panel-meta-fg)]',
      reverted: 'bg-[color:var(--oui-panel-dock-bg)] text-[color:var(--oui-panel-meta-fg)]',
      conflicted: 'bg-[color:var(--oui-tone-danger-bg)] text-[color:var(--oui-tone-danger-fg)]',
    } satisfies Record<DiffReviewStatus, string>,
  },
  defaultVariants: { status: 'pending' },
});
export type DiffReviewPillVariantProps = VariantProps<typeof diffReviewPillVariants>;

/** A diff row: a tinted band for added and removed lines. */
export const diffRowVariants = cva('flex min-w-0 font-mono text-[12px] leading-[1.55]', {
  variants: {
    kind: {
      add: 'bg-[color:var(--oui-tone-success-bg)]',
      remove: 'bg-[color:var(--oui-tone-danger-bg)]',
      context: '',
    },
  },
  defaultVariants: { kind: 'context' },
});
export type DiffRowVariantProps = VariantProps<typeof diffRowVariants>;

/** The +/- gutter cell of a row. */
export const diffSignVariants = cva('w-[22px] shrink-0 text-center select-none', {
  variants: {
    kind: {
      add: 'text-[color:var(--oui-tone-success-fg)]',
      remove: 'text-[color:var(--oui-tone-danger-fg)]',
      context: '',
    },
  },
  defaultVariants: { kind: 'context' },
});

export const diffAddClasses = 'font-mono text-[11.5px] text-[color:var(--oui-tone-success-fg)]';
export const diffRemoveClasses = 'font-mono text-[11.5px] text-[color:var(--oui-tone-danger-fg)]';

export const diffTabClasses = [
  'inline-flex h-8 cursor-pointer items-center gap-1.5 border-b-2 border-transparent bg-transparent px-3 text-[12.5px] font-medium',
  'text-[color:var(--oui-panel-meta-fg)] hover:text-[color:var(--oui-foreground)]',
  'aria-selected:border-[color:var(--oui-tone-accent-solid-bg)] aria-selected:text-[color:var(--oui-foreground)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
].join(' ');

/** The checklist toggle: a box that shows a CSS check while ticked (no icon set needed). */
export const diffCheckClasses = [
  'relative size-[18px] shrink-0 cursor-pointer rounded-[5px] border border-solid border-[color:var(--oui-tone-neutral-border)] bg-transparent',
  'aria-pressed:border-transparent aria-pressed:bg-[color:var(--oui-tone-accent-solid-bg)]',
  "aria-pressed:after:absolute aria-pressed:after:top-[2px] aria-pressed:after:left-[5.5px] aria-pressed:after:h-[9px] aria-pressed:after:w-[5px] aria-pressed:after:rotate-45 aria-pressed:after:border-r-2 aria-pressed:after:border-b-2 aria-pressed:after:border-solid aria-pressed:after:border-[color:var(--oui-tone-accent-solid-fg)] aria-pressed:after:content-['']",
  'disabled:cursor-not-allowed disabled:opacity-50',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
].join(' ');
