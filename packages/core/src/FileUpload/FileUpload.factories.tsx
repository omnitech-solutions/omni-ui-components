import type { FileUploadProps } from '@oc-tech/omni-ui-components/FileUpload';
import type { Variant } from '../../internal/support/makeFactory';

export const fileUploadPropsFactory = (overrides: Partial<FileUploadProps> = {}): FileUploadProps => ({
  id: 'demo-file-upload',
  label: 'Attachments',
  value: null,
  multiple: true,
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

export const fileUploadVariants: Variant<FileUploadProps>[] = [
  { name: 'Default', args: { label: 'Default', value: null } },
  { name: 'Single file', args: { label: 'Single file', multiple: false } },
  { name: 'Accept images', args: { label: 'Accept images', accept: 'image/*' } },
  { name: 'Max 3 files', args: { label: 'Max 3 files', maxFiles: 3 } },
  { name: 'Max 5MB', args: { label: 'Max 5MB', maxSize: 5 * 1024 * 1024 } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Please attach at least one file', required: true } },
];
