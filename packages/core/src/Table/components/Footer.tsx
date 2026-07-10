import * as React from 'react';
import { useTable } from '../hooks/useTable';
import type { TableDataRow, TableProps } from '../Table.types';

export interface FooterProps<TRecord, TRowData> {
  render: NonNullable<TableProps<TRecord, TRowData>['footer']>;
  data: TRecord[];
  rows: TableDataRow<TRecord, TRowData>[];
  className?: string;
  style?: React.CSSProperties;
}

export function Footer<TRecord, TRowData>({ render, data, rows, className, style }: FooterProps<TRecord, TRowData>) {
  const { table, props, registry, testIdPrefix } = useTable<TRecord, TRowData>();
  return (
    <registry.components.Footer table={table} props={props} registry={registry} className={className} style={style} data-testid={`${testIdPrefix}-footer`}>
      {render(data, rows)}
    </registry.components.Footer>
  );
}
