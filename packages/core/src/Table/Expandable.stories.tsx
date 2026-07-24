import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Table } from '@oc-tech/omni-ui-components/Table';
import { ComponentWrapper } from './storySupport';
import { defaultColumns, projects, treeProjects, type ProjectRecord } from './Table.story.fixtures';
const meta: Meta = {
  title: 'omni-ui-components/Table/Expandable',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Expandable stories cover expanded detail rows and tree rows using the AntD-compatible expandable contract: expandedRowRender, expandedRowKeys, expandIcon, row-click expansion, showExpandColumn, and indentation for nested records.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const ExpandedRowRender: Story = {
  render: () => (
    <ComponentWrapper
      title="Expanded row render"
      description="Return any `ReactNode` from `expandable.expandedRowRender(record, index, indent, expanded)` to reveal detail content beneath a row. Seed which rows start open with `defaultExpandedRowKeys`."
    >
      <Table<ProjectRecord>
        columns={defaultColumns}
        dataSource={projects}
        rowKey="id"
        expandable={{
          defaultExpandedRowKeys: ['p-1'],
          expandedRowRender: (record) => <div className="text-sm text-[var(--color-muted-foreground)]">{record.description}</div>,
        }}
        testIdPrefix="expandable-render"
      />
    </ComponentWrapper>
  ),
};

export const TreeRows: Story = {
  render: () => (
    <ComponentWrapper
      title="Tree rows"
      description="Records with a `children` array render as a tree. `expandable.childrenColumnName` picks the field name, `defaultExpandAllRows` opens everything on mount, and `indentSize` controls the per-depth indent in pixels."
    >
      <Table<ProjectRecord>
        columns={defaultColumns}
        dataSource={treeProjects}
        rowKey="id"
        expandable={{ childrenColumnName: 'children', defaultExpandAllRows: true, indentSize: 28 }}
        testIdPrefix="expandable-tree"
      />
    </ComponentWrapper>
  ),
};

export const ControlledExpandedKeys: Story = {
  render: () => {
    const [expandedRowKeys, setExpandedRowKeys] = React.useState<React.Key[]>(['p-2']);
    return (
      <ComponentWrapper
        title="Controlled expanded keys"
        description="Lift expansion into your component with `expandedRowKeys` + `onExpandedRowsChange`. Useful when expansion is driven by external state (URL params, remote data readiness, other UI)."
      >
        <Table<ProjectRecord>
          columns={defaultColumns}
          dataSource={projects}
          rowKey="id"
          expandable={{
            expandedRowKeys,
            expandedRowRender: (record) => <div>{record.description}</div>,
            onExpandedRowsChange: setExpandedRowKeys,
          }}
          testIdPrefix="expandable-controlled"
        />
      </ComponentWrapper>
    );
  },
};

export const CustomExpandIcon: Story = {
  render: () => (
    <ComponentWrapper
      title="Custom expand icon"
      description="`expandable.expandIcon({ expanded, record, onExpand })` returns the toggle element. Call `onExpand(record, event)` from your custom control to keep the Table's expansion state in sync."
    >
      <Table<ProjectRecord>
        columns={defaultColumns}
        dataSource={projects}
        rowKey="id"
        expandable={{
          expandedRowRender: (record) => <div>{record.description}</div>,
          expandIcon: ({ expanded, record, onExpand }) => (
            <button type="button" className="pb-nav-btn" onClick={(event) => onExpand(record, event)}>
              {expanded ? 'Close' : 'Open'}
            </button>
          ),
        }}
        testIdPrefix="expandable-custom-icon"
      />
    </ComponentWrapper>
  ),
};

export const ExpandRowByClickWithoutColumn: Story = {
  render: () => (
    <ComponentWrapper
      title="Expand row by click without column"
      description="`showExpandColumn: false` drops the dedicated toggle column and `expandRowByClick: true` makes the entire row clickable. Gate which rows can expand via `rowExpandable(record)`."
    >
      <Table<ProjectRecord>
        columns={defaultColumns}
        dataSource={projects}
        rowKey="id"
        expandable={{
          showExpandColumn: false,
          expandRowByClick: true,
          rowExpandable: (record) => record.id !== 'p-2',
          expandedRowRender: (record) => <div>{record.description}</div>,
        }}
        testIdPrefix="expandable-click-row"
      />
    </ComponentWrapper>
  ),
};
