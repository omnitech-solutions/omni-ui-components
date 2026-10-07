import type { RowDataType } from './Table.RowData';
import { renderLinkField } from './Table.registry';

export const RowDataLinkType: RowDataType = {
  type: 'link',
  render: (ctx) => renderLinkField(ctx as never),
};
