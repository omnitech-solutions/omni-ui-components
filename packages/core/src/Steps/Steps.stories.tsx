import type { Meta, StoryObj } from '@storybook/react';
import { Steps } from './Steps';
const meta = { title: 'omni-ui-components/Steps', component: Steps } satisfies Meta<typeof Steps>;
export default meta;
export const Default: StoryObj<typeof meta> = { args: { items: [{ title: 'Question' }, { title: 'Solution' }, { title: 'Tests' }] } };
