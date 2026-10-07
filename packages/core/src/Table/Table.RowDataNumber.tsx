import type { RowDataType } from './Table.RowData';
import { renderNumberField } from './Table.registry';

export const RowDataNumberType: RowDataType = {
  type: 'number',
  render: (ctx) => renderNumberField(ctx as never),
};
