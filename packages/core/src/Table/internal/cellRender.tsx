import * as React from 'react';
import type { TableCellOverride, TableCellRenderContext } from '../Table.types';
import { createRowDataTypeMap, type RowDataType } from '../Table.RowData';
import { RowDataActionsType } from '../Table.RowDataActions';
import { RowDataAvatarType } from '../Table.RowDataAvatar';
import { RowDataDateType } from '../Table.RowDataDate';
import { RowDataFileType } from '../Table.RowDataFile';
import { RowDataIconType } from '../Table.RowDataIcon';
import { RowDataLinkType } from '../Table.RowDataLink';
import { RowDataMoneyType } from '../Table.RowDataMoney';
import { RowDataNumberType } from '../Table.RowDataNumber';
import { RowDataTextType } from '../Table.RowDataText';

export const BUILT_IN_ROW_DATA_TYPES = createRowDataTypeMap(
  RowDataActionsType,
  RowDataAvatarType,
  RowDataDateType,
  RowDataFileType,
  RowDataIconType,
  RowDataLinkType,
  RowDataMoneyType,
  RowDataNumberType,
  RowDataTextType,
);

export const renderCellContent = <TRecord, TRowData>(
  ctx: TableCellRenderContext<TRecord, TRowData>,
  value: unknown,
  override: TableCellOverride<TRecord, TRowData> | undefined,
  rowDataTypes: Record<string, RowDataType> = BUILT_IN_ROW_DATA_TYPES,
): React.ReactNode => {
  if (override?.kind) {
    const renderer = ctx.registry.fields[override.kind];
    if (renderer) return renderer(ctx);
  }
  if (override?.render) return override.render(value, ctx);
  if (ctx.column.render) return ctx.column.render(value, ctx.record, ctx.rowIndex, ctx.row);
  const rawTypeKey = ctx.column.type ?? ctx.column.valueType;
  const typeKey = rawTypeKey === 'string' ? 'text' : rawTypeKey;
  if (typeKey && rowDataTypes[typeKey]) {
    return rowDataTypes[typeKey].render({
      value,
      record: ctx.record,
      row: ctx.row,
      column: ctx.column,
      rowIndex: ctx.rowIndex,
    });
  }
  return value == null ? null : String(value);
};
