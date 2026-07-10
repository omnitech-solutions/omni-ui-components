import type * as React from 'react';
import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  ExpandedState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Table as TanStackTable,
  VisibilityState,
} from '@tanstack/react-table';

export type TableKey = React.Key;
export type TableSize = 'large' | 'medium' | 'small';
export type TableSortOrder = 'ascend' | 'descend';
export type TableSortDirection = TableSortOrder;
export type TableLayout = 'auto' | 'fixed';
export type TableAlign = 'left' | 'center' | 'right';
export type TableFixed = boolean | 'start' | 'end' | 'left' | 'right';
export type TableBreakpoint = 'sm' | 'md' | 'lg' | 'xl';
export type TableAction = 'paginate' | 'sort' | 'filter';
export const ROW_DATA_TYPES = ['string', 'date', 'icon', 'avatar', 'file', 'actions', 'money', 'link', 'number'] as const;
export type TableRowDataType = (typeof ROW_DATA_TYPES)[number];

export type TableSemanticDOM =
  | 'root'
  | 'title'
  | 'content'
  | 'section'
  | 'header.wrapper'
  | 'header.row'
  | 'header.cell'
  | 'body.wrapper'
  | 'body.row'
  | 'body.cell'
  | 'footer'
  | 'summary'
  | 'pagination.root'
  | 'pagination.item'
  | 'selection.cell'
  | 'expand.cell'
  | 'empty'
  | 'loading';

export interface TableState {
  sorting?: SortingState;
  filters?: ColumnFiltersState;
  pagination?: PaginationState;
  rowSelection?: RowSelectionState;
  expanded?: ExpandedState;
  columnVisibility?: VisibilityState;
  columnOrder?: ColumnOrderState;
  columnSizing?: ColumnSizingState;
  columnPinning?: ColumnPinningState;
}

export interface TableResolvedRow<TRecord, TRowData = unknown> {
  key: TableKey;
  record: TRecord;
  row: TableDataRow<TRecord, TRowData>;
  index: number;
}

export interface TableDataRowTitleInfo<TRecord, TRowData = unknown> {
  row: TableDataRow<TRecord, TRowData>;
  record: TRecord;
  index: number;
}

export interface TableDataRow<TRecord, TRowData = unknown> {
  key: TableKey;
  kind?: string;
  record?: TRecord;
  data?: TRowData;
  dataIndex?: keyof TRecord | string | string[];
  title?: React.ReactNode | ((info: TableDataRowTitleInfo<TRecord, TRowData>) => React.ReactNode);
  render?: (record: TRecord, index: number, row: TableDataRow<TRecord, TRowData>) => React.ReactNode;
  children?: TableDataRow<TRecord, TRowData>[];
  className?: string;
  style?: React.CSSProperties;
  height?: number | string;
  minHeight?: number;
  hidden?: boolean;
  disabled?: boolean;
  selected?: boolean;
  expanded?: boolean;
  expandable?: boolean | ((record: TRecord, row: TableDataRow<TRecord, TRowData>) => boolean);
  draggable?: boolean;
  editable?: boolean | TableEditableRowConfig<TRecord, TRowData>;
  cells?: Record<string, TableCellOverride<TRecord, TRowData>>;
  onCell?: (column: TableColumn<TRecord, TRowData>, columnIndex: number) => React.TdHTMLAttributes<HTMLTableCellElement>;
  onRow?: (record: TRecord, rowIndex: number) => React.HTMLAttributes<HTMLTableRowElement>;
  /** Reserved for future memoized row rendering. The current runtime does not invoke this callback. */
  shouldRowUpdate?: (record: TRecord, prevRecord: TRecord) => boolean;
  meta?: Record<string, unknown>;
}

export interface TableCellRenderContext<TRecord, TRowData = unknown> {
  record: TRecord;
  row: TableDataRow<TRecord, TRowData>;
  column: TableColumn<TRecord, TRowData>;
  rowIndex: number;
  columnIndex: number;
  registry: TableRegistry<TRecord, TRowData>;
}

export interface TableCellOverride<TRecord, TRowData = unknown, TValue = unknown> {
  value?: TValue;
  kind?: TableRowDataType | (string & {});
  render?: (value: TValue, ctx: TableCellRenderContext<TRecord, TRowData>) => React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  align?: TableAlign;
  className?: string;
  style?: React.CSSProperties;
  editable?: boolean | TableEditableCellConfig<TRecord, TRowData>;
  disabled?: boolean;
  meta?: Record<string, unknown>;
}

