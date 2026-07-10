/**
 * Base contract shared by every row-data type the Table can render
 * declaratively via `column.type = '<name>'`. New types live in
 * `Table.RowData<Name>.tsx` and export a `RowDataType` implementation
 * so `Table` doesn't need to know about them by hand.
 */

import * as React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- open contract at
// the registration boundary; individual types narrow inside their `render`.
export interface RowDataRenderContext {
  value: unknown;
  record: any;
  row: any;
  column: any;
  rowIndex: number;
}

export interface RowDataType {
  /** Column `type` string that routes to this renderer, e.g. `'icon'`. */
  readonly type: string;
  /** Renders the cell content for this row data type. */
  render(ctx: RowDataRenderContext): React.ReactNode;
}

/** Map of registered row data types, keyed by `column.type`. Filled in by
 * each type module (side-effect free — modules export the descriptor and
 * `Table` imports them to build the map). */
export const createRowDataTypeMap = (...types: RowDataType[]): Record<string, RowDataType> => Object.fromEntries(types.map((entry) => [entry.type, entry]));
