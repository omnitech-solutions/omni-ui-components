import type { A11yAllowance } from './a11yGate';

/**
 * The stories that still fail the accessibility check, one entry per story and rule. `vitest.setup.ts` reads
 * this list in `pnpm test:storybook` (see `a11yGate.ts`): a violation that is not here fails the run, and an
 * entry whose story no longer violates its rule fails the run too, so fixing a story means deleting its entry.
 * The check runs in the Storybook's default theme (dark); the light theme is measured with
 * `node scripts/storybook-inventory.mjs --a11y --theme light`.
 *
 * Not to be confused with `a11yAllowances.ts`: that is the one accepted colour pair (white on the brand
 * primary), which holds on every story. This is a backlog, meant to shrink.
 */
export const a11yAllowList: A11yAllowance[] = [
  {
    story: 'omni-ui-components-actionmenu--answer-style-scrolling',
    rule: 'scrollable-region-focusable',
    reason:
      'False positive: the menu items are reached with the arrow keys (roving focus), which scrolls the list; axe only counts tab stops.',
    date: '2026-10-10',
  },
  {
    story: 'omni-ui-components-composer--see-through',
    rule: 'color-contrast',
    reason:
      'See-through demo: the surface is 22 to 60% opaque over a fixed wallpaper, so contrast depends on what is behind the window. Needs a design decision (a floor on surface opacity).',
    date: '2026-10-10',
  },
  {
    story: 'omni-ui-components-panel--see-through-22',
    rule: 'color-contrast',
    reason:
      'See-through demo: the surface is 22 to 60% opaque over a fixed wallpaper, so contrast depends on what is behind the window. Needs a design decision (a floor on surface opacity).',
    date: '2026-10-10',
  },
  {
    story: 'omni-ui-components-sessionbar--see-through',
    rule: 'color-contrast',
    reason:
      'See-through demo: the surface is 22 to 60% opaque over a fixed wallpaper, so contrast depends on what is behind the window. Needs a design decision (a floor on surface opacity).',
    date: '2026-10-10',
  },
  {
    story: 'omni-ui-components-showcase-native-app--panels-in-three-states',
    rule: 'landmark-unique',
    reason:
      'One page shows the same window in three states, so each panel title appears three times; a real window has each panel once.',
    date: '2026-10-10',
  },
  {
    story: 'omni-ui-components-transcript--conversation-see-through',
    rule: 'color-contrast',
    reason:
      'See-through demo: the surface is 22 to 60% opaque over a fixed wallpaper, so contrast depends on what is behind the window. Needs a design decision (a floor on surface opacity).',
    date: '2026-10-10',
  },
  {
    story: 'omni-ui-components-watermark--default',
    rule: 'color-contrast',
    reason:
      'The watermark is drawn faint on purpose: a decorative mark behind content, not text to be read.',
    date: '2026-10-10',
  },
  {
    story: 'omni-ui-components-watermark--internal',
    rule: 'color-contrast',
    reason:
      'The watermark is drawn faint on purpose: a decorative mark behind content, not text to be read.',
    date: '2026-10-10',
  },
  {
    story: 'omni-ui-components-layout--app-shell',
    rule: 'scrollable-region-focusable',
    reason:
      'Layout (other owner, story added 2026-10-10): the scrolling content area is not a tab stop.',
    date: '2026-10-10',
  },
  {
    story: 'omni-ui-components-layout--collapsed',
    rule: 'scrollable-region-focusable',
    reason:
      'Layout (other owner, story added 2026-10-10): the scrolling content area is not a tab stop.',
    date: '2026-10-10',
  },
  {
    story: 'omni-ui-components-layout--page-header',
    rule: 'heading-order',
    reason:
      'Layout (other owner, story added 2026-10-10): the page header heading skips a level in the story.',
    date: '2026-10-10',
  },
];
