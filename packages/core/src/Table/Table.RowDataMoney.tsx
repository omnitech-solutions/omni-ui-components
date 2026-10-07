import type { RowDataType } from './Table.RowData';
import { renderMoneyField } from './Table.registry';

export const RowDataMoneyType: RowDataType = {
  type: 'money',
  render: (ctx) => renderMoneyField(ctx as never),
};
