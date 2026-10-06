import { cva } from 'class-variance-authority';

/** The summary button: a quiet outlined pill row. */
export const stepSummaryButtonClasses = [
  'inline-flex h-7 max-w-full cursor-pointer items-center gap-2 self-start rounded-lg border border-solid px-2 text-[12.5px]',
  'border-[color:var(--oui-panel-divider)] bg-[color:var(--oui-panel-dock-bg)] text-[color:var(--oui-panel-meta-fg)] transition-colors',
  'hover:text-[color:var(--oui-tone-neutral-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  '[&_svg]:size-3.5 [&_svg]:flex-none',
].join(' ');

export const stepListClasses =
  'flex flex-col rounded-[10px] border border-solid border-[color:var(--oui-panel-divider)] p-1 bg-[color:color-mix(in_srgb,var(--oui-panel-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)]';

export const stepRowClasses = 'flex items-center gap-2.5 px-2 py-1.5 text-[13px]';

/** The quiet `parallel` tag. */
export const stepParallelClasses =
  'flex-none rounded-[5px] border border-solid border-[color:var(--oui-panel-divider)] px-1.5 text-[11px] leading-4 font-normal text-[color:var(--oui-panel-meta-fg)]';

/** The default spinner ring. */
export const stepSpinnerClasses =
  'inline-block size-3.5 flex-none animate-spin rounded-full border-2 border-solid border-current border-t-transparent motion-reduce:animate-none';

/** Rail dot: empty circle, accent ring while running, success tint when done, danger tint when failed. */
export const railDotVariants = cva('flex size-[18px] flex-none items-center justify-center rounded-full [&_svg]:size-3', {
  variants: {
    state: {
      pending: 'border border-dotted border-[color:var(--oui-panel-divider)] bg-transparent text-[color:var(--oui-panel-meta-fg)]',
      running: 'bg-transparent text-[color:var(--oui-tone-accent-fg)]',
      done: 'bg-[color:var(--oui-tone-success-bg)] text-[color:var(--oui-tone-success-fg)]',
      failed: 'bg-[color:var(--oui-tone-danger-bg)] text-[color:var(--oui-tone-danger-fg)]',
    },
  },
  defaultVariants: { state: 'pending' },
});

/** The dotted connector between two rail dots. */
export const railLineClasses = 'my-0.5 min-h-3 w-0 flex-1 border-s-[1.5px] border-dotted border-[color:var(--oui-panel-divider)]';
