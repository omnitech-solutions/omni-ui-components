import type { RowDataType } from './Table.RowData';
import { renderDateField } from './Table.registry';

export const RowDataDateType: RowDataType = {
  type: 'date',
  render: (ctx) => renderDateField(ctx as never),
};
