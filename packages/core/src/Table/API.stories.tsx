import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { InlineCode } from './storySupport';

interface ApiRow {
  prop: string;
  description: string;
  type: string;
  default?: string;
}

const propTableStyle: React.CSSProperties = {
  width: '100%',
  minWidth: 900,
  borderCollapse: 'collapse',
  fontSize: 13,
  lineHeight: 1.55,
  marginTop: 6,
  tableLayout: 'fixed',
};

const cellBase: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid var(--color-border)',
  verticalAlign: 'top',
  textAlign: 'left',
};

const headerCell: React.CSSProperties = {
  ...cellBase,
  background: 'var(--color-muted, rgba(255,255,255,0.04))',
  fontWeight: 600,
};

const propNameCell: React.CSSProperties = {
  ...cellBase,
  fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  fontSize: 12.5,
  overflowWrap: 'anywhere',
  color: '#22ad01',
};

const typeCell: React.CSSProperties = {
  ...cellBase,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
};

const defaultCellCode: React.CSSProperties = {
  ...cellBase,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  whiteSpace: 'normal',
};

const defaultCellEmpty: React.CSSProperties = {
  ...cellBase,
  color: 'var(--color-muted-foreground)',
  fontSize: 13,
};

const PropTable = ({ rows }: { rows: ApiRow[] }) => (
  <table style={propTableStyle}>
    <colgroup>
      <col style={{ width: 200 }} />
      <col />
      <col style={{ width: 240 }} />
      <col style={{ width: 200 }} />
    </colgroup>
    <thead>
      <tr>
        <th style={headerCell}>Property</th>
        <th style={headerCell}>Description</th>
        <th style={headerCell}>Type</th>
        <th style={headerCell}>Default</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((r) => (
        <tr key={r.prop}>
          <td style={propNameCell}>{r.prop}</td>
          <td style={cellBase}>{r.description}</td>
          <td style={typeCell} className="bui-api-type">
            <InlineCode code={r.type} />
          </td>
          {r.default ? (
            <td style={defaultCellCode} className="bui-api-default">
              <InlineCode code={r.default} />
            </td>
          ) : (
            <td style={defaultCellEmpty}>—</td>
          )}
        </tr>
      ))}
    </tbody>
  </table>
);

const sectionStyle: React.CSSProperties = { display: 'grid', gap: 8, marginBottom: 32 };
const sectionTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--color-foreground)',
  margin: '0 0 4px',
};
const sectionSubStyle: React.CSSProperties = { margin: 0, color: 'var(--color-foreground)', fontSize: 13.5, lineHeight: 1.6 };

const Section = ({ id, title, blurb, rows }: { id: string; title: string; blurb?: React.ReactNode; rows: ApiRow[] }) => (
  <section id={id} style={sectionStyle}>
    <h3 style={sectionTitleStyle}>{title}</h3>
    {blurb && <p style={sectionSubStyle}>{blurb}</p>}
    <PropTable rows={rows} />
  </section>
);

