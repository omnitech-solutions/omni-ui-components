/**
 * Look of the rendered reply. Written out in full for Tailwind's source scan. Text colour is inherited, so the
 * parent (a Panel, a bubble) decides it; surfaces use the `--oui-panel-*` tokens like the Transcript code block.
 */
export const markdownRootClasses = 'min-w-0 text-[13px] leading-[1.55] break-words select-text [&>*:first-child]:mt-0 [&>*:last-child]:mb-0';

export const markdownHeadingClasses = 'mt-3 mb-1 text-[14px] leading-[1.35] font-semibold';
export const markdownParagraphClasses = 'my-2';
export const markdownListClasses = 'my-2 ps-5 [&_ol]:my-1 [&_ul]:my-1';
export const markdownBlockquoteClasses =
  'my-2 border-s-2 border-solid border-[color:var(--oui-panel-divider)] ps-3 text-[color:var(--oui-panel-meta-fg)]';
export const markdownLinkClasses =
  'text-[color:var(--oui-tone-accent-fg)] underline underline-offset-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
export const markdownInlineCodeClasses =
  'rounded-[5px] bg-[color:var(--oui-tone-accent-bg)] px-1 py-px font-mono text-[0.92em] text-[color:var(--oui-code-plain)]';
export const markdownRuleClasses = 'my-3 border-0 border-t border-solid border-[color:var(--oui-panel-divider)]';
export const markdownTableWrapClasses = 'my-2 max-w-full overflow-x-auto';
export const markdownTableClasses = 'w-full border-collapse text-[12.5px]';
export const markdownCellClasses = 'border border-solid border-[color:var(--oui-panel-divider)] px-2 py-1 text-start align-top';
export const markdownHeadCellClasses = `${markdownCellClasses} bg-[color:var(--oui-panel-dock-bg)] font-semibold`;

/** Citation pill: a small round accent number, the size of a superscript. */
export const markdownCiteClasses = [
  'mx-0.5 inline-flex h-4 min-w-4 cursor-pointer items-center justify-center rounded-full border-0 px-1 align-baseline',
  'bg-[color:var(--oui-tone-accent-bg)] text-[10.5px] leading-none font-semibold text-[color:var(--oui-tone-accent-fg)]',
  'transition-colors hover:bg-[color:var(--oui-tone-accent-solid-bg)] hover:text-[color:var(--oui-tone-accent-solid-fg)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
].join(' ');

/** Code block: the same look as the Transcript's (dock colour mixed with the see-through token, backgrounds only). */
export const markdownCodeBlockClasses = [
  'my-2 min-w-0 overflow-hidden rounded-lg border border-solid border-[color:var(--oui-panel-divider)]',
  'bg-[color:color-mix(in_srgb,var(--oui-panel-dock-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)]',
].join(' ');
export const markdownCodeHeaderClasses =
  'flex h-7 items-center justify-between gap-2 border-b border-solid border-[color:var(--oui-panel-divider)] pr-1 pl-2.5 font-mono text-[11px] text-[color:var(--oui-panel-meta-fg)] select-none';
export const markdownCodeTextClasses = 'm-0 px-2.5 py-2 font-mono text-[12px] leading-[1.5] select-text';
export const markdownCopyClasses =
  'h-6 gap-1 rounded-md px-1.5 text-[11px] font-normal text-[color:var(--oui-panel-meta-fg)] select-none [&_svg]:size-3';

/** Streaming cursor: a blinking block; static for people who prefer reduced motion. */
export const markdownCursorClasses =
  'ms-0.5 inline-block h-[1.05em] w-[0.5em] translate-y-[0.15em] animate-pulse rounded-[1px] bg-current opacity-70 motion-reduce:animate-none';
