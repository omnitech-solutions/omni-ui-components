import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Table, type TableColumn, type TableState } from '@omnitech/omni-ui-core/Table';
import { ComponentWrapper } from './storySupport';
import { clientFilters, groupedProjectColumns, phaseTreeFilters, defaultColumns, projects, spanRows, type ProjectRecord } from './Table.story.fixtures';
const formatBudget = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(String(value ?? '').replace(/[^0-9+-.]/g, ''));
  return Number.isFinite(parsed) ? `$${parsed.toLocaleString()}` : String(value ?? '');
};

const meta: Meta = {
  title: 'omni-ui-components/Table/Column',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Column stories focus on AntD-compatible column props mapped to the Omni Table runtime: render/dataIndex, grouped headers, sorting, filtering, visibility, sizing, pinning, spans, ellipsis, responsive visibility, and drag ordering.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const RenderAndDataIndex: Story = {
  render: () => (
    <ComponentWrapper
      title="Render and dataIndex"
      description="`column.dataIndex` picks the field to read from each record; `column.render(value, record, index)` transforms it into the cell content. Combine both to format numbers, compose fields, or return JSX — the same record is available for cross-field renders."
    >
      <Table<ProjectRecord>
        columns={[
          { key: 'name', title: 'Project name', dataIndex: 'name' },
          { key: 'client', title: 'Nested-ish render', dataIndex: 'client', render: (value, record) => `${value} / ${record.owner}` },
          { key: 'budget', title: 'Formatted budget', dataIndex: 'budget', align: 'right', render: formatBudget },
        ]}
        dataSource={projects}
        rowKey="id"
        testIdPrefix="column-render-data-index"
      />
    </ComponentWrapper>
  ),
};

export const GroupedColumns: Story = {
  render: () => (
    <ComponentWrapper
      title="Grouped columns"
      description="A column can nest `children` to build a two-row header. The parent contributes a title spanning its children; leaf children drive the actual data columns (their `dataIndex`, `render`, sort, and filter still apply)."
    >
      <Table<ProjectRecord> columns={groupedProjectColumns} dataSource={projects} rowKey="id" testIdPrefix="column-grouped" />
    </ComponentWrapper>
  ),
};

export const Sorting: Story = {
  render: () => (
    <ComponentWrapper
      title="Sorting"
      description="Set `sorter: true` for the default comparison, or pass `{ compare, multiple }` for custom logic and multi-column priority. `defaultSortOrder` and `sortDirections` seed and constrain the click cycle; `sortIcon` swaps the indicator."
    >
      <Table<ProjectRecord>
        columns={[
          { ...defaultColumns[0], defaultSortOrder: 'ascend', sortDirections: ['ascend', 'descend'] },
          { ...defaultColumns[4], sorter: { compare: (a, b) => a.budget - b.budget, multiple: 2 } },
          {
            key: 'margin',
            title: 'Margin',
            dataIndex: 'margin',
            sorter: true,
            sortIcon: ({ sortOrder }) => <span aria-label="Custom sort icon">{sortOrder === 'ascend' ? '↑' : sortOrder === 'descend' ? '↓' : '↕'}</span>,
            render: (value) => `${Math.round(Number(value) * 100)}%`,
          },
        ]}
        dataSource={projects}
        rowKey="id"
        testIdPrefix="column-sorting"
      />
    </ComponentWrapper>
  ),
};

export const Filtering: Story = {
  render: () => (
    <ComponentWrapper
      title="Filtering"
      description="Declare `column.filters` for a checkbox dropdown, `filterMode: 'tree'` for nested groups, or `column.filterDropdown` for a fully custom UI (the render receives `selectedKeys`, `setSelectedKeys`, `confirm`, `clearFilters`). `onFilter(value, record)` decides which rows match."
    >
      <Table<ProjectRecord>
        columns={[
          defaultColumns[0],
          {
            ...defaultColumns[1],
            filters: clientFilters,
            filteredValue: ['Acme Coffee'],
            filterIcon: (filtered) => <span aria-label="Filter icon">{filtered ? '●' : '○'}</span>,
          },
          {
            key: 'phase',
            title: 'Phase tree',
            dataIndex: 'phase',
            filters: phaseTreeFilters,
            filterMode: 'tree',
            onFilter: (value, record) => record.phase === value,
          },
          {
            key: 'owner',
            title: 'Custom dropdown',
            dataIndex: 'owner',
            filterOnChange: true,
            filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }) => {
              const owners = ['Nora Nunes', 'Mae Cooper', 'Iris Chen'];
              const selected = selectedKeys as string[];
              const toggle = (owner: string) => {
                setSelectedKeys(selected.includes(owner) ? selected.filter((k) => k !== owner) : [...selected, owner]);
              };
              interface WindowSpec {
                owner: string;
                x: number;
                y: number;
                w: number;
                h: number;
                cols: number;
                rows: number;
              }
              const drawWindow = ({ owner, x, y, w, h, cols, rows }: WindowSpec): React.ReactNode => {
                const active = selected.includes(owner);
                const dividerColor = active ? 'rgba(0,0,0,0.35)' : 'var(--color-border)';
                const verticals = Array.from({ length: cols - 1 }, (_, i) => {
                  const vx = x + ((i + 1) * w) / cols;
                  return <line key={`v${i}`} x1={vx} y1={y} x2={vx} y2={y + h} stroke={dividerColor} strokeWidth={1} />;
                });
                const horizontals = Array.from({ length: rows - 1 }, (_, i) => {
                  const hy = y + ((i + 1) * h) / rows;
                  return <line key={`h${i}`} x1={x} y1={hy} x2={x + w} y2={hy} stroke={dividerColor} strokeWidth={1} />;
                });
                return (
                  <g key={owner} style={{ cursor: 'pointer' }} onClick={() => toggle(owner)}>
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      rx={4}
                      fill={active ? '#22ad01' : 'rgba(255,255,255,0.06)'}
                      stroke={active ? '#22ad01' : 'var(--color-border)'}
                      strokeWidth={1.5}
                    />
                    {verticals}
                    {horizontals}
                    <text
                      x={x + w / 2}
                      y={y + h + 12}
                      textAnchor="middle"
                      fontSize={9.5}
                      fill={active ? '#22ad01' : 'var(--color-muted-foreground)'}
                      fontWeight={active ? 600 : 500}
                    >
                      {owner.split(' ')[0]}
                    </text>
                  </g>
                );
              };
              return (
                <div style={{ padding: 10, userSelect: 'none' }} onMouseDown={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()}>
                  <svg width={220} height={220} viewBox="0 0 220 220" aria-label="Owner filter">
                    {/* Roof */}
                    <polygon points="15,80 110,15 205,80" fill="rgba(34, 173, 1, 0.14)" stroke="#22ad01" strokeWidth={1.5} strokeLinejoin="round" />
                    {/* Body */}
                    <rect x={25} y={80} width={170} height={130} fill="rgba(255,255,255,0.02)" stroke="var(--color-border)" strokeWidth={1.5} />
                    {/* Windows — all bottoms aligned at y=170 */}
                    {drawWindow({ owner: owners[0], x: 40, y: 108, w: 40, h: 62, cols: 2, rows: 4 })}
                    {drawWindow({ owner: owners[1], x: 90, y: 108, w: 40, h: 62, cols: 2, rows: 2 })}
                    {drawWindow({ owner: owners[2], x: 140, y: 108, w: 40, h: 62, cols: 2, rows: 4 })}
                    {/* Door (reset) */}
                    <g
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        clearFilters?.();
                        confirm();
                      }}
                    >
                      <title>Reset filter</title>
                      <rect x={94} y={186} width={32} height={24} rx={2} fill="rgba(34, 173, 1, 0.22)" stroke="#22ad01" strokeWidth={1.5} />
                      <text x={110} y={202} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#22ad01">
                        reset
                      </text>
                    </g>
                  </svg>
                </div>
              );
            },
            onFilter: (value, record) => record.owner === value,
          },
        ]}
        dataSource={projects}
        rowKey="id"
        testIdPrefix="column-filtering"
      />
    </ComponentWrapper>
  ),
};

