import type { RowDataType } from './Table.RowData';
import { renderFileField } from './Table.registry';

export const RowDataFileType: RowDataType = {
  type: 'file',
  render: (ctx) => renderFileField(ctx as never),
};
