import type { Meta, StoryObj } from '@storybook/react';
import { Cascader } from './Cascader';

const meta = {
  title: 'omni-ui-components/Cascader',
  component: Cascader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Chooses a value from a tree of `options`, one level at a time: each option has a `value`, a `label` and optional `children`.',
      },
    },
  },
} satisfies Meta<typeof Cascader>;
export default meta;
export const Default: StoryObj<typeof meta> = {
  args: {
    'aria-label': 'Stack',
    options: [
      { value: 'frontend', label: 'Frontend', children: [{ value: 'react', label: 'React' }] },
    ],
  },
};
