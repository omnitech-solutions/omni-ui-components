import * as React from 'react';
import classNames from 'classnames';
import { useTable } from '../hooks/useTable';
import { headerCellClass } from '../internal';
import type { TableProps } from '../Table.types';

export interface ExpandHeaderProps<TRecord, TRowData> {
  expandable: NonNullable<TableProps<TRecord, TRowData>['expandable']>;
  className?: string;
}

export function ExpandHeader<TRecord, TRowData>({ expandable, className }: ExpandHeaderProps<TRecord, TRowData>) {
  const { testIdPrefix } = useTable<TRecord, TRowData>();
  const fixedSide = (expandable.fixed === true ? 'left' : expandable.fixed) as 'left' | 'right' | undefined;
  const style: React.CSSProperties = {
    width: expandable.columnWidth ?? 'var(--bui-table-selection-column-width)',
    ...(fixedSide ? { position: 'sticky', [fixedSide]: 0 } : {}),
  };
  return (
    <th
      className={classNames(headerCellClass, fixedSide && 'sticky z-[2]', className)}
      style={style}
      data-testid={`${testIdPrefix}-expand-header-cell`}
      data-pinned={fixedSide}
    >
      {expandable.columnTitle}
    </th>
  );
}
