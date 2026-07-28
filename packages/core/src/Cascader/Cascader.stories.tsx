import type { Meta, StoryObj } from '@storybook/react';
import { Cascader } from './Cascader';
const meta = { title: 'omni-ui-components/Cascader', component: Cascader } satisfies Meta<typeof Cascader>;
export default meta;
export const Default: StoryObj<typeof meta> = { args: { options: [{ value: 'frontend', label: 'Frontend', children: [{ value: 'react', label: 'React' }] }] } };
