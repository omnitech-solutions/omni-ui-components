import * as React from 'react';
import { X } from 'lucide-react';

import { cn } from 'lib/utils';
import { inputVariants } from '../Input/Input.variants';

export interface TagInputPrimitiveProps {
  id?: string;
  name?: string;
  value?: string[];
  defaultValue?: string[];
  onChange?: (next: string[]) => void;
  placeholder?: string;
  pattern?: RegExp;
  maxItems?: number;
  commitOnSpace?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  'aria-describedby'?: string;
  'data-testid'?: string;
  className?: string;
}

/** Raw tag input: chips + draft input + commit logic. */
export const TagInputPrimitive = React.forwardRef<HTMLInputElement, TagInputPrimitiveProps>(
  (
    {
      id,
      name,
      value,
      defaultValue,
      onChange,
      placeholder = 'Add tag…',
      pattern,
      maxItems,
      commitOnSpace = false,
      disabled,
      required,
      invalid,
      readOnly,
      className,
      ...rest
    },
    ref,
  ) => {
    const testId = rest['data-testid'] ?? id;
    const [internal, setInternal] = React.useState<string[]>(defaultValue ?? []);
    const isControlled = value !== undefined;
    const current = isControlled ? (value as string[]) : internal;
    const [draft, setDraft] = React.useState('');

    const commit = (next: string[]) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    };

    const commitChip = (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      if (pattern && !pattern.test(trimmed)) return;
      if (current.includes(trimmed)) return;
      if (maxItems !== undefined && current.length >= maxItems) return;
      commit([...current, trimmed]);
    };

    const removeChip = (chip: string) => commit(current.filter((c) => c !== chip));

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
      const isCommitKey = e.key === 'Enter' || e.key === ',' || (commitOnSpace && e.key === ' ');
      if (isCommitKey) {
        if (e.key === ' ' && !draft.trim()) return;
        e.preventDefault();
        commitChip(draft);
        setDraft('');
      } else if (e.key === 'Backspace' && !draft && current.length > 0) {
        e.preventDefault();
        commit(current.slice(0, -1));
      }
    };

    return (
      <div
        data-slot="tag-input"
        data-testid={testId}
        aria-invalid={invalid || undefined}
        className={cn(
          inputVariants({ variant: 'bordered', inputSize: 'default' }),
          'h-auto min-h-[var(--oui-field-height-md)] w-full flex-wrap items-center gap-1.5 px-2 py-1.5 cursor-text',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
        onClick={() => {
          if (id) document.getElementById(id)?.focus();
        }}
      >
        {current.map((chip) => (
          <span
            key={chip}
            data-slot="tag-input-chip"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary"
          >
            {chip}
            {!disabled && !readOnly ? (
              <button
                type="button"
                aria-label={`Remove ${chip}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeChip(chip);
                }}
                className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-transparent border-0 p-0 text-primary cursor-pointer transition-colors hover:bg-red-500/15 hover:text-red-500"
              >
                <X className="size-3.5" strokeWidth={3} />
              </button>
            ) : null}
          </span>
        ))}
        <input
          ref={ref}
          id={id}
          name={name}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (draft) {
              commitChip(draft);
              setDraft('');
            }
          }}
          placeholder={current.length === 0 ? placeholder : ''}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-describedby={rest['aria-describedby']}
          aria-invalid={invalid || undefined}
          className="min-w-[6rem] flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[var(--oui-foreground-placeholder)]"
        />
      </div>
    );
  },
);
TagInputPrimitive.displayName = 'TagInputPrimitive';
