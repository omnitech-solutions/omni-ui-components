import { renderDateField } from './Table.registry';
import type { RowDataType } from './Table.RowData';

export const RowDataDateType: RowDataType = {
  type: 'date',
  render: (ctx) => renderDateField(ctx as never),
};
