import * as React from 'react';
import classNames from 'classnames';
import { useTable } from '../hooks/useTable';
import { bodyCellClass, pathValue } from '../internal';
import type { TableColumn, TableProps, TableResolvedRow } from '../Table.types';

export interface SelectionCellProps<TRecord, TRowData> {
  resolved: TableResolvedRow<TRecord, TRowData>;
  rowIndex: number;
  column: TableColumn<TRecord, TRowData> | undefined;
  checked: boolean;
  rowSelection: NonNullable<TableProps<TRecord, TRowData>['rowSelection']>;
  checkboxProps: React.InputHTMLAttributes<HTMLInputElement>;
  onSelect: (resolved: TableResolvedRow<TRecord, TRowData>, next: boolean, event: Event) => void;
  fixedSide: 'left' | 'right' | undefined;
  alignStyle: React.CSSProperties;
  className?: string;
}

export function SelectionCell<TRecord, TRowData>({
  resolved,
  rowIndex,
  column,
  checked,
  rowSelection,
  checkboxProps,
  onSelect,
  fixedSide,
  alignStyle,
  className,
}: SelectionCellProps<TRecord, TRowData>) {
  const { table, props, registry, testIdPrefix } = useTable<TRecord, TRowData>();
  const key = String(resolved.key);
  const ariaLabel = `Select row ${pathValue(resolved.record, 'name') ?? resolved.key}`;
  const originNode = (
    <input
      type={rowSelection.type === 'radio' ? 'radio' : 'checkbox'}
      aria-label={ariaLabel}
      {...checkboxProps}
      checked={checked}
      onChange={(event) => onSelect(resolved, event.currentTarget.checked, event.nativeEvent)}
      data-testid={`${testIdPrefix}-selection-checkbox-${key}`}
      disabled={checkboxProps.disabled}
    />
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (checkboxProps.disabled) return;
    const target = event.target as HTMLElement;
    if (target.closest('input, label')) return;
    onSelect(resolved, rowSelection.type === 'radio' ? true : !checked, event.nativeEvent);
  };

  const style: React.CSSProperties = {
    width: rowSelection.columnWidth ?? 'var(--bui-table-selection-column-width)',
    cursor: checkboxProps.disabled ? 'not-allowed' : 'pointer',
    ...alignStyle,
    ...(fixedSide ? { position: 'sticky', [fixedSide]: 0 } : {}),
  };

  return (
    <registry.components.SelectionCell
      table={table}
      props={props}
      registry={registry}
      record={resolved.record}
      row={resolved.row}
      column={column!}
      rowIndex={rowIndex}
      columnIndex={-1}
      value={checked}
      checked={checked}
      onCheckedChange={(next: boolean) => onSelect(resolved, next, new Event('change'))}
      className={classNames(bodyCellClass, fixedSide && 'sticky z-[1]', className)}
      style={style}
      data-bui-utility-cell="true"
      data-testid={`${testIdPrefix}-selection-cell-${key}`}
      data-pinned={fixedSide}
      onClick={handleClick}
      {...rowSelection.onCell?.(resolved.record, rowIndex, resolved.row)}
    >
      {rowSelection.renderCell ? rowSelection.renderCell(checked, resolved.record, rowIndex, originNode, resolved.row) : originNode}
    </registry.components.SelectionCell>
  );
}
