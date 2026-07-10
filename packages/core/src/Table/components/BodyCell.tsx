import * as React from 'react';
import classNames from 'classnames';
import { useTable } from '../hooks/useTable';
import {
  alignStyle,
  bodyCellClass,
  cellValue,
  componentTitle,
  editableRenderer,
  editableRowConfig,
  ellipsisCellClass,
  isEllipsisEnabled,
  isExpandedKey,
  normalizeEditableInputValue,
  rawCellValue,
  renderCellContent,
  shouldShowEllipsisTitle,
  type ResolvedCellEditable,
} from '../internal';
import { TreeExpandToggle } from '../Table.tree';
import type {
  TableCellEditorRenderContext,
  TableCellOverride,
  TableCellRenderContext,
  TableColumn,
  TableDataRow,
  TableEditableRowConfig,
  TableProps,
  TableResolvedRow,
} from '../Table.types';

export interface BodyCellProps<TRecord, TRowData> {
  resolved: TableResolvedRow<TRecord, TRowData>;
  col: TableColumn<TRecord, TRowData>;
  rowIndex: number;
  columnIndex: number;
  indent?: number;
  appearance: NonNullable<TableProps<TRecord, TRowData>['appearance']>;
  treeMode: boolean;
  expandable: TableProps<TRecord, TRowData>['expandable'];
  expanded: import('@tanstack/react-table').ExpandedState;
  toggleExpanded: (resolved: TableResolvedRow<TRecord, TRowData>) => void;
  currentRows: TableDataRow<TRecord, TRowData>[];
  resolvedExtendable: { rows?: unknown };
  handleAppendRow: () => Promise<TableDataRow<TRecord, TRowData>>;
  bodyCellEditableConfig: (
    override: TableCellOverride<TRecord, TRowData> | undefined,
    col: TableColumn<TRecord, TRowData>,
  ) => ResolvedCellEditable<TRecord, TRowData> | null;
  editableCellTarget: (
    rowKey: string,
    columnKey: string,
    direction: -1 | 1,
  ) => {
    resolved: TableResolvedRow<TRecord, TRowData>;
    column: TableColumn<TRecord, TRowData>;
    rowConfig: TableEditableRowConfig<TRecord, TRowData> | null;
    editableConfig: ResolvedCellEditable<TRecord, TRowData>;
    value: unknown;
  } | null;
  firstEditableCellTarget: (resolved: TableResolvedRow<TRecord, TRowData>) => {
    resolved: TableResolvedRow<TRecord, TRowData>;
    column: TableColumn<TRecord, TRowData>;
    rowConfig: TableEditableRowConfig<TRecord, TRowData> | null;
    editableConfig: ResolvedCellEditable<TRecord, TRowData>;
    value: unknown;
  } | null;
  beginCellEdit: (
    resolved: TableResolvedRow<TRecord, TRowData>,
    col: TableColumn<TRecord, TRowData>,
    value: unknown,
    rowConfig: TableEditableRowConfig<TRecord, TRowData> | null,
    editableConfig: ResolvedCellEditable<TRecord, TRowData> | null,
  ) => void;
  saveCellEdit: (
    rowKey: string,
    col: TableColumn<TRecord, TRowData>,
    editableConfig: ResolvedCellEditable<TRecord, TRowData>,
    ctx: TableCellRenderContext<TRecord, TRowData>,
    nextValue?: unknown,
  ) => Promise<boolean>;
  saveRowEdit: (resolved: TableResolvedRow<TRecord, TRowData>, rowConfig: TableEditableRowConfig<TRecord, TRowData>) => Promise<void>;
  cancelCellEdit: (rowKey: string, columnKey: string) => void;
  cancelRowEdit: (resolved: TableResolvedRow<TRecord, TRowData>, rowConfig: TableEditableRowConfig<TRecord, TRowData>) => void;
  setEditableValue: (rowKey: string, columnKey: string, value: unknown) => void;
  rowInitialEditableValues: (
    resolved: TableResolvedRow<TRecord, TRowData>,
    rowConfig: TableEditableRowConfig<TRecord, TRowData> | null,
  ) => Record<string, unknown>;
  editableErrorKey: (rowKey: string, columnKey: string) => string;
}

