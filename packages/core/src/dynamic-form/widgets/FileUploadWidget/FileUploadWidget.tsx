import { FileUploadPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { dataURItoBlob } from '@rjsf/utils';
import * as React from 'react';
import { numberOption, stringOption, widgetField, widgetGroupName } from '../../lib/widgetKit';

export type FileWidgetMode = 'file' | 'data-url' | 'name';

/** A file as RJSF's `data-url` string: `data:<type>;name=<name>;base64,<bytes>`. */
export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () =>
      resolve(
        String(reader.result).replace(';base64', `;name=${encodeURIComponent(file.name)};base64`),
      );
    reader.readAsDataURL(file);
  });

/** What the form holds, as the files the control shows as already attached. */
const toFiles = (value: unknown, mode: FileWidgetMode): File[] =>
  (Array.isArray(value)
    ? value
    : value === undefined || value === null || value === ''
      ? []
      : [value]
  )
    .map((entry) => {
      if (entry instanceof File) return entry;
      if (typeof entry !== 'string') return null;
      if (mode === 'data-url' && entry.startsWith('data:')) {
        try {
          const { blob, name } = dataURItoBlob(entry);
          return new File([blob], name, { type: blob.type });
        } catch {
          return null;
        }
      }
      return new File([], entry);
    })
    .filter((file): file is File => file !== null);

/**
 * `file`: one file, or several for an array schema. The library never uploads: the value leaves through
 * `onSubmit` and the host sends it. `ui:options.mode` says what the form holds:
 *   - `'file'` (default): the real `File` object(s). Validate with Zod (`z.instanceof(File)`).
 *   - `'data-url'`: a `data:` string per file (RJSF's `format: 'data-url'`), for small files and pure JSON.
 *   - `'name'`: the file name(s) only.
 * `ui:options.appearance: 'button'` draws a compact button instead of the drop area.
 * `ui:options.accept`, `maxSize` (bytes) and `maxFiles` are checked by the control; a refused file is reported
 * as the field's error.
 */
export const FileUploadWidget = (props: WidgetProps) => {
  const { id, value, options, schema, onChange } = props;
  const multiple = schema.type === 'array';
  const mode: FileWidgetMode =
    options?.mode === 'data-url' || options?.mode === 'name'
      ? options.mode
      : schema.format === 'data-url' && options?.mode !== 'file'
        ? 'data-url'
        : 'file';
  const files = React.useMemo(() => toFiles(value, mode), [value, mode]);
  const latest = React.useRef({ onChange, value, id });
  latest.current = { onChange, value, id };

  const store = React.useCallback(
    async (next: File[]) => {
      const stored =
        mode === 'file'
          ? next
          : mode === 'name'
            ? next.map((file) => file.name)
            : await Promise.all(next.map(fileToDataUrl));
      latest.current.onChange(multiple ? stored : stored[0], undefined, latest.current.id);
    },
    [mode, multiple],
  );
  // A refusal (too large, too many, wrong type) is the field's error: the value is kept, the message is shown.
  const refuse = React.useCallback((message: string) => {
    latest.current.onChange(
      latest.current.value,
      { __errors: [message] } as never,
      latest.current.id,
    );
  }, []);

  return (
    <FileUploadPrimitive
      {...widgetField(props)}
      {...widgetGroupName(props)}
      multiple={multiple}
      appearance={options?.appearance === 'button' ? 'button' : 'dropzone'}
      value={files}
      accept={stringOption(options, 'accept')}
      maxSize={numberOption(options, 'maxSize')}
      maxFiles={numberOption(options, 'maxFiles') ?? (multiple ? schema.maxItems : undefined)}
      onChange={store}
      onError={refuse}
    />
  );
};
