import * as React from 'react';
import { Pagination as PaginationControl } from '../../Pagination';
import { useTable } from '../hooks/useTable';
import type { TablePaginationPlacement, TablePaginationState } from '../Table.types';

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
  const { testIdPrefix } = useTable();
  const testIdSegment = testIdSuffix ? `-${testIdSuffix}` : '';
  const sizeOptions = pageSizeOptions ?? [10, 20, 50, 100];

  return (
    <PaginationControl
      current={state.current}
      total={state.total}
      pageSize={state.pageSize}
      disabled={disabled}
      showPrevNext={showPrevNext}
      showSizeChanger={showSizeChanger}
      pageSizeOptions={sizeOptions}
      onChange={(page) => onGoToPage(page)}
      onShowSizeChange={(_, pageSize) => onPageSizeChange(pageSize)}
      className={className}
      style={style as React.CSSProperties}
      data-placement={placement}
      testIdPrefix={`${testIdPrefix}${testIdSegment}`}
      data-testid={`${testIdPrefix}-pagination-root${testIdSegment}`}
    />
  );
}
