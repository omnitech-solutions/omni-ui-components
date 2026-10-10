import type { TableColumn } from '@oc-tech/omni-ui-components/Table';

import { Table } from '@oc-tech/omni-ui-components/Table';
import type { Meta, StoryObj } from '@storybook/react';

import { ComponentWrapper } from './storySupport';
import { type ProjectRecord, projects } from './Table.story.fixtures';

const columns: TableColumn<ProjectRecord>[] = [
  { key: 'name', dataIndex: 'name', title: 'Project', editable: true },
  { key: 'client', dataIndex: 'client', title: 'Client', editable: true },
  { key: 'status', dataIndex: 'status', title: 'Status', editable: true },
];

const meta: Meta<typeof Table<ProjectRecord>> = {
  title: 'omni-ui-components/Table/Extendable',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A table that grows: `extendable.rows` and `extendable.columns` add an append control under the last row and after the last column, with factories for what is appended.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Table<ProjectRecord>>;

const dataSource = projects.slice(0, 2);

export const AppendRows: Story = {
  name: 'Append rows',
  render: () => (
    <ComponentWrapper
      title="Append rows"
      description="`extendable={{ rows: true }}` reveals an in-table “+ Add row” affordance below the last row. Omni builds an empty row from the current `columns`, so cells stay in sync with the schema."
    >
      <Table<ProjectRecord>
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        editable
        extendable={{ rows: true }}
        pagination={{ placement: ['none'] }}
        testIdPrefix="story-extend-rows"
      />
    </ComponentWrapper>
  ),
};

export const AppendColumns: Story = {
  name: 'Append columns',
  render: () => (
    <ComponentWrapper
      title="Append columns"
      description="`extendable={{ columns: true }}` reveals a “+ Add column” affordance to the right of the last header. New columns default to editable text cells; supply `extendable.columns.onAppend` to control their shape."
    >
      <Table<ProjectRecord>
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        editable
        extendable={{ columns: true }}
        pagination={{ placement: ['none'] }}
        testIdPrefix="story-extend-columns"
      />
    </ComponentWrapper>
  ),
};

export const AppendBoth: Story = {
  name: 'Append rows and columns',
  render: () => (
    <ComponentWrapper
      title="Append rows and columns"
      description="`extendable={true}` enables both affordances at once — the same shape as `{ rows: true, columns: true }`. Rows go beneath the last data row, columns to the right of the last header."
    >
      <Table<ProjectRecord>
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        editable
        extendable
        pagination={{ placement: ['none'] }}
        testIdPrefix="story-extend-both"
      />
    </ComponentWrapper>
  ),
};

export const CustomFactories: Story = {
  name: 'Custom row + column factories',
  render: () => (
    <ComponentWrapper
      title="Custom row + column factories"
      description="Provide `extendable.rows.onAppend` / `extendable.columns.onAppend` to customize the new-row and new-column shape. Each factory receives the current `rows` and `columns` so keys, defaults, and `dataIndex` stay unique."
    >
      <Table<ProjectRecord>
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        editable
        extendable={{
          rows: {
            onAppend: ({ rows }) => ({
              key: `custom-row-${rows.length + 1}`,
              cells: {
                name: { value: `New project ${rows.length + 1}` },
                client: { value: '—' },
                status: { value: 'Discovery' },
              },
            }),
          },
          columns: {
            onAppend: ({ columns: cols }) => ({
              key: `custom-column-${cols.length + 1}`,
              title: `Metric ${cols.length + 1}`,
              dataIndex: `metric_${cols.length + 1}`,
              editable: true,
            }),
          },
        }}
        pagination={{ placement: ['none'] }}
        testIdPrefix="story-extend-custom"
      />
    </ComponentWrapper>
  ),
};
