import type { TextareaProps } from '@oc-tech/omni-ui-components/Textarea/Textarea.types';
import { makeFactory, type Variant } from '../../internal/support/makeFactory';

/**
 * Build `<Textarea>` props for standalone (non-RJSF) stories and unit tests.
 *
 * @example
 * render(<Textarea {...textareaPropsFactory({ value: 'a', invalid: true })} />);
 */
export const textareaPropsFactory = makeFactory<TextareaProps>({
  id: 'demo-textarea',
  label: 'Message',
  placeholder: "We're looking forward to working together…",
  description: 'Recipients see this in the email body.',
  value: '',
  rows: 5,
  variant: 'bordered',
  textareaSize: 'default',
  layout: 'vertical',
  required: false,
  disabled: false,
  readOnly: false,
});

/** Ordered variant matrix used by the cheatsheet + kitchen-sink stories. */
export const textareaVariants: Variant<TextareaProps>[] = [
  { name: 'Default', args: { label: 'Default', placeholder: 'Type something…' } },
  { name: 'Required', args: { label: 'Required', required: true } },
  { name: 'With description', args: { label: 'With description', description: 'Recipients see this in the email body.' } },
  { name: 'Read only', args: { label: 'Read only', readOnly: true, value: 'Locked content.' } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: 'Greyed out.' } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'This field is required' } },
];
