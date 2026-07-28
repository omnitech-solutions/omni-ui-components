import type { Meta, StoryObj } from '@storybook/react';
import { clamp, isNil } from './index';

const meta = { title: 'omni-ui-components/Util' } satisfies Meta;
export default meta;
export const Default: StoryObj<typeof meta> = {
  render: () => (
    <dl className="space-y-2 rounded-lg border p-4 text-sm">
      <div className="flex justify-between gap-6"><dt>clamp(12, 0, 10)</dt><dd className="font-mono">{clamp(12, 0, 10)}</dd></div>
      <div className="flex justify-between gap-6"><dt>isNil(null)</dt><dd className="font-mono">{String(isNil(null))}</dd></div>
    </dl>
  ),
};
