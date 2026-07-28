import type { Meta } from '@storybook/react'; import { ConfigProvider } from './ConfigProvider';
export default { title: 'omni-ui-components/ConfigProvider', component: ConfigProvider } satisfies Meta<typeof ConfigProvider>;
export const Default = { render: () => <ConfigProvider><div>Configured content</div></ConfigProvider> };
