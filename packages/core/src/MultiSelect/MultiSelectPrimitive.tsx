import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'components/ui/command';
import { Check, ChevronDown, X } from 'lucide-react';

import { cn } from 'lib/utils';
import { inputVariants } from '../Input/Input.variants';
import type { SelectOption } from '../Select';

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
  'aria-describedby'?: string;
  'data-testid'?: string;
  className?: string;
}

/** Raw multi-select: popover trigger + command + chips. */
export const MultiSelectPrimitive = React.forwardRef<HTMLButtonElement, MultiSelectPrimitiveProps>(
  ({ id, options, value = [], onChange, placeholder = 'Select…', searchable = false, maxItems, disabled, required, invalid, className, ...rest }, ref) => {
    const testId = rest['data-testid'] ?? id;
    const [open, setOpen] = React.useState(false);

    const toggle = (val: string) => {
      if (value.includes(val)) onChange?.(value.filter((v) => v !== val));
      else if (maxItems === undefined || value.length < maxItems) onChange?.([...value, val]);
    };
    const removeChip = (val: string) => onChange?.(value.filter((v) => v !== val));

    const selected = options.filter((o) => value.includes(o.value));
    const isPlaceholder = selected.length === 0;

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            id={id}
            type="button"
            disabled={disabled}
            data-slot="multi-select"
            data-testid={testId}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            aria-describedby={rest['aria-describedby']}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={cn(
              inputVariants({ variant: 'bordered', inputSize: 'default' }),
              'h-auto min-h-[var(--oui-field-height-md)] items-center justify-between gap-2 px-2 py-1.5 text-left cursor-pointer disabled:cursor-not-allowed',
              className,
            )}
          >
            <span className={cn('flex flex-1 flex-wrap items-center gap-1', isPlaceholder && 'text-[var(--oui-foreground-placeholder)]')}>
              {isPlaceholder
                ? placeholder
                : selected.map((opt) => (
                    <span key={opt.value} className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      {opt.label}
                      <span
                        role="button"
                        tabIndex={-1}
                        aria-label={`Remove ${typeof opt.label === 'string' ? opt.label : opt.value}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeChip(opt.value);
                        }}
                        className="inline-flex size-3.5 items-center justify-center rounded-full hover:bg-red-500/20 hover:text-red-500"
                      >
                        <X className="size-2.5" strokeWidth={3} />
                      </span>
                    </span>
                  ))}
            </span>
            <ChevronDown
              className={cn('h-3.5 w-3.5 shrink-0 text-[var(--oui-foreground-muted)] transition-transform', open && 'rotate-180')}
              aria-hidden="true"
            />
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            data-testid={`${testId}-popover`}
            className="z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-md border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] text-[var(--oui-foreground)] shadow-md outline-none"
          >
            <Command>
              {searchable ? <CommandInput placeholder="Search…" /> : null}
              <CommandList className="max-h-64">
                <CommandEmpty>No results.</CommandEmpty>
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
                          isSelected && 'bg-muted font-medium text-foreground data-[selected=true]:bg-muted',
                        )}
                      >
                        <Check className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
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
