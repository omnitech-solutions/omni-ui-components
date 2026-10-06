import type { TagProps } from '@oc-tech/omni-ui-components/Tag';
import type { Variant } from '../../internal/support/makeFactory';

/** Build `<Tag>` props for standalone stories and tests. */
export const tagPropsFactory = (overrides: Partial<TagProps> = {}): TagProps => ({
  children: 'In review',
  ...overrides,
});

export const tagVariants: Variant<TagProps>[] = [
  { name: 'Default', args: { children: 'Draft' } },
  { name: 'Colored', args: { children: 'Published', color: '#2563eb' } },
  { name: 'Closable', args: { children: 'Filter', closable: true } },
  { name: 'Mono', args: { children: 'O(n) time', mono: true } },
  { name: 'Mono with tooltip', args: { children: '3f9a1c2 · main', mono: true, tooltip: '3f9a1c2d4e5b6a7f8091a2b3c4d5e6f708192a3b' } },
  {
    name: 'Copy on click',
    args: { children: '3f9a1c2 · main', mono: true, copyValue: '3f9a1c2d4e5b6a7f8091a2b3c4d5e6f708192a3b', tooltip: 'Click to copy the full SHA' },
  },
];
