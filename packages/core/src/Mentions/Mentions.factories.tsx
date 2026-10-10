import type { MentionsOption, MentionsProps } from '@oc-tech/omni-ui-components/Mentions';
import type { Variant } from '../../internal/support/makeFactory';

/** A consumer's own option type: the extra fields reach `onMention` by reference. */
export interface MemberOption extends MentionsOption {
  memberId: number;
}

export const SAMPLE_MEMBERS: MemberOption[] = [
  { value: 'alex', label: 'Alex Morgan', description: 'Design', memberId: 1 },
  { value: 'jamie', label: 'Jamie Chen', description: 'Platform', memberId: 2 },
  { value: 'james', label: 'James Brooks', description: 'Platform', memberId: 3 },
  { value: 'samir', label: 'Samir Patel', description: 'On leave', memberId: 4, disabled: true },
  { value: 'jane', label: 'Jane Miller', description: 'Support', memberId: 5 },
];

export const SAMPLE_TOPICS: MemberOption[] = [
  { value: 'release', memberId: 101 },
  { value: 'research', memberId: 102 },
  { value: 'roadmap', memberId: 103 },
];

/** Build `<Mentions>` props for standalone stories and tests. */
export const mentionsPropsFactory = (
  overrides: Partial<MentionsProps<MemberOption>> = {},
): MentionsProps<MemberOption> => ({
  id: 'demo-mentions',
  label: 'Comment',
  description: 'Type @ to mention someone.',
  placeholder: 'Write a comment…',
  options: SAMPLE_MEMBERS,
  value: '',
  rows: 3,
  layout: 'vertical',
  required: false,
  disabled: false,
  readOnly: false,
  ...overrides,
});

/** Ordered variant matrix. */
export const mentionsVariants: Variant<MentionsProps<MemberOption>>[] = [
  { name: 'Default', args: { label: 'Default' } },
  { name: 'Prefilled', args: { label: 'Prefilled', value: '@alex please review this' } },
  { name: 'Required', args: { label: 'Required', required: true } },
  { name: 'Read only', args: { label: 'Read only', readOnly: true, value: '@jamie done' } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: '@jamie done' } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Write a comment' } },
];
