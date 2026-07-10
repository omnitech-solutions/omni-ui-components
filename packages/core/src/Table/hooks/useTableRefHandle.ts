import * as React from 'react';
import type { Row } from '@tanstack/react-table';
import type { Virtualizer } from '@tanstack/react-virtual';
import type { TableRef, TableResolvedRow } from '../Table.types';

export interface UseTableRefHandleInput<TRecord, TRowData> {
  ref: React.Ref<TableRef>;
  rootRef: React.RefObject<HTMLDivElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  visibleRows: Row<TableResolvedRow<TRecord, TRowData>>[];
  enableVirtualRows: boolean;
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
}

export function useTableRefHandle<TRecord, TRowData>({
  ref,
  rootRef,
  scrollRef,
  visibleRows,
  enableVirtualRows,
  rowVirtualizer,
}: UseTableRefHandleInput<TRecord, TRowData>) {
  React.useImperativeHandle(
    ref,
    () => ({
      nativeElement: rootRef.current as HTMLDivElement,
      scrollTo: ({ index, key, top, offset = 0, align = 'nearest' }) => {
        if (typeof top === 'number') {
          if (scrollRef.current?.scrollTo) scrollRef.current.scrollTo({ top });
          else if (scrollRef.current) scrollRef.current.scrollTop = top;
          return;
        }
        const rowIndex = typeof index === 'number' ? index : key == null ? -1 : visibleRows.findIndex((item) => item.original.key === key);
        if (rowIndex < 0) return;
        if (enableVirtualRows) {
          rowVirtualizer.scrollToIndex(rowIndex, { align: align === 'nearest' ? 'auto' : align });
          return;
        }
        const rowEl = rootRef.current?.querySelector<HTMLElement>(`[data-row-key="${String(visibleRows[rowIndex].original.key)}"]`);
        if (rowEl && scrollRef.current) scrollRef.current.scrollTop = rowEl.offsetTop - offset;
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enableVirtualRows, rowVirtualizer, visibleRows],
  );
}
