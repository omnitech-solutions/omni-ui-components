import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import '../internal/support/overview.css';
import type { TableColumn } from '@oc-tech/omni-ui-components/Table';
import { Table } from '@oc-tech/omni-ui-components/Table';
import {
  clientFilters,
  type DocCellData,
  defaultColumns,
  draggableRows,
  groupedProjectColumns,
  type InvoiceLineRecord,
  invoiceColumns,
  invoiceLines,
  largeProjects,
  matrixRows,
  type ProjectRecord,
  projects,
  registryRows,
  spanRows,
  statusFilters,
  storyTableRegistry,
  wideProjectColumns,
} from '../../packages/core/src/Table/Table.story.fixtures';
import { ComponentLink } from '../internal/support/ComponentLink';
import { ExampleFrame } from '../internal/support/ExampleFrame';
import { InlineCode } from '../internal/support/InlineCode';
import { SegmentedPill } from '../internal/support/SegmentedPill';
import { TableOfContents, type TocItem } from '../internal/support/TableOfContents';
import { useIsDark } from '../internal/support/useIsDark';

// The code of a row is cut from this file and the fixtures as they are written. Their text and the parser that
// reads it are requested the first time a row's code is opened or copied, not with the page.
let snippetSources: Promise<{ build: (target: string) => string }> | undefined;
const loadSnippetSources = () => {
  snippetSources ??= Promise.all([
    import('../internal/support/sourceSnippet'),
    import('./TableOverview.stories.tsx?raw').then((module) => module.default),
    import('../../packages/core/src/Table/Table.factories.tsx?raw').then(
      (module) => module.default,
    ),
    import('../internal/support/useIsDark.ts?raw').then((module) => module.default),
  ]).then(([{ buildSourceSnippet }, source, fixtureSource, themeSource]) => ({
    build: (target: string) =>
      buildSourceSnippet(source, target, {
        '../../packages/core/src/Table/Table.story.fixtures': fixtureSource,
        '../internal/support/useIsDark': themeSource,
      }),
  }));
  return snippetSources;
};

