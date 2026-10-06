import type { Meta, StoryObj } from '@storybook/react';

import { Tag, type TagProps } from '@oc-tech/omni-ui-components/Tag';
import { tagVariants } from 'factories/omni-ui-components/Tag/Tag.factories';

const meta: Meta<typeof Tag> = {
  title: 'omni-ui-components/Tag',
  component: Tag,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Compact pill surface for statuses, filters, and categorical metadata. Tags should feel lightweight and scannable, with optional dismissal when used for active filters or selections. `mono` sets a monospace face, `tooltip` adds a hover tooltip, and `copyValue` turns the tag into a copy-to-clipboard button.',
      },
    },
  },
  args: { children: 'In review' },
  argTypes: {
    mono: { control: 'boolean', description: 'Monospace face.' },
    copyValue: { control: 'text', description: 'Makes the tag a button that copies this text and briefly confirms.' },
    tooltip: { control: 'text', description: 'Hover and focus tooltip.' },
    onCopy: { action: 'copied' },
    onClose: { action: 'closed' },
  },
};
export default meta;

type Story = StoryObj<typeof Tag>;
export const Default: Story = {};

export const Closable: Story = { args: { children: 'Filter', closable: true } };
export const Colored: Story = { args: { children: 'Priority', color: '#c2410c' } };

export const StatusSet: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag>Draft</Tag>
      <Tag color="#2563eb">Published</Tag>
      <Tag color="#15803d">Approved</Tag>
      <Tag color="#c2410c">Needs review</Tag>
    </div>
  ),
};

export const Mono: Story = { args: { children: 'O(n) time', mono: true } };
export const MonoWithTooltip: Story = {
  args: { children: '3f9a1c2 · main', mono: true, tooltip: '3f9a1c2d4e5b6a7f8091a2b3c4d5e6f708192a3b' },
};
export const CopyOnClick: Story = {
  name: 'Build tag, copy on click',
  args: { children: '3f9a1c2 · main', mono: true, copyValue: '3f9a1c2d4e5b6a7f8091a2b3c4d5e6f708192a3b', tooltip: 'Click to copy the full SHA' },
};

export const VariantMatrix: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {tagVariants.map((variant) => (
        <Tag key={variant.name} {...(variant.args as TagProps)} />
      ))}
    </div>
  ),
};
