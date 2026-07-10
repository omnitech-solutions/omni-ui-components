import { renderLinkField } from './Table.registry';
import type { RowDataType } from './Table.RowData';

export const RowDataLinkType: RowDataType = {
  type: 'link',
  render: (ctx) => renderLinkField(ctx as never),
};
