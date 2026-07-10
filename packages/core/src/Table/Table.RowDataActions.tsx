import { renderActionsField } from './Table.registry';
import type { RowDataType } from './Table.RowData';

export const RowDataActionsType: RowDataType = {
  type: 'actions',
  render: (ctx) => renderActionsField(ctx as never),
};
