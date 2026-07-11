import * as React from 'react';
import { Check, Search } from 'lucide-react';

import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '../components/ui/command';
import { cn } from 'lib/utils';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import { InputPrimitive } from '../Input/InputPrimitive';
import type { InputProps } from '../Input';

export interface AutoCompleteOption {
  value: string;
  label?: React.ReactNode;
}

export interface AutoCompleteProps extends Omit<InputProps, 'onChange' | 'value'> {
  value?: string;
  onChange?: (next: string) => void;
  options?: AutoCompleteOption[];
}

const optionText = (option: AutoCompleteOption) => {
  if (typeof option.label === 'string') return option.label;
  return option.value;
};

export function AutoComplete({
  id: idProp,
  value = '',
  onChange,
  options = [],
  className,
  label,
  description,
  error,
  required,
  invalid,
  layout = 'vertical',
  wrapperClassName,
  labelClassName,
  placeholder = 'Search…',
  disabled,
  onBlur,
  onFocus,
  ...props
}: AutoCompleteProps) {
  const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
    id: idProp,
    label,
    description,
    error,
    invalid,
    prefix: 'oui-autocomplete',
  });
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const filtered = React.useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option: AutoCompleteOption) => option.value.toLowerCase().includes(query) || optionText(option).toLowerCase().includes(query));
  }, [options, value]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [value, filtered.length]);

  React.useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const commit = React.useCallback(
    (next: string) => {
      onChange?.(next);
      setOpen(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [onChange],
  );

  return (
    <FieldShell
      id={id}
      layout={layout}
      label={label}
      description={description}
      error={error}
      required={required}
      descriptionId={descriptionId}
      errorId={errorId}
      wrapperClassName={wrapperClassName}
      labelClassName={labelClassName}
    >
      <div ref={rootRef} className="relative">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--oui-foreground-muted)]" aria-hidden="true" />
          <InputPrimitive
            {...props}
            ref={inputRef}
            id={id}
            value={value}
            onChange={(next) => {
              onChange?.(next);
              setOpen(true);
            }}
            onFocus={(event) => {
              onFocus?.(event);
              if (!disabled) setOpen(true);
            }}
            onBlur={onBlur}
            invalid={isInvalid}
            disabled={disabled}
            aria-describedby={describedBy}
            aria-required={required || undefined}
            aria-invalid={isInvalid || undefined}
            aria-autocomplete="list"
            aria-expanded={open && filtered.length > 0}
            aria-controls={`${id}-listbox`}
            role="combobox"
            placeholder={placeholder}
            className={cn('pl-9', className)}
            onKeyDown={(event) => {
              if (!filtered.length) return;
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((current) => Math.min(current + 1, filtered.length - 1));
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((current) => Math.max(current - 1, 0));
              } else if (event.key === 'Enter' && open) {
                event.preventDefault();
                const option = filtered[activeIndex];
                if (option) commit(option.value);
              } else if (event.key === 'Escape') {
                setOpen(false);
              }
            }}
          />
        </div>
        {open && filtered.length > 0 ? (
          <div
            id={`${id}-listbox`}
            role="listbox"
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-md border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] shadow-md"
          >
            <Command className="rounded-none border-0 bg-transparent">
              <CommandList className="max-h-64">
                <CommandEmpty>No results.</CommandEmpty>
                <CommandGroup>
                  {filtered.map((option: AutoCompleteOption, index: number) => {
                    const selected = option.value === value;
                    const active = index === activeIndex;
                    return (
                      <CommandItem
                        key={option.value}
                        value={optionText(option)}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          commit(option.value);
                        }}
                        className={cn(
                          'cursor-pointer',
                          active && 'bg-muted/60 text-foreground',
                          selected && 'font-medium text-foreground',
                        )}
                      >
                        <Check className={cn('mr-2 h-4 w-4', selected ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
                        <span>{option.label ?? option.value}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
