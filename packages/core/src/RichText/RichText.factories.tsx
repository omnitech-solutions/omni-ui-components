import type { RichTextProps } from '@omnitech/omni-ui-core/RichText';
import type { Variant } from '../../internal/support/makeFactory';

export const richTextPropsFactory = (overrides: Partial<RichTextProps> = {}): RichTextProps => ({
  id: 'demo-rich-text',
  label: 'Description',
  value: '',
  placeholder: 'Start typing…',
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

export const richTextVariants: Variant<RichTextProps>[] = [
  { name: 'Default', args: { label: 'Default', value: '' } },
  {
    name: 'Prefilled',
    args: {
      label: 'Prefilled',
      value:
        '<h2>Project brief</h2>' +
        '<p>Omni is the all-in-one product suite for <strong>freelancers</strong> and <em>small agencies</em>.</p>' +
        '<ul><li>CRM, projects, tasks</li><li>Invoices &amp; agreements</li><li>Payments &amp; banking</li></ul>' +
        '<blockquote>Boring tech wins.</blockquote>',
    },
  },
  { name: 'Read only', args: { label: 'Read only', readOnly: true, value: '<p>Locked content — toolbar visible, editor disabled.</p>' } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: '<p>Greyed out and inert.</p>' } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Description is required', required: true, value: '' } },
];
