import { cva } from 'class-variance-authority';

/**
 * The composer box. Its background follows `--oui-panel-see-through` the way the panel Input does (the dock colour
 * mixed with the token, backgrounds only); the border brightens on focus.
 */
export const composerBoxVariants = cva(
  [
    'flex min-w-0 border border-solid border-[color:var(--oui-panel-divider)] text-[13.5px] text-[color:var(--oui-foreground)]',
    'bg-[color:color-mix(in_srgb,var(--oui-panel-dock-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)]',
    'transition-[border-color] duration-[var(--oui-transition-duration)] focus-within:border-[var(--oui-border-interactive)]',
  ].join(' '),
  {
    variants: {
      variant: {
        stacked: 'flex-col gap-1 rounded-2xl p-2.5',
        pill: 'items-center gap-1.5 rounded-full py-1.5 pr-1.5 pl-1.5',
      },
      disabled: { true: 'opacity-60', false: '' },
    },
    defaultVariants: { variant: 'stacked', disabled: false },
  },
);

/** The textarea: borderless, transparent, grows with its content (height is set inline up to `maxHeight`). */
export const composerTextareaClasses = [
  'block min-h-[24px] w-full min-w-0 flex-auto resize-none border-0 bg-transparent p-0 px-1 font-[family-name:var(--oui-font-sans)] text-[13.5px] leading-[1.5]',
  'text-[color:var(--oui-foreground)] outline-none placeholder:text-[color:var(--oui-panel-meta-fg)] disabled:cursor-not-allowed',
].join(' ');

/** Round 34px control (send, plus). */
export const composerRoundClasses = 'size-[34px] flex-none rounded-full';

export const composerHintClasses = 'px-1 pt-1 text-[11.5px] text-[color:var(--oui-panel-meta-fg)]';

export const composerNoticeVariants = cva('flex min-w-0 items-center gap-2 rounded-lg border border-solid px-2.5 py-1.5 text-[12.5px] [&_svg]:size-4 [&_svg]:flex-none', {
  variants: {
    tone: {
      warning: 'border-[color:var(--oui-tone-warning-border)] bg-[color:var(--oui-tone-warning-bg)] text-[color:var(--oui-tone-warning-fg)]',
      danger: 'border-[color:var(--oui-tone-danger-border)] bg-[color:var(--oui-tone-danger-bg)] text-[color:var(--oui-tone-danger-fg)]',
      accent: 'border-[color:var(--oui-tone-accent-border)] bg-[color:var(--oui-tone-accent-bg)] text-[color:var(--oui-tone-accent-fg)]',
      neutral: 'border-[color:var(--oui-panel-divider)] bg-transparent text-[color:var(--oui-panel-meta-fg)]',
    },
  },
  defaultVariants: { tone: 'warning' },
});
