import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ComponentWrapper } from './storySupport';
import { Table } from '@oc-tech/omni-ui-components/Table';
import type { InvoiceLineRecord, ProjectRecord } from './Table.story.fixtures';
import {
  clientFilters,
  invoiceColumns,
  invoiceLines,
  defaultColumns,
  projects,
  statusFilters,
  storyTableRegistry,
  treeProjects,
  type DocCellData,
} from './Table.story.fixtures';

const meta: Meta = {
  title: 'omni-ui-components/Table/Kitchen Sink',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Every capability that composes on a single Omni Table instance, laid out one section per feature. Same component, different configurations — each block includes an AntD-style API summary and its own Show code panel.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const primaryRowSelection = { selections: true, getCheckboxProps: (record: ProjectRecord) => ({ disabled: record.disabled }) };
const primaryExpandable = {
  defaultExpandedRowKeys: ['p-1'],
  expandedRowRender: (record: ProjectRecord) => <div className="text-sm text-[var(--color-muted-foreground)]">{record.description}</div>,
};
const primaryPagination = { defaultPageSize: 4, placement: ['topEnd', 'bottomEnd'] as ('topStart' | 'topEnd' | 'bottomStart' | 'bottomEnd' | 'none')[] };

const filterableColumns = [
  { ...defaultColumns[0], sorter: true },
  { ...defaultColumns[1], filters: clientFilters, onFilter: (value: unknown, record: ProjectRecord) => record.client === value },
  { ...defaultColumns[2], filters: statusFilters, onFilter: (value: unknown, record: ProjectRecord) => record.status === value },
  ...defaultColumns.slice(3),
];

const treeExpandable = { childrenColumnName: 'children' as const, defaultExpandAllRows: true, indentSize: 28 };
const treeRowSelection = { checkStrictly: false };

const invoicePagination = { placement: ['none'] as ('topStart' | 'topEnd' | 'bottomStart' | 'bottomEnd' | 'none')[] };

export const AllFeatures: Story = {
  render: () => (
    <div className="grid gap-8">
      <ComponentWrapper
        title="Composed primary grid"
        description="Combines `rowSelection` (multi-select + bulk actions + disabled rows via `getCheckboxProps`), `expandable` (per-record detail rendered by `expandedRowRender`), `pagination` (top + bottom placement), and `registry`-driven cell renderers on the shared TanStack state."
      >
        <Table<ProjectRecord, DocCellData>
          columns={defaultColumns}
          dataSource={projects}
          rowKey="id"
          registry={storyTableRegistry}
          rowSelection={primaryRowSelection}
          expandable={primaryExpandable}
          pagination={primaryPagination}
          testIdPrefix="table-kitchen-sink"
        />
      </ComponentWrapper>

      <ComponentWrapper
        title="Filter and sort headers"
        description="Overlay `column.sorter` on the header cells you want sortable and `column.filters` + `column.onFilter` on the ones with dropdown filters — same `dataSource`, no extra state."
      >
        <Table<ProjectRecord> columns={filterableColumns} dataSource={projects} rowKey="id" testIdPrefix="table-kitchen-sink-filters" />
      </ComponentWrapper>

      <ComponentWrapper
        title="Tree rows with linked selection"
        description="`expandable.childrenColumnName` renders each record's `children` inline with an indent guide; `rowSelection.checkStrictly: false` cascades a parent's selection down to descendants."
      >
        <Table<ProjectRecord>
          columns={defaultColumns}
          dataSource={treeProjects}
          rowKey="id"
          expandable={treeExpandable}
          rowSelection={treeRowSelection}
          testIdPrefix="table-kitchen-sink-tree"
        />
      </ComponentWrapper>

      <ComponentWrapper
        title="Invoice-style record grid"
        description="A different record type on the same component — money-typed totals rendered through `invoiceColumns`, no pagination via `pagination.placement: ['none']`."
      >
        <Table<InvoiceLineRecord>
          columns={invoiceColumns}
          dataSource={invoiceLines}
          rowKey="id"
          pagination={invoicePagination}
          testIdPrefix="table-kitchen-sink-invoice"
        />
      </ComponentWrapper>
    </div>
  ),
};
