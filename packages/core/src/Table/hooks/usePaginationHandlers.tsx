import * as React from 'react';
import type { PaginationState, Table as TanStackTable } from '@tanstack/react-table';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { filtersRecord } from '../internal';
import type { TablePaginationPlacement, TablePaginationState, TableProps, TableResolvedRow, TableSemanticDOM } from '../Table.types';
import { Pagination } from '../components/Pagination';

export interface UsePaginationHandlersInput<TRecord, TRowData> {
  pagination: TableProps<TRecord, TRowData>['pagination'];
  paginationStateValue: PaginationState;
  setPaginationStateValue: React.Dispatch<React.SetStateAction<PaginationState>>;
  table: TanStackTable<TableResolvedRow<TRecord, TRowData>>;
  paginationState: () => TablePaginationState;
  scrollToFirstRow: () => void;
  onChange: TableProps<TRecord, TRowData>['onChange'];
  columnFilters: ColumnFiltersState;
  dataSource: TRecord[];
  resolvedRows: TableResolvedRow<TRecord, TRowData>[];
  allResolvedRows: TableResolvedRow<TRecord, TRowData>[];
  emitStateChange: (partial: Partial<NonNullable<TableProps<TRecord, TRowData>['state']>>) => void;
  classMap: Partial<Record<TableSemanticDOM, string>>;
  styleMap: Partial<Record<TableSemanticDOM, React.CSSProperties>>;
}

export function usePaginationHandlers<TRecord, TRowData>({
  pagination,
  paginationStateValue: _paginationStateValue,
  setPaginationStateValue,
  table,
  paginationState,
  scrollToFirstRow,
  onChange,
  columnFilters,
  dataSource,
  resolvedRows,
  allResolvedRows,
  emitStateChange,
  classMap,
  styleMap,
}: UsePaginationHandlersInput<TRecord, TRowData>) {
  const paginationConfig = typeof pagination === 'object' ? pagination : {};
  const paginationDisabled = Boolean(paginationConfig.disabled);
  const paginationShowPrevNext = paginationConfig.showPrevNext !== false;

  const paginationEffectivelyOff =
    !pagination ||
    (typeof pagination === 'object' &&
      Array.isArray(pagination.placement) &&
      pagination.placement.length > 0 &&
      pagination.placement.every((p) => p === 'none'));

  React.useEffect(() => {
    if (paginationEffectivelyOff) {
      setPaginationStateValue((current) => ({ ...current, pageIndex: 0, pageSize: Math.max(allResolvedRows.length, 1) }));
    }
  }, [paginationEffectivelyOff, allResolvedRows.length, setPaginationStateValue]);

  const handleGoToPage = React.useCallback(
    (page: number) => {
      if (paginationDisabled) return;
      const currentState = paginationState();
      const pageCount = Math.max(Math.ceil(currentState.total / currentState.pageSize), 1);
      const index = Math.min(Math.max(page - 1, 0), pageCount - 1);
      table.setPageIndex(index);
      const next = { pageIndex: index, pageSize: currentState.pageSize };
      setPaginationStateValue(next);
      scrollToFirstRow();
      paginationConfig.onChange?.(index + 1, currentState.pageSize);
      onChange?.({ ...currentState, current: index + 1 }, filtersRecord(columnFilters), [], {
        currentDataSource: dataSource,
        currentRows: resolvedRows.map((r) => r.row),
        action: 'paginate',
        table,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnFilters, dataSource, onChange, paginationConfig, paginationDisabled, resolvedRows, setPaginationStateValue, table],
  );

  const handlePageSizeChange = React.useCallback(
    (pageSize: number) => {
      const next = { pageIndex: 0, pageSize };
      setPaginationStateValue(next);
      table.setPageSize(pageSize);
      scrollToFirstRow();
      paginationConfig.onShowSizeChange?.(1, pageSize);
      paginationConfig.onChange?.(1, pageSize);
      emitStateChange({ pagination: next });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [emitStateChange, paginationConfig, setPaginationStateValue, table],
  );

  const paginationPlacements = React.useMemo(() => {
    if (!pagination) return [];
    const configured = typeof pagination === 'object' ? (pagination.placement ?? ['bottomEnd']) : ['bottomEnd'];
    return configured.filter((placement) => placement !== 'none');
  }, [pagination]);

  const usePlacementSuffix = paginationPlacements.length > 1;
  const renderPagination = (placement: TablePaginationPlacement = 'bottomEnd', testIdSuffix = ''): React.ReactNode => {
    if (!pagination) return null;
    const state = paginationState();
    const pageCount = Math.max(Math.ceil(state.total / state.pageSize), 1);
    return (
      <Pagination
        placement={placement}
        state={state}
        pageCount={pageCount}
        disabled={paginationDisabled}
        showPrevNext={paginationShowPrevNext}
        showSizeChanger={paginationConfig.showSizeChanger}
        pageSizeOptions={paginationConfig.pageSizeOptions}
        onGoToPage={handleGoToPage}
        onPageSizeChange={handlePageSizeChange}
        className={classMap['pagination.root']}
        style={styleMap['pagination.root']}
        testIdSuffix={testIdSuffix}
      />
    );
  };
  const topPagination = paginationPlacements
    .filter((placement) => placement.startsWith('top'))
    .map((placement) => (
      <React.Fragment key={placement}>{renderPagination(placement as TablePaginationPlacement, usePlacementSuffix ? placement : '')}</React.Fragment>
    ));
  const bottomPagination = paginationPlacements
    .filter((placement) => placement.startsWith('bottom'))
    .map((placement) => (
      <React.Fragment key={placement}>{renderPagination(placement as TablePaginationPlacement, usePlacementSuffix ? placement : '')}</React.Fragment>
    ));

  return { paginationEffectivelyOff, topPagination, bottomPagination };
}