const tableProps: ApiRow[] = [
  { prop: 'columns', description: 'Column definitions rendered as table headers.', type: 'TableColumn<TRecord>[]' },
  { prop: 'dataSource', description: 'Record-first data. Each entry becomes one row; each column reads its cell via `dataIndex`.', type: 'TRecord[]' },
  {
    prop: 'rows',
    description: 'Explicit row objects for cell-oriented tables. Bypasses `dataIndex` — each `cells` entry drives its column.',
    type: 'TableDataRow<TRecord, TRowData>[]',
  },
  {
    prop: 'rowKey',
    description: 'Key path or accessor for uniquely identifying each row. Falls back to `record.key`, then `record.id`, then the row index.',
    type: 'keyof TRecord | string | (record, index) => Key',
  },
  { prop: 'bordered', description: 'Convenience switch for `appearance.borders = "grid"`.', type: 'boolean', default: 'false' },
  {
    prop: 'theme',
    description: 'Force a light or dark palette on the Table subtree; `auto` inherits from `data-theme`.',
    type: "'auto' | 'light' | 'dark'",
    default: "'auto'",
  },
  { prop: 'size', description: 'Cell density preset.', type: "'large' | 'medium' | 'small'", default: "'large'" },
  {
    prop: 'appearance',
    description: 'Fine-grained visual configuration — borders, header treatment, striping, alignment, spacing, background.',
    type: 'TableAppearance',
    default: "{ borders: 'grid', headerRow: true }",
  },
  { prop: 'showHeader', description: 'Render the `<thead>` region.', type: 'boolean', default: 'true' },
  { prop: 'rowHoverable', description: 'Highlight rows on hover.', type: 'boolean', default: 'true' },
  {
    prop: 'tableLayout',
    description: 'CSS table-layout mode. `fixed` combined with `column.width` gives predictable column widths.',
    type: "'auto' | 'fixed'",
  },
  { prop: 'sortDirections', description: 'Click cycle for sortable columns.', type: 'TableSortOrder[]', default: "['ascend', 'descend', null]" },
  { prop: 'scroll', description: 'Enable inner scroll on the body; drives virtualization windowing when `virtual` is set.', type: 'TableScrollConfig' },
  {
    prop: 'virtual',
    description: 'Row / column virtualization. `true` enables row virtualization with defaults; object form tunes overscan / estimates.',
    type: 'boolean | TableVirtualConfig',
    default: 'false',
  },
  { prop: 'sticky', description: 'Pin the header (and horizontal scrollbar) inside a scrolling ancestor.', type: 'boolean | TableStickyConfig' },
  { prop: 'pagination', description: 'Pagination configuration or `false` to disable.', type: 'TablePaginationConfig | false', default: 'false' },
  { prop: 'expandable', description: 'Per-row expansion — detail rendering, tree children, custom icons.', type: 'TableExpandable<TRecord>' },
  {
    prop: 'rowSelection',
    description: 'Row selection state and callbacks — checkbox / radio, bulk actions, disabled rows, tree-linked selection.',
    type: 'TableRowSelection<TRecord>',
  },
  {
    prop: 'editable',
    description: 'Table-level editable configuration. Combines with `column.editable` — controls append-on-Tab and the edit UI affordances.',
    type: 'boolean | TableEditableConfig<TRecord>',
  },
  { prop: 'extendable', description: 'Enable append-row / append-column affordances. `true` turns on both.', type: 'boolean | TableExtendableConfig<TRecord>' },
  {
    prop: 'loading',
    description: 'Loading state — boolean, variant string, or a full `TableLoadingProps` object.',
    type: "boolean | 'skeleton' | 'spinner' | TableLoadingProps",
    default: 'false',
  },
  { prop: 'locale', description: 'Text overrides — empty state, filter confirm/reset, select-all label.', type: 'TableLocale' },
  { prop: 'title', description: 'Render the top slot above the header.', type: '(currentData, rows) => ReactNode' },
  { prop: 'footer', description: 'Render the footer slot below the body.', type: '(currentData, rows) => ReactNode' },
  { prop: 'summary', description: 'Render a summary row (e.g. subtotals) beneath the body.', type: '(currentData, rows) => ReactNode' },
  { prop: 'rowClassName', description: 'Per-row className.', type: 'string | (record, index, row) => string' },
  {
    prop: 'components',
    description: 'Slot overrides for the rendered DOM elements (`Root`, `HeaderCell`, `BodyRow`, `PaginationItem`, ...).',
    type: 'Partial<TableComponents<TRecord>>',
  },
  {
    prop: 'registry',
    description: 'Overrides / additions for the field-render registry (`heading`, `pill`, `money`, `orderedList`, ...).',
    type: 'Partial<TableRegistry<TRecord>>',
  },
  { prop: 'renderers', description: 'Global cell / header / row / empty / loading renderer overrides.', type: 'Partial<TableRenderers<TRecord>>' },
  {
    prop: 'className / classNames',
    description: 'Root className and a semantic-slot className map.',
    type: 'string | Partial<Record<TableSemanticDOM, string>>',
  },
  {
    prop: 'style / styles',
    description: 'Root style and a semantic-slot style map.',
    type: 'CSSProperties | Partial<Record<TableSemanticDOM, CSSProperties>>',
  },
  {
    prop: 'state / defaultState',
    description:
      'Controlled / uncontrolled `TableState` covering sorting, filters, pagination, rowSelection, expanded, columnOrder, columnSizing, columnPinning, columnVisibility.',
    type: 'TableState',
  },
  {
    prop: 'onChange',
    description:
      'Fires when pagination / filters / sort mutate; receives the current derived state and an extra info payload (`action`, `currentDataSource`, `currentRows`, `table`).',
    type: '(pagination, filters, sorter, extra) => void',
  },
  { prop: 'onStateChange', description: 'Fires whenever any part of `TableState` changes.', type: '(state: TableState) => void' },
  { prop: 'onRow', description: 'Return extra `<tr>` attributes per body row.', type: '(record, index, row) => HTMLAttributes<HTMLTableRowElement>' },
  { prop: 'onHeaderRow', description: 'Return extra `<tr>` attributes per header row.', type: '(columns, index) => HTMLAttributes<HTMLTableRowElement>' },
  { prop: 'onScroll', description: 'Body-scroll callback.', type: '(event: UIEvent<HTMLDivElement>) => void' },
  { prop: 'onRowOrderChange', description: 'Fires when rows are reordered via drag-and-drop.', type: '(keys, rows, records) => void' },
  { prop: 'onColumnOrderChange', description: 'Fires when columns are reordered via drag-and-drop.', type: '(columnOrder: string[]) => void' },
  { prop: 'onEdit', description: 'Fires whenever any editable cell is committed.', type: '(commit: RowDataEdit<TRecord>) => void' },
  { prop: 'testIdPrefix', description: 'Prefix for every `data-testid` emitted by the Table.', type: 'string', default: "'table'" },
];