const meta: Meta = {
  title: 'Getting Started/Table Overview',
  parameters: {
    layout: 'fullscreen',
    // The page is its own frame, and the Table is checked for accessibility in its own stories.
    example: { frame: false },
    a11y: { test: 'off' },
    docs: {
      description: {
        component:
          'The single reference page for every facet of the Omni Table component. Grouped into Core, Interaction, Data handling, and Presentation, each subsection carries a variant chip, description, live preview driven by the same factories the component stories use, and a Show code panel with the JSX a consumer would paste into an app view. The title pills link to the main Table documentation for additional variations.',
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
  { id: 'presentation-defaults', label: '1.7 Row and column defaults; renderers' },
  {
    id: 'interaction-selection-checkbox',
    label: '2.1 Row selection (checkbox)',
    group: '2. Interaction',
  },
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
  { id: 'presentation-scroll-fixed', label: '3.5 Scroll, fixed columns and sticky header' },
  { id: 'data-state', label: '3.6 Controlled state and events' },
  { id: 'data-scroll-ref', label: '3.7 Scroll reference' },
  { id: 'presentation-density', label: '4.1 Sizes and borders', group: '4. Presentation' },
  { id: 'presentation-appearance', label: '4.2 Appearance' },
  { id: 'presentation-header-styling', label: '4.3 Header styling' },
  { id: 'presentation-layout', label: '4.4 Hover, header and layout' },
  { id: 'presentation-alignment', label: '4.5 Alignment and text size' },
  { id: 'presentation-semantic-dom', label: '4.6 Semantic DOM slots' },
  { id: 'presentation-styles', label: '4.7 Styles and class names' },
  { id: 'presentation-title-footer', label: '4.8 Title, footer and summary' },
  { id: 'presentation-empty', label: '4.9 Empty state' },
  { id: 'presentation-loading', label: '4.10 Loading' },
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

  children: React.ReactNode;
}

/** The preview components among a row's children, by the name their code is cut from. */
const previewTargets = (children: React.ReactNode): string[] => {
  const targets: string[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const target = typeof child.type === 'function' ? PREVIEW_SOURCES.get(child.type) : undefined;
    if (target) targets.push(target);
    else targets.push(...previewTargets((child.props as { children?: React.ReactNode }).children));
  });
  return targets;
};

/** True when the row holds sections the table of contents links to: they must be in the page from the start. */
const hasAnchors = (children: React.ReactNode): boolean =>
  React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      (Boolean((child.props as { id?: string }).id) ||
        hasAnchors((child.props as { children?: React.ReactNode }).children)),
  );

const SubComponentRow = ({
  id,
  number,
  name,
  ic,
  description,
  chips,
  children,
}: SubComponentRowProps) => {
  const names = previewTargets(children).join(' ');
  // One snippet, or a labelled one a preview when the row shows several.
  const code = React.useCallback(async () => {
    const sources = await loadSnippetSources();
    const targets = names.split(' ').filter(Boolean);
    if (targets.length === 1) return sources.build(targets[0]);
    return Object.fromEntries(
      targets.map((target) => [target.replace(/Preview$/, ''), sources.build(target)]),
    );
  }, [names]);
  return (
    <ExampleFrame
      id={id}
      className="pb-overview-row"
      defer={!hasAnchors(children)}
      deferHeight={260}
      code={names ? code : undefined}
      header={
        <div className="pb-overview-row-header">
          <SegmentedPill
            segments={[
              { content: number, uppercase: true, tinted: true },
              { content: <ComponentLink component="Table">{name}</ComponentLink>, uppercase: true },
              { content: <InlineCode code={ic} /> },
            ]}
          />
        </div>
      }
      description={description}
      meta={
        chips ? (
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {chips.map((chip) => (
              <span key={chip} className="rounded border px-2 py-1">
                {chip}
              </span>
            ))}
          </div>
        ) : null
      }
    >
      {children}
    </ExampleFrame>
  );
};

const GroupHeader = ({
  id,
  number,
  title,
}: {
  id: string;
  number: string;
  title: string;
  description?: React.ReactNode;
}) => (
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
      {
        key: 'name',
        dataIndex: 'name',
        title: 'Name',
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
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
      expandedRowRender: (record) => (
        <div className="text-sm text-[var(--color-muted-foreground)]">{record.description}</div>
      ),
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
      {
        key: 'name',
        dataIndex: 'name',
        title: 'Name',
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        key: 'client',
        dataIndex: 'client',
        title: 'Client',
        sorter: (a, b) => a.client.localeCompare(b.client),
      },
      {
        key: 'budget',
        dataIndex: 'budget',
        title: 'Budget',
        align: 'right',
        sorter: (a, b) => a.budget - b.budget,
      },
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
      {
        key: 'client',
        dataIndex: 'client',
        title: 'Client',
        filters: clientFilters,
        onFilter: (v, r) => r.client === v,
      },
      {
        key: 'status',
        dataIndex: 'status',
        title: 'Status',
        filters: statusFilters,
        onFilter: (v, r) => r.status === v,
      },
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
      appearance={{
        borders: 'grid',
        headerFill,
        borderColor,
        headerColumn: true,
      }}
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
  <Table<ProjectRecord>
    columns={compactProjectColumns}
    dataSource={[]}
    rowKey="id"
    pagination={{ placement: ['none'] }}
    testIdPrefix="overview-empty"
  />
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

const DensityPreview = () => (
  <div className="grid gap-4">
    {(['small', 'medium', 'large'] as const).map((size) => (
      <Table
        key={size}
        columns={plainProjectColumns}
        dataSource={projects.slice(0, 2)}
        rowKey="id"
        size={size}
        bordered
        pagination={false}
      />
    ))}
  </div>
);
const HoverHeaderLayoutPreview = () => (
  <div className="grid gap-4">
    <Table
      columns={plainProjectColumns}
      dataSource={projects.slice(0, 2)}
      rowKey="id"
      rowHoverable={false}
      showHeader={false}
      tableLayout="fixed"
      pagination={false}
    />
    <Table
      columns={plainProjectColumns}
      dataSource={projects.slice(0, 2)}
      rowKey="id"
      rowHoverable
      showHeader
      tableLayout="auto"
      pagination={false}
    />
  </div>
);
const SemanticStylesPreview = () => (
  <Table
    columns={plainProjectColumns}
    dataSource={projects.slice(0, 3)}
    rowKey="id"
    styles={{
      'header.cell': { color: 'var(--color-primary)' },
      'body.cell': { paddingBlock: 16 },
    }}
    classNames={{ root: 'rounded-xl', 'body.row': 'font-medium' }}
    rowClassName={(record) => (record.id === 'p-1' ? 'bg-primary/10' : '')}
    style={{ borderRadius: 12 }}
    className="w-full"
    pagination={false}
  />
);
const TitleFooterSummaryPreview = () => (
  <Table
    columns={invoiceColumns}
    dataSource={invoiceLines}
    rowKey="id"
    title={() => 'Invoice details'}
    footer={(records) => `${records.length} line items`}
    summary={(records) => (
      <tr>
        <td colSpan={2}>Total</td>
        <td className="text-right">
          ${records.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
        </td>
      </tr>
    )}
    pagination={false}
  />
);
const ScrollFixedPreview = () => (
  <Table
    columns={wideProjectColumns.map((column, index) => ({
      ...column,
      fixed: index === 0 ? ('left' as const) : undefined,
      width: 180,
    }))}
    dataSource={projects}
    rowKey="id"
    scroll={{ x: 1600, y: 240 }}
    sticky={{ offsetHeader: 0 }}
    pagination={false}
  />
);
const ControlledStatePreview = () => {
  const [state, setState] = React.useState<import('@oc-tech/omni-ui-components/Table').TableState>({
    sorting: [{ id: 'name', desc: false }],
  });
  const [lastAction, setLastAction] = React.useState('No changes yet');
  return (
    <div className="grid gap-3">
      <p role="status">{lastAction}</p>
      <Table
        columns={compactProjectColumns}
        dataSource={projects}
        rowKey="id"
        state={state}
        onStateChange={setState}
        onChange={(_pagination, _filters, _sorter, extra) => setLastAction(extra.action)}
        sortDirections={['ascend', 'descend']}
        pagination={{ defaultPageSize: 3 }}
        onRow={(record) => ({
          onClick: () => setLastAction(`Clicked ${record.name}`),
        })}
        onHeaderRow={() => ({ className: 'font-semibold' })}
      />
    </div>
  );
};
const DefaultsAndRenderersPreview = () => (
  <Table
    columns={plainProjectColumns}
    dataSource={projects.slice(0, 3)}
    rowKey="id"
    column={{ align: 'center' }}
    row={{ className: 'font-medium' }}
    renderers={{ empty: () => <div>No matching projects</div> }}
    pagination={false}
  />
);
const RefScrollPreview = () => {
  const ref = React.useRef<import('@oc-tech/omni-ui-components/Table').TableRef>(null);
  const [position, setPosition] = React.useState(0);
  return (
    <div className="grid gap-3">
      <button type="button" onClick={() => ref.current?.scrollTo({ index: 8 })}>
        Scroll to row 9
      </button>
      <p role="status">Scroll position: {position}</p>
      <Table
        ref={ref}
        columns={plainProjectColumns}
        dataSource={largeProjects}
        rowKey="id"
        scroll={{ y: 220 }}
        virtual
        onScroll={(event) => setPosition(event.currentTarget.scrollTop)}
        pagination={false}
      />
    </div>
  );
};

// Story
// ---------------------------------------------------------------------------

// Component identities remain stable when a production build minifies function names.
const PREVIEW_SOURCES = new Map<React.ElementType, string>([
  [CoreComponentPreview, 'CoreComponentPreview'],
  [CoreColumnsPreview, 'CoreColumnsPreview'],
  [ColumnGroupsPreview, 'ColumnGroupsPreview'],
  [DataRowsPreview, 'DataRowsPreview'],
  [CellOverridesPreview, 'CellOverridesPreview'],
  [RegistryPreview, 'RegistryPreview'],
  [SelectionCheckboxPreview, 'SelectionCheckboxPreview'],
  [SelectionRadioPreview, 'SelectionRadioPreview'],
  [BulkActionsPreview, 'BulkActionsPreview'],
  [ExpandablePreview, 'ExpandablePreview'],
  [TreePreview, 'TreePreview'],
  [EditablePreview, 'EditablePreview'],
  [ColumnDragPreview, 'ColumnDragPreview'],
  [RowDragPreview, 'RowDragPreview'],
  [ExtendRowsPreview, 'ExtendRowsPreview'],
  [ExtendColumnsPreview, 'ExtendColumnsPreview'],
  [ExtendBothPreview, 'ExtendBothPreview'],
  [SortingPreview, 'SortingPreview'],
  [FilteringPreview, 'FilteringPreview'],
  [PaginationPreview, 'PaginationPreview'],
  [VirtualizationPreview, 'VirtualizationPreview'],
  [AppearancePreview, 'AppearancePreview'],
  [HeaderStylingPreview, 'HeaderStylingPreview'],
  [AlignmentPreview, 'AlignmentPreview'],
  [SemanticDomPreview, 'SemanticDomPreview'],
  [EmptyPreview, 'EmptyPreview'],
  [LoadingSkeletonPreview, 'LoadingSkeletonPreview'],
  [LoadingSpinnerPreview, 'LoadingSpinnerPreview'],
  [DensityPreview, 'DensityPreview'],
  [HoverHeaderLayoutPreview, 'HoverHeaderLayoutPreview'],
  [SemanticStylesPreview, 'SemanticStylesPreview'],
  [TitleFooterSummaryPreview, 'TitleFooterSummaryPreview'],
  [ScrollFixedPreview, 'ScrollFixedPreview'],
  [ControlledStatePreview, 'ControlledStatePreview'],
  [DefaultsAndRenderersPreview, 'DefaultsAndRenderersPreview'],
  [RefScrollPreview, 'RefScrollPreview'],
]);

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
                {
                  content: <ComponentLink component="Table">{'<Table />'}</ComponentLink>,
                  tinted: true,
                },
                { content: 'Reference', tinted: true },
              ]}
            />
          </h2>
          <p style={{ color: '#CED0D2' }}>
            Every configuration option the Table component supports, on one page. Each section shows
            what the option does, a working preview you can interact with, and a copy-pasteable
            snippet.
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
              Render a list of records as a table. Pass an array to <InlineCode code="dataSource" />
              , describe your columns, and give each row a stable id via{' '}
              <InlineCode code="rowKey" />. That’s the minimum setup — everything else on this page
              is optional.
            </>
          }
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
              Each column decides which record property to read (
              <InlineCode code="dataIndex" />
              ), what header to show (<InlineCode code="title" />
              ), and how the cell renders. Add <InlineCode code="render" /> for custom JSX,{' '}
              <InlineCode code="align" /> / <InlineCode code="width" /> for layout, and{' '}
              <InlineCode code="sorter" /> or <InlineCode code="filters" /> to make the column
              interactive.
            </>
          }
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
              Group related columns under a shared header. Put child columns inside a parent
              column’s <InlineCode code="children" /> array — the parent header spans them
              automatically and each child keeps its own sorting or filtering.
            </>
          }
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
              Use <InlineCode code="rows" /> instead of <InlineCode code="dataSource" /> when your
              data is cell-first rather than record-first — e.g. a document-style table where each
              cell has its own type. Every row still carries its record plus an explicit{' '}
              <InlineCode code="cells" /> object keyed by column.
            </>
          }
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
              Change behaviour on a single cell without touching the whole column.{' '}
              <InlineCode code="colSpan" /> and <InlineCode code="rowSpan" /> merge cells,{' '}
              <InlineCode code="align" /> overrides the column’s alignment, and{' '}
              <InlineCode code="kind" /> picks a specific renderer from the registry.
            </>
          }
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
              The registry turns a cell’s <InlineCode code="kind" /> (paragraph, image, money,
              status, …) into the component that renders it. Extend the default registry with{' '}
              <InlineCode code="mergeTableRegistry" /> when you need a custom renderer — don’t fork
              the Table itself.
            </>
          }
        >
          <RegistryPreview />
        </SubComponentRow>

        <SubComponentRow
          id="presentation-defaults"
          number="1.7"
          name="Row and column defaults; renderers"
          ic="TableProps"
          description="Configure shared row and column defaults and replace the empty-state renderer."
        >
          <DefaultsAndRenderersPreview />
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
              Pass <InlineCode code="rowSelection" /> to add per-row checkboxes and a select-all in
              the header. Use <InlineCode code="defaultSelectedRowKeys" /> for uncontrolled
              defaults, or <InlineCode code="selectedRowKeys" /> +
              <InlineCode code="onChange" /> for full control. Add{' '}
              <InlineCode code="preserveSelectedRowKeys" /> to keep the selection when the data
              reloads.
            </>
          }
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
              Show extra detail inline below any row. Return React content from{' '}
              <InlineCode code="expandable.expandedRowRender" />. Use{' '}
              <InlineCode code="defaultExpandedRowKeys" /> for a default open state, or{' '}
              <InlineCode code="expandedRowKeys" /> when you need to control which rows are open.
            </>
          }
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
              Turn the table into a tree by pointing{' '}
              <InlineCode code="expandable.childrenColumnName" /> at the property that holds a row’s
              children. Combine with <InlineCode code="rowSelection.checkStrictly: false" /> so
              selecting a parent also selects everything under it.
            </>
          }
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
              Let users reorder columns by dragging their headers. Add{' '}
              <InlineCode code="draggable: true" /> to each reorderable column and listen to{' '}
              <InlineCode code="onColumnOrderChange" /> to persist the new order.
            </>
          }
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
              Let users reorder rows by dragging a grip handle on the left. Pass data through the{' '}
              <InlineCode code="rows" /> prop with <InlineCode code="draggable: true" /> on each
              reorderable row — <InlineCode code="onRowOrderChange" /> gives you the new key order
              after every drop.
            </>
          }
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
              One prop turns every column into an inline editor and enables the "+" affordances for
              appending rows and columns. Table persists edits and appended rows/columns internally;
              wire <InlineCode code="onEdit" />, <InlineCode code="column.editable" />, or
              <InlineCode code="extendable.rows.onAppend" /> only when you need to intercept.
            </>
          }
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
              Set <InlineCode code="sorter: true" /> for the default comparison, or provide{' '}
              <InlineCode code="sorter: (a, b) => …" /> for custom logic. Clicking a header cycles
              ascend → descend → unset. Use <InlineCode code="sorter.multiple" /> to sort by more
              than one column at once.
            </>
          }
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
              Add a filter dropdown to any column by listing its <InlineCode code="filters" /> and
              providing an <InlineCode code="onFilter" /> that returns true for rows to keep. Use{' '}
              <InlineCode code="filterMultiple: false" /> for single-value filters, or{' '}
              <InlineCode code="filterDropdown" /> to supply a completely custom UI.
            </>
          }
        >
          <FilteringPreview />
        </SubComponentRow>

        <SubComponentRow
          id="data-pagination"
          number="3.3"
          name="Pagination"
          ic="TablePaginationConfig"
          chips={[
            'topStart',
            'topCenter',
            'topEnd',
            'bottomStart',
            'bottomCenter',
            'bottomEnd',
            'none',
          ]}
          description="Set pagination to page long lists. placement takes an array — pass both 'topEnd' and 'bottomEnd' to render pagers above and below. Use pagination={false} (or placement: ['none']) to render every row at once."
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
              Enable <InlineCode code="virtual" /> alongside a fixed <InlineCode code="scroll.y" />{' '}
              to keep long lists snappy — only visible rows are mounted. For very wide tables,{' '}
              <InlineCode code="scroll.x" /> virtualizes columns the same way.
            </>
          }
        >
          <VirtualizationPreview />
        </SubComponentRow>

        <SubComponentRow
          id="presentation-scroll-fixed"
          number="3.5"
          name="Scroll, fixed columns and sticky header"
          ic="TableScrollConfig"
          description="Scroll horizontally and vertically while keeping the first column and header visible."
        >
          <ScrollFixedPreview />
        </SubComponentRow>
        <SubComponentRow
          id="data-state"
          number="3.6"
          name="Controlled state and events"
          ic="TableState"
          description="Sort, filter and paginate through controlled state; click a row to inspect the event."
        >
          <ControlledStatePreview />
        </SubComponentRow>
        <SubComponentRow
          id="data-scroll-ref"
          number="3.7"
          name="Scroll reference"
          ic="TableRef"
          description="Use a ref to scroll to a row and observe the scroll event."
        >
          <RefScrollPreview />
        </SubComponentRow>
        <GroupHeader
          id="group-presentation"
          number="4"
          title="Presentation"
          description="How the table looks — borders, headers, alignment, and the accessible markup underneath."
        />

        <SubComponentRow
          id="presentation-density"
          number="4.1"
          name="Sizes and borders"
          ic="TableSize"
          description="Small, medium and large density with the bordered option."
        >
          <DensityPreview />
        </SubComponentRow>
        <SubComponentRow
          id="presentation-appearance"
          number="4.2"
          name="Appearance"
          ic="TableAppearance"
          chips={['grid', 'rows', 'none', 'stripedRows']}
          description="appearance.borders chooses between a full grid, horizontal rows only, or no borders. Turn on stripedRows to shade alternate rows with the low-contrast row-hover token."
        >
          <AppearancePreview />
        </SubComponentRow>

        <SubComponentRow
          id="presentation-header-styling"
          number="4.3"
          name="Header styling"
          ic="TableAppearance"
          chips={['headerRow', 'headerColumn', 'headerFill', 'borderColor']}
          description={
            <>
              Style the header row — and the first-column header when{' '}
              <InlineCode code="headerColumn" /> is on — with brand colours.
              <InlineCode code="headerFill" /> sets the background;{' '}
              <InlineCode code="borderColor" /> sets the divider colour. Both accept any CSS value.
            </>
          }
        >
          <HeaderStylingPreview />
        </SubComponentRow>

        <SubComponentRow
          id="presentation-layout"
          number="4.4"
          name="Hover, header and layout"
          ic="TableProps"
          description="Compare hover and header visibility with fixed and automatic table layout."
        >
          <HoverHeaderLayoutPreview />
        </SubComponentRow>
        <SubComponentRow
          id="presentation-alignment"
          number="4.5"
          name="Alignment and text size"
          ic="TableAppearance"
          chips={['left', 'center', 'right', 'textSize (px)']}
          description={
            <>
              Align cells per column with <InlineCode code="column.align" />, or set a table-wide
              default with <InlineCode code="appearance.cellAlignment" />.{' '}
              <InlineCode code="appearance.textSize" /> bumps the base font size across every cell.
            </>
          }
        >
          <AlignmentPreview />
        </SubComponentRow>

        <SubComponentRow
          id="presentation-semantic-dom"
          number="4.6"
          name="Semantic DOM slots"
          ic="TableSemanticDOM"
          chips={['role="table"', 'role="rowgroup"', 'role="row"', 'role="cell"']}
          description={
            <>
              Under the hood the Table renders a real <InlineCode code="<table>" /> —{' '}
              <InlineCode code="<thead>" />,
              <InlineCode code="<tbody>" />, <InlineCode code="<tr>" />, <InlineCode code="<th>" />,{' '}
              <InlineCode code="<td>" /> with the correct ARIA roles. Screen readers navigate it as
              a table, not a grid of divs.
            </>
          }
        >
          <SemanticDomPreview />
        </SubComponentRow>

        <SubComponentRow
          id="presentation-styles"
          number="4.7"
          name="Styles and class names"
          ic="TableSemanticDOM"
          description="Apply styles and class names to semantic slots, plus per-row and root styles."
        >
          <SemanticStylesPreview />
        </SubComponentRow>
        <SubComponentRow
          id="presentation-title-footer"
          number="4.8"
          name="Title, footer and summary"
          ic="TableProps"
          description="Add a title, footer and calculated invoice summary."
        >
          <TitleFooterSummaryPreview />
        </SubComponentRow>
        <SubComponentRow
          id="presentation-empty"
          number="4.9"
          name="Empty state"
          ic="TableProps<TRecord, TRowData>"
          chips={['empty', 'locale.emptyText']}
          description={
            <>
              An empty <InlineCode code="dataSource" /> renders the empty-state placeholder.
              Override the text via
              <InlineCode code="locale.emptyText" /> or the entire cell via the registry's{' '}
              <InlineCode code="empty" /> renderer.
            </>
          }
        >
          <EmptyPreview />
        </SubComponentRow>

        <SubComponentRow
          id="presentation-loading"
          number="4.10"
          name="Loading"
          ic="TableLoadingProps"
          chips={['skeleton (default)', 'spinner', 'loading']}
          description={
            <>
              Set <InlineCode code="loading" /> to swap the body for shimmering skeleton rows
              (default) or a centered overlay spinner via
              <InlineCode code='loading="spinner"' />. Row and column layout stays in place so the
              page doesn't jump when data arrives.
            </>
          }
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
      <aside>
        <TableOfContents items={tocItems} title="Table of contents" />
      </aside>
    </div>
  </div>
);

export const Overview: StoryObj = {
  name: 'Table Component Overview',
  render: () => <TableComponentOverview />,
};
