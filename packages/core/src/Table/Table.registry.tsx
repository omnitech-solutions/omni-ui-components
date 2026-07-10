import * as React from 'react';
import { Inbox } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

import type {
  TableBodyCellProps,
  TableBodyRowProps,
  TableBodyWrapperProps,
  TableComponents,
  TableContentProps,
  TableEmptyProps,
  TableFooterProps,
  TableHeaderCellProps,
  TableHeaderRowProps,
  TableHeaderWrapperProps,
  TableLoadingProps,
  TablePaginationItemProps,
  TablePaginationRootProps,
  TableSelectionCellProps,
  TableRegistry,
  TableRootProps,
  TableSectionProps,
  TableSummaryProps,
  TableTitleProps,
  TableExpandCellProps,
  TableCellRenderContext,
} from './Table.types';

type FieldValue = unknown;

const formatCurrency = (amount: number, currency: string, options: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);

const isRecord = (value: FieldValue): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const firstPresent = (...values: unknown[]): unknown => values.find((value) => value !== null && value !== undefined && value !== '');

const textFromValue = (value: FieldValue): string => {
  if (value === null || value === undefined) return '';
  if (React.isValidElement(value)) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== 'object') return String(value);
  return String(
    firstPresent(
      (value as Record<string, unknown>).text,
      (value as Record<string, unknown>).label,
      (value as Record<string, unknown>).name,
      (value as Record<string, unknown>).title,
      (value as Record<string, unknown>).value,
    ) ?? '',
  );
};

const valuePayload = <TRecord, TRowData>(ctx: TableCellRenderContext<TRecord, TRowData>): FieldValue => ctx.row.cells?.[ctx.column.key]?.value;

const numberCandidate = (value: FieldValue): unknown => {
  if (!isRecord(value)) return value;
  return firstPresent(value.amount, value.number, value.value, value.text);
};