const columnProps: ApiRow[] = [
  { prop: 'key', description: 'Unique column identifier. Used in `TableState.columnOrder / columnVisibility / columnSizing / columnPinning`.', type: 'string' },
  {
    prop: 'title',
    description: 'Header cell content. Function form receives `{ column, sortOrder, sortColumn, filters }`.',
    type: 'ReactNode | (info) => ReactNode',
  },
  { prop: 'dataIndex', description: 'Path into each record for `dataSource`-driven cells.', type: 'keyof TRecord | string | string[]' },
  { prop: 'render', description: 'Custom cell renderer. Receives `(value, record, index, row)`.', type: '(value, record, index, row) => ReactNode' },
  {
    prop: 'type',
    description:
      'Declarative row-data type — routes the cell through a `Table.RowData<Name>` renderer (`text`, `number`, `money`, `date`, `icon`, `avatar`, `link`, `file`, `actions`).',
    type: 'TableRowDataType',
  },
  { prop: 'valueType', description: 'Value coercion hint for sorting / default rendering.', type: 'TableRowDataType' },
  { prop: 'align', description: 'Cell horizontal alignment.', type: "'left' | 'center' | 'right'" },
  { prop: 'className', description: 'Cell className.', type: 'string' },
  { prop: 'width / minWidth', description: 'Column widths. `width` accepts number (px) or CSS length.', type: 'string | number' },
  { prop: 'fixed', description: 'Pin the column to the start / end. `true` is treated as `left`.', type: "boolean | 'start' | 'end' | 'left' | 'right'" },
  { prop: 'ellipsis', description: 'Truncate overflowing text. Object form hides the native tooltip.', type: 'boolean | { showTitle?: boolean }' },
  { prop: 'responsive', description: 'Hide the column below the listed breakpoints.', type: "('sm' | 'md' | 'lg' | 'xl')[]" },
  { prop: 'colSpan', description: 'Header cell colSpan. Use `0` on the covered leaf column to hide it.', type: 'number' },
  { prop: 'hidden', description: 'Static hide flag (overrides `TableState.columnVisibility`).', type: 'boolean' },
  { prop: 'draggable', description: 'Enable header drag-reorder for this column.', type: 'boolean' },
  { prop: 'children', description: 'Grouped-header columns.', type: 'TableColumn<TRecord>[]' },
  {
    prop: 'sorter',
    description:
      'Sort configuration. `true` uses default comparator; function form supplies a compare fn; object form adds a `multiple` priority for multi-column sort.',
    type: 'boolean | (a, b, order) => number | { compare, multiple }',
  },
  { prop: 'sortOrder / defaultSortOrder', description: 'Controlled / uncontrolled sort direction for this column.', type: "'ascend' | 'descend' | null" },
  { prop: 'sortDirections', description: 'Per-column override of the click cycle.', type: 'TableSortDirection[]' },
  { prop: 'sortIcon', description: 'Render function for the sort indicator.', type: '(props: { sortOrder }) => ReactNode' },
  { prop: 'filters', description: 'Options for the built-in filter dropdown.', type: 'TableFilterItem[]' },
  { prop: 'filterMode', description: 'Layout for the built-in filter dropdown.', type: "'menu' | 'tree'", default: "'menu'" },
  { prop: 'filterMultiple', description: 'Allow multiple selections in the filter dropdown.', type: 'boolean', default: 'true' },
  {
    prop: 'filterSearch',
    description: 'Enable search inside the filter dropdown. Function form supplies a custom matcher.',
    type: 'boolean | (input, item) => boolean',
  },
  { prop: 'filteredValue / defaultFilteredValue', description: 'Controlled / uncontrolled filter selections.', type: 'TableKey[]' },
  { prop: 'filterResetToDefaultFilteredValue', description: 'Reset button restores `defaultFilteredValue` instead of clearing.', type: 'boolean' },
  { prop: 'filterOnClose', description: 'Commit the current filter draft when the dropdown closes.', type: 'boolean', default: 'true' },
  {
    prop: 'filterOnChange',
    description: 'Inside a custom `filterDropdown`, `setSelectedKeys` also commits immediately — apply-on-click without closing.',
    type: 'boolean',
    default: 'false',
  },
  {
    prop: 'filterDropdown',
    description: 'Custom filter UI. Receives `{ selectedKeys, setSelectedKeys, confirm, clearFilters, close, column }`.',
    type: 'ReactNode | (props) => ReactNode',
  },
  { prop: 'filterDropdownProps', description: 'Controlled open state for the filter dropdown.', type: 'TableDropdownProps' },
  { prop: 'filterIcon', description: 'Custom filter trigger icon.', type: 'ReactNode | (filtered) => ReactNode' },
  { prop: 'onFilter', description: 'Predicate driving row inclusion for the current filter selection.', type: '(value, record) => boolean' },
  { prop: 'onCell', description: 'Extra `<td>` attributes per body cell.', type: '(record, rowIndex, row) => TdHTMLAttributes' },
  { prop: 'onHeaderCell', description: 'Extra `<th>` attributes for the header cell.', type: '(column) => ThHTMLAttributes' },
  {
    prop: 'editable',
    description: 'Column-level editable configuration (`{ mode, validate, onSave, renderEditor }`).',
    type: 'boolean | TableEditableColumnConfig<TRecord>',
  },
  { prop: 'meta', description: 'Arbitrary per-column metadata surfaced via TanStack column meta.', type: 'Record<string, unknown>' },
];

