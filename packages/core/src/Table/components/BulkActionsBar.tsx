import * as React from 'react';
import { useTable } from '../hooks/useTable';
import { BulkActionsButton } from '../internal';
import type { TableBulkActionsRenderContext, TableDataRow, TableProps, TableSelectionAction } from '../Table.types';

export interface BulkActionsBarProps<TRecord, TRowData> {
  bulkActions: NonNullable<NonNullable<TableProps<TRecord, TRowData>['rowSelection']>['bulkActions']>;
  selectedKeys: string[];
  selectedRows: TRecord[];
  selectedDataRows: TableDataRow<TRecord, TRowData>[];
  actions: TableSelectionAction[];
  onRunAction: (action: TableSelectionAction) => void;
  onClear: () => void;
}

export function BulkActionsBar<TRecord, TRowData>({
  bulkActions,
  selectedKeys,
  selectedRows,
  selectedDataRows,
  actions,
  onRunAction,
  onClear,
}: BulkActionsBarProps<TRecord, TRowData>) {
  const { testIdPrefix } = useTable<TRecord, TRowData>();
  const placement = bulkActions.placement ?? 'left';
  const showWhenEmpty = bulkActions.showWhenEmpty ?? false;
  const configuredActions = bulkActions.actions ?? [];
  const useConfigured = configuredActions.length > 0;
  const useCustomRender = !useConfigured && Boolean(bulkActions.render);

  if (selectedKeys.length === 0 && !showWhenEmpty) return null;

  const ctx: TableBulkActionsRenderContext<TRecord, TRowData> = {
    selectedRowKeys: selectedKeys,
    selectedRows,
    selectedDataRows,
    actions,
    runAction: onRunAction,
    clear: onClear,
    Button: BulkActionsButton,
  };

  return (
    <div className="bui-table-bulk-bar" data-placement={placement} data-testid={`${testIdPrefix}-bulk-bar`}>
      {useConfigured ? (
        <>
          <span className="bui-table-bulk-count" data-testid={`${testIdPrefix}-bulk-count`}>
            {selectedKeys.length} selected
          </span>
          {configuredActions.map((action) => (
            <BulkActionsButton
              key={action.key}
              variant={action.variant}
              disabled={action.disabled}
              onClick={() => action.onClick({ selectedRowKeys: selectedKeys, selectedRows, selectedDataRows, clear: onClear })}
              data-testid={`${testIdPrefix}-bulk-action-${action.key}`}
            >
              {action.icon}
              {action.label}
            </BulkActionsButton>
          ))}
          <BulkActionsButton variant="ghost" onClick={onClear} data-testid={`${testIdPrefix}-bulk-clear`}>
            Clear
          </BulkActionsButton>
        </>
      ) : useCustomRender ? (
        bulkActions.render!(ctx)
      ) : (
        <>
          <span className="bui-table-bulk-count" data-testid={`${testIdPrefix}-bulk-count`}>
            {selectedKeys.length} selected
          </span>
          {actions.map((action) => (
            <BulkActionsButton key={action.key} onClick={() => onRunAction(action)} data-testid={`${testIdPrefix}-bulk-action-${action.key}`}>
              {action.text}
            </BulkActionsButton>
          ))}
          <BulkActionsButton variant="ghost" onClick={onClear} data-testid={`${testIdPrefix}-bulk-clear`}>
            Clear
          </BulkActionsButton>
        </>
      )}
    </div>
  );
}
