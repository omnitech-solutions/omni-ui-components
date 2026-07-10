import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { InlineCode, SegmentedPill, ShowCodePanel, TableOfContents, oneLine, useIsDark, type TocItem } from '../internal/support';

import { Table } from '@omnitech/omni-ui-core/Table';
import type { TableColumn } from '@omnitech/omni-ui-core/Table';
import {
  clientFilters,
  draggableRows,
  editableRows,
  groupedProjectColumns,
  invoiceColumns,
  invoiceLines,
  largeProjects,
  matrixRows,
  defaultColumns,
  projects,
  registryRows,
  spanRows,
  statusFilters,
  storyTableRegistry,
  treeProjects,
  wideProjectColumns,
  type DocCellData,
  type InvoiceLineRecord,
  type ProjectRecord,
} from '../../packages/core/src/Table/Table.story.fixtures';

const meta: Meta = {
  title: 'Getting Started/Table Overview',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The single reference page for every facet of the Omni Table component. Grouped into Core, Interaction, Data handling, and Presentation, each subsection carries a variant chip, description, live preview driven by the same factories the component stories use, and a Show code panel with the JSX a consumer would paste into an app view. Adding a variant in a factory flows through automatically.',
      },
    },
  },
};
export default meta;

// ---------------------------------------------------------------------------
// TOC
// ---------------------------------------------------------------------------

