import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Table, type TableRef } from '@oc-tech/omni-ui-components/Table';
import { ComponentWrapper } from './storySupport';
import { largeProjects, wideProjectColumns, type ProjectRecord } from './Table.story.fixtures';
const meta: Meta = {
  title: 'omni-ui-components/Table/Virtualization',
  // No `autodocs` tag — the autodocs page renders every story simultaneously,
  // which forces 5 large virtualized tables (150 + 20 + 40 + 40 + 150 records)
  // to mount inside containers the virtualizer can't measure reliably. Open
  // each story directly for the interactive preview instead.
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Virtualization stories cover large-table behavior in the shared Table component: row virtualization, optional column virtualization, pinned columns with horizontal virtualization, sticky scrolling, and imperative TableRef scrolling.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

// Hoisted to module scope so every render reuses the same reference. Inline
// `.slice()` / object literals in `render()` change identity on every render,
// which combined with `scrollToFirstRowOnChange` triggered a re-render loop
// on the autodocs page (all 5 stories rendered together).
const narrowColumns = wideProjectColumns.slice(0, 5);
const first20 = largeProjects.slice(0, 20);
const first40 = largeProjects.slice(0, 40);

const rowVirtualScroll = { y: 320 } as const;
const rowColumnVirtualScroll = { x: 900, y: 320 } as const;
const stickyScroll = { x: 900, y: 280, scrollToFirstRowOnChange: true } as const;

const virtualRows = { rows: true, overscan: 6 } as const;
const virtualRowsAndColumns = { rows: true, columns: true, overscan: 3 } as const;
const virtualRefRows = { rows: true, overscan: 4 } as const;

const pinnedDefaultState = { columnPinning: { left: ['name'], right: ['budget'] } };
const stickyConfig = { offsetHeader: 0, offsetScroll: 12 } as const;
const stickyPagination = { defaultPageSize: 10 } as const;

export const RowVirtualization: Story = {
  render: () => (
    <ComponentWrapper
      title="Row virtualization"
      description="`virtual={{ rows: true, overscan }}` mounts only the rows that fit within `scroll.y` (plus `overscan` above/below). Required for large `dataSource` arrays — DOM size stays constant regardless of row count."
    >
      <Table<ProjectRecord>
        columns={narrowColumns}
        dataSource={largeProjects}
        rowKey="id"
        scroll={rowVirtualScroll}
        virtual={virtualRows}
        testIdPrefix="virtual-rows"
      />
    </ComponentWrapper>
  ),
};

export const ColumnVirtualization: Story = {
  render: () => (
    <ComponentWrapper
      title="Column virtualization"
      description="`virtual={{ rows: true, columns: true }}` also skips off-screen columns as the viewport pans horizontally. Combine with `scroll.x` to bound the render surface for wide tables."
    >
      <Table<ProjectRecord>
        columns={wideProjectColumns}
        dataSource={first20}
        rowKey="id"
        scroll={rowColumnVirtualScroll}
        virtual={virtualRowsAndColumns}
        testIdPrefix="virtual-columns"
      />
    </ComponentWrapper>
  ),
};

export const PinnedColumnsWithVirtualColumns: Story = {
  render: () => (
    <ComponentWrapper
      title="Pinned columns with virtual columns"
      description="Pinned columns (`defaultState.columnPinning.left|right`) stay mounted outside the virtualization window so their cells remain visible during horizontal scroll. Non-pinned columns virtualize normally."
    >
      <Table<ProjectRecord>
        columns={wideProjectColumns}
        dataSource={first40}
        rowKey="id"
        scroll={rowColumnVirtualScroll}
        virtual={virtualRowsAndColumns}
        defaultState={pinnedDefaultState}
        testIdPrefix="virtual-pinned"
      />
    </ComponentWrapper>
  ),
};

export const StickyHeaderAndScroll: Story = {
  render: () => (
    <ComponentWrapper
      title="Sticky header and scroll"
      description="`sticky={{ offsetHeader, offsetScroll }}` pins the header (and the bottom horizontal scrollbar) inside a scrolling ancestor. `scroll.scrollToFirstRowOnChange: true` snaps back to row 1 whenever `dataSource` changes."
    >
      <Table<ProjectRecord>
        columns={wideProjectColumns}
        dataSource={first40}
        rowKey="id"
        scroll={stickyScroll}
        sticky={stickyConfig}
        pagination={stickyPagination}
        testIdPrefix="virtual-sticky"
      />
    </ComponentWrapper>
  ),
};

const TableRefScrollToExample = () => {
  const tableRef = React.useRef<TableRef | null>(null);
  return (
    <div className="grid gap-3">
      <div className="flex gap-2">
        <button type="button" className="pb-nav-btn" onClick={() => tableRef.current?.scrollTo({ top: 0 })}>
          Top
        </button>
        <button type="button" className="pb-nav-btn" onClick={() => tableRef.current?.scrollTo({ index: 40, align: 'start' })}>
          Row 41
        </button>
        <button type="button" className="pb-nav-btn" onClick={() => tableRef.current?.scrollTo({ key: 'project-75', align: 'center' })}>
          Project 75
        </button>
      </div>
      <ComponentWrapper
        title="Imperative scrollTo"
        description="Attach a `ref` typed as `TableRef` and call `ref.current.scrollTo({ top, index, key, align })` to jump to a pixel offset, row index, or `rowKey`. Works with virtualization — the target row is mounted if it's outside the viewport."
      >
        <Table<ProjectRecord>
          ref={tableRef}
          columns={narrowColumns}
          dataSource={largeProjects}
          rowKey="id"
          scroll={rowVirtualScroll}
          virtual={virtualRefRows}
          testIdPrefix="virtual-ref-scroll"
        />
      </ComponentWrapper>
    </div>
  );
};

export const TableRefScrollTo: Story = {
  render: () => <TableRefScrollToExample />,
};
