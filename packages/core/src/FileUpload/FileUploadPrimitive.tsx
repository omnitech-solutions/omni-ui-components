import { cn } from 'lib/utils';
import { Upload, X } from 'lucide-react';
import * as React from 'react';

/** Words of the drop zone, the file list and the refusals. */
export interface FileUploadLabels {
  prompt: string;
  /** The words of the compact button (`appearance="button"`). */
  choose: string;
  dropPrompt: string;
  anyType: string;
  accepted: (accept: string) => string;
  upTo: (size: string) => string;
  remove: (name: string) => string;
  tooLarge: (name: string, size: string) => string;
  tooMany: (max: number) => string;
  wrongType: (name: string) => string;
}

export const DEFAULT_FILE_UPLOAD_LABELS: FileUploadLabels = {
  prompt: 'Click to browse or drag files here',
  choose: 'Choose file',
  dropPrompt: 'Drop to upload',
  anyType: 'Any file type',
  accepted: (accept) => `Accepted: ${accept}`,
  upTo: (size) => `up to ${size}`,
  remove: (name) => `Remove ${name}`,
  tooLarge: (name, size) => `${name} exceeds ${size} limit`,
  tooMany: (max) => `Pick up to ${max} files`,
  wrongType: (name) => `${name} is not an accepted file type`,
};

/** Whether a file matches an `accept` list (`.pdf`, `image/*`, `text/plain`), as the browser's picker would. */
export const fileMatchesAccept = (file: File, accept: string | undefined): boolean => {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  return accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) =>
      rule.startsWith('.')
        ? name.endsWith(rule)
        : rule.endsWith('/*')
          ? file.type.toLowerCase().startsWith(rule.slice(0, -1))
          : file.type.toLowerCase() === rule,
    );
};

export interface FileUploadPrimitiveProps {
  id?: string;
  name?: string;
  value?: File[] | null;
  onChange?: (next: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onError?: (message: string) => void;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  labels?: Partial<FileUploadLabels>;
  /** `dropzone` (default): the large drop area. `button`: a compact button for a dense form; files can still be dropped on it. */
  appearance?: 'dropzone' | 'button';
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'data-testid'?: string;
  className?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/** Raw drop-zone + file list (no chrome). */
export const FileUploadPrimitive = React.forwardRef<HTMLInputElement, FileUploadPrimitiveProps>(
  (
    {
      id,
      name,
      value,
      onChange,
      onError,
      accept,
      multiple = false,
      maxSize,
      maxFiles,
      disabled,
      required,
      invalid,
      readOnly,
      labels: labelsProp,
      appearance = 'dropzone',
      className,
      ...rest
    },
    ref,
  ) => {
    const labels = { ...DEFAULT_FILE_UPLOAD_LABELS, ...labelsProp };
    const testId = rest['data-testid'] ?? id;
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [dragOver, setDragOver] = React.useState(false);
    const files = value ?? [];

    const commit = (next: File[]) => {
      let filtered = next;
      // A dropped file never met the picker's `accept` filter, so it is checked here.
      const refused = filtered.find((f) => !fileMatchesAccept(f, accept));
      if (refused) onError?.(labels.wrongType(refused.name));
      filtered = filtered.filter((f) => fileMatchesAccept(f, accept));
      if (maxSize !== undefined) {
        const oversize = filtered.find((f) => f.size > maxSize);
        if (oversize) onError?.(labels.tooLarge(oversize.name, formatBytes(maxSize)));
        filtered = filtered.filter((f) => f.size <= maxSize);
      }
      if (maxFiles !== undefined && filtered.length > maxFiles) {
        onError?.(labels.tooMany(maxFiles));
        filtered = filtered.slice(0, maxFiles);
      }
      onChange?.(multiple ? [...files, ...filtered].slice(0, maxFiles) : filtered.slice(0, 1));
    };

    const removeFile = (file: File) => onChange?.(files.filter((f) => f !== file));

    return (
      <>
        <div
          data-slot="file-upload"
          data-appearance={appearance}
          data-testid={testId}
          // The drop zone is the control a keyboard and a screen reader meet: a button that opens the picker.
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || readOnly || undefined}
          aria-label={rest['aria-label']}
          aria-labelledby={rest['aria-labelledby']}
          aria-describedby={rest['aria-describedby']}
          aria-invalid={invalid || undefined}
          data-readonly={readOnly && !disabled ? '' : undefined}
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget || disabled || readOnly) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            if (disabled || readOnly) return;
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            if (disabled || readOnly) return;
            e.preventDefault();
            setDragOver(false);
            const dropped = Array.from(e.dataTransfer.files ?? []);
            if (dropped.length) commit(dropped);
          }}
          onClick={() => !disabled && !readOnly && inputRef.current?.click()}
          className={cn(
            appearance === 'button'
              ? 'inline-flex w-fit items-center gap-2 rounded-[var(--oui-radius-field)] border px-3 h-[var(--oui-field-height-md)] cursor-pointer transition-colors'
              : 'flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center cursor-pointer transition-colors',
            'border-[var(--oui-border-field)] bg-[var(--oui-surface-field)]',
            'outline-none focus-visible:border-[var(--oui-border-interactive)]',
            readOnly && !disabled
              ? 'cursor-default'
              : 'hover:border-[var(--oui-border-interactive)] hover:bg-muted/30',
            dragOver && 'border-primary bg-primary/5',
            disabled && 'cursor-not-allowed opacity-50',
            invalid && 'border-[var(--oui-border-invalid)]',
            className,
          )}
        >
          <Upload
            aria-hidden="true"
            className={cn(
              'text-[var(--oui-foreground-muted)]',
              appearance === 'button' ? 'size-4' : 'size-6',
            )}
          />
          <div className="text-sm font-medium text-[var(--oui-foreground)]">
            {dragOver ? labels.dropPrompt : appearance === 'button' ? labels.choose : labels.prompt}
          </div>
          {appearance === 'button' ? null : (
            <div className="text-xs text-[var(--oui-foreground-muted)]">
              {accept ? labels.accepted(accept) : labels.anyType}
              {maxSize ? ` · ${labels.upTo(formatBytes(maxSize))}` : ''}
            </div>
          )}
          <input
            ref={(el) => {
              inputRef.current = el;
              if (typeof ref === 'function') ref(el);
              else if (ref && typeof ref === 'object')
                (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }}
            id={id}
            name={name}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled || readOnly}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              if (picked.length) commit(picked);
              e.target.value = '';
            }}
            className="hidden"
          />
        </div>
        {files.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {files.map((file) => (
              <li
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="flex items-center justify-between gap-2 rounded-md border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] px-3 py-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate text-[var(--oui-foreground)]">
                  {file.name}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-[var(--oui-foreground-muted)]">
                  {formatBytes(file.size)}
                </span>
                {!disabled && !readOnly ? (
                  <button
                    type="button"
                    aria-label={labels.remove(file.name)}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file);
                    }}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-transparent border-0 text-[var(--oui-border-invalid)] cursor-pointer transition-colors hover:bg-muted/40"
                  >
                    <X className="size-4" strokeWidth={2.5} />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </>
    );
  },
);
FileUploadPrimitive.displayName = 'FileUploadPrimitive';
