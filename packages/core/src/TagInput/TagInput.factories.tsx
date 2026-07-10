import type { TagInputProps } from '@omnitech/omni-ui-core/TagInput';
import type { Variant } from '../../internal/support/makeFactory';

export const tagInputPropsFactory = (overrides: Partial<TagInputProps> = {}): TagInputProps => ({
  id: 'demo-tag-input',
  label: 'Tags',
  value: [],
  placeholder: 'Type and press enter or space…',
  commitOnSpace: true,
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

export const tagInputVariants: Variant<TagInputProps>[] = [
  { name: 'Default', args: { label: 'Default', value: [] } },
  { name: 'Prefilled', args: { label: 'Prefilled', value: ['ruby', 'rails', 'react'] } },
  { name: 'Enter only', args: { label: 'Enter only', value: ['enter-to-commit'], commitOnSpace: false, placeholder: 'Press enter to commit…' } },
  { name: 'Max items', args: { label: 'Max items', value: ['one'], maxItems: 3 } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: ['locked'] } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Add at least one tag', required: true, value: [] } },
];
