import { Table } from '@oc-tech/omni-ui-components/Table';
import type { Meta, StoryObj } from '@storybook/react';
import { ExampleFrame } from 'storybook-helpers/internal/support/ExampleFrame';
import { defaultColumns, type ProjectRecord, treeProjects } from '../Table.story.fixtures';

const meta: Meta = {
  title: 'omni-ui-components/Table/Showcase/Project task list',
  tags: ['autodocs'],
  // The story is a page of its own: it draws its frame itself, with the scenario as the description.
  parameters: { layout: 'padded', example: { frame: false } },
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
    <ExampleFrame
      eyebrow="Showcase"
      title="Project task list"
      description="A project detail page's task tree — parent tasks with nested subtasks, cascading multi-select, and bulk-action controls. Uses the tree-shaped fixture with children rendered inline via expandable.childrenColumnName."
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
    </ExampleFrame>
  ),
};
