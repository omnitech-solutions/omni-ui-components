import type { FeedbackPanelProps, FeedbackReason } from '@oc-tech/omni-ui-components/FeedbackPanel';
import type { Variant } from '../../internal/support/makeFactory';

export const SAMPLE_REASONS: FeedbackReason[] = ['Incorrect', 'Not what I asked', 'Too long', 'Ignored my evidence', 'Unsafe change'].map(
  (label) => ({
    id: label.toLowerCase().replaceAll(' ', '-'),
    label,
  }),
);

/** Build `<FeedbackPanel>` props for stories and tests. */
export const feedbackPanelPropsFactory = (overrides: Partial<FeedbackPanelProps> = {}): FeedbackPanelProps => ({
  reasons: SAMPLE_REASONS,
  onSubmit: () => undefined,
  onCancel: () => undefined,
  ...overrides,
});

export const feedbackPanelVariants: Variant<FeedbackPanelProps>[] = [
  { name: 'Nothing chosen', args: {} },
  { name: 'Two chosen', args: { defaultSelected: ['incorrect', 'too-long'] } },
  { name: 'Send disabled', args: { submitDisabled: true } },
];
