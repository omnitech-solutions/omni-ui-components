import * as React from 'react';
import { getLoadingVariant, resolveLoading } from '../../Table.Loading';
import type { TableProps } from '../../Table.types';

// Memoizes resolveLoading + getLoadingVariant so `loading` prop churn
// doesn't re-run either on every render.
export function useLoadingState<TRecord, TRowData>(loading: TableProps<TRecord, TRowData>['loading']) {
  const state = React.useMemo(() => resolveLoading(loading), [loading]);
  const variant = React.useMemo(() => getLoadingVariant(state.variant), [state.variant]);
  return { state, variant };
}
