import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Table, type TableAppearance, type TableProps, type TableState } from '@oc-tech/omni-ui-components/Table';
import { ComponentWrapper } from './storySupport';
import {
  appearanceVariantProjects,
  basicDataSourceTableFactory,
  matrixRows,
  defaultColumns,
  registryRows,
  storyTableRegistry,
  type DocCellData,
  type ProjectRecord,
} from './Table.story.fixtures';
interface TableStoryArgs {
  size?: TableProps<ProjectRecord>['size'];
  bordered?: boolean;
  showHeader?: boolean;
  tableLayout?: TableProps<ProjectRecord>['tableLayout'];
  appearance?: TableAppearance;
  testIdPrefix?: string;
}

// No `defaultArgs` — the Storybook Controls panel starts empty so every base
// story renders with the Table's own defaults. That way the preview shows
// exactly what a consumer gets from `<Table columns={...} dataSource={...} />`.
// Storybook-driven props (`size`, `bordered`, `showHeader`, `tableLayout`,
// `appearance`, `rowKey`, `testIdPrefix`) are stripped from the emitted Show
// code by `useDynamicSnippet`'s `DEFAULT_OMIT` — stories don't need to repeat
// them.

interface RenderBaseTableOptions {
  args: TableStoryArgs;
  title?: string;
  description?: React.ReactNode;
  props?: Partial<TableProps<ProjectRecord, DocCellData>>;
}

const renderBaseTable = ({ args, title, description, props = {} }: RenderBaseTableOptions) => (
  <ComponentWrapper title={title} description={description}>
    <Table<ProjectRecord, DocCellData>
      {...basicDataSourceTableFactory({
        ...(args.size !== undefined && { size: args.size }),
        ...(args.bordered !== undefined && { bordered: args.bordered }),
        ...(args.showHeader !== undefined && { showHeader: args.showHeader }),
        ...(args.tableLayout !== undefined && { tableLayout: args.tableLayout }),
        ...(args.appearance !== undefined && { appearance: args.appearance }),
        ...(args.testIdPrefix !== undefined && { testIdPrefix: args.testIdPrefix }),
        ...props,
      })}
    />
  </ComponentWrapper>
);

const LOADER_GREEN = '#22ad01';
const LOADER_GREEN_SOFT = 'rgba(34, 173, 1, 0.28)';

const LoadingStage = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-[88px] items-center justify-center rounded-md border border-border/60 bg-background px-4 py-3">{children}</div>
);

const RingLoader = ({ size = 28, thickness = 3 }: { size?: number; thickness?: number }) => (
  <span
    aria-hidden="true"
    style={{
      width: size,
      height: size,
      borderWidth: thickness,
      borderStyle: 'solid',
      borderColor: LOADER_GREEN_SOFT,
      borderTopColor: LOADER_GREEN,
      animation: 'spin 1.8s linear infinite',
    }}
    className="inline-block rounded-full"
  />
);

const PillLoader = ({ label }: { label: string }) => (
  <span
    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
    style={{
      border: '1px solid rgba(255,255,255,0.14)',
      background: 'transparent',
      color: 'rgba(255,255,255,0.92)',
    }}
  >
    <RingLoader size={14} thickness={2} />
    <span>{label}</span>
  </span>
);

const LoadingPatternGallery = () => (
  <div className="rounded-lg border border-border bg-card p-4">
    <div className="mb-3 text-sm font-medium text-foreground">Pill / loading slow</div>
    <LoadingStage>
      <PillLoader label="Loading..." />
    </LoadingStage>
  </div>
);

