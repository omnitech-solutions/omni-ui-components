import type { TemplatesType } from '@rjsf/utils';

import { FieldTemplate } from '../templates/FieldTemplate';
import { ObjectFieldTemplate } from '../templates/ObjectFieldTemplate';
import { WrapIfAdditionalTemplate } from '../templates/WrapIfAdditionalTemplate';
import { CopyButton, MoveDownButton, MoveUpButton, RemoveButton, SubmitButton } from '../templates/ButtonTemplates';

/**
 * Omni overrides layered on top of `@rjsf/shadcn`'s template registry.
 * Only includes templates that change behavior relative to the upstream
 * theme — everything else (GridTemplate, ButtonTemplates, Title/Description,
 * MultiSchema, Array) inherits from `@rjsf/shadcn`.
 *
 * - `ObjectFieldTemplate` adds the flat `ui:rows` authoring API.
 * - `FieldTemplate` paints the required `*` marker in `text-destructive`.
 */
export const appTemplates: Partial<TemplatesType> = {
  FieldTemplate,
  ObjectFieldTemplate,
  WrapIfAdditionalTemplate,
  ButtonTemplates: {
    SubmitButton,
    CopyButton,
    MoveDownButton,
    MoveUpButton,
    RemoveButton,
  } as TemplatesType['ButtonTemplates'],
};
