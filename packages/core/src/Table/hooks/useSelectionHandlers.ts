import * as React from 'react';
import type { RowSelectionState } from '@tanstack/react-table';
import { alignStyle } from '../internal';
import type { TableKey, TableProps, TableResolvedRow, TableSelectionAction } from '../Table.types';

export interface UseSelectionHandlersInput<TRecord, TRowData> {
  rowSelection: TableProps<TRecord, TRowData>['rowSelection'];
  locale: TableProps<TRecord, TRowData>['locale'];
  allResolvedRows: TableResolvedRow<TRecord, TRowData>[];
  resolvedRows: TableResolvedRow<TRecord, TRowData>[];
  rowByKey: Map<string, TableResolvedRow<TRecord, TRowData>>;
  tanStackRowSelection: RowSelectionState;
  setTanStackRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  selectionKeysToState: (keys: TableKey[] | Iterable<TableKey>) => RowSelectionState;
  preserveSelectedRecordsRef: React.MutableRefObject<Map<string, TRecord>>;
  lastSelectedKeyRef: React.MutableRefObject<string | null>;
  emitStateChange: (partial: Partial<NonNullable<TableProps<TRecord, TRowData>['state']>>) => void;
}

export function useSelectionHandlers<TRecord, TRowData>({
  rowSelection,
  locale,
  allResolvedRows,
  resolvedRows,
  rowByKey,
  tanStackRowSelection,
  setTanStackRowSelection,
  selectionKeysToState,
  preserveSelectedRecordsRef,
  lastSelectedKeyRef,
  emitStateChange,
}: UseSelectionHandlersInput<TRecord, TRowData>) {
  const selectedKeys = React.useMemo(() => Object.keys(tanStackRowSelection).filter((key) => tanStackRowSelection[key]), [tanStackRowSelection]);
  const selectedKeySet = React.useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const selectionControlled = rowSelection?.selectedRowKeys !== undefined;
  const selectionFixedSide = (rowSelection?.fixed === true ? 'left' : rowSelection?.fixed) as 'left' | 'right' | undefined;
  const selectionAlignStyle = alignStyle(rowSelection?.align);

  const selectionTree = React.useMemo(() => {
    const nodes = new Map<string, { resolved: TableResolvedRow<TRecord, TRowData>; parentKey?: string; childKeys: string[] }>();
    const walk = (items: TableResolvedRow<TRecord, TRowData>[], parentKey?: string) => {
      items.forEach((item) => {
        const key = String(item.key);
        const childItems = item.row.children?.map((child, index) => ({ key: child.key, record: child.record ?? ({} as TRecord), row: child, index })) ?? [];
        nodes.set(key, { resolved: item, parentKey, childKeys: childItems.map((child) => String(child.key)) });
        walk(childItems, key);
      });
    };
    walk(resolvedRows);
    return nodes;
  }, [resolvedRows]);

  const selectionStateForKeys = React.useCallback((keys: TableKey[] = []): RowSelectionState => selectionKeysToState(keys), [selectionKeysToState]);

  const selectedRecordsForKeys = React.useCallback(
    (keys: string[]): TRecord[] =>
      keys.map((key) => rowByKey.get(key)?.record ?? preserveSelectedRecordsRef.current.get(key)).filter((record): record is TRecord => record !== undefined),
    [rowByKey, preserveSelectedRecordsRef],
  );

  const selectionCheckboxPropsFor = React.useCallback(
    (resolved: TableResolvedRow<TRecord, TRowData>): React.InputHTMLAttributes<HTMLInputElement> =>
      rowSelection?.getCheckboxProps?.(resolved.record, resolved.row) ?? {},
    [rowSelection],
  );

  const isSelectionDisabled = React.useCallback(
    (resolved: TableResolvedRow<TRecord, TRowData>): boolean => Boolean(selectionCheckboxPropsFor(resolved).disabled),
    [selectionCheckboxPropsFor],
  );

  const changeableSelectionRows = React.useMemo(() => allResolvedRows.filter((item) => !isSelectionDisabled(item)), [allResolvedRows, isSelectionDisabled]);
  const changeableSelectionKeys = React.useMemo(() => changeableSelectionRows.map((item) => String(item.key)), [changeableSelectionRows]);

  React.useEffect(() => {
    if (!rowSelection?.preserveSelectedRowKeys) {
      preserveSelectedRecordsRef.current = new Map(allResolvedRows.map((item) => [String(item.key), item.record]));
      return;
    }
    allResolvedRows.forEach((item) => preserveSelectedRecordsRef.current.set(String(item.key), item.record));
  }, [allResolvedRows, rowSelection?.preserveSelectedRowKeys, preserveSelectedRecordsRef]);

  const normalizeSelectionKeys = React.useCallback(
    (keys: string[]): string[] => {
      const uniqueKeys = Array.from(new Set(keys));
      if (rowSelection?.preserveSelectedRowKeys) return uniqueKeys;
      return uniqueKeys.filter((key) => rowByKey.has(key));
    },
    [rowByKey, rowSelection?.preserveSelectedRowKeys],
  );

  const applySelectionKeys = React.useCallback(
    (keys: string[], type: 'single' | 'multiple' | 'all' | 'invert' | 'none') => {
      const nextKeys = normalizeSelectionKeys(keys);
      allResolvedRows.forEach((item) => {
        if (nextKeys.includes(String(item.key))) preserveSelectedRecordsRef.current.set(String(item.key), item.record);
      });
      const nextState = selectionStateForKeys(nextKeys);
      if (!selectionControlled) setTanStackRowSelection(nextState);
      emitStateChange({ rowSelection: nextState });
      rowSelection?.onChange?.(nextKeys, selectedRecordsForKeys(nextKeys), { type });
      return nextKeys;
    },
    [
      allResolvedRows,
      emitStateChange,
      normalizeSelectionKeys,
      rowSelection,
      selectedRecordsForKeys,
      selectionControlled,
      selectionStateForKeys,
      setTanStackRowSelection,
      preserveSelectedRecordsRef,
    ],
  );

  const descendantSelectionKeys = React.useCallback(
    (key: string): string[] => {
      const keys: string[] = [];
      const walk = (currentKey: string) => {
        const node = selectionTree.get(currentKey);
        if (!node) return;
        if (!isSelectionDisabled(node.resolved)) keys.push(currentKey);
        node.childKeys.forEach(walk);
      };
      walk(key);
      return keys;
    },
    [isSelectionDisabled, selectionTree],
  );

  const normalizeTreeSelectionKeys = React.useCallback(
    (keys: string[]): string[] => {
      if (rowSelection?.checkStrictly !== false || rowSelection?.type === 'radio') return normalizeSelectionKeys(keys);
      const keySet = new Set(normalizeSelectionKeys(keys));
      Array.from(selectionTree.entries())
        .reverse()
        .forEach(([key, node]) => {
          if (!node.childKeys.length || isSelectionDisabled(node.resolved)) return;
          const changeableChildKeys = node.childKeys.filter((childKey) => {
            const child = selectionTree.get(childKey);
            return child && !isSelectionDisabled(child.resolved);
          });
          if (!changeableChildKeys.length) return;
          if (changeableChildKeys.every((childKey) => keySet.has(childKey))) keySet.add(key);
          else keySet.delete(key);
        });
      return Array.from(keySet);
    },
    [isSelectionDisabled, normalizeSelectionKeys, rowSelection?.checkStrictly, rowSelection?.type, selectionTree],
  );

  const handleSelect = (resolved: TableResolvedRow<TRecord, TRowData>, checked: boolean, nativeEvent: Event) => {
    const type = rowSelection?.type ?? 'checkbox';
    const key = String(resolved.key);
    const shiftKey = nativeEvent instanceof MouseEvent && nativeEvent.shiftKey;
    let nextKeys: string[];
    let method: 'single' | 'multiple' = 'single';
    let changedKeys: string[] = [key];

    if (type === 'radio') {
      nextKeys = checked ? [key] : [];
    } else if (shiftKey && lastSelectedKeyRef.current && rowSelection?.checkStrictly !== false) {
      const currentIndex = changeableSelectionKeys.indexOf(key);
      const previousIndex = changeableSelectionKeys.indexOf(lastSelectedKeyRef.current);
      if (currentIndex >= 0 && previousIndex >= 0) {
        const [start, end] = currentIndex < previousIndex ? [currentIndex, previousIndex] : [previousIndex, currentIndex];
        changedKeys = changeableSelectionKeys.slice(start, end + 1).filter((item) => item !== lastSelectedKeyRef.current || !selectedKeySet.has(item));
        const nextSet = new Set(selectedKeys);
        changeableSelectionKeys.slice(start, end + 1).forEach((item) => {
          if (checked) nextSet.add(item);
          else nextSet.delete(item);
        });
        nextKeys = Array.from(nextSet);
        method = 'multiple';
      } else {
        nextKeys = checked ? Array.from(new Set([...selectedKeys, key])) : selectedKeys.filter((item) => item !== key);
      }
    } else if (rowSelection?.checkStrictly === false) {
      const linkedKeys = descendantSelectionKeys(key);
      changedKeys = linkedKeys;
      const nextSet = new Set(selectedKeys);
      linkedKeys.forEach((item) => {
        if (checked) nextSet.add(item);
        else nextSet.delete(item);
      });
      nextKeys = normalizeTreeSelectionKeys(Array.from(nextSet));
    } else {
      nextKeys = checked ? Array.from(new Set([...selectedKeys, key])) : selectedKeys.filter((item) => item !== key);
    }

    const appliedKeys = applySelectionKeys(nextKeys, method);
    const selectedRows = selectedRecordsForKeys(appliedKeys);
    const changeRows = selectedRecordsForKeys(changedKeys);
    if (method === 'multiple') rowSelection?.onSelectMultiple?.(checked, selectedRows, changeRows);
    else rowSelection?.onSelect?.(resolved.record, checked, selectedRows, nativeEvent, resolved.row);
    lastSelectedKeyRef.current = checked ? key : null;
  };

  const resolvedSelectionActions = React.useMemo<TableSelectionAction[]>(() => {
    if (!rowSelection || rowSelection.type === 'radio' || !rowSelection.selections) return [];
    if (Array.isArray(rowSelection.selections)) return rowSelection.selections;
    return [
      {
        key: 'all',
        text: locale?.selectAll ?? 'All',
        onSelect: () => {
          const nextKeys = Array.from(new Set([...selectedKeys, ...changeableSelectionKeys]));
          const changeKeys = changeableSelectionKeys.filter((key) => !selectedKeySet.has(key));
          const appliedKeys = applySelectionKeys(nextKeys, 'all');
          rowSelection.onSelectAll?.(true, selectedRecordsForKeys(appliedKeys), selectedRecordsForKeys(changeKeys));
          lastSelectedKeyRef.current = null;
        },
      },
      {
        key: 'invert',
        text: 'Invert',
        onSelect: () => {
          const nextSet = new Set(selectedKeys);
          changeableSelectionKeys.forEach((key) => {
            if (nextSet.has(key)) nextSet.delete(key);
            else nextSet.add(key);
          });
          const appliedKeys = applySelectionKeys(Array.from(nextSet), 'invert');
          rowSelection.onSelectInvert?.(appliedKeys);
          lastSelectedKeyRef.current = null;
        },
      },
      {
        key: 'none',
        text: 'None',
        onSelect: () => {
          const nextKeys = selectedKeys.filter((key) => {
            const resolved = rowByKey.get(key);
            return resolved ? isSelectionDisabled(resolved) : false;
          });
          rowSelection.onSelectNone?.();
          applySelectionKeys(nextKeys, 'none');
          lastSelectedKeyRef.current = null;
        },
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection, locale, changeableSelectionKeys, selectedKeys, selectedKeySet, applySelectionKeys, selectedRecordsForKeys, rowByKey, isSelectionDisabled]);

  const bulkActionsConfigured = Boolean(rowSelection?.bulkActions);

  const clearSelection = React.useCallback(() => {
    const keepDisabled = selectedKeys.filter((key) => {
      const resolved = rowByKey.get(key);
      return resolved ? isSelectionDisabled(resolved) : false;
    });
    applySelectionKeys(keepDisabled, 'none');
    rowSelection?.onSelectNone?.();
    lastSelectedKeyRef.current = null;
  }, [applySelectionKeys, isSelectionDisabled, rowByKey, rowSelection, selectedKeys, lastSelectedKeyRef]);

  const runBulkAction = React.useCallback(
    (action: TableSelectionAction) => {
      action.onSelect(changeableSelectionKeys);
    },
    [changeableSelectionKeys],
  );

  return {
    selectedKeys,
    selectedKeySet,
    selectionControlled,
    selectionFixedSide,
    selectionAlignStyle,
    selectionStateForKeys,
    selectedRecordsForKeys,
    selectionCheckboxPropsFor,
    isSelectionDisabled,
    changeableSelectionKeys,
    applySelectionKeys,
    handleSelect,
    resolvedSelectionActions,
    bulkActionsConfigured,
    clearSelection,
    runBulkAction,
  };
}
