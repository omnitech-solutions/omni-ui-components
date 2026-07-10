import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Table, type TableColumn } from '@omnitech/omni-ui-core/Table';
import { ComponentWrapper } from './storySupport';
import {
  draggableRows,
  matrixRows,
  defaultColumns,
  projects,
  registryRows,
  spanRows,
  storyTableRegistry,
  type DocCellData,
  type ProjectRecord,
} from './Table.story.fixtures';
const meta: Meta = {
  title: 'omni-ui-components/Table/DataRow',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'DataRow stories cover the Omni row-first API for matrix-style tables. Use explicit rows when the data model is cell-oriented or when cell overrides need to drive content, spans, registry renderer kind, editability, or row state.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const ExplicitDataRowMatrix: Story = {
  render: () => (
    <ComponentWrapper
      title="Explicit data row matrix"
      description="Use `rows` instead of `dataSource` when the model is cell-oriented (documents, matrices, editable spreadsheets). Each `TableDataRow` supplies a `record` for downstream consumers and a `cells` map keyed by `column.key`; if a `column` has no matching cell, the cell renders empty rather than through `dataIndex`."
    >
      <Table<ProjectRecord, DocCellData> columns={defaultColumns} rows={matrixRows} testIdPrefix="data-row-matrix" />
    </ComponentWrapper>
  ),
};

export const CellOverrideRenderers: Story = {
  render: () => (
    <ComponentWrapper
      title="Cell override renderers"
      description="A `TableCellOverride` lets one row diverge from its column defaults. Supply `render` for custom JSX, `className` / `style` for one-off styling, `align` to override the column's alignment, and `kind` to route through a `TableRegistry` renderer — all without editing the shared column definition."
    >
      <Table<ProjectRecord, DocCellData>
        columns={defaultColumns}
        rows={[
          {
            key: 'override-1',
            record: {
              ...projects[0],
              id: 'override-1',
              name: 'Custom render',
              client: 'Cell class',
              status: 'Discovery',
              owner: 'Inline style',
              budget: 12400,
            },
            cells: {
              name: {
                value: 'Custom render',
                render: (value) => <strong>{String(value)}</strong>,
              },
              client: { value: 'Cell class', className: 'bg-emerald-500/10' },
              status: { value: 'Centered', align: 'center' },
              owner: { value: 'Inline style', style: { color: 'var(--pb-accent)' } },
              budget: { value: { amount: 12400, currency: 'USD' }, kind: 'money', align: 'right' },
            },
          },
        ]}
        testIdPrefix="data-row-cell-overrides"
      />
    </ComponentWrapper>
  ),
};

export const RegistryKindCells: Story = {
  render: () => (
    <ComponentWrapper
      title="Registry kind cells"
      description="Set `cell.kind` to the name of a renderer registered on `TableRegistry.fields` (e.g. `heading`, `pill`, `money`, `bulletList`). One registry serves every table in the app — DocTable and Omni UI Tables share the same cell variants."
      omit={['registry']}
    >
      <Table<ProjectRecord, DocCellData>
        columns={defaultColumns}
        rows={registryRows}
        registry={storyTableRegistry}
        appearance={{ borders: 'grid', headerRow: true }}
        testIdPrefix="data-row-registry-kind"
      />
    </ComponentWrapper>
  ),
};

export const CellSpans: Story = {
  render: () => (
    <ComponentWrapper
      title="Cell spans"
      description="`cell.colSpan={n}` merges a cell across `n` columns; `cell.colSpan={0}` hides the cell that would otherwise be covered so column widths still line up. `rowSpan` behaves the same across rows."
    >
      <Table<ProjectRecord, DocCellData>
        columns={defaultColumns}
        rows={spanRows}
        appearance={{ borders: 'grid', headerRow: true }}
        testIdPrefix="data-row-spans"
      />
    </ComponentWrapper>
  ),
};

export const RowStatesAndAttributes: Story = {
  render: () => (
    <ComponentWrapper
      title="Row states and attributes"
      description="A `TableDataRow` can carry runtime state directly: `selected`, `disabled`, `hidden`, `className`, and `onRow` (returning extra `<tr>` attributes like `aria-label`, `data-*`, or event handlers) — no need to lift into `rowSelection` or `onRow` at the Table level for row-scoped state."
    >
      <Table<ProjectRecord, DocCellData>
        columns={defaultColumns}
        rows={[
          {
            key: 'selected-row',
            record: projects[0],
            selected: true,
            className: 'font-medium',
            cells: {
              name: { value: 'Selected row' },
              client: { value: 'Acme Coffee' },
              status: { value: 'Discovery' },
              owner: { value: 'Nora' },
              budget: { value: { amount: 3800, currency: 'USD' }, kind: 'money', align: 'right' },
            },
            onRow: () => ({ 'aria-label': 'Selected DataRow story row' }),
          },
          {
            key: 'disabled-row',
            record: projects[1],
            disabled: true,
            cells: {
              name: { value: 'Disabled row' },
              client: { value: 'Northstar' },
              status: { value: 'Design' },
              owner: { value: 'Mae' },
              budget: { value: { amount: 8200, currency: 'USD' }, kind: 'money', align: 'right' },
            },
          },
          {
            key: 'hidden-row',
            record: projects[2],
            hidden: true,
            cells: { name: { value: 'Hidden row' } },
          },
        ]}
        testIdPrefix="data-row-states"
      />
    </ComponentWrapper>
  ),
};

const EditableRowsExample = () => {
  const [, setLastSaved] = React.useState<string>('Nothing saved yet');
  const handleSave = React.useCallback((value: unknown, record: ProjectRecord) => setLastSaved(`${record.id}: ${JSON.stringify(value)}`), []);
  const editableColumns: TableColumn<ProjectRecord>[] = React.useMemo(
    () => defaultColumns.map((column) => ({ ...column, editable: { mode: 'cell' as const, onSave: handleSave } })),
    [handleSave],
  );
  return (
    <ComponentWrapper
      title="Editable cell and row contracts"
      description="Mark an editable column with `editable: { mode: 'cell', onSave }` and pass records through `dataSource` — no per-row shape needed. In cell mode, Tab moves between editable cells; Tab from the last cell appends a new row via `extendable.rows`."
    >
      <div style={{ padding: '8px 24px 24px' }}>
        <Table<ProjectRecord>
          columns={editableColumns}
          dataSource={projects.slice(0, 3)}
          rowKey="id"
          extendable={{ rows: true, columns: true }}
          testIdPrefix="data-row-editable"
        />
      </div>
    </ComponentWrapper>
  );
};

export const EditableCellAndRowContracts: Story = {
  render: () => <EditableRowsExample />,
};

export const DraggableRows: Story = {
  render: () => (
    <ComponentWrapper
      title="Draggable rows"
      description="Mark rows with `draggable: true` and pass `onRowOrderChange` to enable reorder via `@atlaskit/pragmatic-drag-and-drop`. `disabled` rows stay pinned; the callback receives the new order so the parent can persist it."
    >
      <Table<ProjectRecord, DocCellData> columns={defaultColumns} rows={draggableRows} onRowOrderChange={() => undefined} testIdPrefix="data-row-draggable" />
    </ComponentWrapper>
  ),
};