const VisibilityOrderSizingPinningExample = () => {
  const [state, setState] = React.useState<TableState>({
    columnVisibility: { owner: false },
    columnOrder: ['budget', 'name', 'client', 'status', 'owner'],
    columnSizing: { name: 260, budget: 160 },
    columnPinning: { left: ['name'], right: ['budget'] },
  });

  return (
    <ComponentWrapper
      title="Visibility, order, sizing, pinning"
      description="Four column controls, one shared `TableState`: `columnVisibility` hides columns by key, `columnOrder` reorders them, `columnSizing` sets pixel widths, and `columnPinning.left|right` freezes them against horizontal scroll. Drive them together via `state` + `onStateChange`."
    >
      <Table<ProjectRecord>
        columns={defaultColumns}
        dataSource={projects}
        rowKey="id"
        state={state}
        onStateChange={setState}
        scroll={{ x: 820 }}
        testIdPrefix="column-state"
      />
    </ComponentWrapper>
  );
};

export const VisibilityOrderSizingPinning: Story = {
  render: () => <VisibilityOrderSizingPinningExample />,
};

export const SpansEllipsisResponsive: Story = {
  render: () => (
    <ComponentWrapper
      title="Spans, ellipsis, responsive"
      description="`column.colSpan={n}` merges header cells (use `colSpan: 0` to hide the covered column); `column.ellipsis` truncates long text (`{ showTitle: false }` disables the native tooltip); `column.responsive: ['lg']` hides the column below Omni's `lg` breakpoint."
    >
      <Table<ProjectRecord>
        columns={[
          { ...defaultColumns[0], colSpan: 2, ellipsis: true, width: 240 },
          { ...defaultColumns[1], colSpan: 0 },
          { ...defaultColumns[2], responsive: ['lg'] },
          { ...defaultColumns[3], ellipsis: { showTitle: false }, width: 160 },
          defaultColumns[4],
        ]}
        rows={spanRows}
        tableLayout="fixed"
        scroll={{ x: 760 }}
        testIdPrefix="column-spans-responsive"
      />
    </ComponentWrapper>
  ),
};

