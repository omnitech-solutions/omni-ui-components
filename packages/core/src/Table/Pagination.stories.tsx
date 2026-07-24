import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Table } from '@oc-tech/omni-ui-components/Table';
import { ComponentWrapper } from './storySupport';
import { defaultColumns, projects, type ProjectRecord } from './Table.story.fixtures';
const meta: Meta = {
  title: 'omni-ui-components/Table/Pagination',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Pagination stories cover the compact Omni pagination treatment over the AntD-compatible pagination API: controlled current/pageSize state, placement, disabled mode, and page-size changing.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const paginatedProjects = [...projects, ...projects.map((project, index) => ({ ...project, id: `${project.id}-copy-${index}`, name: `${project.name} copy` }))];

export const ControlledCurrentAndPageSize: Story = {
  render: () => {
    const [current, setCurrent] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(2);
    return (
      <ComponentWrapper
        title="Controlled current and page size"
        description="Lift pagination into your component with `pagination.current` + `pagination.pageSize`. `onChange(page, size)` fires on page clicks; `onShowSizeChange(page, size)` fires when the size dropdown changes."
      >
        <Table<ProjectRecord>
          columns={defaultColumns}
          dataSource={paginatedProjects}
          rowKey="id"
          pagination={{
            current,
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: [2, 3, 5],
            onChange: (page, size) => {
              setCurrent(page);
              setPageSize(size);
            },
            onShowSizeChange: (page, size) => {
              setCurrent(page);
              setPageSize(size);
            },
          }}
          testIdPrefix="pagination-controlled"
        />
      </ComponentWrapper>
    );
  },
};

export const PlacementVariants: Story = {
  render: () => (
    <ComponentWrapper
      title="Placement variants"
      description="`pagination.placement` accepts an array of anchors: `topStart`, `topEnd`, `bottomStart`, `bottomEnd`, and `none`. Combine multiple entries to show pagers above and below, or set `['none']` to hide the pager but keep slicing."
    >
      <Table<ProjectRecord>
        columns={defaultColumns}
        dataSource={paginatedProjects}
        rowKey="id"
        pagination={{ defaultPageSize: 2, placement: ['topStart', 'bottomEnd'] }}
        testIdPrefix="pagination-placement"
      />
    </ComponentWrapper>
  ),
};

export const DisabledPagination: Story = {
  render: () => (
    <ComponentWrapper
      title="Disabled pagination"
      description="`pagination.disabled: true` freezes the pager UI without hiding it — useful during async loads or when a parent flow needs to lock navigation. `dataSource` still paginates on the current page."
    >
      <Table<ProjectRecord>
        columns={defaultColumns}
        dataSource={paginatedProjects}
        rowKey="id"
        pagination={{ defaultPageSize: 2, disabled: true }}
        testIdPrefix="pagination-disabled"
      />
    </ComponentWrapper>
  ),
};

export const SizeChanger: Story = {
  render: () => (
    <ComponentWrapper
      title="Size changer"
      description="`showSizeChanger: true` renders the page-size dropdown; `pageSizeOptions` supplies the list of choices. Combine with `defaultPageSize` for the initial value in uncontrolled mode."
    >
      <Table<ProjectRecord>
        columns={defaultColumns}
        dataSource={paginatedProjects}
        rowKey="id"
        pagination={{ defaultPageSize: 2, showSizeChanger: true, pageSizeOptions: [2, 4, 8] }}
        testIdPrefix="pagination-size-changer"
      />
    </ComponentWrapper>
  ),
};
