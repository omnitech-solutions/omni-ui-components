import { cva } from 'class-variance-authority';

/** The bar replaces the field: same height and see-through background as the panel Input. */
export const dictationBarVariants = cva(
  [
    'flex min-h-[34px] min-w-0 flex-1 items-center gap-2.5 rounded-[9px] px-2.5 py-1 text-[13px] text-[color:var(--oui-foreground)]',
    'bg-[color:color-mix(in_srgb,var(--oui-panel-dock-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)]',
  ].join(' '),
  {
    variants: { variant: { stacked: '', pill: 'bg-transparent' } },
    defaultVariants: { variant: 'stacked' },
  },
);

export const dictationRecordClasses =
  'size-2 flex-none rounded-full bg-[color:var(--oui-tone-danger-solid-bg)] animate-[oui-record-pulse_1.2s_ease-in-out_infinite]';
export const dictationTextClasses = 'min-w-0 flex-1 truncate';
export const dictationWaveClasses = 'flex h-5 flex-none items-center gap-[2px]';
export const dictationBarClasses =
  'block h-full w-[2px] origin-center rounded-full bg-[color:var(--oui-tone-danger-fg)] animate-[oui-wave_0.9s_ease-in-out_infinite]';