const parseFiniteNumber = (value: FieldValue): number | null => {
  const candidate = numberCandidate(value);
  if (typeof candidate === 'number') return Number.isFinite(candidate) ? candidate : null;
  if (typeof candidate !== 'string') return null;
  const normalized = candidate.replace(/[^0-9+-.]/g, '');
  if (!normalized || normalized === '-' || normalized === '.' || normalized === '-.') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const renderOriginalValue = (value: FieldValue): React.ReactNode => {
  if (React.isValidElement(value)) return value;
  return textFromValue(value);
};

const parseDateValue = (value: unknown): Date | null => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  if (typeof value === 'string') {
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (dateOnly) {
      const [, year, month, day] = dateOnly;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const renderStringField = <TRecord, TRowData>(ctx: TableCellRenderContext<TRecord, TRowData>) => renderOriginalValue(valuePayload(ctx));

export const renderNumberField = <TRecord, TRowData>(ctx: TableCellRenderContext<TRecord, TRowData>) => {
  const value = valuePayload(ctx);
  const parsed = parseFiniteNumber(value);
  if (parsed === null) return renderOriginalValue(value);
  const options = isRecord(value) && isRecord(value.formatOptions) ? (value.formatOptions as Intl.NumberFormatOptions) : undefined;
  return new Intl.NumberFormat('en-US', options).format(parsed);
};

export const renderMoneyField = <TRecord, TRowData>(ctx: TableCellRenderContext<TRecord, TRowData>) => {
  const value = valuePayload(ctx);
  const parsed = parseFiniteNumber(value);
  if (parsed === null) return renderOriginalValue(value);
  const currency = isRecord(value) && typeof value.currency === 'string' ? value.currency : 'USD';
  return formatCurrency(parsed, currency, isRecord(value) && isRecord(value.formatOptions) ? value.formatOptions : {});
};

export const renderDateField = <TRecord, TRowData>(ctx: TableCellRenderContext<TRecord, TRowData>) => {
  const value = valuePayload(ctx);
  const candidate = isRecord(value) ? firstPresent(value.date, value.value, value.text) : value;
  const date = parseDateValue(candidate);
  if (!date) return renderOriginalValue(value);
  const options =
    isRecord(value) && isRecord(value.formatOptions)
      ? (value.formatOptions as Intl.DateTimeFormatOptions)
      : ({ month: 'short', day: 'numeric', year: 'numeric' } as Intl.DateTimeFormatOptions);
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const renderIconField = <TRecord, TRowData>(ctx: TableCellRenderContext<TRecord, TRowData>) => {
  const value = valuePayload(ctx);
  if (React.isValidElement(value)) return value;
  const icon = isRecord(value) ? firstPresent(value.icon, value.symbol, value.text, value.label) : value;
  const label = isRecord(value) ? textFromValue(value) : '';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true">{icon == null ? null : String(icon)}</span>
      {label && label !== String(icon ?? '') && <span>{label}</span>}
    </span>
  );
};

export const renderAvatarField = <TRecord, TRowData>(ctx: TableCellRenderContext<TRecord, TRowData>) => {
  const value = valuePayload(ctx);
  const data = isRecord(value) ? value : { name: textFromValue(value) };
  const url = firstPresent(data.url, data.src, data.avatarUrl, data.avatar_url);
  const label = textFromValue(data);
  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <span className="inline-flex items-center gap-2">
      <Avatar className="h-6 w-6 shrink-0">
        {typeof url === 'string' ? <AvatarImage src={url} alt={label} /> : null}
        <AvatarFallback className="text-[10px]">{initials || '?'}</AvatarFallback>
      </Avatar>
      {label && <span>{label}</span>}
    </span>
  );
};

export const renderLinkField = <TRecord, TRowData>(ctx: TableCellRenderContext<TRecord, TRowData>) => {
  const value = valuePayload(ctx);
  const data = isRecord(value) ? value : { label: textFromValue(value) };
  const href = firstPresent(data.href, data.url);
  const label = textFromValue(data) || (typeof href === 'string' ? href : '');
  if (typeof href !== 'string' || href.trim() === '') return label;
  return (
    <a href={href} target={data.target === '_blank' ? '_blank' : undefined} rel={data.target === '_blank' ? 'noreferrer' : undefined}>
      {label}
    </a>
  );
};

export const renderFileField = <TRecord, TRowData>(ctx: TableCellRenderContext<TRecord, TRowData>) => {
  const value = valuePayload(ctx);
  const data = isRecord(value) ? value : { name: textFromValue(value) };
  const href = firstPresent(data.href, data.url, data.downloadUrl, data.download_url);
  const label = textFromValue(data) || 'File';
  if (typeof href !== 'string' || href.trim() === '') return label;
  return <a href={href}>{label}</a>;
};

export const renderActionsField = <TRecord, TRowData>(ctx: TableCellRenderContext<TRecord, TRowData>) => {
  const value = valuePayload(ctx);
  if (Array.isArray(value)) {
    return (
      <span className="inline-flex items-center gap-2">
        {value.map((action, index) => {
          if (React.isValidElement(action)) return React.cloneElement(action, { key: action.key ?? index } as React.Attributes);
          const data = isRecord(action) ? action : { label: String(action) };
          return (
            <button
              key={String(firstPresent(data.key, data.id, index))}
              type="button"
              onClick={typeof data.onClick === 'function' ? (data.onClick as React.MouseEventHandler<HTMLButtonElement>) : undefined}
            >
              {textFromValue(data)}
            </button>
          );
        })}
      </span>
    );
  }
  if (React.isValidElement(value)) return value;
  return renderOriginalValue(value);
};

const RootBase = React.forwardRef<HTMLDivElement, TableRootProps<unknown, unknown>>(
  ({ children, className, style, table: _table, props: _props, registry: _registry, ...rest }, ref) => (
    <div ref={ref} data-bui-table-root className={className} style={style} {...rest}>
      {children}
    </div>
  ),
);
RootBase.displayName = 'TableRoot';
const Root = RootBase as <TRecord, TRowData = unknown>(props: TableRootProps<TRecord, TRowData>) => React.ReactElement;

const Title = <TRecord, TRowData = unknown>({
  children,
  className,
  style,
  table: _table,
  props: _props,
  registry: _registry,
  ...rest
}: TableTitleProps<TRecord, TRowData>) => (
  <div className={className} style={style} {...rest}>
    {children}
  </div>
);

const Content = <TRecord, TRowData = unknown>({
  children,
  className,
  style,
  table: _table,
  props: _props,
  registry: _registry,
  ...rest
}: TableContentProps<TRecord, TRowData>) => (
  <div className={className} style={style} {...rest}>
    {children}
  </div>
);

const Section = <TRecord, TRowData = unknown>({
  children,
  className,
  style,
  table: _table,
  props: _props,
  registry: _registry,
  ...rest
}: TableSectionProps<TRecord, TRowData>) => (
  <div className={className} style={style} {...rest}>
    {children}
  </div>
);

const HeaderWrapper = <TRecord, TRowData = unknown>({
  children,
  className,
  style,
  table: _table,
  props: _props,
  registry: _registry,
  ...rest
}: TableHeaderWrapperProps<TRecord, TRowData>) => (
  <thead className={className} style={style} {...rest}>
    {children}
  </thead>
);

const HeaderRow = <TRecord, TRowData = unknown>({
  children,
  className,
  style,
  table: _table,
  props: _props,
  registry: _registry,
  ...rest
}: TableHeaderRowProps<TRecord, TRowData>) => (
  <tr className={className} style={style} {...rest}>
    {children}
  </tr>
);

const HeaderCell = <TRecord, TRowData = unknown>({
  children,
  className,
  style,
  table: _table,
  props: _props,
  registry: _registry,
  column: _column,
  columnIndex: _columnIndex,
  ...rest
}: TableHeaderCellProps<TRecord, TRowData>) => (
  <th className={className} style={style} scope="col" {...rest}>
    {children}
  </th>
);

const BodyWrapper = <TRecord, TRowData = unknown>({
  children,
  className,
  style,
  table: _table,
  props: _props,
  registry: _registry,
  ...rest
}: TableBodyWrapperProps<TRecord, TRowData>) => (
  <tbody className={className} style={style} {...rest}>
    {children}
  </tbody>
);

const BodyRow = <TRecord, TRowData = unknown>({
  children,
  className,
  style,
  table: _table,
  props: _props,
  registry: _registry,
  record: _record,
  row: _row,
  rowIndex: _rowIndex,
  ...rest
}: TableBodyRowProps<TRecord, TRowData>) => (
  <tr className={className} style={style} {...rest}>
    {children}
  </tr>
);

const BodyCell = <TRecord, TRowData = unknown>({
  children,
  className,
  style,
  table: _table,
  props: _props,
  registry: _registry,
  record: _record,
  row: _row,
  column: _column,
  rowIndex: _rowIndex,
  columnIndex: _columnIndex,
  value: _value,
  ...rest
}: TableBodyCellProps<TRecord, TRowData>) => (
  <td className={className} style={style} {...rest}>
    {children}
  </td>
);

const Footer = <TRecord, TRowData = unknown>({
  children,
  className,
  style,
  table: _table,
  props: _props,
  registry: _registry,
  ...rest
}: TableFooterProps<TRecord, TRowData>) => (
  <div className={className} style={style} {...rest}>
    {children}
  </div>
);

const Summary = <TRecord, TRowData = unknown>({
  children,
  className,
  style,
  table: _table,
  props: _props,
  registry: _registry,
  ...rest
}: TableSummaryProps<TRecord, TRowData>) => (
  <tfoot className={className} style={style} {...rest}>
    {children}
  </tfoot>
);

const PaginationRoot = <TRecord, TRowData = unknown>({
  children,
  className,
  style,
  table: _table,
  props: _props,
  registry: _registry,
  ...rest
}: TablePaginationRootProps<TRecord, TRowData>) => (
  <nav className={['bui-table-pagination', className].filter(Boolean).join(' ')} style={style} {...rest}>
    {children}
  </nav>
);

const PaginationItem = ({ page, label, kind = 'page', selected, disabled, onClick, testId }: TablePaginationItemProps) => (
  <button
    type="button"
    className="bui-table-pagination-item"
    aria-current={selected ? 'page' : undefined}
    aria-label={kind === 'prev' ? 'Previous page' : kind === 'next' ? 'Next page' : undefined}
    disabled={disabled}
    onClick={onClick}
    data-kind={kind}
    data-testid={testId}
  >
    {label ?? page}
  </button>
);

const SelectionCell = <TRecord, TRowData = unknown>({
  children,
  className,
  style,
  table: _table,
  props: _props,
  registry: _registry,
  record: _record,
  row: _row,
  column: _column,
  rowIndex: _rowIndex,
  columnIndex: _columnIndex,
  value: _value,
  checked: _checked,
  onCheckedChange: _onCheckedChange,
  ...rest
}: TableSelectionCellProps<TRecord, TRowData>) => (
  <td className={className} style={style} {...rest}>
    {children}
  </td>
);

const ExpandCell = <TRecord, TRowData = unknown>({
  children,
  className,
  style,
  table: _table,
  props: _props,
  registry: _registry,
  record: _record,
  row: _row,
  column: _column,
  rowIndex: _rowIndex,
  columnIndex: _columnIndex,
  value: _value,
  expanded: _expanded,
  onExpandedChange: _onExpandedChange,
  ...rest
}: TableExpandCellProps<TRecord, TRowData>) => (
  <td className={className} style={style} {...rest}>
    {children}
  </td>
);

const Empty = ({ children }: TableEmptyProps) => (
  <div className="bui-table-empty-state" data-testid="bui-table-empty-state">
    <span className="bui-table-empty-state__icon" aria-hidden="true">
      <Inbox size={40} strokeWidth={1.6} />
    </span>
    <span className="bui-table-empty-state__label">{children ?? 'No data'}</span>
  </div>
);

const Loading = ({ text = 'Loading...' }: TableLoadingProps) => (
  <div className="bui-table-loading-state" role="status" aria-live="polite">
    <span className="bui-table-loading-pill">
      <span className="bui-table-loading-pill__spinner" aria-hidden="true" />
      <span className="bui-table-loading-pill__label">{text}</span>
    </span>
  </div>
);

export function getDefaultTableRegistry<TRecord, TRowData = unknown>(): TableRegistry<TRecord, TRowData> {
  const components: TableComponents<TRecord, TRowData> = {
    Root: Root as TableComponents<TRecord, TRowData>['Root'],
    Title,
    Content,
    Section,
    HeaderWrapper,
    HeaderRow,
    HeaderCell,
    BodyWrapper,
    BodyRow,
    BodyCell,
    Footer,
    Summary,
    PaginationRoot,
    PaginationItem,
    SelectionCell,
    ExpandCell,
    Empty,
    Loading,
  };

  return {
    components,
    templates: {
      Root,
      Content,
      Header: HeaderWrapper,
      Body: BodyWrapper,
      Footer,
      Pagination: PaginationRoot,
    },
    editors: {},
    fields: {
      string: renderStringField,
      text: renderStringField,
      date: renderDateField,
      icon: renderIconField,
      avatar: renderAvatarField,
      file: renderFileField,
      actions: renderActionsField,
      money: renderMoneyField,
      link: renderLinkField,
      number: renderNumberField,
    },
    renderers: {
      cell: ({ record, row, column, rowIndex }) => {
        const cell = row.cells?.[column.key];
        if (cell?.kind) return null;
        if (cell?.render)
          return cell.render(cell.value, { record, row, column, rowIndex, columnIndex: 0, registry: getDefaultTableRegistry<TRecord, TRowData>() });
        const value = cell?.value;
        if (column.render) return column.render(value, record, rowIndex, row);
        return value == null ? null : String(value);
      },
      headerCell: ({ column }) => (typeof column.title === 'function' ? column.title({ column, sortColumns: [], filters: {} }) : column.title),
      row: ({ row }) => (typeof row.title === 'function' ? null : row.title),
      empty: Empty,
      loading: (props) => <components.Loading {...props} />,
    },
  };
}

export function mergeTableRegistry<TRecord, TRowData = unknown>(
  base: TableRegistry<TRecord, TRowData>,
  override: Partial<TableRegistry<TRecord, TRowData>> = {},
): TableRegistry<TRecord, TRowData> {
  return {
    components: { ...base.components, ...override.components },
    templates: { ...base.templates, ...override.templates },
    editors: { ...base.editors, ...override.editors },
    fields: { ...base.fields, ...override.fields },
    renderers: { ...base.renderers, ...override.renderers },
  };
}
