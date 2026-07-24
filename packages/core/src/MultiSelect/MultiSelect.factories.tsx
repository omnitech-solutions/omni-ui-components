import type { MultiSelectProps } from '@oc-tech/omni-ui-components/MultiSelect';
import type { SelectOption } from '@oc-tech/omni-ui-components/Select';
import type { Variant } from '../../internal/support/makeFactory';

export const SAMPLE_TAGS: SelectOption[] = [
  { value: 'ruby', label: 'Ruby' },
  { value: 'rails', label: 'Rails' },
  { value: 'react', label: 'React' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'tailwind', label: 'Tailwind' },
  { value: 'storybook', label: 'Storybook' },
];

export const multiSelectPropsFactory = (overrides: Partial<MultiSelectProps> = {}): MultiSelectProps => ({
  id: 'demo-multi-select',
  label: 'Skills',
  options: SAMPLE_TAGS,
  value: [],
  placeholder: 'Pick a few…',
  searchable: true,
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

export const multiSelectVariants: Variant<MultiSelectProps>[] = [
  { name: 'Default', args: { label: 'Default', value: [] } },
  { name: 'Prefilled', args: { label: 'Prefilled', value: ['ruby', 'rails'] } },
  { name: 'Max items', args: { label: 'Max items', value: ['react'], maxItems: 3 } },
  { name: 'Not searchable', args: { label: 'Not searchable', searchable: false, value: ['react'] } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: ['ruby', 'rails'] } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Pick at least one', required: true, value: [] } },
];