export const ShowAndHideHeader: Story = {
  render: () => {
    const [showHeader, setShowHeader] = React.useState(true);
    return (
      <ComponentWrapper
        title="Show and hide header"
        description="Toggle the standalone `<thead>` on/off with the `showHeader` prop. When `false`, the header row is removed from view — data rows shift up and the table starts flush at the top. Consumers that still want the first tbody row styled as a header can combine `showHeader={false}` with `headerRow` (see the DocTable consumer)."
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <button type="button" className="pb-nav-btn" onClick={() => setShowHeader((v) => !v)}>
              {showHeader ? 'Hide header' : 'Show header'}
            </button>
            <span className="text-sm text-[var(--color-muted-foreground)]">showHeader = {String(showHeader)}</span>
          </div>
          <Table<ProjectRecord> columns={defaultColumns} dataSource={projects} rowKey="id" showHeader={showHeader} testIdPrefix="column-show-hide-header" />
        </div>
      </ComponentWrapper>
    );
  },
};

export const ColumnDragReorder: Story = {
  render: () => (
    <ComponentWrapper
      title="Column drag reorder"
      description="Mark each column `draggable: true` to enable header-based drag reordering. Seed the initial order with `defaultState.columnOrder`; the Table emits the new order through `onStateChange` (or updates it internally in uncontrolled mode)."
    >
      <Table<ProjectRecord>
        columns={defaultColumns.map((column) => ({ ...column, draggable: true }) satisfies TableColumn<ProjectRecord>)}
        dataSource={projects}
        rowKey="id"
        defaultState={{ columnOrder: ['name', 'client', 'status', 'owner', 'budget'] }}
        testIdPrefix="column-drag"
      />
    </ComponentWrapper>
  ),
};
