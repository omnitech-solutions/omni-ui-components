import { renderNumberField } from './Table.registry';
import type { RowDataType } from './Table.RowData';

export const RowDataNumberType: RowDataType = {
  type: 'number',
  render: (ctx) => renderNumberField(ctx as never),
};
