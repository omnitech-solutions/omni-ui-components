import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useTable } from '../hooks/useTable';
import type { TablePaginationPlacement, TablePaginationState } from '../Table.types';

type PageEntry = number | 'ellipsis';

function buildPageWindow(current: number, pageCount: number): PageEntry[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const entries: PageEntry[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(pageCount - 1, current + 1);
  if (start > 2) entries.push('ellipsis');
  for (let page = start; page <= end; page += 1) entries.push(page);
  if (end < pageCount - 1) entries.push('ellipsis');
  entries.push(pageCount);
  return entries;
}

export interface PaginationProps {
  placement: TablePaginationPlacement;
  state: TablePaginationState;
  pageCount: number;
  disabled: boolean;
  showPrevNext: boolean;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  onGoToPage: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
  style?: React.CSSProperties;
  testIdSuffix?: string;
}

export function Pagination({
  placement,
  state,
  pageCount,
  disabled,
  showPrevNext,
  showSizeChanger,
  pageSizeOptions,
  onGoToPage,
  onPageSizeChange,
  className,
  style,
  testIdSuffix = '',
}: PaginationProps) {
  const { table, props, registry, testIdPrefix } = useTable();
  const testIdSegment = testIdSuffix ? `-${testIdSuffix}` : '';
  const { PaginationRoot, PaginationItem } = registry.components;
  const sizeOptions = pageSizeOptions ?? [10, 20, 50, 100];
  const prevDisabled = disabled || state.current <= 1;
  const nextDisabled = disabled || state.current >= pageCount;

  return (
    <PaginationRoot
      table={table}
      props={props}
      registry={registry}
      className={className}
      style={style}
      data-testid={`${testIdPrefix}-pagination-root${testIdSegment}`}
      data-placement={placement}
    >
      <span className="bui-table-pagination-pages" data-testid={`${testIdPrefix}-pagination-pages${testIdSegment}`}>
        {showPrevNext && (
          <PaginationItem
            kind="prev"
            selected={false}
            disabled={prevDisabled}
            label="‹"
            testId={`${testIdPrefix}-pagination-prev${testIdSegment}`}
            onClick={() => onGoToPage(state.current - 1)}
          />
        )}
        {buildPageWindow(state.current, pageCount).map((entry, index) =>
          entry === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="bui-table-pagination-ellipsis"
              data-testid={`${testIdPrefix}-pagination-ellipsis${testIdSegment}-${index}`}
            >
              …
            </span>
          ) : (
            <PaginationItem
              key={entry}
              page={entry}
              selected={state.current === entry}
              disabled={disabled}
              testId={`${testIdPrefix}-pagination-item${testIdSegment}-${entry}`}
              onClick={() => onGoToPage(entry)}
            />
          ),
        )}
        {showPrevNext && (
          <PaginationItem
            kind="next"
            selected={false}
            disabled={nextDisabled}
            label="›"
            testId={`${testIdPrefix}-pagination-next${testIdSegment}`}
            onClick={() => onGoToPage(state.current + 1)}
          />
        )}
      </span>
      {showSizeChanger && (
        <span className="bui-table-pagination-size" data-testid={`${testIdPrefix}-pagination-size${testIdSegment}`}>
          <Select value={String(state.pageSize)} disabled={disabled} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger aria-label="Rows per page" className="bui-table-pagination-size-trigger" data-testid={`${testIdPrefix}-pagination-size-changer`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bui-table-pagination-size-content">
              {sizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </span>
      )}
    </PaginationRoot>
  );
}
