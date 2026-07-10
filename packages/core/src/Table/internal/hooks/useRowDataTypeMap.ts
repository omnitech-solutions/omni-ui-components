import * as React from 'react';
import { BUILT_IN_ROW_DATA_TYPES } from '../cellRender';
import type { RowDataType } from '../../Table.RowData';

// Merges overrides on top of BUILT_IN; identity-stable when overrides empty.
export function useRowDataTypeMap(overrides?: RowDataType[]): Record<string, RowDataType> {
  return React.useMemo(() => {
    if (!overrides?.length) return BUILT_IN_ROW_DATA_TYPES;
    const extras = Object.fromEntries(overrides.map((t) => [t.type, t]));
    return { ...BUILT_IN_ROW_DATA_TYPES, ...extras };
  }, [overrides]);
}
