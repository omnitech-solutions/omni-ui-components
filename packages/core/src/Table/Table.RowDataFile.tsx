import { renderFileField } from './Table.registry';
import type { RowDataType } from './Table.RowData';

export const RowDataFileType: RowDataType = {
  type: 'file',
  render: (ctx) => renderFileField(ctx as never),
};
