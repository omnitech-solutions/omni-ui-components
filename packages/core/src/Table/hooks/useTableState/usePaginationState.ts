import * as React from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { resolvedRowsLengthHint } from '../../internal';
import type { TableProps } from '../../Table.types';

export function usePaginationState<TRecord, TRowData>(rawProps: TableProps<TRecord, TRowData>) {
  const { pagination } = rawProps;
  const initialPageSize =
    typeof pagination === 'object' && pagination
      ? (pagination.pageSize ?? pagination.defaultPageSize ?? resolvedRowsLengthHint(rawProps))
      : resolvedRowsLengthHint(rawProps);

  const [paginationStateValue, setPaginationStateValue] = React.useState<PaginationState>({
    pageIndex: typeof pagination === 'object' && pagination ? (pagination.current ?? pagination.defaultCurrent ?? 1) - 1 : 0,
    pageSize: Math.max(initialPageSize, 1),
  });

  React.useEffect(() => {
    if (typeof pagination === 'object' && pagination) {
      setPaginationStateValue((current) => ({
        pageIndex: pagination.current != null ? pagination.current - 1 : current.pageIndex,
        pageSize: pagination.pageSize ?? current.pageSize,
      }));
    }
  }, [pagination]);

  return { paginationStateValue, setPaginationStateValue };
}