const appearanceProps: ApiRow[] = [
  { prop: 'borders', description: 'Cell divider treatment.', type: "'grid' | 'rows' | 'none'", default: "'grid'" },
  { prop: 'stripedRows', description: 'Alternate row background.', type: 'boolean', default: 'false' },
  { prop: 'headerRow', description: 'Emphasize the header row.', type: 'boolean', default: 'true' },
  { prop: 'headerColumn', description: 'Emphasize the first column as a header column.', type: 'boolean', default: 'false' },
  { prop: 'headerFill', description: 'Override the header row background color.', type: 'string' },
  { prop: 'borderColor', description: 'Override the cell border color.', type: 'string' },
  { prop: 'cellAlignment', description: 'Default alignment for cells without a column-level `align`.', type: 'TableAlign' },
  { prop: 'textSize', description: 'Override cell font size (px).', type: 'number' },
  { prop: 'background', description: 'Override the table body background.', type: 'string' },
  { prop: 'padding / margin', description: 'Outer spacing around the root.', type: 'BoxSpacing' },
  { prop: 'blockBorder', description: 'Outer border style / width / color / radius.', type: 'TableBlockBorder' },
];

const paginationProps: ApiRow[] = [
  { prop: 'current / defaultCurrent', description: 'Controlled / uncontrolled 1-based page number.', type: 'number' },
  { prop: 'pageSize / defaultPageSize', description: 'Controlled / uncontrolled page size.', type: 'number', default: '10' },
  { prop: 'total', description: 'Explicit total row count (defaults to the filtered dataSource length).', type: 'number' },
  {
    prop: 'placement',
    description: "Where to render the pager — supports multiple placements; `'none'` renders no pager but still paginates.",
    type: 'TablePaginationPlacement[]',
    default: "['bottomEnd']",
  },
  { prop: 'showPrevNext', description: 'Show ‹ / › buttons.', type: 'boolean', default: 'true' },
  { prop: 'showSizeChanger', description: 'Show the page-size dropdown.', type: 'boolean', default: 'false' },
  { prop: 'pageSizeOptions', description: 'Options in the size dropdown.', type: 'number[]' },
  { prop: 'disabled', description: 'Grey out the pager and short-circuit `goToPage`.', type: 'boolean', default: 'false' },
  { prop: 'onChange', description: 'Page click callback.', type: '(page: number, pageSize: number) => void' },
  { prop: 'onShowSizeChange', description: 'Page-size change callback.', type: '(current: number, size: number) => void' },
];

