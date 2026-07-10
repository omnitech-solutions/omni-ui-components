import { renderAvatarField } from './Table.registry';
import type { RowDataType } from './Table.RowData';

export const RowDataAvatarType: RowDataType = {
  type: 'avatar',
  render: (ctx) => renderAvatarField(ctx as never),
};
