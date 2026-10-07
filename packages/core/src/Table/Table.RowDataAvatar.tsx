import type { RowDataType } from './Table.RowData';
import { renderAvatarField } from './Table.registry';

export const RowDataAvatarType: RowDataType = {
  type: 'avatar',
  render: (ctx) => renderAvatarField(ctx as never),
};