const expandableProps: ApiRow[] = [
  {
    prop: 'expandedRowRender',
    description: 'Render function for the detail row beneath an expanded record.',
    type: '(record, index, indent, expanded, row) => ReactNode',
  },
  { prop: 'expandedRowKeys / defaultExpandedRowKeys', description: 'Controlled / uncontrolled expanded keys.', type: 'TableKey[]' },
  { prop: 'defaultExpandAllRows', description: 'Expand every row on mount.', type: 'boolean', default: 'false' },
  { prop: 'childrenColumnName', description: 'Record key holding nested rows for tree mode.', type: 'string', default: "'children'" },
  { prop: 'indentSize', description: 'Per-depth indent in pixels for tree rows.', type: 'number' },
  { prop: 'columnTitle / columnWidth', description: 'Header title / width of the expand toggle column.', type: 'ReactNode / string | number' },
  { prop: 'expandIcon', description: 'Custom toggle button. Call `onExpand(record, event)` to commit.', type: '(props) => ReactNode' },
  { prop: 'expandRowByClick', description: 'Toggle expansion when the row is clicked anywhere.', type: 'boolean', default: 'false' },
  { prop: 'showExpandColumn', description: 'Show / hide the dedicated toggle column.', type: 'boolean', default: 'true' },
  { prop: 'rowExpandable', description: 'Per-record gate for expansion.', type: '(record, row) => boolean' },
  { prop: 'fixed', description: 'Pin the expand column.', type: "boolean | 'left' | 'right'" },
  { prop: 'expandedRowClassName', description: 'className for the detail row.', type: 'string | (record, index, indent) => string' },
  { prop: 'onExpand', description: 'Fires when a single row toggles.', type: '(expanded, record, row) => void' },
  { prop: 'onExpandedRowsChange', description: 'Fires with the new expanded-key array.', type: '(keys: TableKey[]) => void' },
];

