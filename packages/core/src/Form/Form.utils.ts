import type { z } from 'zod';

import type { FormError } from './Form.types';

/**
 * Translate a Zod issue list into Omni's `FormError[]` shape.
 * Shared by `Form` (via `onSubmitInvalid`) and `DynamicForm` (RJSF adapter).
 */
export const zodIssuesToFormErrors = (error: z.ZodError): FormError[] =>
  error.issues.map((issue) => ({
    path: issue.path.map(String),
    message: issue.message,
    source: 'zod' as const,
  }));
