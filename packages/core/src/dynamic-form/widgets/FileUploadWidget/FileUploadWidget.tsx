import * as React from 'react';
import type { WidgetProps } from '@rjsf/utils';

import { FileUploadPrimitive } from '@oc-tech/omni-ui-components';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/**
 * RJSF FileUpload widget — emits file.name strings (placeholder behavior).
 * Real uploads require feature code to override onChange.
 */
export const FileUploadWidget = (props: WidgetProps) => {
  const { id, disabled, readonly, rawErrors, required, options, schema } = props;
  const multiple = schema.type === 'array';
  const { onChange } = useStableRjsfCallbacks<File[]>(props, (next) => {
    const names = (next as File[]).map((f) => f.name);
    return multiple ? names : names[0];
  });

  if (options?.mode !== 'name') {
    return (
      <div
        id={id}
        data-slot="file-upload-placeholder"
        role="note"
        className="rounded-md border border-dashed border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-3 text-xs text-[var(--oui-foreground-muted)]"
      >
        FileUpload widget is not wired for upload yet — set <code>ui:options.mode: &apos;name&apos;</code> to acknowledge the placeholder behavior.
      </div>
    );
  }

  return (
    <FileUploadPrimitive
      id={id}
      multiple={multiple}
      accept={(options?.accept as string | undefined) ?? undefined}
      maxSize={(options?.maxSize as number | undefined) ?? undefined}
      maxFiles={(options?.maxFiles as number | undefined) ?? undefined}
      required={required}
      disabled={disabled || readonly}
      invalid={Boolean(rawErrors?.length)}
      onChange={onChange}
    />
  );
};
