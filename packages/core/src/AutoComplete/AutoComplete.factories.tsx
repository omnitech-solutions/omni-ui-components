import type {
  AutoCompleteOption,
  AutoCompleteProps,
} from '@oc-tech/omni-ui-components/AutoComplete';
import type { Variant } from '../../internal/support/makeFactory';

/** A consumer's own option type: the extra fields reach `onSelect` by reference. */
export interface PersonOption extends AutoCompleteOption {
  team: string;
}

export const SAMPLE_PEOPLE: PersonOption[] = [
  { value: 'Alex Morgan', team: 'Design' },
  { value: 'Jamie Chen', team: 'Platform' },
  { value: 'James Brooks', team: 'Platform' },
  { value: 'Samir Patel', team: 'Research', disabled: true },
  { value: 'Jane Miller', team: 'Support' },
];

/** Build `<AutoComplete>` props for standalone stories and tests. */
export const autoCompletePropsFactory = (
  overrides: Partial<AutoCompleteProps<PersonOption>> = {},
): AutoCompleteProps<PersonOption> => ({
  id: 'demo-autocomplete',
  label: 'Assignee',
  description: 'Type a name, or pick a suggestion.',
  options: SAMPLE_PEOPLE,
  value: '',
  layout: 'vertical',
  required: false,
  disabled: false,
  readOnly: false,
  ...overrides,
});

/** Ordered variant matrix. */
export const autoCompleteVariants: Variant<AutoCompleteProps<PersonOption>>[] = [
  { name: 'Default', args: { label: 'Default' } },
  { name: 'Prefilled', args: { label: 'Prefilled', value: 'Jam' } },
  { name: 'Required', args: { label: 'Required', required: true } },
  { name: 'Read only', args: { label: 'Read only', readOnly: true, value: 'Alex Morgan' } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: 'Alex Morgan' } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Pick an assignee' } },
];
