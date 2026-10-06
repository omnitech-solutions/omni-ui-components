/** The disclosure header: a quiet text button. */
export const thinkingButtonClasses = [
  'inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-md border-0 bg-transparent px-1 py-0.5 text-[12.5px] leading-[1.4]',
  'text-[color:var(--oui-panel-meta-fg)] transition-colors hover:text-[color:var(--oui-tone-neutral-fg)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  '[&_svg]:size-3.5 [&_svg]:flex-none',
].join(' ');

/** The muted body that holds the reasoning text. */
export const thinkingBodyClasses =
  'mt-1 ms-1 border-s-2 border-solid border-[color:var(--oui-panel-divider)] ps-3 text-[12.5px] leading-[1.5] whitespace-pre-wrap text-[color:var(--oui-panel-meta-fg)] select-text';

/** The default spinner: a small ring, still for people who prefer reduced motion. */
export const thinkingSpinnerClasses =
  'inline-block size-3.5 flex-none animate-spin rounded-full border-2 border-solid border-current border-t-transparent motion-reduce:animate-none';
