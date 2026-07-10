import { renderStringField } from './Table.registry';
import type { RowDataType } from './Table.RowData';

export const RowDataTextType: RowDataType = {
  type: 'text',
  render: (ctx) => renderStringField(ctx as never),
};