export interface TableFilterItem {
  text: React.ReactNode;
  value: TableKey;
  children?: TableFilterItem[];
}

export interface TableDropdownProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface TableFilterDropdownProps<TRecord, TRowData = unknown> {
  column: TableColumn<TRecord, TRowData>;
  selectedKeys: TableKey[];
  setSelectedKeys: (keys: TableKey[]) => void;
  confirm: () => void;
  clearFilters: () => void;
  close: () => void;
}

export interface TableColumnTitleInfo<TRecord, TRowData = unknown> {
  column: TableColumn<TRecord, TRowData>;
  sortColumns: TableSorterResult<TRecord>[];
  filters: Record<string, TableKey[] | null>;
}

export interface TableSorterResult<TRecord> {
  columnKey: string;
  field?: string | string[];
  order: TableSortOrder | null;
  column?: TableColumn<TRecord, unknown>;
}

export interface TableColumn<TRecord, TRowData = unknown, TValue = unknown> {
  align?: TableAlign;
  className?: string;
  colSpan?: number;
  dataIndex?: keyof TRecord | string | string[];
  valueType?: TableRowDataType;
  defaultFilteredValue?: TableKey[];
  filterResetToDefaultFilteredValue?: boolean;
  defaultSortOrder?: TableSortOrder;
  ellipsis?: boolean | { showTitle?: boolean };
  filterDropdown?: React.ReactNode | ((props: TableFilterDropdownProps<TRecord, TRowData>) => React.ReactNode);
  filtered?: boolean;
  filteredValue?: TableKey[];
  filterIcon?: React.ReactNode | ((filtered: boolean) => React.ReactNode);
  filterOnClose?: boolean;
  /** When true, `setSelectedKeys` commits the filter immediately without
   *  closing the dropdown — useful for custom `filterDropdown` UIs that
   *  want apply-on-click behavior. */
  filterOnChange?: boolean;
  filterMultiple?: boolean;
  filterMode?: 'menu' | 'tree';
  filterSearch?: boolean | ((input: string, record: TableFilterItem) => boolean);
  filters?: TableFilterItem[];
  filterDropdownProps?: TableDropdownProps;
  fixed?: TableFixed;
  key: string;
  render?: (value: TValue, record: TRecord, index: number, row: TableDataRow<TRecord, TRowData>) => React.ReactNode;
  responsive?: TableBreakpoint[];
  /** Reserved for future body row-header cells. Body cells currently render as td elements. */
  rowScope?: 'row' | 'rowgroup';
  /** Reserved for future memoized cell rendering. The current runtime does not invoke this callback. */
  shouldCellUpdate?: (record: TRecord, prevRecord: TRecord) => boolean;
  /** Reserved for future sorter tooltip UI. Sortable headers currently expose accessible buttons without tooltips. */
  showSorterTooltip?: TableProps<TRecord, TRowData>['showSorterTooltip'];
  sortDirections?: TableSortDirection[];
  sorter?:
    | boolean
    | ((a: TRecord, b: TRecord, sortOrder?: TableSortOrder | null) => number)
    | { compare?: (a: TRecord, b: TRecord, sortOrder?: TableSortOrder | null) => number; multiple?: number };
  sortOrder?: TableSortOrder | null;
  sortIcon?: (props: { sortOrder: TableSortOrder | null }) => React.ReactNode;
  title?: React.ReactNode | ((info: TableColumnTitleInfo<TRecord, TRowData>) => React.ReactNode);
  width?: string | number;
  minWidth?: number;
  hidden?: boolean;
  onCell?: (record: TRecord, rowIndex: number, row: TableDataRow<TRecord, TRowData>) => React.TdHTMLAttributes<HTMLTableCellElement>;
  onFilter?: (value: TableKey, record: TRecord) => boolean;
  onHeaderCell?: (column: TableColumn<TRecord, TRowData>) => React.ThHTMLAttributes<HTMLTableCellElement>;
  editable?: boolean | TableEditableColumnConfig<TRecord, TRowData>;
  draggable?: boolean;
  children?: TableColumn<TRecord, TRowData>[];
  meta?: Record<string, unknown>;
  /** Declarative row-data type. Routes the cell through the matching
   * `Table.RowData<Name>.tsx` renderer (see Table.RowData.tsx for the
   * shared contract). Combine with `render` to layer additional content. */
  type?: 'text' | 'number' | 'money' | 'date' | 'icon' | 'avatar' | 'link' | 'file' | 'actions' | (string & {});
  /** Named icon to render when `type === 'icon'`. */
  icon?: import('./Table.RowDataIcon').RowDataIconName;
}

