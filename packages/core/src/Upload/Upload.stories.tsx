import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Upload } from './index';

const meta = {
  title: 'omni-ui-components/Upload',
  component: Upload,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The `FileUpload` drop zone under the name `Upload`: a controlled list of files (`value`, `onChange`), with `accept`, `multiple` and `maxSize`.',
      },
    },
  },
} satisfies Meta<typeof Upload>;
export default meta;

/** The chosen files are held in state and handed back as `value`. */
export const Default: StoryObj<typeof meta> = {
  render: () => {
    const [files, setFiles] = React.useState<File[]>([]);
    return (
      <Upload
        id="contract-upload"
        label="Contract"
        accept="application/pdf"
        value={files}
        onChange={setFiles}
        wrapperClassName="max-w-md"
      />
    );
  },
};
