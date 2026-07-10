import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Table } from '@omnitech/omni-ui-core/Table';
import { ComponentWrapper } from './storySupport';
import { defaultColumns, projects, treeProjects, type ProjectRecord } from './Table.story.fixtures';
const meta: Meta = {
  title: 'omni-ui-components/Table/Selection',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Selection stories cover the AntD-style rowSelection API mapped onto the Omni Table runtime: checkbox and radio modes, bulk actions, disabled rows, preserved keys, custom selection cell rendering, and linked tree selection.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const CheckboxSelection: Story = {
  render: () => (
    <ComponentWrapper
      title="Checkbox selection"
      description="Enable multi-select by passing `rowSelection`. Seed the initial selection with `defaultSelectedRowKeys` or control it via `selectedRowKeys` + `onChange`."
    >
      <Table<ProjectRecord>
        columns={defaultColumns}
        dataSource={projects}
        rowKey="id"
        rowSelection={{ defaultSelectedRowKeys: ['p-1'] }}
        testIdPrefix="selection-checkbox"
      />
    </ComponentWrapper>
  ),
};

export const RadioSelection: Story = {
  render: () => (
    <ComponentWrapper
      title="Radio selection"
      description="Set `rowSelection.type='radio'` to allow only one row at a time. The selection column narrows and renders a radio input in each row."
    >
      <Table<ProjectRecord>
        columns={defaultColumns}
        dataSource={projects}
        rowKey="id"
        rowSelection={{ type: 'radio', defaultSelectedRowKeys: ['p-3'] }}
        testIdPrefix="selection-radio"
      />
    </ComponentWrapper>
  ),
};

export const BulkActions: Story = {
  render: () => (
    <ComponentWrapper
      title="Bulk actions"
      description="`rowSelection.selections={true}` reveals the header dropdown with the AntD-parity bulk-selection presets (`SELECTION_ALL`, `SELECTION_INVERT`, `SELECTION_NONE`)."
    >
      <Table<ProjectRecord> columns={defaultColumns} dataSource={projects} rowKey="id" rowSelection={{ selections: true }} testIdPrefix="selection-bulk" />
    </ComponentWrapper>
  ),
};

export const DisabledRows: Story = {
  render: () => (
    <ComponentWrapper
      title="Disabled rows"
      description="Return `{ disabled: true }` from `getCheckboxProps` to lock specific rows out of selection. The row remains visible and clickable elsewhere."
    >
      <Table<ProjectRecord>
        columns={defaultColumns}
        dataSource={projects}
        rowKey="id"
        rowSelection={{ selections: true, getCheckboxProps: (record) => ({ disabled: record.disabled }) }}
        testIdPrefix="selection-disabled"
      />
    </ComponentWrapper>
  ),
};

const PreserveSelectedKeysExample = () => {
  const [compact, setCompact] = React.useState(false);
  return (
    <ComponentWrapper
      title="Preserve selected row keys"
      description="`preserveSelectedRowKeys={true}` keeps selection entries alive even when their rows leave `dataSource`. Toggle the dataSource to see the selection restored when the row re-enters."
    >
      <div className="grid gap-3">
        <button type="button" className="pb-nav-btn" onClick={() => setCompact((value) => !value)}>
          Toggle dataSource
        </button>
        <Table<ProjectRecord>
          columns={defaultColumns}
          dataSource={compact ? projects.slice(2) : projects}
          rowKey="id"
          rowSelection={{ defaultSelectedRowKeys: ['p-1'], preserveSelectedRowKeys: true }}
          testIdPrefix="selection-preserve"
        />
      </div>
    </ComponentWrapper>
  );
};

export const PreserveSelectedRowKeys: Story = {
  render: () => <PreserveSelectedKeysExample />,
};

export const CustomRenderCell: Story = {
  render: () => (
    <ComponentWrapper
      title="Custom render cell"
      description="`rowSelection.renderCell` receives the checked flag, record, index, and the default `originNode` — return any `ReactNode` to wrap or replace the selection input."
    >
      <Table<ProjectRecord>
        columns={defaultColumns}
        dataSource={projects}
        rowKey="id"
        rowSelection={{
          renderCell: (checked, record, _index, originNode) => (
            <label className="inline-flex items-center gap-2">
              {originNode}
              <span className="text-xs">{checked ? `Selected ${record.name}` : `Choose ${record.name}`}</span>
            </label>
          ),
        }}
        testIdPrefix="selection-render-cell"
      />
    </ComponentWrapper>
  ),
};

export const TreeLinkedSelection: Story = {
  render: () => (
    <ComponentWrapper
      title="Tree-linked selection"
      description="`rowSelection.checkStrictly={false}` links parent and child selections through the tree defined by `expandable`. Selecting a parent selects all descendants; deselecting a child updates the parent's indeterminate state."
    >
      <Table<ProjectRecord>
        columns={defaultColumns}
        dataSource={treeProjects}
        rowKey="id"
        expandable={{ defaultExpandAllRows: true }}
        rowSelection={{ checkStrictly: false }}
        testIdPrefix="selection-tree-linked"
      />
    </ComponentWrapper>
  ),
};
