import * as React from 'react';
import { useTable } from '../hooks/useTable';
import type { TableDataRow, TableProps } from '../Table.types';

export interface TitleProps<TRecord, TRowData> {
  render: NonNullable<TableProps<TRecord, TRowData>['title']>;
  data: TRecord[];
  rows: TableDataRow<TRecord, TRowData>[];
  className?: string;
  style?: React.CSSProperties;
}

export function Title<TRecord, TRowData>({ render, data, rows, className, style }: TitleProps<TRecord, TRowData>) {
  const { table, props, registry, testIdPrefix } = useTable<TRecord, TRowData>();
  return (
    <registry.components.Title table={table} props={props} registry={registry} className={className} style={style} data-testid={`${testIdPrefix}-title`}>
      {render(data, rows)}
    </registry.components.Title>
  );
}
