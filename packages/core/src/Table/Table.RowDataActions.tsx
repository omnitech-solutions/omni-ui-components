import type { RowDataType } from './Table.RowData';
import { renderActionsField } from './Table.registry';

export const RowDataActionsType: RowDataType = {
  type: 'actions',
  render: (ctx) => renderActionsField(ctx as never),
};
