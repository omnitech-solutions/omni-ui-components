import * as React from 'react';
import classNames from 'classnames';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTable } from '../hooks/useTable';
import { bodyCellClass } from '../internal';
import type { TableColumn, TableProps, TableResolvedRow } from '../Table.types';

export interface ExpandCellProps<TRecord, TRowData> {
  resolved: TableResolvedRow<TRecord, TRowData>;
  rowIndex: number;
  indent: number;
  column: TableColumn<TRecord, TRowData> | undefined;
  expandable: NonNullable<TableProps<TRecord, TRowData>['expandable']>;
  isExpanded: boolean;
  canExpand: boolean;
  fixedSide: 'left' | 'right' | undefined;
  indentSize: number;
  onToggle: (resolved: TableResolvedRow<TRecord, TRowData>) => void;
  className?: string;
}

export function ExpandCell<TRecord, TRowData>({
  resolved,
  rowIndex,
  indent,
  column,
  expandable,
  isExpanded,
  canExpand,
  fixedSide,
  indentSize,
  onToggle,
  className,
}: ExpandCellProps<TRecord, TRowData>) {
  const { table, props, registry, testIdPrefix } = useTable<TRecord, TRowData>();
  const key = String(resolved.key);
  const originNode = (
    <button
      type="button"
      className="bui-table-expand-toggle"
      aria-expanded={isExpanded}
      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} row ${key}`}
      onClick={() => onToggle(resolved)}
      data-testid={`${testIdPrefix}-expand-toggle-${key}`}
    >
      {isExpanded ? (
        <ChevronDown className="bui-table-expand-toggle__icon" aria-hidden="true" />
      ) : (
        <ChevronRight className="bui-table-expand-toggle__icon" aria-hidden="true" />
      )}
    </button>
  );

  const style: React.CSSProperties = {
    width: expandable.columnWidth ?? 'var(--bui-table-selection-column-width)',
    paddingLeft: indent ? indent * indentSize : undefined,
    ...(fixedSide ? { position: 'sticky', [fixedSide]: 0 } : {}),
  };

  return (
    <registry.components.ExpandCell
      table={table}
      props={props}
      registry={registry}
      record={resolved.record}
      row={resolved.row}
      column={column!}
      rowIndex={rowIndex}
      columnIndex={-2}
      value={isExpanded}
      expanded={isExpanded}
      onExpandedChange={() => onToggle(resolved)}
      className={classNames(bodyCellClass, fixedSide && 'sticky z-[1]', className)}
      style={style}
      data-bui-utility-cell="true"
      data-testid={`${testIdPrefix}-expand-cell-${key}`}
      data-pinned={fixedSide}
      data-indent={indent}
    >
      <span className="bui-table-expand-control">
        {indent > 0 && (
          <span className="bui-table-expand-guides" aria-hidden="true">
            {Array.from({ length: indent }).map((_, guideIndex) => (
              <span key={guideIndex} className="bui-table-expand-guide" style={{ left: `${guideIndex * indentSize + Math.floor(indentSize / 2)}px` }} />
            ))}
          </span>
        )}
        <span className="bui-table-expand-trigger-slot" data-expandable={canExpand ? 'true' : 'false'}>
          {canExpand ? (
            expandable.expandIcon ? (
              expandable.expandIcon({
                expanded: isExpanded,
                expandable: canExpand,
                record: resolved.record,
                row: resolved.row,
                onExpand: () => onToggle(resolved),
              })
            ) : (
              originNode
            )
          ) : (
            <span className="bui-table-expand-spacer" aria-hidden="true" />
          )}
        </span>
      </span>
    </registry.components.ExpandCell>
  );
}