export interface TableColumnGroup<TRecord, TRowData = unknown> {
  key: string;
  title: React.ReactNode;
  children: TableColumn<TRecord, TRowData>[];
}

export interface BoxSpacing {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface TableBlockBorder {
  style?: 'none' | 'solid' | 'dashed' | 'dotted';
  width?: number;
  color?: string;
  radius?: number;
}

export interface TableAppearance {
  borders?: 'grid' | 'rows' | 'none';
  stripedRows?: boolean;
  headerRow?: boolean;
  headerColumn?: boolean;
  headerFill?: string;
  borderColor?: string;
  cellAlignment?: TableAlign;
  textSize?: number;
  background?: string;
  position?: 'inline' | 'float';
  padding?: BoxSpacing;
  margin?: BoxSpacing;
  blockBorder?: TableBlockBorder;
}

export type TablePaginationPlacement = 'topStart' | 'topCenter' | 'topEnd' | 'bottomStart' | 'bottomCenter' | 'bottomEnd' | 'none';

export interface TablePaginationConfig {
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
  total?: number;
  placement?: TablePaginationPlacement[];
  showPrevNext?: boolean;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  disabled?: boolean;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

export interface TablePaginationState {
  current: number;
  pageSize: number;
  total: number;
}

export interface TableExpandable<TRecord, TRowData = unknown> {
  childrenColumnName?: string;
  columnTitle?: React.ReactNode;
  columnWidth?: string | number;
  defaultExpandAllRows?: boolean;
  defaultExpandedRowKeys?: TableKey[];
  expandedRowClassName?: string | ((record: TRecord, index: number, indent: number) => string);
  expandedRowKeys?: TableKey[];
  expandedRowRender?: (record: TRecord, index: number, indent: number, expanded: boolean, row: TableDataRow<TRecord, TRowData>) => React.ReactNode;
  expandIcon?: (props: TableExpandIconProps<TRecord, TRowData>) => React.ReactNode;
  expandRowByClick?: boolean;
  fixed?: boolean | 'left' | 'right';
  indentSize?: number;
  rowExpandable?: (record: TRecord, row: TableDataRow<TRecord, TRowData>) => boolean;
  showExpandColumn?: boolean;
  onExpand?: (expanded: boolean, record: TRecord, row: TableDataRow<TRecord, TRowData>) => void;
  onExpandedRowsChange?: (expandedRows: TableKey[]) => void;
}

export interface TableExpandIconProps<TRecord, TRowData = unknown> {
  expanded: boolean;
  record: TRecord;
  row: TableDataRow<TRecord, TRowData>;
  expandable: boolean;
  onExpand: (record: TRecord, event: React.MouseEvent) => void;
}

export interface TableSelectionAction {
  key: string;
  text: React.ReactNode;
  onSelect: (changeableRowKeys: TableKey[]) => void;
}

export type TableBulkActionsPlacement = 'left' | 'right';

export interface TableBulkActionsButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'ref'> {
  children?: React.ReactNode;
  /** Matches the Bonsai `components/Button` variant surface. Defaults to `secondary`. */
  variant?: 'primary' | 'secondary' | 'default' | 'ghost' | 'outline' | 'outline-primary' | 'outline-secondary' | 'danger' | 'outline-danger';
  size?: 'xs' | 'sm' | 'smd' | 'md' | 'lg';
}

export interface TableBulkActionsRenderContext<TRecord, TRowData = unknown> {
  selectedRowKeys: TableKey[];
  selectedRows: TRecord[];
  selectedDataRows: TableDataRow<TRecord, TRowData>[];
  actions: TableSelectionAction[];
  runAction: (action: TableSelectionAction) => void;
  clear: () => void;
  Button: React.FC<TableBulkActionsButtonProps>;
}

export interface TableBulkAction<TRecord, TRowData = unknown> {
  key: string;
  label: React.ReactNode;
  onClick: (ctx: { selectedRowKeys: TableKey[]; selectedRows: TRecord[]; selectedDataRows: TableDataRow<TRecord, TRowData>[]; clear: () => void }) => void;
  variant?: TableBulkActionsButtonProps['variant'];
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface TableBulkActionsConfig<TRecord, TRowData = unknown> {
  placement?: TableBulkActionsPlacement;
  showWhenEmpty?: boolean;
  /** Declarative shortcut — Table renders the default bar (count + buttons + clear). */
  actions?: TableBulkAction<TRecord, TRowData>[];
  /** Escape hatch for a fully custom bar. Ignored when `actions` is set. */
  render?: (ctx: TableBulkActionsRenderContext<TRecord, TRowData>) => React.ReactNode;
}

export interface TableRowSelection<TRecord, TRowData = unknown> {
  align?: TableAlign;
  checkStrictly?: boolean;
  columnTitle?: React.ReactNode | ((originalNode: React.ReactNode) => React.ReactNode);
  columnWidth?: string | number;
  fixed?: boolean | 'left' | 'right';
  getCheckboxProps?: (record: TRecord, row: TableDataRow<TRecord, TRowData>) => React.InputHTMLAttributes<HTMLInputElement>;
  getTitleCheckboxProps?: () => React.InputHTMLAttributes<HTMLInputElement>;
  hideSelectAll?: boolean;
  preserveSelectedRowKeys?: boolean;
  renderCell?: (checked: boolean, record: TRecord, index: number, originNode: React.ReactNode, row: TableDataRow<TRecord, TRowData>) => React.ReactNode;
  selectedRowKeys?: TableKey[];
  defaultSelectedRowKeys?: TableKey[];
  selections?: TableSelectionAction[] | boolean;
  type?: 'checkbox' | 'radio';
  onCell?: (record: TRecord, rowIndex: number, row: TableDataRow<TRecord, TRowData>) => React.TdHTMLAttributes<HTMLTableCellElement>;
  onChange?: (selectedRowKeys: TableKey[], selectedRows: TRecord[], info: { type: 'single' | 'multiple' | 'all' | 'invert' | 'none' }) => void;
  onSelect?: (record: TRecord, selected: boolean, selectedRows: TRecord[], nativeEvent: Event, row: TableDataRow<TRecord, TRowData>) => void;
  onSelectAll?: (selected: boolean, selectedRows: TRecord[], changeRows: TRecord[]) => void;
  onSelectInvert?: (selectedRowKeys: TableKey[]) => void;
  onSelectMultiple?: (selected: boolean, selectedRows: TRecord[], changeRows: TRecord[]) => void;
  onSelectNone?: () => void;
  bulkActions?: TableBulkActionsConfig<TRecord, TRowData>;
}

export interface TableScrollConfig {
  scrollToFirstRowOnChange?: boolean;
  x?: string | number | true | 'max-content';
  y?: string | number;
}

export interface TableVirtualConfig {
  rows?: boolean;
  columns?: boolean;
  estimateRowHeight?: number;
  estimateColumnWidth?: number;
  overscan?: number;
}

export interface TableStickyConfig {
  offsetHeader?: number;
  offsetScroll?: number;
  getContainer?: () => HTMLElement;
}

export interface TableSorterTooltipProps {
  /** Reserved for future sorter tooltip UI parity. */
  target?: 'full-header' | 'sorter-icon';
}

export type TableLoadingVariant = 'skeleton' | 'spinner';

export interface TableLoadingProps {
  spinning?: boolean;
  text?: React.ReactNode;
  /** Which loading affordance to render. Defaults to `'skeleton'`. */
  variant?: TableLoadingVariant;
}

export interface TableLocale {
  emptyText?: React.ReactNode;
  filterConfirm?: React.ReactNode;
  filterReset?: React.ReactNode;
  selectAll?: React.ReactNode;
}

/** Payload passed to `Table.onEdit` when a cell edit is committed. */
export interface RowDataEdit<TRecord, TRowData = unknown> {
  key: string;
  value: unknown;
  record: TRecord;
  row: TableDataRow<TRecord, TRowData>;
  column: TableColumn<TRecord, TRowData>;
  rowKey: string;
}

export interface TableEditableColumnConfig<TRecord, TRowData = unknown> {
  mode: 'cell' | 'row';
  validate?: (value: unknown, record: TRecord, row: TableDataRow<TRecord, TRowData>) => string | null;
  onSave?: (value: unknown, record: TRecord, row: TableDataRow<TRecord, TRowData>) => void | Promise<void>;
  renderEditor?: TableCellEditorRenderer<TRecord, TRowData>;
}

export interface TableEditableRowConfig<TRecord, TRowData = unknown> {
  mode: 'row';
  initialValues?: (record: TRecord, row: TableDataRow<TRecord, TRowData>) => Record<string, unknown>;
  onSave?: (values: Record<string, unknown>, record: TRecord, row: TableDataRow<TRecord, TRowData>) => void | Promise<void>;
  onCancel?: (record: TRecord, row: TableDataRow<TRecord, TRowData>) => void;
}

export interface TableEditableCellConfig<TRecord, TRowData = unknown> {
  validate?: (value: unknown, ctx: TableCellRenderContext<TRecord, TRowData>) => string | null;
  onSave?: (value: unknown, ctx: TableCellRenderContext<TRecord, TRowData>) => void | Promise<void>;
  renderEditor?: TableCellEditorRenderer<TRecord, TRowData>;
}

export interface TableEditableControlsConfig {
  headerColumns?: boolean;
  bodyRows?: boolean;
}

export interface TableAppendRowContext<TRecord, TRowData = unknown> {
  rows: TableDataRow<TRecord, TRowData>[];
  columns: TableColumn<TRecord, TRowData>[];
}

export interface TableAppendColumnContext<TRecord, TRowData = unknown> {
  columns: TableColumn<TRecord, TRowData>[];
  rows: TableDataRow<TRecord, TRowData>[];
}

/**
 * Structural extension of the table — append rows / columns on demand.
 *
 * - `extendable: true` — enables both row + column extension with sensible
 *   defaults: tab-in-last-cell appends a row, and small "+" controls appear
 *   below the last row and to the right of the last column.
 * - Object form allows narrowing to `rows` only, `columns` only, or wiring
 *   custom `onAppend` callbacks that own the new row/column shape. Setting a
 *   side to `false` disables that side entirely.
 */
export interface TableExtendableSide<TRecord, TRowData = unknown, TAppended = TableDataRow<TRecord, TRowData>> {
  onAppend?: (ctx: TableAppendRowContext<TRecord, TRowData>) => TAppended | void | Promise<TAppended | void>;
}

export interface TableExtendableConfig<TRecord, TRowData = unknown> {
  rows?: boolean | TableExtendableSide<TRecord, TRowData, TableDataRow<TRecord, TRowData>>;
  columns?: boolean | TableExtendableSide<TRecord, TRowData, TableColumn<TRecord, TRowData>>;
  /** Show the +/- affordance buttons (default true when the side is enabled). */
  controls?: boolean;
}

export interface TableEditableConfig<TRecord, TRowData = unknown> {
  headerColumns?: boolean;
  bodyRows?: boolean;
  appendRowOnTab?: boolean;
  controls?: boolean | TableEditableControlsConfig;
  onAppendRow?: (ctx: TableAppendRowContext<TRecord, TRowData>) => TableDataRow<TRecord, TRowData> | void | Promise<TableDataRow<TRecord, TRowData> | void>;
}

export interface TableChangeExtra<TRecord, TRowData = unknown> {
  currentDataSource: TRecord[];
  currentRows: TableDataRow<TRecord, TRowData>[];
  action: TableAction;
  table: TanStackTable<TableResolvedRow<TRecord, TRowData>>;
}

export interface TableRef {
  nativeElement: HTMLDivElement;
  scrollTo: (config: { index?: number; key?: TableKey; top?: number; offset?: number; align?: 'start' | 'center' | 'end' | 'nearest' }) => void;
}

export interface TableProps<TRecord, TRowData = unknown> {
  bordered?: boolean;
  theme?: 'auto' | 'light' | 'dark';
  className?: string;
  classNames?: Partial<Record<TableSemanticDOM, string>> | ((info: { props: TableProps<TRecord, TRowData> }) => Partial<Record<TableSemanticDOM, string>>);
  style?: React.CSSProperties;
  testIdPrefix?: string;
  styles?:
    | Partial<Record<TableSemanticDOM, React.CSSProperties>>
    | ((info: { props: TableProps<TRecord, TRowData> }) => Partial<Record<TableSemanticDOM, React.CSSProperties>>);
  column?: Partial<TableColumn<TRecord, TRowData>>;
  columns: TableColumn<TRecord, TRowData>[];
  row?: Partial<TableDataRow<TRecord, TRowData>>;
  rows?: TableDataRow<TRecord, TRowData>[];
  dataSource?: TRecord[];
  rowKey?: keyof TRecord | string | ((record: TRecord, index: number) => TableKey);
  components?: Partial<TableComponents<TRecord, TRowData>>;
  registry?: Partial<TableRegistry<TRecord, TRowData>>;
  /** Extra row-data types to make available via `column.type`. Merged over
   * the built-in set — a matching `type` overrides the default. */
  rowDataTypes?: import('./Table.RowData').RowDataType[];
  renderers?: Partial<TableRenderers<TRecord, TRowData>>;
  expandable?: TableExpandable<TRecord, TRowData>;
  footer?: (currentPageData: TRecord[], rows: TableDataRow<TRecord, TRowData>[]) => React.ReactNode;
  title?: (currentPageData: TRecord[], rows: TableDataRow<TRecord, TRowData>[]) => React.ReactNode;
  summary?: (currentData: TRecord[], rows: TableDataRow<TRecord, TRowData>[]) => React.ReactNode;
  /** Reserved for future portaled overlay support. Built-in filter UI currently renders inline. */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  loading?: boolean | TableLoadingVariant | TableLoadingProps;
  locale?: TableLocale;
  pagination?: TablePaginationConfig | false;
  rowClassName?: string | ((record: TRecord, index: number, row: TableDataRow<TRecord, TRowData>) => string);
  rowSelection?: TableRowSelection<TRecord, TRowData>;
  rowHoverable?: boolean;
  scroll?: TableScrollConfig;
  showHeader?: boolean;
  /** Ref forwarded to the inner `<table>` element. Useful for consumers
   *  who need external content slotted directly under the table (e.g. a
   *  ProseMirror contentDOM `<tbody>`). */
  tableRef?: React.Ref<HTMLTableElement>;
  /** Optional content rendered directly inside `<table>` before the
   *  header / body sections. Typical use: a `<colgroup>` supplying column
   *  widths for fixed layouts. */
  beforeTableContent?: React.ReactNode;
  /** Reserved for future sorter tooltip UI. Sortable headers currently expose accessible buttons without tooltips. */
  showSorterTooltip?: boolean | TableSorterTooltipProps;
  size?: TableSize;
  sortDirections?: TableSortDirection[];
  sticky?: boolean | TableStickyConfig;
  tableLayout?: TableLayout;
  virtual?: boolean | TableVirtualConfig;
  appearance?: TableAppearance;
  editable?: boolean | TableEditableConfig<TRecord, TRowData>;
  /** Enable row / column extension. `true` turns on both sides with defaults;
   * pass an object to configure per side. Row extension also drives the
   * "append on Tab in last cell" behavior when `editable` is enabled. */
  extendable?: boolean | TableExtendableConfig<TRecord, TRowData>;
  /** Fires whenever any editable cell is committed. Consumers who don't wire
   * `column.editable.onSave` still see the change visibly (Table persists it
   * internally); use this hook to sync to their own state / API. */
  onEdit?: (commit: RowDataEdit<TRecord, TRowData>) => void;
  state?: TableState;
  defaultState?: TableState;
  onChange?: (
    pagination: TablePaginationState,
    filters: Record<string, TableKey[] | null>,
    sorter: TableSorterResult<TRecord> | TableSorterResult<TRecord>[],
    extra: TableChangeExtra<TRecord, TRowData>,
  ) => void;
  onStateChange?: (state: TableState) => void;
  onHeaderRow?: (columns: TableColumn<TRecord, TRowData>[], index: number) => React.HTMLAttributes<HTMLTableRowElement>;
  onRow?: (record: TRecord, index: number, row: TableDataRow<TRecord, TRowData>) => React.HTMLAttributes<HTMLTableRowElement>;
  onRowOrderChange?: (keys: TableKey[], rows: TableDataRow<TRecord, TRowData>[], records: TRecord[]) => void;
  onColumnOrderChange?: (columnOrder: string[]) => void;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}

export interface TableHeaderCellRenderContext<TRecord, TRowData = unknown> {
  column: TableColumn<TRecord, TRowData>;
  columnIndex: number;
  registry: TableRegistry<TRecord, TRowData>;
}

export interface TableRowRenderContext<TRecord, TRowData = unknown> {
  record: TRecord;
  row: TableDataRow<TRecord, TRowData>;
  rowIndex: number;
  registry: TableRegistry<TRecord, TRowData>;
}

export type TableCellRenderer<TRecord, TRowData = unknown> = (ctx: TableCellRenderContext<TRecord, TRowData>) => React.ReactNode;
export type TableHeaderCellRenderer<TRecord, TRowData = unknown> = (ctx: TableHeaderCellRenderContext<TRecord, TRowData>) => React.ReactNode;
export type TableRowRenderer<TRecord, TRowData = unknown> = (ctx: TableRowRenderContext<TRecord, TRowData>) => React.ReactNode;
export type TableEmptyRenderer = (props: TableEmptyProps) => React.ReactNode;
export type TableLoadingRenderer = (props: TableLoadingProps) => React.ReactNode;
export interface TableCellEditorRenderContext<TRecord, TRowData = unknown> extends TableCellRenderContext<TRecord, TRowData> {
  value: unknown;
  error: string | null;
  mode: 'cell' | 'row';
  autoFocus: boolean;
  onChange: (value: unknown) => void;
  onSave: (value?: unknown) => void | Promise<void>;
  onCancel: () => void;
  onNavigate: (direction: -1 | 1, value?: unknown) => boolean;
}
export type TableCellEditorRenderer<TRecord, TRowData = unknown> = (ctx: TableCellEditorRenderContext<TRecord, TRowData>) => React.ReactNode;
export type TableFieldEditors<TRecord, TRowData = unknown> = Record<string, TableCellEditorRenderer<TRecord, TRowData>>;

export interface TableRenderers<TRecord, TRowData = unknown> {
  cell: TableCellRenderer<TRecord, TRowData>;
  headerCell: TableHeaderCellRenderer<TRecord, TRowData>;
  row: TableRowRenderer<TRecord, TRowData>;
  empty: TableEmptyRenderer;
  loading: TableLoadingRenderer;
}

export interface TableBaseComponentProps<TRecord, TRowData = unknown> {
  table: TanStackTable<TableResolvedRow<TRecord, TRowData>>;
  props: TableProps<TRecord, TRowData>;
  registry: TableRegistry<TRecord, TRowData>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export type TableRootProps<TRecord, TRowData = unknown> = TableBaseComponentProps<TRecord, TRowData> &
  React.HTMLAttributes<HTMLDivElement> &
  React.RefAttributes<HTMLDivElement>;
export type TableTitleProps<TRecord, TRowData = unknown> = TableBaseComponentProps<TRecord, TRowData> & React.HTMLAttributes<HTMLDivElement>;
export type TableContentProps<TRecord, TRowData = unknown> = TableBaseComponentProps<TRecord, TRowData> & React.HTMLAttributes<HTMLDivElement>;
export type TableSectionProps<TRecord, TRowData = unknown> = TableBaseComponentProps<TRecord, TRowData> & React.HTMLAttributes<HTMLDivElement>;
export type TableHeaderWrapperProps<TRecord, TRowData = unknown> = TableBaseComponentProps<TRecord, TRowData> & React.HTMLAttributes<HTMLTableSectionElement>;
export type TableHeaderRowProps<TRecord, TRowData = unknown> = TableBaseComponentProps<TRecord, TRowData> & React.HTMLAttributes<HTMLTableRowElement>;
export type TableBodyWrapperProps<TRecord, TRowData = unknown> = TableBaseComponentProps<TRecord, TRowData> & React.HTMLAttributes<HTMLTableSectionElement>;
export type TableFooterProps<TRecord, TRowData = unknown> = TableBaseComponentProps<TRecord, TRowData> & React.HTMLAttributes<HTMLDivElement>;
export type TableSummaryProps<TRecord, TRowData = unknown> = TableBaseComponentProps<TRecord, TRowData> & React.HTMLAttributes<HTMLTableSectionElement>;
export type TablePaginationRootProps<TRecord, TRowData = unknown> = TableBaseComponentProps<TRecord, TRowData> & React.HTMLAttributes<HTMLElement>;

export interface TableHeaderCellProps<TRecord, TRowData = unknown>
  extends TableBaseComponentProps<TRecord, TRowData>, React.ThHTMLAttributes<HTMLTableCellElement> {
  column: TableColumn<TRecord, TRowData>;
  columnIndex: number;
}

export interface TableBodyRowProps<TRecord, TRowData = unknown> extends TableBaseComponentProps<TRecord, TRowData>, React.HTMLAttributes<HTMLTableRowElement> {
  record: TRecord;
  row: TableDataRow<TRecord, TRowData>;
  rowIndex: number;
}

export interface TableBodyCellProps<TRecord, TRowData = unknown>
  extends TableBaseComponentProps<TRecord, TRowData>, React.TdHTMLAttributes<HTMLTableCellElement> {
  record: TRecord;
  row: TableDataRow<TRecord, TRowData>;
  column: TableColumn<TRecord, TRowData>;
  rowIndex: number;
  columnIndex: number;
  value: unknown;
}

export interface TablePaginationItemProps {
  page?: number;
  label?: React.ReactNode;
  kind?: 'page' | 'prev' | 'next';
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  testId?: string;
}

export interface TableSelectionCellProps<TRecord, TRowData = unknown> extends TableBodyCellProps<TRecord, TRowData> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export interface TableExpandCellProps<TRecord, TRowData = unknown> extends TableBodyCellProps<TRecord, TRowData> {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

export interface TableEmptyProps {
  children?: React.ReactNode;
}

export interface TableComponents<TRecord, TRowData = unknown> {
  Root: React.ComponentType<TableRootProps<TRecord, TRowData>>;
  Title: React.ComponentType<TableTitleProps<TRecord, TRowData>>;
  Content: React.ComponentType<TableContentProps<TRecord, TRowData>>;
  Section: React.ComponentType<TableSectionProps<TRecord, TRowData>>;
  HeaderWrapper: React.ComponentType<TableHeaderWrapperProps<TRecord, TRowData>>;
  HeaderRow: React.ComponentType<TableHeaderRowProps<TRecord, TRowData>>;
  HeaderCell: React.ComponentType<TableHeaderCellProps<TRecord, TRowData>>;
  BodyWrapper: React.ComponentType<TableBodyWrapperProps<TRecord, TRowData>>;
  BodyRow: React.ComponentType<TableBodyRowProps<TRecord, TRowData>>;
  BodyCell: React.ComponentType<TableBodyCellProps<TRecord, TRowData>>;
  Footer: React.ComponentType<TableFooterProps<TRecord, TRowData>>;
  Summary: React.ComponentType<TableSummaryProps<TRecord, TRowData>>;
  PaginationRoot: React.ComponentType<TablePaginationRootProps<TRecord, TRowData>>;
  PaginationItem: React.ComponentType<TablePaginationItemProps>;
  SelectionCell: React.ComponentType<TableSelectionCellProps<TRecord, TRowData>>;
  ExpandCell: React.ComponentType<TableExpandCellProps<TRecord, TRowData>>;
  Empty: React.ComponentType<TableEmptyProps>;
  Loading: React.ComponentType<TableLoadingProps>;
}

export interface TableTemplates<TRecord, TRowData = unknown> {
  Root: React.ComponentType<TableRootProps<TRecord, TRowData>>;
  Content: React.ComponentType<TableContentProps<TRecord, TRowData>>;
  Header: React.ComponentType<TableHeaderWrapperProps<TRecord, TRowData>>;
  Body: React.ComponentType<TableBodyWrapperProps<TRecord, TRowData>>;
  Footer: React.ComponentType<TableFooterProps<TRecord, TRowData>>;
  Pagination: React.ComponentType<TablePaginationRootProps<TRecord, TRowData>>;
}

export type TableFields<TRecord, TRowData = unknown> = Record<string, TableCellRenderer<TRecord, TRowData>>;

export interface TableRegistry<TRecord, TRowData = unknown> {
  components: TableComponents<TRecord, TRowData>;
  renderers: TableRenderers<TRecord, TRowData>;
  templates: TableTemplates<TRecord, TRowData>;
  fields: TableFields<TRecord, TRowData>;
  editors: TableFieldEditors<TRecord, TRowData>;
}
