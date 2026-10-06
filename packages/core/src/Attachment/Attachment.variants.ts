import { cva } from 'class-variance-authority';

/**
 * The attachment card: a bordered row, at most 220px wide. Backgrounds follow `--oui-panel-see-through` the way the
 * panel Input does (the dock colour mixed with the token), so a card sits on a see-through Panel; text stays opaque.
 */
export const attachmentCardVariants = cva(
  'relative flex min-w-0 flex-none items-center border border-solid border-[color:var(--oui-panel-divider)] text-[color:var(--oui-foreground)] select-none',
  {
    variants: {
      variant: {
        card: [
          'max-w-[220px] gap-2 rounded-[10px] py-1.5 pr-1 pl-1.5',
          'bg-[color:color-mix(in_srgb,var(--oui-panel-dock-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)]',
        ].join(' '),
        chip: 'max-w-[220px] gap-1.5 rounded-full bg-[color:var(--oui-tone-accent-bg)] py-0.5 pr-2.5 pl-1.5 text-xs',
      },
      status: {
        ready: '',
        uploading: '',
        extracting: '',
        failed: 'border-[color:var(--oui-tone-danger-border)]',
      },
    },
    defaultVariants: { variant: 'card', status: 'ready' },
  },
);

/** The 32px thumbnail tile: an image fills it, an icon centres in it. */
export const attachmentThumbClasses =
  'flex size-8 flex-none items-center justify-center overflow-hidden rounded-md bg-[color:var(--oui-tone-accent-bg)] text-[color:var(--oui-tone-accent-fg)] [&_svg]:size-4';

/** Name and meta stack. */
export const attachmentTextClasses = 'flex min-w-0 flex-1 flex-col text-left leading-[1.25]';
export const attachmentNameClasses = 'truncate text-[12.5px] font-medium';
export const attachmentMetaClasses = 'truncate text-[11px] text-[color:var(--oui-panel-meta-fg)]';
export const attachmentErrorClasses = 'truncate text-[11px] text-[color:var(--oui-tone-danger-fg)]';

/** Progress track under the card; the bar width is inline (`progress`). Never animates when motion is reduced. */
export const attachmentProgressTrackClasses = 'absolute inset-x-1.5 bottom-0 h-0.5 overflow-hidden rounded-full bg-[color:var(--oui-panel-divider)]';
export const attachmentProgressBarClasses =
  'block h-full bg-[color:var(--oui-tone-accent-solid-bg)] transition-[width] duration-200 motion-reduce:transition-none';
/** An upload with no known progress: a sliding bar. */
export const attachmentIndeterminateClasses =
  'block h-full w-1/3 bg-[color:var(--oui-tone-accent-solid-bg)] animate-pulse motion-reduce:animate-none';

export const attachmentStripVariants = cva('flex min-w-0 gap-1.5', {
  variants: {
    layout: {
      scroll: 'flex-nowrap overflow-x-auto pb-0.5 [scrollbar-width:thin]',
      wrap: 'flex-wrap',
    },
  },
  defaultVariants: { layout: 'scroll' },
});

/** The drop overlay: a dashed accent frame over the container that says where to drop. */
export const attachmentDropOverlayClasses = [
  'pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[inherit]',
  'border-2 border-dashed border-[color:var(--oui-tone-accent-solid-bg)] text-sm font-medium text-[color:var(--oui-tone-accent-fg)]',
  'bg-[color:color-mix(in_srgb,var(--oui-panel-dock-bg)_85%,transparent)]',
].join(' ');
