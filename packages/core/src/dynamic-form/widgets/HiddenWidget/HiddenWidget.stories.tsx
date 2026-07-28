import type { Meta } from '@storybook/react'; import { HiddenWidget } from './HiddenWidget';
export default { title: 'dynamic-form/widgets/HiddenWidget', component: HiddenWidget } satisfies Meta<typeof HiddenWidget>;
export const Default = { args: { id: 'hidden', value: 'value' } };
