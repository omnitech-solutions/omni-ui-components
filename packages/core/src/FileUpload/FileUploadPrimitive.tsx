import * as React from 'react';
import { Upload, X } from 'lucide-react';

import { cn } from 'lib/utils';

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
  ({ id, name, value, onChange, onError, accept, multiple = false, maxSize, maxFiles, disabled, required, invalid, readOnly, className, ...rest }, ref) => {
    const testId = rest['data-testid'] ?? id;
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [dragOver, setDragOver] = React.useState(false);
    const files = value ?? [];

    const commit = (next: File[]) => {
      let filtered = next;
      if (maxSize !== undefined) {
        const oversize = filtered.find((f) => f.size > maxSize);
        if (oversize) onError?.(`${oversize.name} exceeds ${formatBytes(maxSize)} limit`);
        filtered = filtered.filter((f) => f.size <= maxSize);
      }
      if (maxFiles !== undefined && filtered.length > maxFiles) {
        onError?.(`Pick up to ${maxFiles} files`);
        filtered = filtered.slice(0, maxFiles);
      }
      onChange?.(multiple ? [...files, ...filtered].slice(0, maxFiles) : filtered.slice(0, 1));
    };

    const removeFile = (file: File) => onChange?.(files.filter((f) => f !== file));

    return (
      <>
        <div
          data-slot="file-upload"
          data-testid={testId}
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
            'flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center cursor-pointer transition-colors',
            'border-[var(--oui-border-field)] bg-[var(--oui-surface-field)]',
            'hover:border-[var(--oui-border-interactive)] hover:bg-muted/30',
            dragOver && 'border-primary bg-primary/5',
            disabled && 'cursor-not-allowed opacity-50',
            invalid && 'border-[var(--oui-border-invalid)]',
            className,
          )}
        >
          <Upload aria-hidden="true" className="size-6 text-[var(--oui-foreground-muted)]" />
          <div className="text-sm font-medium text-[var(--oui-foreground)]">{dragOver ? 'Drop to upload' : 'Click to browse or drag files here'}</div>
          <div className="text-xs text-[var(--oui-foreground-muted)]">
            {accept ? `Accepted: ${accept}` : 'Any file type'}
            {maxSize ? ` · up to ${formatBytes(maxSize)}` : ''}
          </div>
          <input
            ref={(el) => {
              inputRef.current = el;
              if (typeof ref === 'function') ref(el);
              else if (ref && typeof ref === 'object') (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }}
            id={id}
            name={name}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled || readOnly}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            aria-describedby={rest['aria-describedby']}
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
                <span className="min-w-0 flex-1 truncate text-[var(--oui-foreground)]">{file.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-[var(--oui-foreground-muted)]">{formatBytes(file.size)}</span>
                {!disabled && !readOnly ? (
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file);
                    }}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-transparent border-0 text-red-500 cursor-pointer transition-colors hover:bg-red-500/15"
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