const rowSelectionProps: ApiRow[] = [
  { prop: 'type', description: 'Selection mode.', type: "'checkbox' | 'radio'", default: "'checkbox'" },
  { prop: 'selectedRowKeys / defaultSelectedRowKeys', description: 'Controlled / uncontrolled selected keys.', type: 'TableKey[]' },
  { prop: 'preserveSelectedRowKeys', description: 'Keep selection alive when rows leave `dataSource`.', type: 'boolean', default: 'false' },
  { prop: 'checkStrictly', description: '`false` cascades parent selection to descendants in tree mode.', type: 'boolean', default: 'true' },
  {
    prop: 'columnTitle / columnWidth',
    description: 'Header title / width of the selection column.',
    type: 'ReactNode | (originalNode) => ReactNode / string | number',
  },
  { prop: 'fixed', description: 'Pin the selection column.', type: "boolean | 'left' | 'right'", default: 'true' },
  { prop: 'align', description: 'Cell horizontal alignment for the selection column.', type: "'left' | 'center' | 'right'" },
  { prop: 'hideSelectAll', description: 'Hide the header select-all checkbox.', type: 'boolean', default: 'false' },
  { prop: 'getCheckboxProps', description: 'Return per-row `<input>` attributes (e.g. `{ disabled: true }`).', type: '(record, row) => InputHTMLAttributes' },
  { prop: 'getTitleCheckboxProps', description: 'Return per-header `<input>` attributes.', type: '() => InputHTMLAttributes' },
  { prop: 'renderCell', description: 'Custom render for each selection cell.', type: '(checked, record, index, originNode, row) => ReactNode' },
  { prop: 'onCell', description: 'Extra `<td>` attributes for each selection cell.', type: '(record, rowIndex, row) => TdHTMLAttributes' },
  {
    prop: 'selections',
    description: 'Bulk-actions dropdown — `true` for the default set, or supply your own actions.',
    type: 'boolean | TableSelectionAction[]',
  },
  { prop: 'bulkActions', description: 'Bar-style bulk-actions configuration (buttons or a fully custom bar).', type: 'TableBulkActionsConfig<TRecord>' },
  { prop: 'onChange', description: 'Fires on every selection change with the new keys, rows, and change type.', type: '(keys, rows, info) => void' },
  { prop: 'onSelect', description: 'Fires for single-row toggles.', type: '(record, selected, selectedRows, event, row) => void' },
  { prop: 'onSelectAll', description: 'Fires for the header select-all toggle.', type: '(selected, selectedRows, changeRows) => void' },
  { prop: 'onSelectInvert', description: 'Fires for the invert-selection built-in action.', type: '(keys: TableKey[]) => void' },
  { prop: 'onSelectMultiple', description: 'Fires for shift-click range selection.', type: '(selected, selectedRows, changeRows) => void' },
  { prop: 'onSelectNone', description: 'Fires for the clear-selection built-in action.', type: '() => void' },
];

const scrollProps: ApiRow[] = [
  {
    prop: 'x',
    description: 'Horizontal scroll — set to `true` / `"max-content"` / number to reserve a minimum table width.',
    type: "string | number | true | 'max-content'",
  },
  { prop: 'y', description: 'Vertical scroll — bounds the inner scroll body height.', type: 'string | number' },
  { prop: 'scrollToFirstRowOnChange', description: 'Snap back to row 1 whenever sort / filter / pagination changes.', type: 'boolean', default: 'true' },
];