const tocItems: TocItem[] = [
  { id: 'core-component', label: '1.1 Table component', group: '1. Core' },
  { id: 'core-columns', label: '1.2 Columns' },
  { id: 'core-column-groups', label: '1.3 Column groups' },
  { id: 'core-data-rows', label: '1.4 Explicit data rows' },
  { id: 'core-cell-overrides', label: '1.5 Cell overrides' },
  { id: 'core-registry', label: '1.6 Registry cell renderers' },

  { id: 'interaction-selection-checkbox', label: '2.1 Row selection (checkbox)', group: '2. Interaction' },
  { id: 'interaction-selection-radio', label: '2.2 Row selection (radio)' },
  { id: 'interaction-bulk-actions', label: '2.3 Bulk actions' },
  { id: 'interaction-expandable', label: '2.4 Expandable rows' },
  { id: 'interaction-tree', label: '2.5 Tree rows' },
  { id: 'interaction-column-drag', label: '2.6 Column drag and drop' },
  { id: 'interaction-row-drag', label: '2.7 Row drag and drop' },
  { id: 'interaction-editable', label: '2.8 Editable' },
  { id: 'interaction-editable-cells', label: 'Editable cells', nested: true },
  { id: 'interaction-editable-append-columns', label: 'Append columns', nested: true },
  { id: 'interaction-editable-append-rows', label: 'Append rows', nested: true },
  { id: 'interaction-editable-append-both', label: 'Append rows and columns', nested: true },

  { id: 'data-sorting', label: '3.1 Sorting', group: '3. Data handling' },
  { id: 'data-filtering', label: '3.2 Column filters' },
  { id: 'data-pagination', label: '3.3 Pagination' },
  { id: 'data-virtualization', label: '3.4 Virtualization' },

  { id: 'presentation-appearance', label: '4.1 Appearance', group: '4. Presentation' },
  { id: 'presentation-header-styling', label: '4.2 Header styling' },
  { id: 'presentation-alignment', label: '4.3 Alignment and text size' },
  { id: 'presentation-semantic-dom', label: '4.4 Semantic DOM slots' },
  { id: 'presentation-empty', label: '4.5 Empty state' },
  { id: 'presentation-loading', label: '4.6 Loading' },
  { id: 'presentation-loading-skeleton', label: 'Skeleton', nested: true },
  { id: 'presentation-loading-spinner', label: 'Spinner', nested: true },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface SubComponentRowProps {
  id: string;
  number: string;
  name: string;
  ic: string;
  chips?: string[];
  description: React.ReactNode;
  code: string | Record<string, string>;
  language?: string;
  children: React.ReactNode;
}

const SubComponentRow = ({ id, number, name, ic, code, language = 'tsx', children }: SubComponentRowProps) => (
  <div id={id} className="pb-overview-row">
    <div className="pb-overview-row-header">
      <SegmentedPill
        segments={[{ content: number, uppercase: true, silver: true }, { content: name, uppercase: true }, { content: <InlineCode code={ic} /> }]}
      />
    </div>
    <div className="pb-overview-row-preview">{children}</div>
    <ShowCodePanel code={code} language={language} />
  </div>
);

const GroupHeader = ({ id, number, title }: { id: string; number: string; title: string; description?: React.ReactNode }) => (
  <section id={id} className="pb-pipeline-section pb-overview-group">
    <h3 className="pb-overview-group-title">
      {number}. {title}
    </h3>
  </section>
);

// ---------------------------------------------------------------------------
// Reusable minimal columns (kept short so previews stay legible)
// ---------------------------------------------------------------------------

const compactProjectColumns: TableColumn<ProjectRecord>[] = defaultColumns.slice(0, 4);

// ---------------------------------------------------------------------------
// Individual subcomponent renderers
// ---------------------------------------------------------------------------

// Plain columns — no icon, no phase pill, no sorter. Used by 1.1 so the
// intro preview reads as the minimum "table of records" without extra
// affordances (those live in 1.2 Columns and further sections).
const plainProjectColumns: TableColumn<ProjectRecord>[] = [
  { key: 'name', dataIndex: 'name', title: 'Project' },
  { key: 'client', dataIndex: 'client', title: 'Client' },
  { key: 'status', dataIndex: 'status', title: 'Status' },
  { key: 'owner', dataIndex: 'owner', title: 'Owner' },
];

const CoreComponentPreview = () => (
  <Table<ProjectRecord>
    columns={plainProjectColumns}
    dataSource={projects.slice(0, 3)}
    rowKey="id"
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-core-component"
  />
);

const CoreColumnsPreview = () => (
  <Table<ProjectRecord>
    columns={[
      { key: 'name', dataIndex: 'name', title: 'Name', sorter: (a, b) => a.name.localeCompare(b.name) },
      { key: 'client', dataIndex: 'client', title: 'Client' },
      { key: 'status', dataIndex: 'status', title: 'Status', align: 'center' },
      { key: 'budget', dataIndex: 'budget', title: 'Budget', align: 'right' },
    ]}
    dataSource={projects.slice(0, 4)}
    rowKey="id"
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-core-columns"
  />
);

const ColumnGroupsPreview = () => (
  <Table<ProjectRecord>
    columns={groupedProjectColumns}
    dataSource={projects.slice(0, 3)}
    rowKey="id"
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-core-column-groups"
  />
);

const DataRowsPreview = () => (
  <Table<ProjectRecord, DocCellData>
    columns={compactProjectColumns}
    rows={matrixRows.slice(0, 3)}
    rowKey="id"
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-core-data-rows"
  />
);

const CellOverridesPreview = () => (
  <Table<ProjectRecord, DocCellData>
    columns={compactProjectColumns}
    rows={spanRows.slice(0, 3)}
    rowKey="id"
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-core-cell-overrides"
  />
);

const RegistryPreview = () => (
  <Table<ProjectRecord, DocCellData>
    columns={compactProjectColumns}
    rows={registryRows.slice(0, 3)}
    rowKey="id"
    registry={storyTableRegistry}
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-core-registry"
  />
);

const SelectionCheckboxPreview = () => (
  <Table<ProjectRecord>
    columns={compactProjectColumns}
    dataSource={projects.slice(0, 4)}
    rowKey="id"
    rowSelection={{ defaultSelectedRowKeys: ['p-1'] }}
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-selection-checkbox"
  />
);

const SelectionRadioPreview = () => (
  <Table<ProjectRecord>
    columns={compactProjectColumns}
    dataSource={projects.slice(0, 4)}
    rowKey="id"
    rowSelection={{ type: 'radio', defaultSelectedRowKeys: ['p-2'] }}
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-selection-radio"
  />
);

const BulkActionsPreview = () => (
  <Table<ProjectRecord>
    columns={compactProjectColumns}
    dataSource={projects.slice(0, 4)}
    rowKey="id"
    rowSelection={{ selections: true }}
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-bulk-actions"
  />
);

const ExpandablePreview = () => (
  <Table<ProjectRecord>
    columns={compactProjectColumns}
    dataSource={projects.slice(0, 3)}
    rowKey="id"
    expandable={{
      defaultExpandedRowKeys: ['p-1'],
      expandedRowRender: (record) => <div className="text-sm text-[var(--color-muted-foreground)]">{record.description}</div>,
    }}
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-expandable"
  />
);

const treeProjectColumns: TableColumn<ProjectRecord>[] = [
  { key: 'name', dataIndex: 'name', title: 'Project' },
  { key: 'client', dataIndex: 'client', title: 'Client' },
  { key: 'status', dataIndex: 'status', title: 'Status' },
  { key: 'owner', dataIndex: 'owner', title: 'Owner' },
];

const treeProjectData: ProjectRecord[] = [
  {
    id: 'phase-1',
    name: 'Phase 1',
    client: 'Acme Coffee',
    status: 'Discovery',
    phase: 'Phase 1',
    owner: 'Nora Nunes',
    budget: 3800,
    margin: 0.36,
    dueDate: '2026-07-15',
    children: [
      {
        id: 'phase-1-a',
        name: 'Research',
        client: 'Acme Coffee',
        status: 'Discovery',
        phase: 'Phase 1',
        owner: 'Nora Nunes',
        budget: 1200,
        margin: 0.3,
        dueDate: '2026-07-08',
        children: [
          {
            id: 'phase-1-a-1',
            name: 'User interviews',
            client: 'Acme Coffee',
            status: 'Discovery',
            phase: 'Phase 1',
            owner: 'Nora Nunes',
            budget: 600,
            margin: 0.28,
            dueDate: '2026-07-05',
          },
          {
            id: 'phase-1-a-2',
            name: 'Competitive scan',
            client: 'Acme Coffee',
            status: 'Discovery',
            phase: 'Phase 1',
            owner: 'Nora Nunes',
            budget: 600,
            margin: 0.32,
            dueDate: '2026-07-06',
          },
        ],
      },
    ],
  },
  {
    id: 'phase-2',
    name: 'Phase 2',
    client: 'Northstar',
    status: 'Design',
    phase: 'Phase 2',
    owner: 'Mae Cooper',
    budget: 4200,
    margin: 0.32,
    dueDate: '2026-08-01',
  },
  {
    id: 'phase-3',
    name: 'Phase 3',
    client: 'Field Goods',
    status: 'Build',
    phase: 'Phase 3',
    owner: 'Iris Chen',
    budget: 5100,
    margin: 0.28,
    dueDate: '2026-08-20',
    children: [
      {
        id: 'phase-3-a',
        name: 'Handover',
        client: 'Field Goods',
        status: 'Build',
        phase: 'Phase 3',
        owner: 'Iris Chen',
        budget: 900,
        margin: 0.24,
        dueDate: '2026-08-18',
      },
      {
        id: 'phase-3-b',
        name: 'Retrospective',
        client: 'Field Goods',
        status: 'Build',
        phase: 'Phase 3',
        owner: 'Mae Cooper',
        budget: 400,
        margin: 0.22,
        dueDate: '2026-08-22',
      },
    ],
  },
];

const TreePreview = () => (
  <Table<ProjectRecord>
    columns={treeProjectColumns}
    dataSource={treeProjectData}
    rowKey="id"
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-tree"
  />
);

const editableColumns: TableColumn<ProjectRecord>[] = [
  { key: 'name', dataIndex: 'name', title: 'Project', editable: true },
  { key: 'client', dataIndex: 'client', title: 'Client', editable: true },
  { key: 'status', dataIndex: 'status', title: 'Status', editable: true },
  { key: 'owner', dataIndex: 'owner', title: 'Owner', editable: true },
];

const EditablePreview = () => (
  <Table<ProjectRecord>
    columns={editableColumns}
    dataSource={projects.slice(0, 3)}
    rowKey="id"
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-editable"
  />
);

const ColumnDragPreview = () => (
  <Table<ProjectRecord>
    // Strip filter / sort affordances so the row focuses on the drag gesture;
    // filtering + sorting live in their own dedicated 3.1 / 3.2 sections.
    columns={compactProjectColumns.map((column) => ({
      ...column,
      draggable: true,
      filters: undefined,
      onFilter: undefined,
      sorter: undefined,
    }))}
    dataSource={projects.slice(0, 4)}
    rowKey="id"
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-column-drag"
  />
);

const RowDragPreview = () => (
  <Table<ProjectRecord, DocCellData>
    columns={compactProjectColumns}
    rows={draggableRows}
    rowKey="id"
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-row-drag"
  />
);

const extendColumns: TableColumn<ProjectRecord>[] = [
  { key: 'name', dataIndex: 'name', title: 'Project', editable: true },
  { key: 'client', dataIndex: 'client', title: 'Client', editable: true },
  { key: 'status', dataIndex: 'status', title: 'Status', editable: true },
];

const ExtendRowsPreview = () => (
  <Table<ProjectRecord>
    columns={extendColumns}
    dataSource={projects.slice(0, 2)}
    rowKey="id"
    editable
    extendable={{ rows: true }}
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-extend-rows"
  />
);

const ExtendColumnsPreview = () => (
  <Table<ProjectRecord>
    columns={extendColumns}
    dataSource={projects.slice(0, 2)}
    rowKey="id"
    editable
    extendable={{ columns: true }}
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-extend-columns"
  />
);

const ExtendBothPreview = () => (
  <Table<ProjectRecord>
    columns={extendColumns}
    dataSource={projects.slice(0, 2)}
    rowKey="id"
    editable
    extendable
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-extend-both"
  />
);

const SortingPreview = () => (
  <Table<ProjectRecord>
    columns={[
      { key: 'name', dataIndex: 'name', title: 'Name', sorter: (a, b) => a.name.localeCompare(b.name) },
      { key: 'client', dataIndex: 'client', title: 'Client', sorter: (a, b) => a.client.localeCompare(b.client) },
      { key: 'budget', dataIndex: 'budget', title: 'Budget', align: 'right', sorter: (a, b) => a.budget - b.budget },
    ]}
    dataSource={projects}
    rowKey="id"
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-sorting"
  />
);

const FilteringPreview = () => (
  <Table<ProjectRecord>
    columns={[
      { key: 'name', dataIndex: 'name', title: 'Name' },
      { key: 'client', dataIndex: 'client', title: 'Client', filters: clientFilters, onFilter: (v, r) => r.client === v },
      { key: 'status', dataIndex: 'status', title: 'Status', filters: statusFilters, onFilter: (v, r) => r.status === v },
    ]}
    dataSource={projects}
    rowKey="id"
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-filtering"
  />
);

const PaginationPreview = () => (
  <Table<ProjectRecord>
    columns={compactProjectColumns}
    dataSource={projects}
    rowKey="id"
    pagination={{
      defaultPageSize: 2,
      placement: ['bottomEnd'],
      showSizeChanger: true,
      pageSizeOptions: [2, 5, 10, 20],
    }}
    testIdPrefix="overview-pagination"
  />
);

const VirtualizationPreview = () => (
  <Table<ProjectRecord>
    columns={wideProjectColumns.slice(0, 5)}
    dataSource={largeProjects}
    rowKey="id"
    scroll={{ y: 260 }}
    virtual
    testIdPrefix="overview-virtualization"
  />
);

const AppearancePreview = () => (
  <div className="grid gap-4">
    <Table<ProjectRecord>
      columns={compactProjectColumns}
      dataSource={projects.slice(0, 3)}
      rowKey="id"
      appearance={{ borders: 'grid', stripedRows: true }}
      pagination={{ placement: ['none'] }}
      testIdPrefix="overview-appearance-grid"
    />
    <Table<ProjectRecord>
      columns={compactProjectColumns}
      dataSource={projects.slice(0, 3)}
      rowKey="id"
      appearance={{ borders: 'rows' }}
      pagination={{ placement: ['none'] }}
      testIdPrefix="overview-appearance-rows"
    />
    <Table<ProjectRecord>
      columns={compactProjectColumns}
      dataSource={projects.slice(0, 3)}
      rowKey="id"
      appearance={{ borders: 'none' }}
      pagination={{ placement: ['none'] }}
      testIdPrefix="overview-appearance-none"
    />
  </div>
);

const HeaderStylingPreview = () => {
  // `headerFill` / `borderColor` accept explicit CSS values. The demo values
  // below swap per theme so the preview stays readable in dark mode; a real
  // consumer typically passes a single brand color that reads against their
  // own body copy on a doc canvas.
  const isDark = useIsDark();
  const headerFill = isDark ? '#213b2c' : '#eef5ee';
  const borderColor = isDark ? '#3f5844' : '#c9d6cb';
  return (
    <Table<ProjectRecord>
      columns={compactProjectColumns}
      dataSource={projects.slice(0, 3)}
      rowKey="id"
      appearance={{ borders: 'grid', headerFill, borderColor, headerColumn: true }}
      pagination={{ placement: ['none'] }}
      testIdPrefix="overview-header-styling"
    />
  );
};

const AlignmentPreview = () => (
  <Table<ProjectRecord>
    columns={[
      { key: 'name', dataIndex: 'name', title: 'Left', align: 'left' },
      { key: 'client', dataIndex: 'client', title: 'Center', align: 'center' },
      { key: 'status', dataIndex: 'status', title: 'Right', align: 'right' },
    ]}
    dataSource={projects.slice(0, 3)}
    rowKey="id"
    appearance={{ textSize: 16, cellAlignment: 'center' }}
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-alignment"
  />
);

const SemanticDomPreview = () => (
  <Table<InvoiceLineRecord>
    columns={invoiceColumns}
    dataSource={invoiceLines}
    rowKey="id"
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-semantic-dom"
  />
);

const EmptyPreview = () => (
  <Table<ProjectRecord> columns={compactProjectColumns} dataSource={[]} rowKey="id" pagination={{ placement: ['none'] }} testIdPrefix="overview-empty" />
);

const LoadingSkeletonPreview = () => (
  <Table<ProjectRecord>
    columns={compactProjectColumns}
    dataSource={projects.slice(0, 2)}
    rowKey="id"
    loading
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-loading-skeleton"
  />
);

const LoadingSpinnerPreview = () => (
  <Table<ProjectRecord>
    columns={compactProjectColumns}
    dataSource={projects.slice(0, 2)}
    rowKey="id"
    loading="spinner"
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-loading-spinner"
  />
);

// ---------------------------------------------------------------------------
// Code strings (kept next to their preview for editability)
// ---------------------------------------------------------------------------

// Every fixture referenced in Show code is registered here with its actual
// import name. A snippet that mentions any of these identifiers is prepended
// with a `const <name> = <one-line-value>;` declaration so the reader can
// paste the snippet as-is. Add a new entry when introducing a new fixture
// reference in a CODE.* string.
const FIXTURE_INLINES: Record<string, string> = {
  defaultColumns: oneLine(defaultColumns),
  projects: oneLine(projects),
  treeProjects: oneLine(treeProjects),
  largeProjects: oneLine(largeProjects),
  wideProjectColumns: oneLine(wideProjectColumns),
  matrixRows: oneLine(matrixRows),
  editableRows: oneLine(editableRows),
  draggableRows: oneLine(draggableRows),
  invoiceColumns: oneLine(invoiceColumns),
  invoiceLines: oneLine(invoiceLines),
};

const RAW_CODE = {
  component: `<Table<ProjectRecord>
  columns={defaultColumns}
  dataSource={projects}
  rowKey="id"
/>`,
  columns: `<Table<ProjectRecord>
  columns={defaultColumns}
  dataSource={projects}
  rowKey="id"
/>`,
  columnGroups: `const grouped: TableColumn<ProjectRecord>[] = [
  {
    title: 'Project',
    children: [
      { key: 'name', dataIndex: 'name', title: 'Name' },
      { key: 'client', dataIndex: 'client', title: 'Client' },
    ],
  },
  {
    title: 'Delivery',
    children: [
      { key: 'status', dataIndex: 'status', title: 'Status' },
      { key: 'budget', dataIndex: 'budget', title: 'Budget', align: 'right' },
    ],
  },
];

<Table<ProjectRecord> columns={grouped} dataSource={projects} rowKey="id" />`,
  dataRows: `<Table<ProjectRecord, DocCellData>
  columns={defaultColumns}
  rows={matrixRows}
  rowKey="id"
/>`,
  cellOverrides: `const rows: TableDataRow<ProjectRecord, DocCellData>[] = [
  {
    key: 'p-1',
    record: projects[0],
    cells: {
      name: { colSpan: 2, value: 'Combined title cell' },
      status: { align: 'right', value: 'On track' },
    },
  },
];

<Table<ProjectRecord, DocCellData> columns={defaultColumns} rows={rows} rowKey="id" />`,
  registry: `const registry = mergeTableRegistry(getDefaultTableRegistry(), {
  fields: {
    money: { render: ({ value }) => formatCurrency(value) },
    status: { render: ({ value }) => <StatusTag status={value} /> },
  },
});

<Table<ProjectRecord, DocCellData>
  columns={defaultColumns}
  rows={rows}
  rowKey="id"
  registry={registry}
/>`,
  selectionCheckbox: `<Table<ProjectRecord>
  columns={defaultColumns}
  dataSource={projects}
  rowKey="id"
  rowSelection={{ defaultSelectedRowKeys: ['p-1'] }}
/>`,
  selectionRadio: `<Table<ProjectRecord>
  columns={defaultColumns}
  dataSource={projects}
  rowKey="id"
  rowSelection={{ type: 'radio', defaultSelectedRowKeys: ['p-2'] }}
/>`,
  bulkActions: `<Table<ProjectRecord>
  columns={defaultColumns}
  dataSource={projects}
  rowKey="id"
  rowSelection={{ selections: true }}
/>`,
  expandable: `<Table<ProjectRecord>
  columns={defaultColumns}
  dataSource={projects}
  rowKey="id"
  expandable={{
    defaultExpandedRowKeys: ['p-1'],
    expandedRowRender: (record) => <div>{record.description}</div>,
  }}
/>`,
  tree: `const columns = [
  { key: 'name', dataIndex: 'name', title: 'Project' },
  { key: 'client', dataIndex: 'client', title: 'Client' },
  { key: 'status', dataIndex: 'status', title: 'Status' },
  { key: 'owner', dataIndex: 'owner', title: 'Owner' },
];

const data = [
  {
    id: 'phase-1',
    name: 'Phase 1',
    client: 'Acme Coffee',
    status: 'Discovery',
    owner: 'Nora Nunes',
    children: [
      { id: 'phase-1-a', name: 'Research', client: 'Acme Coffee', status: 'Discovery', owner: 'Nora Nunes' },
      { id: 'phase-1-b', name: 'Audit',    client: 'Acme Coffee', status: 'Discovery', owner: 'Iris Chen' },
    ],
  },
  { id: 'phase-2', name: 'Phase 2', client: 'Northstar',   status: 'Design', owner: 'Mae Cooper' },
];

<Table columns={columns} dataSource={data} rowKey="id" />`,
  editable: `<Table<ProjectRecord, DocCellData>
  columns={defaultColumns}
  rows={editableRows}
  rowKey="id"
  registry={registry}
/>`,
  columnDrag: `<Table<ProjectRecord>
  columns={columns.map((column) => ({ ...column, draggable: true }))}
  dataSource={projects}
  rowKey="id"
  onColumnOrderChange={(order) => saveColumnOrder(order)}
/>`,
  rowDrag: `<Table<ProjectRecord, DocCellData>
  columns={defaultColumns}
  rows={draggableRows}
  rowKey="id"
  onRowOrderChange={(keys, rows, records) => saveRowOrder(keys)}
/>`,
  extendRows: `<Table
  columns={columns}
  dataSource={rows}
  rowKey="id"
  editable
  extendable={{ rows: true }}
/>`,
  extendColumns: `<Table
  columns={columns}
  dataSource={rows}
  rowKey="id"
  editable
  extendable={{ columns: true }}
/>`,
  extendBoth: `<Table
  columns={columns}
  dataSource={rows}
  rowKey="id"
  editable
  extendable
/>`,
  sorting: `<Table<ProjectRecord>
  columns={defaultColumns}
  dataSource={projects}
  rowKey="id"
/>`,
  filtering: `<Table<ProjectRecord>
  columns={defaultColumns}
  dataSource={projects}
  rowKey="id"
/>`,
  pagination: `<Table<ProjectRecord>
  columns={defaultColumns}
  dataSource={projects}
  rowKey="id"
  pagination={{
    defaultPageSize: 2,
    placement: ['bottomEnd'],
    showSizeChanger: true,
    pageSizeOptions: [2, 5, 10, 20],
  }}
/>`,
  virtualization: `<Table<ProjectRecord>
  columns={wideProjectColumns.slice(0, 5)}
  dataSource={largeProjects}
  rowKey="id"
  scroll={{ y: 260 }}
  virtual
/>`,
  appearance: `<Table appearance={{ borders: 'grid',   stripedRows: true }} ... />
<Table appearance={{ borders: 'rows' }} ... />
<Table appearance={{ borders: 'none' }} ... />`,
  headerStyling: `<Table
  columns={defaultColumns}
  dataSource={projects}
  rowKey="id"
  appearance={{ borders: 'grid', headerFill: '#eef5ee', borderColor: '#c9d6cb', headerColumn: true }}
/>`,
  alignment: `<Table
  columns={defaultColumns}
  dataSource={projects}
  rowKey="id"
  appearance={{ textSize: 16, cellAlignment: 'center' }}
/>`,
  semanticDom: `<Table<InvoiceLineRecord>
  columns={invoiceColumns}
  dataSource={invoiceLines}
  rowKey="id"
/>
// Rendered semantic DOM:
// <table role="table">
//   <thead role="rowgroup">
//     <tr role="row">
//       <th role="columnheader">...</th>
//     </tr>
//   </thead>
//   <tbody role="rowgroup">
//     <tr role="row">
//       <td role="cell">...</td>
//     </tr>
//   </tbody>
// </table>`,
  empty: `<Table columns={defaultColumns} dataSource={[]} rowKey="id" />`,
  loadingSkeleton: `<Table columns={defaultColumns} dataSource={projects} rowKey="id" loading />`,
  loadingSpinner: `<Table columns={defaultColumns} dataSource={projects} rowKey="id" loading="spinner" />`,
} as const;

/**
 * Scan a snippet for any registered fixture identifier and prepend a
 * `const <name> = <one-line-value>;` declaration for each one referenced.
 * The declarations are emitted in the order they first appear in the snippet
 * so the resulting preamble reads top-to-bottom naturally.
 */
const withDynamicPreamble = (snippet: string): string => {
  const seen: string[] = [];
  for (const name of Object.keys(FIXTURE_INLINES)) {
    const pattern = new RegExp(`\\b${name}\\b`);
    if (pattern.test(snippet) && !seen.includes(name)) seen.push(name);
  }
  if (!seen.length) return snippet;
  seen.sort((left, right) => snippet.indexOf(left) - snippet.indexOf(right));
  const preamble = seen.map((name) => `const ${name} = ${FIXTURE_INLINES[name]};`).join('\n');
  return `${preamble}\n\n${snippet}`;
};

const CODE = Object.fromEntries(Object.entries(RAW_CODE).map(([key, value]) => [key, withDynamicPreamble(value)])) as Record<keyof typeof RAW_CODE, string>;

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

const TableComponentOverview = () => (
  <div className="pb-shell">
    <div className="pb-overview-layout">
      <main className="pb-overview-main">
        <div className="pb-shell-header">
          <h2>
            Table Component Overview
            <SegmentedPill
              segments={[
                { content: 'Omni UI', uppercase: true },
                { content: '<Table />', tinted: true },
                { content: 'Reference', tinted: true },
              ]}
            />
          </h2>
          <p style={{ color: '#CED0D2' }}>
            Every configuration option the Table component supports, on one page. Each section shows what the option does, a working preview you can interact
            with, and a copy-pasteable snippet.
          </p>
        </div>

        <GroupHeader
          id="group-core"
          number="1"
          title="Core"
          description="The building blocks — the component itself, the columns it renders, and the data it shows."
        />

        <SubComponentRow
          id="core-component"
          number="1.1"
          name="Table"
          ic="Table<TRecord, TRowData>"
          chips={['<Table />', 'columns', 'dataSource']}
          description={
            <>
              Render a list of records as a table. Pass an array to <InlineCode code="dataSource" />, describe your columns, and give each row a stable id via{' '}
              <InlineCode code="rowKey" />. That’s the minimum setup — everything else on this page is optional.
            </>
          }
          code={CODE.component}
        >
          <CoreComponentPreview />
        </SubComponentRow>

        <SubComponentRow
          id="core-columns"
          number="1.2"
          name="Columns"
          ic="TableColumn<TRecord>"
          chips={['dataIndex', 'title', 'align', 'sorter', 'render']}
          description={
            <>
              Each column decides which record property to read (<InlineCode code="dataIndex" />
              ), what header to show (<InlineCode code="title" />
              ), and how the cell renders. Add <InlineCode code="render" /> for custom JSX, <InlineCode code="align" /> / <InlineCode code="width" /> for
              layout, and <InlineCode code="sorter" /> or <InlineCode code="filters" /> to make the column interactive.
            </>
          }
          code={CODE.columns}
        >
          <CoreColumnsPreview />
        </SubComponentRow>

        <SubComponentRow
          id="core-column-groups"
          number="1.3"
          name="Column groups"
          ic="TableColumnGroup<TRecord>"
          chips={['column.children']}
          description={
            <>
              Group related columns under a shared header. Put child columns inside a parent column’s <InlineCode code="children" /> array — the parent header
              spans them automatically and each child keeps its own sorting or filtering.
            </>
          }
          code={CODE.columnGroups}
        >
          <ColumnGroupsPreview />
        </SubComponentRow>

        <SubComponentRow
          id="core-data-rows"
          number="1.4"
          name="Explicit data rows"
          ic="TableDataRow<TRecord, TRowData>"
          chips={['dataRows', 'cells']}
          description={
            <>
              Use <InlineCode code="rows" /> instead of <InlineCode code="dataSource" /> when your data is cell-first rather than record-first — e.g. a
              document-style table where each cell has its own type. Every row still carries its record plus an explicit <InlineCode code="cells" /> object
              keyed by column.
            </>
          }
          code={CODE.dataRows}
        >
          <DataRowsPreview />
        </SubComponentRow>

        <SubComponentRow
          id="core-cell-overrides"
          number="1.5"
          name="Cell overrides"
          ic="TableCellOverride<TRecord, TRowData, TValue>"
          chips={['colSpan', 'rowSpan', 'align', 'value', 'kind']}
          description={
            <>
              Change behaviour on a single cell without touching the whole column. <InlineCode code="colSpan" /> and <InlineCode code="rowSpan" /> merge cells,{' '}
              <InlineCode code="align" /> overrides the column’s alignment, and <InlineCode code="kind" /> picks a specific renderer from the registry.
            </>
          }
          code={CODE.cellOverrides}
        >
          <CellOverridesPreview />
        </SubComponentRow>

        <SubComponentRow
          id="core-registry"
          number="1.6"
          name="Registry cell renderers"
          ic="TableRegistry<TRecord, TRowData>"
          chips={['registry', 'mergeTableRegistry', 'getDefaultTableRegistry']}
          description={
            <>
              The registry turns a cell’s <InlineCode code="kind" /> (paragraph, image, money, status, …) into the component that renders it. Extend the default
              registry with <InlineCode code="mergeTableRegistry" /> when you need a custom renderer — don’t fork the Table itself.
            </>
          }
          code={CODE.registry}
        >
          <RegistryPreview />
        </SubComponentRow>

        <GroupHeader
          id="group-interaction"
          number="2"
          title="Interaction"
          description="Everything a user can do to the table: select, expand, edit, and reorder."
        />

        <SubComponentRow
          id="interaction-selection-checkbox"
          number="2.1"
          name="Row selection (checkbox)"
          ic="TableRowSelection<TRecord, TRowData>"
          chips={['type: checkbox', 'defaultSelectedRowKeys', 'preserveSelectedRowKeys']}
          description={
            <>
              Pass <InlineCode code="rowSelection" /> to add per-row checkboxes and a select-all in the header. Use <InlineCode code="defaultSelectedRowKeys" />{' '}
              for uncontrolled defaults, or <InlineCode code="selectedRowKeys" /> +
              <InlineCode code="onChange" /> for full control. Add <InlineCode code="preserveSelectedRowKeys" /> to keep the selection when the data reloads.
            </>
          }
          code={CODE.selectionCheckbox}
        >
          <SelectionCheckboxPreview />
        </SubComponentRow>

        <SubComponentRow
          id="interaction-selection-radio"
          number="2.2"
          name="Row selection (radio)"
          ic="TableRowSelection<TRecord, TRowData>"
          chips={['type: radio', 'single-select']}
          description="Set rowSelection.type: 'radio' when the user must pick exactly one row — typical for pickers, master/detail views, and single-record flows."
          code={CODE.selectionRadio}
        >
          <SelectionRadioPreview />
        </SubComponentRow>

        <SubComponentRow
          id="interaction-bulk-actions"
          number="2.3"
          name="Bulk actions"
          ic="TableBulkActionsConfig<TRecord, TRowData>"
          chips={['All', 'Invert', 'None']}
          description="Set rowSelection.selections: true to add a dropdown next to the header checkbox with All / Invert / None. Pass an array of action objects instead to add your own — Delete, Export, Archive, and so on."
          code={CODE.bulkActions}
        >
          <BulkActionsPreview />
        </SubComponentRow>

        <SubComponentRow
          id="interaction-expandable"
          number="2.4"
          name="Expandable rows"
          ic="TableExpandable<TRecord, TRowData>"
          chips={['defaultExpandedRowKeys', 'expandedRowKeys', 'expandIcon']}
          description={
            <>
              Show extra detail inline below any row. Return React content from <InlineCode code="expandable.expandedRowRender" />. Use{' '}
              <InlineCode code="defaultExpandedRowKeys" /> for a default open state, or <InlineCode code="expandedRowKeys" /> when you need to control which
              rows are open.
            </>
          }
          code={CODE.expandable}
        >
          <ExpandablePreview />
        </SubComponentRow>

        <SubComponentRow
          id="interaction-tree"
          number="2.5"
          name="Tree rows"
          ic="TableExpandable<TRecord, TRowData>"
          chips={['indentSize', 'defaultExpandAllRows', 'checkStrictly']}
          description={
            <>
              Turn the table into a tree by pointing <InlineCode code="expandable.childrenColumnName" /> at the property that holds a row’s children. Combine
              with <InlineCode code="rowSelection.checkStrictly: false" /> so selecting a parent also selects everything under it.
            </>
          }
          code={CODE.tree}
        >
          <TreePreview />
        </SubComponentRow>

        <SubComponentRow
          id="interaction-column-drag"
          number="2.6"
          name="Column drag and drop"
          ic="TableColumn<TRecord>"
          chips={['@dnd-kit/core', 'horizontal sortable', 'columnOrder']}
          description={
            <>
              Let users reorder columns by dragging their headers. Add <InlineCode code="draggable: true" /> to each reorderable column and listen to{' '}
              <InlineCode code="onColumnOrderChange" /> to persist the new order.
            </>
          }
          code={CODE.columnDrag}
        >
          <ColumnDragPreview />
        </SubComponentRow>

        <SubComponentRow
          id="interaction-row-drag"
          number="2.7"
          name="Row drag and drop"
          ic="TableDataRow<TRecord, TRowData>"
          chips={['@dnd-kit/core', 'vertical sortable', 'onRowOrderChange']}
          description={
            <>
              Let users reorder rows by dragging a grip handle on the left. Pass data through the <InlineCode code="rows" /> prop with{' '}
              <InlineCode code="draggable: true" /> on each reorderable row — <InlineCode code="onRowOrderChange" /> gives you the new key order after every
              drop.
            </>
          }
          code={CODE.rowDrag}
        >
          <RowDragPreview />
        </SubComponentRow>

        <SubComponentRow
          id="interaction-editable"
          number="2.8"
          name="Editable"
          ic="TableEditableConfig<TRecord, TRowData>"
          chips={['editable', 'extendable', 'onEdit']}
          description={
            <>
              One prop turns every column into an inline editor and enables the "+" affordances for appending rows and columns. Table persists edits and
              appended rows/columns internally; wire <InlineCode code="onEdit" />, <InlineCode code="column.editable" />, or
              <InlineCode code="extendable.rows.onAppend" /> only when you need to intercept.
            </>
          }
          code={{
            Cells: CODE.editable,
            'Append columns': CODE.extendColumns,
            'Append rows': CODE.extendRows,
            Both: CODE.extendBoth,
          }}
        >
          <div className="pb-overview-stack">
            <section id="interaction-editable-cells" className="pb-overview-subsection">
              <h4 className="pb-overview-subsection-title">Editable cells</h4>
              <EditablePreview />
            </section>
            <section id="interaction-editable-append-columns" className="pb-overview-subsection">
              <h4 className="pb-overview-subsection-title">Append columns</h4>
              <ExtendColumnsPreview />
            </section>
            <section id="interaction-editable-append-rows" className="pb-overview-subsection">
              <h4 className="pb-overview-subsection-title">Append rows</h4>
              <ExtendRowsPreview />
            </section>
            <section id="interaction-editable-append-both" className="pb-overview-subsection">
              <h4 className="pb-overview-subsection-title">Append rows and columns</h4>
              <ExtendBothPreview />
            </section>
          </div>
        </SubComponentRow>

        <GroupHeader
          id="group-data"
          number="3"
          title="Data handling"
          description="Client-side sorting, filtering, pagination, and virtualization — turned on per column or per table."
        />

        <SubComponentRow
          id="data-sorting"
          number="3.1"
          name="Sorting"
          ic="TableSorterResult<TRecord>"
          chips={['ascend', 'descend', 'unset']}
          description={
            <>
              Set <InlineCode code="sorter: true" /> for the default comparison, or provide <InlineCode code="sorter: (a, b) => …" /> for custom logic. Clicking
              a header cycles ascend → descend → unset. Use <InlineCode code="sorter.multiple" /> to sort by more than one column at once.
            </>
          }
          code={CODE.sorting}
        >
          <SortingPreview />
        </SubComponentRow>

        <SubComponentRow
          id="data-filtering"
          number="3.2"
          name="Column filters"
          ic="TableFilterItem"
          chips={['dropdown', 'multi-select', 'filterMultiple']}
          description={
            <>
              Add a filter dropdown to any column by listing its <InlineCode code="filters" /> and providing an <InlineCode code="onFilter" /> that returns true
              for rows to keep. Use <InlineCode code="filterMultiple: false" /> for single-value filters, or <InlineCode code="filterDropdown" /> to supply a
              completely custom UI.
            </>
          }
          code={CODE.filtering}
        >
          <FilteringPreview />
        </SubComponentRow>

        <SubComponentRow
          id="data-pagination"
          number="3.3"
          name="Pagination"
          ic="TablePaginationConfig"
          chips={['topStart', 'topCenter', 'topEnd', 'bottomStart', 'bottomCenter', 'bottomEnd', 'none']}
          description="Set pagination to page long lists. placement takes an array — pass both 'topEnd' and 'bottomEnd' to render pagers above and below. Use pagination={false} (or placement: ['none']) to render every row at once."
          code={CODE.pagination}
        >
          <PaginationPreview />
        </SubComponentRow>

        <SubComponentRow
          id="data-virtualization"
          number="3.4"
          name="Virtualization"
          ic="TableVirtualConfig"
          chips={['@tanstack/react-virtual', 'row window', 'column window', 'sticky']}
          description={
            <>
              Enable <InlineCode code="virtual" /> alongside a fixed <InlineCode code="scroll.y" /> to keep long lists snappy — only visible rows are mounted.
              For very wide tables, <InlineCode code="scroll.x" /> virtualizes columns the same way.
            </>
          }
          code={CODE.virtualization}
        >
          <VirtualizationPreview />
        </SubComponentRow>

        <GroupHeader
          id="group-presentation"
          number="4"
          title="Presentation"
          description="How the table looks — borders, headers, alignment, and the accessible markup underneath."
        />

        <SubComponentRow
          id="presentation-appearance"
          number="4.1"
          name="Appearance"
          ic="TableAppearance"
          chips={['grid', 'rows', 'none', 'stripedRows']}
          description="appearance.borders chooses between a full grid, horizontal rows only, or no borders. Turn on stripedRows to shade alternate rows with the low-contrast row-hover token."
          code={CODE.appearance}
        >
          <AppearancePreview />
        </SubComponentRow>

        <SubComponentRow
          id="presentation-header-styling"
          number="4.2"
          name="Header styling"
          ic="TableAppearance"
          chips={['headerRow', 'headerColumn', 'headerFill', 'borderColor']}
          description={
            <>
              Style the header row — and the first-column header when <InlineCode code="headerColumn" /> is on — with brand colours.
              <InlineCode code="headerFill" /> sets the background; <InlineCode code="borderColor" /> sets the divider colour. Both accept any CSS value.
            </>
          }
          code={CODE.headerStyling}
        >
          <HeaderStylingPreview />
        </SubComponentRow>

        <SubComponentRow
          id="presentation-alignment"
          number="4.3"
          name="Alignment and text size"
          ic="TableAppearance"
          chips={['left', 'center', 'right', 'textSize (px)']}
          description={
            <>
              Align cells per column with <InlineCode code="column.align" />, or set a table-wide default with <InlineCode code="appearance.cellAlignment" />.{' '}
              <InlineCode code="appearance.textSize" /> bumps the base font size across every cell.
            </>
          }
          code={CODE.alignment}
        >
          <AlignmentPreview />
        </SubComponentRow>

        <SubComponentRow
          id="presentation-semantic-dom"
          number="4.4"
          name="Semantic DOM slots"
          ic="TableSemanticDOM"
          chips={['role="table"', 'role="rowgroup"', 'role="row"', 'role="cell"']}
          description={
            <>
              Under the hood the Table renders a real <InlineCode code="<table>" /> — <InlineCode code="<thead>" />,
              <InlineCode code="<tbody>" />, <InlineCode code="<tr>" />, <InlineCode code="<th>" />, <InlineCode code="<td>" /> with the correct ARIA roles.
              Screen readers navigate it as a table, not a grid of divs.
            </>
          }
          code={CODE.semanticDom}
        >
          <SemanticDomPreview />
        </SubComponentRow>

        <SubComponentRow
          id="presentation-empty"
          number="4.5"
          name="Empty state"
          ic="TableProps<TRecord, TRowData>"
          chips={['empty', 'locale.emptyText']}
          description={
            <>
              An empty <InlineCode code="dataSource" /> renders the empty-state placeholder. Override the text via
              <InlineCode code="locale.emptyText" /> or the entire cell via the registry's <InlineCode code="empty" /> renderer.
            </>
          }
          code={CODE.empty}
        >
          <EmptyPreview />
        </SubComponentRow>

        <SubComponentRow
          id="presentation-loading"
          number="4.6"
          name="Loading"
          ic="TableLoadingProps"
          chips={['skeleton (default)', 'spinner', 'loading']}
          description={
            <>
              Set <InlineCode code="loading" /> to swap the body for shimmering skeleton rows (default) or a centered overlay spinner via
              <InlineCode code='loading="spinner"' />. Row and column layout stays in place so the page doesn't jump when data arrives.
            </>
          }
          code={{
            Skeleton: CODE.loadingSkeleton,
            Spinner: CODE.loadingSpinner,
          }}
        >
          <div className="pb-overview-stack">
            <section id="presentation-loading-skeleton" className="pb-overview-subsection">
              <h4 className="pb-overview-subsection-title">Skeleton</h4>
              <LoadingSkeletonPreview />
            </section>
            <section id="presentation-loading-spinner" className="pb-overview-subsection">
              <h4 className="pb-overview-subsection-title">Spinner</h4>
              <LoadingSpinnerPreview />
            </section>
          </div>
        </SubComponentRow>
      </main>
      <TableOfContents items={tocItems} title="Table of contents" />
    </div>
  </div>
);

export const Overview: StoryObj = {
  name: 'Table Component Overview',
  render: () => <TableComponentOverview />,
};
