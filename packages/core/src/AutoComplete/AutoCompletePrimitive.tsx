import { cn } from 'lib/utils';
import { Search } from 'lucide-react';
import * as React from 'react';
import { InputPrimitive } from '../Input/InputPrimitive';
import { useControllableState } from '../lib/use-controllable-state';
import { useStableId } from '../lib/use-stable-id';
import {
  type AutoCompleteOption,
  type AutoCompletePrimitiveProps,
  DEFAULT_AUTOCOMPLETE_LABELS,
} from './AutoComplete.types';

const optionText = (option: AutoCompleteOption) =>
  typeof option.label === 'string' ? option.label : option.value;

/** Next enabled index from `from` in `step` direction, wrapping; -1 when nothing is enabled. */
const nextEnabled = (options: AutoCompleteOption[], from: number, step: 1 | -1) => {
  const count = options.length;
  for (let offset = 1; offset <= count; offset += 1) {
    const start = from < 0 && step === -1 ? count : from;
    const index = (((start + step * offset) % count) + count) % count;
    if (!options[index].disabled) return index;
  }
  return -1;
};

function AutoCompletePrimitiveInner<T extends AutoCompleteOption = AutoCompleteOption>(
  {
    id: idProp,
    value: valueProp,
    defaultValue,
    onChange,
    onSelect,
    options = [],
    filter = true,
    icon,
    labels: labelsProp,
    placeholder,
    disabled,
    readOnly,
    required,
    invalid,
    className,
    onFocus,
    onBlur,
    onKeyDown,
    onClick,
    ...rest
  }: AutoCompletePrimitiveProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const labels = { ...DEFAULT_AUTOCOMPLETE_LABELS, ...labelsProp };
  const fallbackId = useStableId('oui-autocomplete');
  const id = idProp ?? fallbackId;
  const listId = `${id}-listbox`;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [value, setValue] = useControllableState(valueProp, defaultValue ?? '', onChange);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const matches = React.useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!filter || !query) return options;
    return options.filter(
      (option) =>
        option.value.toLowerCase().includes(query) ||
        optionText(option).toLowerCase().includes(query),
    );
  }, [options, value, filter]);

  const canOpen = !disabled && !readOnly;
  const isOpen = open && canOpen;
  const showList = isOpen && matches.length > 0;
  const showEmpty = isOpen && matches.length === 0 && value.trim().length > 0;
  const active = showList && activeIndex < matches.length ? activeIndex : -1;

  React.useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isOpen]);

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const pick = (option: T) => {
    setValue(option.value);
    onSelect?.(option);
    close();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !canOpen) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!matches.length) return;
      event.preventDefault();
      setOpen(true);
      setActiveIndex(nextEnabled(matches, active, event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Enter') {
      if (active < 0) return;
      event.preventDefault();
      pick(matches[active]);
    } else if (event.key === 'Escape') {
      if (!isOpen) return;
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      close();
    }
  };

  const iconNode = icon === undefined ? <Search className="size-4" /> : icon;

  return (
    <div ref={rootRef} data-slot="autocomplete" className="relative w-full">
      {iconNode ? (
        <span
          data-slot="autocomplete-icon"
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center text-[var(--oui-foreground-muted)] [&_svg]:size-4"
        >
          {iconNode}
        </span>
      ) : null}
      <InputPrimitive
        autoComplete="off"
        {...rest}
        ref={ref}
        id={id}
        role="combobox"
        value={value}
        placeholder={placeholder ?? labels.placeholder}
        disabled={disabled}
        readOnly={readOnly}
        invalid={invalid}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={showList}
        aria-controls={showList ? listId : undefined}
        aria-activedescendant={active >= 0 ? `${id}-option-${active}` : undefined}
        aria-required={required || undefined}
        aria-readonly={readOnly || undefined}
        className={cn(iconNode ? 'pl-9' : undefined, className)}
        onChange={(next) => {
          setValue(next);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          setOpen(true);
        }}
        onClick={(event) => {
          onClick?.(event);
          setOpen(true);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          close();
        }}
        onKeyDown={handleKeyDown}
      />
      {showList || showEmpty ? (
        <div
          data-slot="autocomplete-popup"
          className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-[var(--oui-radius-field)] border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] font-[family-name:var(--oui-font-sans)] text-sm text-[var(--oui-foreground)] shadow-md"
        >
          {showList ? (
            <div
              id={listId}
              role="listbox"
              aria-label={labels.suggestions}
              data-slot="autocomplete-list"
              className="max-h-64 overflow-y-auto p-1"
            >
              {matches.map((option, index) => (
                <div
                  key={option.value}
                  id={`${id}-option-${index}`}
                  role="option"
                  tabIndex={-1}
                  aria-selected={index === active}
                  aria-disabled={option.disabled || undefined}
                  data-slot="autocomplete-option"
                  data-active={index === active || undefined}
                  className={cn(
                    'cursor-pointer select-none rounded-[calc(var(--oui-radius-field)-2px)] px-2 py-1.5',
                    'data-[active]:bg-[var(--oui-tone-neutral-bg)]',
                    option.value === value && 'font-medium',
                    option.disabled && 'cursor-not-allowed opacity-50',
                  )}
                  onMouseDown={(event) => {
                    // Keeps focus in the input, so picking never blurs the field.
                    event.preventDefault();
                    if (!option.disabled) pick(option);
                  }}
                  onMouseEnter={() => {
                    if (!option.disabled) setActiveIndex(index);
                  }}
                >
                  {option.label ?? option.value}
                </div>
              ))}
            </div>
          ) : (
            <div
              role="status"
              data-slot="autocomplete-empty"
              className="px-3 py-2 text-[var(--oui-foreground-muted)]"
            >
              {labels.noResults}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Raw Omni AutoComplete primitive: a free-text input (`role="combobox"`) with a suggestion listbox under it.
 * No label, no description, no error row: pair with {@link AutoComplete} when field chrome is needed.
 * The ref and `id` are the input's.
 *
 * @example
 * <AutoCompletePrimitive aria-label="Assignee" value={name} onChange={setName} onSelect={assign} options={people} />
 */
export const AutoCompletePrimitive = React.forwardRef(AutoCompletePrimitiveInner) as (<
  T extends AutoCompleteOption = AutoCompleteOption,
>(
  props: AutoCompletePrimitiveProps<T> & { ref?: React.Ref<HTMLInputElement> },
) => React.ReactElement) & { displayName?: string };
AutoCompletePrimitive.displayName = 'AutoCompletePrimitive';
