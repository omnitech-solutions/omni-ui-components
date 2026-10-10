import { z } from 'zod';

import type { FormFixture } from '../../DynamicForm/DynamicForm.factories';

export interface RecordFormData {
  recordId?: string;
  note?: string;
}

/** A record id the form carries and never shows, beside one visible field. */
export const hiddenRecordFixture = (): FormFixture<RecordFormData> => ({
  schema: {
    type: 'object',
    properties: {
      recordId: { type: 'string', title: 'Record' },
      note: { type: 'string', title: 'Note' },
    },
  },
  uiSchema: { recordId: { 'ui:widget': 'hidden' } },
  zodSchema: z.object({
    recordId: z.string().optional(),
    note: z.string().optional(),
  }) as unknown as z.ZodType<RecordFormData>,
  defaults: { recordId: 'rec_42', note: '' },
});
