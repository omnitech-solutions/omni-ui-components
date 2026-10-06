import type { ShortcutItem, ShortcutListProps } from '@oc-tech/omni-ui-components/ShortcutList';
import type { Variant } from '../../internal/support/makeFactory';

/** The shortcuts of the original General tab (strings are shortcut strings; `Esc` and `↑` are ready glyphs). */
export const sampleShortcuts = (): ShortcutItem[] => [
  { label: 'Search conversations', keys: 'mod+k' },
  { label: 'New chat', keys: 'mod+shift+o' },
  { label: 'Show / hide assistant', keys: 'mod+j' },
  { label: 'Stop reply', keys: ['Esc'] },
  { label: 'Edit last prompt', keys: ['↑'] },
  { label: 'Commands', keys: ['/'] },
];

/** Build `<ShortcutList>` props for standalone stories and tests. */
export const shortcutListPropsFactory = (overrides: Partial<ShortcutListProps> = {}): ShortcutListProps => ({
  items: sampleShortcuts(),
  ...overrides,
});

export const shortcutListVariants: Variant<ShortcutListProps>[] = [
  { name: 'With heading', args: { title: 'Keyboard shortcuts' } },
  { name: 'Windows / Linux glyphs', args: { describe: (shortcut) => shortcut.split('+').map((p) => (p === 'mod' ? 'Ctrl' : p === 'shift' ? 'Shift' : p.toUpperCase())) } },
];
