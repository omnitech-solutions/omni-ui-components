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
import { Check, ChevronDown } from 'lucide-react';
import * as React from 'react';
import type { SelectPrimitiveProps } from './Select.types';
import { selectVariants } from './Select.variants';

/**
 * Raw Omni Select primitive — a searchable Popover + Command combobox
 * that mirrors `@rjsf/shadcn`'s `FancySelect` look (chevron trigger,
 * search input, scrollable list, checkmark on the selected row). Renders
 * a hidden native `<select>` for native form-submit + a11y, so the
 * controlled `value`/`onChange` contract matches Input + Textarea.
 *
 * Wrapped in `React.memo` so RJSF parent re-renders only touch fields
 * whose props actually changed.
 *
 * @example
 * <SelectPrimitive
 *   options={[{ value: 'US', label: 'United States' }, …]}
 *   placeholder="Select country…"
 *   value={country}
 *   onChange={setCountry}
 * />
 */
const SelectPrimitiveInner = React.forwardRef<HTMLSelectElement, SelectPrimitiveProps>(
  (
    {
      id,
      className,
      variant,
      selectSize: selectSizeProp,
      inputSize,
      invalid,
      readOnly,
      options,
      placeholder = 'Select…',
      searchable = false,
      footerAction,
      value,
      onChange,
      onBlur,
      onFocus,
      disabled,
      autoFocus,
      ...rest
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const selectSize = selectSizeProp ?? inputSize;
    const isReadOnly = Boolean(readOnly) && !disabled;
    const footerLink = React.useRef<HTMLAnchorElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);
    const isInvalid = Boolean(invalid);
    const state = disabled ? 'disabled' : isReadOnly ? 'readonly' : isInvalid ? 'invalid' : 'idle';
    const isPlaceholder = !value;
    const selected = options.find((o) => o.value === value);

    const restAny = rest as Record<string, unknown>;
    const testId =
      typeof restAny['data-testid'] === 'string' && restAny['data-testid'].length > 0
        ? (restAny['data-testid'] as string)
        : id;

    const handlePick = (next: string) => {
      onChange?.(next);
      setOpen(false);
    };

    /* Partition options into [{ group, items }]. Options without a group
     * land in a single un-headed leading section so existing flat lists
     * render identically. */
    const grouped = React.useMemo(() => {
      const buckets = new Map<string | null, typeof options>();
      for (const opt of options) {
        const key = (opt.group ?? null) as string | null;
        const arr = buckets.get(key);
        if (arr) arr.push(opt);
        else buckets.set(key, [opt]);
      }
      return Array.from(buckets.entries()).map(([heading, items]) => ({ heading, items }));
    }, [options]);

    // The library never navigates: an action with an `href` is a real link, activated as a link.
    const handleFooter = () => {
      if (footerAction?.onSelect) footerAction.onSelect();
      else footerLink.current?.click();
      setOpen(false);
    };

    return (
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(o) => !disabled && !isReadOnly && setOpen(o)}
      >
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            id={id}
            disabled={disabled}
            data-testid={testId}
            data-slot="select"
            data-variant={variant ?? 'bordered'}
            data-select-size={selectSize ?? 'default'}
            data-state={state}
            data-placeholder={isPlaceholder || undefined}
            data-open={open || undefined}
            aria-invalid={isInvalid || undefined}
            // A button has no `aria-readonly`: a read-only select is `aria-disabled` and stays focusable.
            aria-disabled={isReadOnly || undefined}
            data-readonly={isReadOnly ? '' : undefined}
            aria-describedby={(rest as { 'aria-describedby'?: string })['aria-describedby']}
            aria-haspopup="listbox"
            aria-expanded={open}
            autoFocus={autoFocus}
            onBlur={onBlur as never}
            onFocus={onFocus as never}
            className={cn(
              selectVariants({ variant, selectSize }),
              'items-center justify-between bg-none pr-3 text-left',
              isReadOnly && 'cursor-default hover:border-[var(--oui-border-field)]',
              className,
            )}
          >
            <span
              className={cn(
                'truncate',
                isPlaceholder && 'text-[var(--oui-foreground-placeholder)]',
              )}
            >
              {selected?.label ?? placeholder}
            </span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 shrink-0 text-[var(--oui-foreground-muted)] transition-transform',
                open && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            data-testid={`${testId}-popover`}
            // With no search box nothing inside takes focus, and the list would not hear the arrow keys:
            // focus goes to the list itself.
            onOpenAutoFocus={(event) => {
              if (searchable) return;
              event.preventDefault();
              listRef.current?.focus();
            }}
            className="z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-md border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] text-[var(--oui-foreground)] shadow-md outline-none"
          >
            <Command ref={listRef} tabIndex={-1} className="outline-none">
              {searchable ? <CommandInput placeholder="Search…" /> : null}
              <CommandList className="max-h-64">
                <CommandEmpty>No results.</CommandEmpty>
                {grouped.map(({ heading, items }) => (
                  <CommandGroup
                    key={heading ?? '__ungrouped__'}
                    heading={
                      heading ? (
                        <span
                          data-testid={`${testId}-group-${heading}`}
                          className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {heading}
                        </span>
                      ) : undefined
                    }
                  >
                    {items.map((opt) => {
                      const isSelected = opt.value === value;
                      return (
                        <CommandItem
                          key={opt.value}
                          value={opt.label}
                          disabled={opt.disabled}
                          onSelect={() => handlePick(opt.value)}
                          data-testid={`${testId}-option-${opt.value}`}
                          data-current={isSelected || undefined}
                          className={cn(
                            'cursor-pointer',
                            'data-[selected=true]:bg-muted/60 data-[selected=true]:text-foreground',
                            isSelected &&
                              'bg-muted font-medium text-foreground data-[selected=true]:bg-muted',
                          )}
                        >
                          {opt.color ? (
                            <span
                              aria-hidden="true"
                              className="mr-2 inline-block size-2 rounded-full"
                              style={{ backgroundColor: opt.color }}
                            />
                          ) : null}
                          {!opt.color ? (
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                isSelected ? 'opacity-100' : 'opacity-0',
                              )}
                              aria-hidden="true"
                            />
                          ) : null}
                          <span className="flex flex-col">
                            <span>{opt.label}</span>
                            {opt.description ? (
                              <span className="text-xs text-muted-foreground">
                                {opt.description}
                              </span>
                            ) : null}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                ))}
                {footerAction ? (
                  <CommandGroup>
                    <CommandItem
                      key="__footer__"
                      value={`__footer__${footerAction.label}`}
                      onSelect={handleFooter}
                      data-testid={`${testId}-footer-action`}
                      className="cursor-pointer border-t border-border text-[color:var(--oui-foreground-primary)] data-[selected=true]:bg-muted/60"
                    >
                      {footerAction.href ? (
                        <a
                          ref={footerLink}
                          href={footerAction.href}
                          tabIndex={-1}
                          className="block w-full text-inherit no-underline"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {footerAction.label}
                        </a>
                      ) : (
                        footerAction.label
                      )}
                    </CommandItem>
                  </CommandGroup>
                ) : null}
              </CommandList>
            </Command>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
        {/* Hidden native <select> so form data + native submit + tests can read the value. */}
        <select
          ref={ref}
          aria-hidden="true"
          tabIndex={-1}
          name={(rest as { name?: string }).name}
          value={value ?? ''}
          onChange={() => undefined}
          className="sr-only"
        >
          {placeholder ? (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
      </PopoverPrimitive.Root>
    );
  },
);
SelectPrimitiveInner.displayName = 'SelectPrimitive';

export const SelectPrimitive = React.memo(SelectPrimitiveInner) as typeof SelectPrimitiveInner;