export function BodyCell<TRecord, TRowData>({
  resolved,
  col,
  rowIndex,
  columnIndex,
  indent = 0,
  appearance,
  treeMode,
  expandable,
  expanded,
  toggleExpanded,
  currentRows,
  resolvedExtendable,
  handleAppendRow,
  bodyCellEditableConfig,
  editableCellTarget,
  firstEditableCellTarget,
  beginCellEdit,
  saveCellEdit,
  saveRowEdit,
  cancelCellEdit,
  cancelRowEdit,
  setEditableValue,
  rowInitialEditableValues,
  editableErrorKey,
}: BodyCellProps<TRecord, TRowData>) {
  const {
    table,
    props,
    registry,
    testIdPrefix,
    classMap,
    styleMap,
    columnPinning,
    editingCell,
    editingRowKey,
    editValues,
    editErrors,
    internalCellValues,
    renderedLeafColumns,
    rowDataTypeMap,
    rootEditableConfig,
  } = useTable<TRecord, TRowData>();

  const override = resolved.row.cells?.[col.key];
  const internalOverride = internalCellValues[String(resolved.key)]?.[col.key];
  const rawValue = internalOverride !== undefined ? internalOverride : rawCellValue(resolved.record, resolved.row, col);
  const value = internalOverride !== undefined ? internalOverride : cellValue(resolved.record, resolved.row, col);
  const ctx: TableCellRenderContext<TRecord, TRowData> = { record: resolved.record, row: resolved.row, column: col, rowIndex, columnIndex, registry };
  const cellProps = { ...(resolved.row.onCell?.(col, columnIndex) ?? {}), ...(col.onCell?.(resolved.record, rowIndex, resolved.row) ?? {}) };
  const {
    className: cellClassName,
    style: cellStyle,
    colSpan: cellColSpan,
    rowSpan: cellRowSpan,
    onClick: cellOnClick,
    onKeyDown: cellOnKeyDown,
    ...restCellProps
  } = cellProps;
  const resolvedColSpan = override?.colSpan ?? cellColSpan;
  const resolvedRowSpan = override?.rowSpan ?? cellRowSpan;
  if (resolvedColSpan === 0 || resolvedRowSpan === 0) return null;

  const alignment = override?.align ?? col.align ?? appearance.cellAlignment;
  const rowConfig = editableRowConfig(resolved.row.editable);
  const editableConfig = bodyCellEditableConfig(override, col);
  const rowKey = String(resolved.key);
  const errorKey = editableErrorKey(rowKey, col.key);
  const savedByNavigateRef = React.useRef(false);
  const isRowEditing = editingRowKey === rowKey && Boolean(rowConfig);
  const isCellEditing = editingCell?.rowKey === rowKey && editingCell.columnKey === col.key && editableConfig?.mode === 'cell';
  const isEditing = isRowEditing || isCellEditing;
  const editingValue = editValues[rowKey]?.[col.key] ?? (isRowEditing ? rowInitialEditableValues(resolved, rowConfig)[col.key] : rawValue);
  const inputValue = normalizeEditableInputValue(editingValue);
  const readContent = renderCellContent(ctx, rawValue, override, rowDataTypeMap);
  const renderCustomEditor = editableConfig ? editableRenderer(registry, col, override, editableConfig) : undefined;

  const navigateCellEdit = (direction: -1 | 1, nextValue?: unknown): boolean => {
    if (!editableConfig || isRowEditing) return false;
    const target = editableCellTarget(rowKey, col.key, direction);
    // Tab-in-last-cell appends via editable.onAppendRow or extendable.rows fallback.
    const canAppendRow =
      direction === 1 && !target && (Boolean(rootEditableConfig?.appendRowOnTab && rootEditableConfig.onAppendRow) || Boolean(resolvedExtendable.rows));
    if (!target && !canAppendRow) return false;
    void (async () => {
      const didSave = await saveCellEdit(rowKey, col, editableConfig, ctx, nextValue);
      if (!didSave) {
        savedByNavigateRef.current = false;
        return;
      }
      if (target) {
        beginCellEdit(target.resolved, target.column, target.value, target.rowConfig, target.editableConfig);
        return;
      }
      const appendedRow =
        (await rootEditableConfig?.onAppendRow?.({ rows: currentRows, columns: renderedLeafColumns })) ??
        (resolvedExtendable.rows ? await handleAppendRow() : undefined);
      if (!appendedRow) return;
      const appendedResolved: TableResolvedRow<TRecord, TRowData> = {
        key: appendedRow.key,
        record: appendedRow.record ?? ({} as TRecord),
        row: appendedRow,
        index: currentRows.length,
      };
      const appendedTarget = firstEditableCellTarget(appendedResolved);
      if (!appendedTarget) return;
      beginCellEdit(appendedTarget.resolved, appendedTarget.column, appendedTarget.value, appendedTarget.rowConfig, appendedTarget.editableConfig);
    })();
    return true;
  };

  const inlineExpandActive = (treeMode || expandable?.showExpandColumn === false) && col === renderedLeafColumns[0];
  const inlineExpand = inlineExpandActive
    ? (() => {
        const hasChildren = Boolean(resolved.row.children?.length);
        const canExpand = expandable?.rowExpandable
          ? expandable.rowExpandable(resolved.record, resolved.row)
          : Boolean(expandable?.expandedRowRender || hasChildren);
        const customExpandIcon = expandable?.expandIcon;
        return (
          <TreeExpandToggle
            indent={indent}
            indentSize={expandable?.indentSize}
            canExpand={canExpand}
            isExpanded={isExpandedKey(expanded, resolved.key)}
            onToggle={() => toggleExpanded(resolved)}
            rowKey={String(resolved.key)}
            testId={`${testIdPrefix}-expand-toggle-${String(resolved.key)}`}
            renderIcon={
              customExpandIcon
                ? ({ expanded: isOpen, canExpand: rowCanExpand, onToggle }) =>
                    customExpandIcon({
                      expanded: isOpen,
                      expandable: rowCanExpand,
                      record: resolved.record,
                      row: resolved.row,
                      onExpand: (_record, event) => onToggle(event),
                    })
                : undefined
            }
          />
        );
      })()
    : null;

  const editorContent = isEditing ? (
    <span className="block space-y-1" data-testid={`${testIdPrefix}-edit-wrapper-${rowKey}-${col.key}`}>
      {renderCustomEditor ? (
        renderCustomEditor({
          ...ctx,
          value: editingValue,
          error: editErrors[errorKey] ?? null,
          mode: isRowEditing ? 'row' : 'cell',
          autoFocus: true,
          onChange: (nextValue) => setEditableValue(rowKey, col.key, nextValue),
          onSave: (nextValue?: unknown) => {
            if (nextValue !== undefined) setEditableValue(rowKey, col.key, nextValue);
            if (isRowEditing && rowConfig) return saveRowEdit(resolved, rowConfig);
            if (editableConfig) return saveCellEdit(rowKey, col, editableConfig, ctx, nextValue).then(() => undefined);
            return undefined;
          },
          onCancel: () => {
            if (isRowEditing && rowConfig) cancelRowEdit(resolved, rowConfig);
            else cancelCellEdit(rowKey, col.key);
          },
          onNavigate: navigateCellEdit,
        } satisfies TableCellEditorRenderContext<TRecord, TRowData>)
      ) : (
        <input
          aria-label={`Edit ${col.key}`}
          autoFocus
          className="w-full rounded border border-[var(--bui-table-border)] bg-[var(--bui-table-bg)] px-2 py-1 text-inherit outline-none focus:border-[var(--bui-table-focus-border)]"
          value={inputValue}
          onChange={(event) => setEditableValue(rowKey, col.key, event.currentTarget.value)}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === 'Enter') {
              event.preventDefault();
              if (isRowEditing && rowConfig) void saveRowEdit(resolved, rowConfig);
              else if (editableConfig) void saveCellEdit(rowKey, col, editableConfig, ctx);
            }
            if (event.key === 'Tab' && !isRowEditing && editableConfig) {
              savedByNavigateRef.current = true;
              const didNavigate = navigateCellEdit(event.shiftKey ? -1 : 1, event.currentTarget.value);
              if (didNavigate) event.preventDefault();
              else savedByNavigateRef.current = false;
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              if (isRowEditing && rowConfig) cancelRowEdit(resolved, rowConfig);
              else cancelCellEdit(rowKey, col.key);
            }
          }}
          onBlur={() => {
            if (savedByNavigateRef.current) {
              savedByNavigateRef.current = false;
              return;
            }
            if (!isRowEditing && editableConfig) void saveCellEdit(rowKey, col, editableConfig, ctx);
          }}
          data-testid={`${testIdPrefix}-edit-input-${rowKey}-${col.key}`}
        />
      )}
      {editErrors[errorKey] && (
        <span className="block text-xs text-[var(--bui-table-error-fg,#b42318)]" role="alert" data-testid={`${testIdPrefix}-edit-error-${rowKey}-${col.key}`}>
          {editErrors[errorKey]}
        </span>
      )}
    </span>
  ) : (
    readContent
  );

  const isPinned = columnPinning.left?.includes(col.key) || columnPinning.right?.includes(col.key) || col.fixed;
  const pinnedSide = columnPinning.left?.includes(col.key) || col.fixed === 'left' || col.fixed === 'start' || col.fixed === true ? 'left' : 'right';
  const titleAttribute = isEllipsisEnabled(col) && shouldShowEllipsisTitle(col) ? componentTitle(value) : undefined;
  const beginEditFromCell = () => beginCellEdit(resolved, col, value, rowConfig, editableConfig);

  const { BodyCell: BC } = registry.components;
  return (
    <BC
      table={table}
      props={props}
      registry={registry}
      record={resolved.record}
      row={resolved.row}
      column={col}
      rowIndex={rowIndex}
      columnIndex={columnIndex}
      value={value}
      className={classNames(
        bodyCellClass,
        isEllipsisEnabled(col) && ellipsisCellClass,
        isPinned && 'sticky z-[1]',
        classMap['body.cell'],
        col.className,
        override?.className,
        cellClassName,
      )}
      style={{
        ...alignStyle(alignment),
        ...(isPinned ? { position: 'sticky', [pinnedSide]: 0 } : {}),
        ...styleMap['body.cell'],
        ...override?.style,
        ...cellStyle,
      }}
      data-testid={`${testIdPrefix}-body-cell-${String(resolved.key)}-${col.key}`}
      data-column-key={col.key}
      data-pinned={isPinned ? pinnedSide : undefined}
      data-ellipsis={isEllipsisEnabled(col) ? 'true' : undefined}
      data-editable={editableConfig ? 'true' : undefined}
      data-editing={isEditing ? 'true' : undefined}
      tabIndex={editableConfig ? 0 : restCellProps.tabIndex}
      title={titleAttribute}
      colSpan={resolvedColSpan}
      rowSpan={resolvedRowSpan}
      onClick={(event) => {
        cellOnClick?.(event);
        if (!event.defaultPrevented && (editableConfig || rowConfig) && !isEditing) beginEditFromCell();
      }}
      onKeyDown={(event) => {
        cellOnKeyDown?.(event);
        if (!event.defaultPrevented && (editableConfig || rowConfig) && !isEditing && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          beginEditFromCell();
        }
      }}
      {...restCellProps}
    >
      {inlineExpand ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {inlineExpand}
          <span>{editorContent}</span>
        </span>
      ) : (
        editorContent
      )}
    </BC>
  );
}
