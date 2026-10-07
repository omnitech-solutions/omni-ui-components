import type { RowDataType } from './Table.RowData';
import { renderStringField } from './Table.registry';

export const RowDataTextType: RowDataType = {
  type: 'text',
  render: (ctx) => renderStringField(ctx as never),
};