const virtualProps: ApiRow[] = [
  { prop: 'rows', description: 'Enable row virtualization (requires `scroll.y`).', type: 'boolean' },
  { prop: 'columns', description: 'Enable column virtualization (requires `scroll.x`).', type: 'boolean' },
  { prop: 'overscan', description: 'How many extra rows / columns to render outside the viewport.', type: 'number' },
  { prop: 'estimateRowHeight', description: 'Row height estimate for the virtualizer.', type: 'number' },
  { prop: 'estimateColumnWidth', description: 'Column width estimate for the virtualizer.', type: 'number' },
];

const stickyProps: ApiRow[] = [
  { prop: 'offsetHeader', description: 'Distance (px) from the top of the scrolling ancestor.', type: 'number' },
  { prop: 'offsetScroll', description: 'Distance (px) from the bottom of the scrolling ancestor for the horizontal scrollbar.', type: 'number' },
  { prop: 'getContainer', description: 'Custom scrolling ancestor. Defaults to `window`.', type: '() => HTMLElement' },
];

const editableProps: ApiRow[] = [
  { prop: 'headerColumns', description: 'Show the header add/remove-column affordances.', type: 'boolean' },
  { prop: 'bodyRows', description: 'Show the body add/remove-row affordances.', type: 'boolean' },
  {
    prop: 'appendRowOnTab',
    description: 'Combined with `extendable.rows`, Tab-in-last-cell appends a new row and focuses its first editable cell.',
    type: 'boolean',
    default: 'true',
  },
  { prop: 'controls', description: 'Configure the header / body control buttons.', type: 'boolean | TableEditableControlsConfig' },
  { prop: 'onAppendRow', description: 'Callback that owns the shape of the row appended via Tab.', type: '(ctx) => TableDataRow<TRecord> | void | Promise' },
];

const extendableProps: ApiRow[] = [
  { prop: 'rows', description: 'Enable row extension. Object form supplies a custom `onAppend`.', type: 'boolean | TableExtendableSide<TRecord>' },
  { prop: 'columns', description: 'Enable column extension. Object form supplies a custom `onAppend`.', type: 'boolean | TableExtendableSide<TRecord>' },
  { prop: 'controls', description: 'Show the ± affordance buttons.', type: 'boolean', default: 'true' },
];

const localeProps: ApiRow[] = [
  { prop: 'emptyText', description: 'Content rendered when `dataSource` is empty.', type: 'ReactNode' },
  { prop: 'filterConfirm', description: 'Label for the built-in filter confirm button.', type: 'ReactNode', default: "'Confirm'" },
  { prop: 'filterReset', description: 'Label for the built-in filter reset button.', type: 'ReactNode', default: "'Reset'" },
  { prop: 'selectAll', description: 'Accessible label for the select-all checkbox.', type: 'ReactNode' },
];

const columnEditableProps: ApiRow[] = [
  { prop: 'mode', description: '`cell` edits one cell at a time; `row` edits the whole row.', type: "'cell' | 'row'" },
  { prop: 'validate', description: 'Reject a value with an error message.', type: '(value, record, row) => string | null' },
  { prop: 'onSave', description: 'Fires on commit.', type: '(value, record, row) => void | Promise' },
  { prop: 'renderEditor', description: 'Custom editor for this column.', type: 'TableCellEditorRenderer<TRecord>' },
];

const rowRefProps: ApiRow[] = [
  { prop: 'nativeElement', description: 'The root DOM node.', type: 'HTMLDivElement' },
  {
    prop: 'scrollTo',
    description: 'Imperative scroll — by pixel offset, row `index`, `rowKey`, plus `align`.',
    type: '(config: { index?, key?, top?, offset?, align? }) => void',
  },
];

