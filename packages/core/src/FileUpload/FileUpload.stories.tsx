import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { FileUpload, type FileUploadProps } from '@oc-tech/omni-ui-components/FileUpload';

const Renderer: React.FC<FileUploadProps> = (args) => {
  const [files, setFiles] = React.useState<File[]>(args.value ?? []);
  React.useEffect(() => setFiles(args.value ?? []), [args.value]);
  return (
    <FileUpload
      {...args}
      value={files}
      onChange={(next) => {
        setFiles(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof FileUpload> = {
  title: 'omni-ui-components/FileUpload',
  component: FileUpload,
  tags: ['autodocs'],
  args: { id: 'demo-upload', label: 'Attachments', multiple: false, accept: '', wrapperClassName: 'mx-auto max-w-md' },
  argTypes: { onChange: { action: 'changed' }, onError: { action: 'error' } },
  render: (args) => <Renderer {...(args as FileUploadProps)} />,
};
export default meta;

type Story = StoryObj<typeof FileUpload>;
export const Default: Story = {};
export const ImagesOnly: Story = { args: { label: 'Avatar', accept: 'image/*', maxSize: 5_000_000 } };
export const MultipleWithMax: Story = { args: { label: 'Attachments', multiple: true, maxFiles: 5 } };
export const WithError: Story = { args: { error: 'File too large' } };
export const Disabled: Story = { args: { disabled: true } };
