import * as PopoverPrimitive from '@radix-ui/react-popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'components/ui/command';
import { cn } from 'lib/utils';
import { Check, ChevronDown, X } from 'lucide-react';
import * as React from 'react';
import type { InputSize, InputVariant } from '../Input/Input.variants';
import { inputVariants } from '../Input/Input.variants';
import type { SelectOption } from '../Select';

export interface MultiSelectLabels {
  searchPlaceholder: string;
  noResults: string;
  /** Accessible name of a chip's remove control. */
  remove: (label: string) => string;
}

export const DEFAULT_MULTI_SELECT_LABELS: MultiSelectLabels = {
  searchPlaceholder: 'Search…',
  noResults: 'No results.',
  remove: (label) => `Remove ${label}`,
};

export interface MultiSelectPrimitiveProps {
  id?: string;
  name?: string;
  options: SelectOption[];
  value?: string[];
  onChange?: (next: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  maxItems?: number;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** Read-only: stays focusable and readable, is announced as read-only, and cannot be changed. `disabled` wins. */
  readOnly?: boolean;
  /** The look of the field box. Default `bordered`. */
  variant?: InputVariant;
  /** The height of the field box. Default `default`. */
  inputSize?: InputSize;
  /** Words drawn or spoken by the control. */
  labels?: Partial<MultiSelectLabels>;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'data-testid'?: string;
  className?: string;
}

const MIN_HEIGHT: Record<InputSize, string> = {
  sm: 'min-h-[var(--oui-field-height-sm)]',
  default: 'min-h-[var(--oui-field-height-md)]',
  md: 'min-h-[var(--oui-field-height-lg)]',
  lg: 'min-h-[var(--oui-field-height-xl)]',
};

/** Raw multi-select: popover trigger + command + chips. */
export const MultiSelectPrimitive = React.forwardRef<HTMLButtonElement, MultiSelectPrimitiveProps>(
  (
    {
      id,
      options,
      value = [],
      onChange,
      placeholder = 'Select…',
      searchable = false,
      maxItems,
      disabled,
      required,
      invalid,
      readOnly,
      variant = 'bordered',
      inputSize = 'default',
      labels: labelsProp,
      className,
      ...rest
    },
    ref,
  ) => {
    const testId = rest['data-testid'] ?? id;
    const [open, setOpen] = React.useState(false);
    const listRef = React.useRef<HTMLDivElement>(null);
    const isReadOnly = Boolean(readOnly) && !disabled;
    const labels = { ...DEFAULT_MULTI_SELECT_LABELS, ...labelsProp };

    const toggle = (val: string) => {
      if (value.includes(val)) onChange?.(value.filter((v) => v !== val));
      else if (maxItems === undefined || value.length < maxItems) onChange?.([...value, val]);
    };
    const removeChip = (val: string) => onChange?.(value.filter((v) => v !== val));

    const selected = options.filter((o) => value.includes(o.value));
    const isPlaceholder = selected.length === 0;

    return (
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(o) => !disabled && !isReadOnly && setOpen(o)}
      >
        {/* The field box holds the chips and the trigger side by side: a button cannot hold the chips' buttons. */}
        <PopoverPrimitive.Anchor asChild>
          <div
            data-slot="multi-select-field"
            data-variant={variant}
            data-input-size={inputSize}
            data-state={
              disabled ? 'disabled' : isReadOnly ? 'readonly' : invalid ? 'invalid' : 'idle'
            }
            aria-disabled={disabled || undefined}
            className={cn(
              inputVariants({ variant, inputSize }),
              'h-auto flex-wrap items-center gap-1 px-2 py-1.5',
              'focus-within:border-[var(--oui-border-interactive)]',
              MIN_HEIGHT[inputSize ?? 'default'],
              disabled && 'cursor-not-allowed opacity-50',
              isReadOnly && 'hover:border-[var(--oui-border-field)]',
              className,
            )}
          >
            {selected.map((opt) => {
              const name = typeof opt.label === 'string' ? opt.label : opt.value;
              return (
                <span
                  key={opt.value}
                  data-slot="multi-select-chip"
                  className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-[color:var(--oui-tone-accent-fg)]"
                >
                  {opt.label}
                  {isReadOnly || disabled ? null : (
                    <button
                      type="button"
                      aria-label={labels.remove(name)}
                      onClick={() => removeChip(opt.value)}
                      className="inline-flex size-3.5 cursor-pointer items-center justify-center rounded-full outline-none hover:text-[var(--oui-border-invalid)] focus-visible:ring-2 focus-visible:ring-[var(--oui-border-interactive)]"
                    >
                      <X className="size-2.5" strokeWidth={3} aria-hidden="true" />
                    </button>
                  )}
                </span>
              );
            })}
            <PopoverPrimitive.Trigger asChild>
              <button
                ref={ref}
                id={id}
                type="button"
                disabled={disabled}
                data-slot="multi-select"
                data-testid={testId}
                data-variant={variant}
                data-input-size={inputSize}
                data-readonly={isReadOnly ? '' : undefined}
                aria-invalid={invalid || undefined}
                // A button has no `aria-readonly`: a read-only select is `aria-disabled` and stays focusable.
                aria-disabled={isReadOnly || undefined}
                aria-label={rest['aria-label']}
                aria-labelledby={rest['aria-labelledby']}
                aria-describedby={rest['aria-describedby']}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={cn(
                  'flex min-w-8 flex-1 cursor-pointer items-center justify-between gap-2 self-stretch border-0 bg-transparent p-0 text-left text-inherit outline-none disabled:cursor-not-allowed',
                  isReadOnly && 'cursor-default',
                )}
              >
                {isPlaceholder ? (
                  <span className="text-[var(--oui-foreground-placeholder)]">{placeholder}</span>
                ) : (
                  // The chips are beside the button; its own name still says what is chosen.
                  <span className="sr-only">
                    {selected
                      .map((opt) => (typeof opt.label === 'string' ? opt.label : opt.value))
                      .join(', ')}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    'ml-auto h-3.5 w-3.5 shrink-0 text-[var(--oui-foreground-muted)] transition-transform motion-reduce:transition-none',
                    open && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>
            </PopoverPrimitive.Trigger>
          </div>
        </PopoverPrimitive.Anchor>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            data-testid={`${testId}-popover`}
            // With no search box nothing inside takes focus, and the list would not hear the arrow keys.
            onOpenAutoFocus={(event) => {
              if (searchable) return;
              event.preventDefault();
              listRef.current?.focus();
            }}
            className="z-50 w-[var(--radix-popper-anchor-width)] overflow-hidden rounded-md border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] text-[var(--oui-foreground)] shadow-md outline-none"
          >
            <Command ref={listRef} tabIndex={-1} className="outline-none">
              {searchable ? <CommandInput placeholder={labels.searchPlaceholder} /> : null}
              <CommandList className="max-h-64">
                <CommandEmpty>{labels.noResults}</CommandEmpty>
                <CommandGroup>
                  {options.map((opt) => {
                    const isSelected = value.includes(opt.value);
                    return (
                      <CommandItem
                        key={opt.value}
                        value={typeof opt.label === 'string' ? opt.label : opt.value}
                        disabled={opt.disabled}
                        onSelect={() => toggle(opt.value)}
                        data-testid={`${testId}-option-${opt.value}`}
                        data-current={isSelected || undefined}
                        className={cn(
                          'cursor-pointer',
                          'data-[selected=true]:bg-muted/60 data-[selected=true]:text-foreground',
                          isSelected &&
                            'bg-muted font-medium text-foreground data-[selected=true]:bg-muted',
                        )}
                      >
                        <Check
                          className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
                          aria-hidden="true"
                        />
                        {opt.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  },
);
MultiSelectPrimitive.displayName = 'MultiSelectPrimitive';
