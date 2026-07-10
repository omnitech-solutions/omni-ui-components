import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Table } from '@omnitech/omni-ui-core/Table';
import { ComponentWrapper } from './storySupport';
import { defaultColumns, appearanceVariantProjects, type ProjectRecord } from './Table.story.fixtures';

const meta: Meta = {
  title: 'omni-ui-components/Table/Theme',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Table exposes `theme?: "auto" | "light" | "dark"`. `auto` inherits the enclosing `data-theme`. `light` and `dark` force the palette on the Table subtree only — the surrounding chrome is untouched.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const rows = appearanceVariantProjects.map((project) => ({ key: project.id, record: project }));

interface ThemeStoryConfig {
  theme: 'auto' | 'light' | 'dark';
  testIdPrefix: string;
  title: string;
  description: React.ReactNode;
}

const themeStory = ({ theme, testIdPrefix, title, description }: ThemeStoryConfig): Story => ({
  render: () => (
    <ComponentWrapper title={title} description={description}>
      <Table<ProjectRecord> columns={defaultColumns} rows={rows} theme={theme} testIdPrefix={testIdPrefix} />
    </ComponentWrapper>
  ),
});

export const ThemeAuto: Story = themeStory({
  theme: 'auto',
  testIdPrefix: 'table-theme-auto',
  title: 'Theme auto',
  description:
    '`theme="auto"` (the default) inherits from the closest ancestor with `data-theme="light|dark"`. The Table has no palette of its own — it reads from the app theme cascade.',
});
export const ThemeLight: Story = themeStory({
  theme: 'light',
  testIdPrefix: 'table-theme-light',
  title: 'Theme light',
  description:
    '`theme="light"` pins the light palette on the Table subtree only, regardless of the enclosing app theme. Useful for exports, print previews, or dark-mode apps that need a light data grid.',
});
export const ThemeDark: Story = themeStory({
  theme: 'dark',
  testIdPrefix: 'table-theme-dark',
  title: 'Theme dark',
  description:
    '`theme="dark"` pins the dark palette on the Table subtree only. Useful for embedding a dark Table inside a light-mode page (e.g. dashboards or code-heavy panels).',
});
