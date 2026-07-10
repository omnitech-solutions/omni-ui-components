import * as React from 'react';
import classNames from 'classnames';
import type { SortingState } from '@tanstack/react-table';
import { useTable } from '../hooks/useTable';
import {
  alignStyle,
  componentTitle,
  DefaultSortIcon,
  ellipsisCellClass,
  headerCellClass,
  isEllipsisEnabled,
  nextSortOrder,
  shouldShowEllipsisTitle,
  SortableHeaderCell,
  sortDescFromOrder,
  sorterPriority,
  sortOrderFromTanStack,
} from '../internal';
import type { TableColumn, TableKey } from '../Table.types';
import { FilterControl } from './FilterControl';

export interface HeaderCellProps<TRecord, TRowData> {
  col: TableColumn<TRecord, TRowData>;
  columnIndex: number;
  extraProps?: React.ThHTMLAttributes<HTMLTableCellElement>;
  committedFilterKeys: (col: TableColumn<TRecord, TRowData>) => TableKey[];
  initialFilterItemsMap: Record<string, import('../Table.types').TableFilterItem[]>;
  onCommitFilter: (col: TableColumn<TRecord, TRowData>, values: TableKey[]) => void;
}

export function HeaderCell<TRecord, TRowData>({
  col,
  columnIndex,
  extraProps = {},
  committedFilterKeys,
  initialFilterItemsMap,
  onCommitFilter,
}: HeaderCellProps<TRecord, TRowData>) {
  const {
    table,
    props,
    registry,
    testIdPrefix,
    classMap,
    styleMap,
    sorting,
    columnSizing,
    columnPinning,
    tableSortDirections,
    applySortingChange,
    moveColumnByKeyboard,
    mergedLeafColumns,
  } = useTable<TRecord, TRowData>();

  const canSort = Boolean(col.sorter);
  const currentSort = sorting.find((item) => item.id === col.key);
  const order = sortOrderFromTanStack(currentSort?.desc);
  const sortDirections = col.sortDirections ?? tableSortDirections;

  const triggerSort = () => {
    const nextOrder = nextSortOrder(order, sortDirections);
    const nextDesc = sortDescFromOrder(nextOrder);
    const priority = sorterPriority(col);
    const firstSortColumn = sorting[0] ? mergedLeafColumns.find((item) => item.key === sorting[0].id) : undefined;
    const firstSortPriority = sorterPriority(firstSortColumn);
    let next: SortingState;
    if (nextDesc == null) {
      next = priority === false ? [] : sorting.filter((item) => item.id !== col.key);
    } else if (priority === false || !sorting.length || firstSortPriority === false) {
      next = [{ id: col.key, desc: nextDesc }];
    } else {
      next = [...sorting.filter((item) => item.id !== col.key), { id: col.key, desc: nextDesc }].sort((a, b) => {
        const left = sorterPriority(mergedLeafColumns.find((item) => item.key === a.id));
        const right = sorterPriority(mergedLeafColumns.find((item) => item.key === b.id));
        if (typeof left === 'number' && typeof right === 'number' && left !== right) return right - left;
        return 0;
      });
    }
    applySortingChange(next, col, nextOrder);
  };

  const headerProps = col.onHeaderCell?.(col) ?? {};
  const { className: headerClassName, style: headerStyle, colSpan: headerColSpan, rowSpan: headerRowSpan, ...restHeaderProps } = headerProps;
  const { style: extraStyle, colSpan: extraColSpan, rowSpan: extraRowSpan, ...restExtraProps } = extraProps;
  const resolvedColSpan = extraColSpan ?? headerColSpan ?? col.colSpan;
  const resolvedRowSpan = extraRowSpan ?? headerRowSpan;
  if (resolvedColSpan === 0 || resolvedRowSpan === 0) return null;

  const width = columnSizing[col.key] ?? col.width;
  const isPinned = columnPinning.left?.includes(col.key) || columnPinning.right?.includes(col.key) || col.fixed;
  const pinnedSide = columnPinning.left?.includes(col.key) || col.fixed === 'left' || col.fixed === 'start' || col.fixed === true ? 'left' : 'right';

  const headerTitle = typeof col.title === 'function' ? col.title({ column: col, sortColumns: [], filters: {} }) : col.title;
  const headerTitleAttribute = isEllipsisEnabled(col) && shouldShowEllipsisTitle(col) ? componentTitle(headerTitle) : undefined;

  const titleContent = canSort ? (
    <button
      type="button"
      className="bui-table-sort-trigger"
      aria-label={`Sort ${typeof col.title === 'string' ? col.title : col.key}`}
      aria-sort={order === 'ascend' ? 'ascending' : order === 'descend' ? 'descending' : undefined}
      onClick={triggerSort}
    >
      {headerTitle}
      <span aria-hidden="true">{col.sortIcon ? col.sortIcon({ sortOrder: order }) : <DefaultSortIcon order={order} />}</span>
    </button>
  ) : (
    headerTitle
  );

  const hasFilter = Boolean(col.filters?.length || col.filterDropdown || col.filterIcon);
  const filterEl = hasFilter ? (
    <FilterControl
      column={col}
      committedKeys={committedFilterKeys(col)}
      filtered={Boolean(committedFilterKeys(col).length || col.filtered)}
      initialFilterItems={initialFilterItemsMap[String(col.key)] ?? col.filters ?? []}
      onCommit={onCommitFilter}
    />
  ) : null;

  const cellClass = classNames(
    headerCellClass,
    isEllipsisEnabled(col) && ellipsisCellClass,
    isPinned && 'sticky z-[2]',
    classMap['header.cell'],
    col.className,
    headerClassName,
  );
  const cellStyle: React.CSSProperties = {
    ...alignStyle(col.align),
    width,
    minWidth: col.minWidth,
    ...(isPinned ? { position: 'sticky', [pinnedSide]: 0 } : {}),
    ...styleMap['header.cell'],
    ...headerStyle,
    ...extraStyle,
  };
  const dataAttrs = {
    'data-testid': `${testIdPrefix}-header-cell-${col.key}`,
    'data-column-key': col.key,
    'data-pinned': isPinned ? pinnedSide : undefined,
    'data-ellipsis': isEllipsisEnabled(col) ? 'true' : undefined,
  };
  const commonProps = {
    title: headerTitleAttribute,
    colSpan: resolvedColSpan,
    rowSpan: resolvedRowSpan,
    'aria-sort': (canSort && order ? (order === 'ascend' ? 'ascending' : 'descending') : undefined) as React.AriaAttributes['aria-sort'],
  };

  if (col.draggable) {
    return (
      <SortableHeaderCell
        {...restHeaderProps}
        {...restExtraProps}
        {...dataAttrs}
        {...commonProps}
        columnKey={col.key}
        testIdPrefix={testIdPrefix}
        onKeyboardMove={moveColumnByKeyboard}
        className={cellClass}
        style={cellStyle}
      >
        {titleContent}
        {filterEl}
      </SortableHeaderCell>
    );
  }

  const { HeaderCell: HC } = registry.components;
  return (
    <HC
      table={table}
      props={props}
      registry={registry}
      column={col}
      columnIndex={columnIndex}
      className={cellClass}
      style={cellStyle}
      {...dataAttrs}
      {...commonProps}
      {...restHeaderProps}
      {...restExtraProps}
    >
      {titleContent}
      {filterEl}
    </HC>
  );
}