const meta: Meta<TableStoryArgs> = {
  title: 'omni-ui-components/Table/Table',
  // Cast: <Table /> is generic and can't be typed against a specific args
  // shape without losing the generic. The generated code name comes from the
  // snippet builder's `componentName`, not from this reference.
  component: Table as unknown as React.ComponentType<TableStoryArgs>,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    docs: {
      description: {
        component:
          'The shared Omni Table component is a shadcn-styled, TanStack-backed table with AntD-compatible API names where supported. These stories cover the primary record-driven surface: dataSource tables, explicit row matrices, registry-backed cells, appearance variants, semantic DOM slots, loading and empty states, and controlled versus default state wiring.',
      },
      // No `source.transform` here — `<ComponentWrapper>` renders its own
      // Show code panel per story via `buildDynamicSnippet`, so the docs
      // page picks up the same dynamic snippet without duplicating logic.
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    bordered: { control: 'boolean' },
    showHeader: { control: 'boolean' },
    tableLayout: { control: 'inline-radio', options: ['auto', 'fixed'] },
    appearance: { control: 'object' },
    testIdPrefix: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<TableStoryArgs>;

export const BasicDataSource: Story = {
  render: (args) => (
    <ComponentWrapper
      title="Basic data source"
      description="Use `<Table />` for app data grids by passing a list of `columns` and a `dataSource` of records. Each column reads its cell via `dataIndex`; row keys resolve from `record.key`, then `record.id`, then the row index — pass `rowKey` to override."
    >
      <Table<ProjectRecord, DocCellData>
        {...basicDataSourceTableFactory({
          ...(args.size !== undefined && { size: args.size }),
          ...(args.bordered !== undefined && { bordered: args.bordered }),
          ...(args.showHeader !== undefined && { showHeader: args.showHeader }),
          ...(args.tableLayout !== undefined && { tableLayout: args.tableLayout }),
          ...(args.appearance !== undefined && { appearance: args.appearance }),
          ...(args.testIdPrefix !== undefined && { testIdPrefix: args.testIdPrefix }),
        })}
      />
    </ComponentWrapper>
  ),
};

export const ExplicitDataRows: Story = {
  render: (args) => (
    <ComponentWrapper
      title="Explicit data rows"
      description="Pass explicit `rows` of `TableDataRow` when data is cell-oriented rather than record-first. Each row can carry its own `cells`, per-cell `render`, `align`, `kind`, and metadata — bypassing `dataIndex` resolution."
    >
      <Table<ProjectRecord, DocCellData>
        columns={defaultColumns}
        rows={matrixRows}
        size={args.size}
        bordered={args.bordered}
        showHeader={args.showHeader}
        tableLayout={args.tableLayout}
        appearance={args.appearance}
        testIdPrefix="table-explicit-rows"
      />
    </ComponentWrapper>
  ),
};

export const RegistryCellRenderers: Story = {
  render: (args) => (
    <ComponentWrapper
      title="Registry cell renderers"
      description="Cell variants (`heading`, `pill`, `bulletList`, `orderedList`, `divider`, `image`, `money`, `actions`) are registered once through `TableRegistry.fields` and consumed by any `TableCellOverride` that declares a matching `kind`."
      omit={['registry']}
    >
      <Table<ProjectRecord, DocCellData>
        columns={defaultColumns}
        rows={registryRows}
        registry={storyTableRegistry}
        size={args.size}
        bordered={args.bordered}
        showHeader={args.showHeader}
        appearance={{ ...args.appearance, borders: 'grid' }}
        testIdPrefix="table-registry-cells"
      />
    </ComponentWrapper>
  ),
};

export const AppearanceVariants: Story = {
  render: () => (
    <div className="grid gap-6">
      <ComponentWrapper
        title="Grid appearance"
        description="`appearance.borders='grid'` outlines every cell, `stripedRows` alternates the row background, and `headerFill` / `borderColor` map to the underlying `--bui-table-*` tokens."
      >
        <Table<ProjectRecord>
          columns={defaultColumns.slice(0, 4)}
          dataSource={appearanceVariantProjects}
          rowKey="id"
          appearance={{
            borders: 'grid',
            headerRow: true,
            stripedRows: true,
            headerFill: 'var(--color-muted)',
            borderColor: 'var(--color-border)',
          }}
          testIdPrefix="table-appearance-grid"
        />
      </ComponentWrapper>
      <ComponentWrapper
        title="Borderless appearance"
        description="`appearance.borders='none'` drops all cell dividers, `headerColumn` styles the first column as a header, and `cellAlignment` / `textSize` / `background` tune the reading density."
      >
        <Table<ProjectRecord>
          columns={defaultColumns.slice(0, 4)}
          dataSource={appearanceVariantProjects}
          rowKey="id"
          appearance={{
            borders: 'none',
            headerColumn: true,
            cellAlignment: 'center',
            textSize: 13,
            background: 'var(--color-card)',
          }}
          testIdPrefix="table-appearance-none"
        />
      </ComponentWrapper>
    </div>
  ),
};

export const EmptyAndLoading: Story = {
  render: (args) => (
    <div className="grid gap-6">
      <ComponentWrapper
        title="Empty state"
        description="An empty `dataSource` renders `locale.emptyText` in the body slot. Supply a string or a `ReactNode` for a richer illustration."
      >
        <Table<ProjectRecord> columns={defaultColumns} dataSource={[]} rowKey="id" locale={{ emptyText: 'No projects yet' }} testIdPrefix="table-empty-state" />
      </ComponentWrapper>
      {renderBaseTable({
        args,
        title: 'Loading state',
        description: 'Pass `loading={{ spinning: true }}` to overlay the async spinner. Pass a full `TableLoadingConfig` to swap the spinner, tip, or delay.',
        props: { loading: { spinning: true }, testIdPrefix: 'table-loading-state' },
      })}
      <LoadingPatternGallery />
    </div>
  ),
};

export const SemanticDomSlots: Story = {
  render: (args) =>
    renderBaseTable({
      args,
      title: 'Semantic DOM slots',
      description:
        'Target individual DOM regions through `classNames` (`root`, `header.cell`, …) and `styles` (`title`, `footer`, …). The `title` and `footer` slots accept a render function returning any `ReactNode`.',
      props: {
        classNames: { root: 'ring-1 ring-border/70', 'header.cell': 'uppercase tracking-wide' },
        styles: {
          title: { color: 'var(--color-muted-foreground)', fontSize: 14, fontWeight: 500, padding: '10px 12px' },
          footer: { color: 'var(--color-muted-foreground)', fontSize: 13, padding: '10px 12px' },
        },
        title: () => 'Semantic DOM slots',
        footer: () => 'Footer rendered through the shared Table footer slot.',
        testIdPrefix: 'table-semantic-slots',
      },
    }),
};

const ControlledStateExample = (args: TableStoryArgs) => {
  const [state, setState] = React.useState<TableState>({
    sorting: [{ id: 'budget', desc: true }],
    pagination: { pageIndex: 0, pageSize: 2 },
  });

  return renderBaseTable({
    args,
    title: 'Controlled and default state',
    description:
      'Pass `defaultState` to let the Table own its own state (uncontrolled) or pair `state` + `onStateChange` to lift ownership into the parent (controlled). One `TableState` shape holds `sorting`, `filters`, `pagination`, `rowSelection`, `expanded`, `columnOrder`, `columnSizing`, `columnPinning`, and `columnVisibility`.',
    props: {
      state,
      onStateChange: setState,
      pagination: { defaultPageSize: 2, showSizeChanger: true, pageSizeOptions: [2, 5] },
      testIdPrefix: 'table-controlled-state',
    },
  });
};

export const ControlledAndDefaultState: Story = {
  render: (args) => <ControlledStateExample {...args} />,
};
