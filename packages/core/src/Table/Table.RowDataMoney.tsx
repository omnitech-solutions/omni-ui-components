import { renderMoneyField } from './Table.registry';
import type { RowDataType } from './Table.RowData';

export const RowDataMoneyType: RowDataType = {
  type: 'money',
  render: (ctx) => renderMoneyField(ctx as never),
};