const stateProps: ApiRow[] = [
  { prop: 'sorting', description: 'TanStack sorting state.', type: 'SortingState' },
  { prop: 'filters', description: 'TanStack column filters state.', type: 'ColumnFiltersState' },
  { prop: 'pagination', description: 'TanStack pagination state.', type: 'PaginationState' },
  { prop: 'rowSelection', description: 'TanStack row-selection state.', type: 'RowSelectionState' },
  { prop: 'expanded', description: 'Expanded row state.', type: 'ExpandedState' },
  { prop: 'columnOrder', description: 'Left-to-right column key order.', type: 'string[]' },
  { prop: 'columnSizing', description: 'Per-column width overrides.', type: 'Record<string, number>' },
  { prop: 'columnPinning', description: 'Column pinning to left / right.', type: '{ left?: string[]; right?: string[] }' },
  { prop: 'columnVisibility', description: 'Per-column visibility flags.', type: 'Record<string, boolean>' },
];

const meta: Meta = {
  title: 'omni-ui-components/Table/API',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Reference for every public prop and interface the Omni Table exposes. Modeled on the AntD Table API doc — pairs of Property / Description / Type / Default so consumers can jump straight to the config they need.',
      },
    },
  },
};
export default meta;

export const TableComponentAPI: StoryObj = {
  name: 'Table Component API',
  render: () => (
    <div style={{ minWidth: 960, maxWidth: 1100, color: 'var(--color-foreground)' }}>
      <style>{`.bui-api-default .pb-pill-inline-code, .bui-api-type .pb-pill-inline-code { white-space: normal !important; overflow-wrap: anywhere !important; word-break: break-word !important; }`}</style>
      <p style={{ margin: '0 0 24px', fontSize: 14, lineHeight: 1.6 }}>
        Omni Table exposes an AntD-compatible surface where possible. Everything below is generated from the real <InlineCode code="Table.types.ts" />{' '}
        definitions and the runtime defaults in <InlineCode code="Table.tsx" />. Where a prop is Omni-specific it is called out inline.
      </p>

      <Section id="api-table" title="Table" rows={tableProps} />
      <Section id="api-column" title="Column" blurb="Column definitions passed to `columns` (or `column.children` for grouped headers)." rows={columnProps} />
      <Section
        id="api-appearance"
        title="appearance"
        blurb="Omni-specific — fine-grained visual configuration. `bordered` is a convenience alias for `appearance.borders = 'grid'`."
        rows={appearanceProps}
      />
      <Section id="api-pagination" title="pagination" rows={paginationProps} />
      <Section id="api-expandable" title="expandable" rows={expandableProps} />
      <Section id="api-row-selection" title="rowSelection" rows={rowSelectionProps} />
      <Section id="api-scroll" title="scroll" rows={scrollProps} />
      <Section id="api-virtual" title="virtual" rows={virtualProps} />
      <Section id="api-sticky" title="sticky" rows={stickyProps} />
      <Section
        id="api-editable"
        title="editable (Table-level)"
        blurb="Combines with `column.editable` — controls the append-on-Tab behavior and the row / column control affordances."
        rows={editableProps}
      />
      <Section
        id="api-column-editable"
        title="column.editable"
        blurb="Column-level editable configuration. Prefer this over row-level `editable` — every editable column can supply its own `onSave` / `validate` / `renderEditor`."
        rows={columnEditableProps}
      />
      <Section id="api-extendable" title="extendable" rows={extendableProps} />
      <Section id="api-locale" title="locale" rows={localeProps} />
      <Section
        id="api-state"
        title="TableState"
        blurb="Passed via `state` (controlled) or `defaultState` (uncontrolled). One shape covers sorting, filters, pagination, selection, expansion, column order / sizing / pinning / visibility."
        rows={stateProps}
      />
      <Section id="api-ref" title="TableRef" blurb="Imperative handle exposed via `React.useRef<TableRef>()` + `ref` on the Table." rows={rowRefProps} />
    </div>
  ),
};
