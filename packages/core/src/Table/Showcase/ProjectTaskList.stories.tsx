import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Table } from '@omnitech/omni-ui-core/Table';
import { defaultColumns, treeProjects, type ProjectRecord } from '../Table.story.fixtures';
import { ShowcaseShell } from './ShowcaseShell';

const meta: Meta = {
  title: 'omni-ui-components/Table/Showcase/Project task list',
  parameters: { layout: 'fullscreen' },
};
export default meta;

const CODE = `<Table<ProjectRecord>
  columns={defaultColumns}
  dataSource={treeProjects}
  rowKey="id"
  expandable={{
    childrenColumnName: 'children',
    defaultExpandAllRows: true,
    indentSize: 28,
  }}
  rowSelection={{
    selections: true,
    checkStrictly: false,
  }}
  testIdPrefix="showcase-project-tasks"
/>`;

export const Default: StoryObj = {
  render: () => (
    <ShowcaseShell
      title="Project task list"
      scenario="A project detail page's task tree — parent tasks with nested subtasks, cascading multi-select, and bulk-action controls. Uses the tree-shaped fixture with children rendered inline via expandable.childrenColumnName."
      code={CODE}
    >
      <Table<ProjectRecord>
        columns={defaultColumns}
        dataSource={treeProjects}
        rowKey="id"
        expandable={{ childrenColumnName: 'children', defaultExpandAllRows: true, indentSize: 28 }}
        rowSelection={{ selections: true, checkStrictly: false }}
        testIdPrefix="showcase-project-tasks"
      />
    </ShowcaseShell>
  ),
};
