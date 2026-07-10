import * as React from 'react';
import type { ExpandedState } from '@tanstack/react-table';
import { expandedStateFromKeys } from '../../internal';
import type { TableProps } from '../../Table.types';

export function useExpandedState<TRecord, TRowData>(
  propsState: TableProps<TRecord, TRowData>['state'],
  defaultStateExpanded: ExpandedState | undefined,
  expandable: TableProps<TRecord, TRowData>['expandable'],
) {
  const initial =
    propsState?.expanded ??
    (expandable?.expandedRowKeys ? expandedStateFromKeys(expandable.expandedRowKeys) : undefined) ??
    defaultStateExpanded ??
    (expandable?.defaultExpandAllRows ? true : expandedStateFromKeys(expandable?.defaultExpandedRowKeys));

  const [expanded, setExpanded] = React.useState<ExpandedState>(initial);

  React.useEffect(() => {
    if (expandable?.expandedRowKeys) setExpanded(expandedStateFromKeys(expandable.expandedRowKeys));
  }, [expandable?.expandedRowKeys]);

  return { expanded, setExpanded };
}
