import { Popover, PopoverContent, PopoverTrigger } from 'components/ui/popover';
import { cn } from 'lib/utils';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import * as React from 'react';
import { inputVariants } from '../Input/Input.variants';
import { useControllableState } from '../lib/use-controllable-state';
import {
  type CascaderOption,
  type CascaderPrimitiveProps,
  DEFAULT_CASCADER_LABELS,
} from './Cascader.types';

const EMPTY_PATH: string[] = [];

/** Where the keyboard is inside the popup: the focused option is the last of `path`. */
interface Navigation {
  path: string[];
  /** The focused option's children column is drawn. */
  expanded: boolean;
}

const childrenOf = <T extends CascaderOption>(option: T): T[] => (option.children ?? []) as T[];
const isEnabled = (option: CascaderOption) => !option.disabled;

/** The options a path names, level by level; stops at the first value that is not in the tree. */
function resolvePath<T extends CascaderOption>(options: T[], path: string[]): T[] {
  const chain: T[] = [];
  let level = options;
  for (const value of path) {
    const option = level.find((candidate) => candidate.value === value);
    if (!option) break;
    chain.push(option);
    level = childrenOf(option);
  }
  return chain;
}

/** Opening lands on the chosen option (as far as it is enabled), else on the first enabled root option. */
function initialNavigation<T extends CascaderOption>(options: T[], value: string[]): Navigation {
  const chain = resolvePath(options, value);
  const firstDisabled = chain.findIndex((option) => option.disabled);
  const reachable = firstDisabled === -1 ? chain : chain.slice(0, firstDisabled);
  if (reachable.length > 0) {
    return { path: reachable.map((option) => option.value), expanded: false };
  }
  const first = options.find(isEnabled);
  return { path: first ? [first.value] : [], expanded: false };
}

const optionClasses = [
  'flex cursor-pointer select-none items-center justify-between gap-3',
  'rounded-sm px-2 py-1.5 text-sm outline-none',
  'text-[var(--oui-foreground)]',
  'hover:bg-[var(--oui-tone-neutral-bg)] focus:bg-[var(--oui-tone-neutral-bg)]',
  'data-[expanded=true]:bg-[var(--oui-tone-neutral-bg)]',
  'aria-selected:font-medium aria-selected:text-[var(--oui-foreground-primary)]',
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent',
].join(' ');

function CascaderPrimitiveInner<T extends CascaderOption = CascaderOption>(
  {
    id,
    name,
    options,
    value,
    defaultValue,
    onChange,
    onClear,
    disabled,
    readOnly,
    required,
    invalid,
    variant,
    inputSize,
    placeholder,
    displaySeparator = ' / ',
    changeOnSelect = false,
    allowClear = false,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    container,
    expandIcon,
    suffixIcon,
    clearIcon,
    labels: labelsProp,
    className,
    'data-testid': dataTestId,
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  }: CascaderPrimitiveProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const labels = { ...DEFAULT_CASCADER_LABELS, ...labelsProp };
  const testId = dataTestId ?? id;
  const part = (suffix: string) => (testId ? `${testId}-${suffix}` : undefined);

  const [path, setPath] = useControllableState<string[]>(value, defaultValue ?? EMPTY_PATH);
  const [isOpen, setIsOpen] = useControllableState<boolean>(openProp, defaultOpen, onOpenChange);
  const locked = Boolean(disabled) || Boolean(readOnly);
  const open = isOpen && !locked;

  // `null` while closed: each opening starts from the chosen path.
  const [navigation, setNavigation] = React.useState<Navigation | null>(null);
  // State, not a ref: the popup mounts after `open` flips, and the focus effect has to run again then.
  const [content, setContent] = React.useState<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const setTriggerRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const current = navigation ?? initialNavigation(options, path);
  const chain = resolvePath(options, current.path);
  const activePath = chain.map((option) => option.value);
  const active = chain.at(-1);
  const columns: T[][] = [options];
  chain.forEach((option, index) => {
    const isFocused = index === chain.length - 1;
    if (childrenOf(option).length > 0 && (!isFocused || current.expanded)) {
      columns.push(childrenOf(option));
    }
  });
  const activeKey = activePath.join('/');

  React.useEffect(() => {
    if (!open) {
      setNavigation(null);
      return;
    }
    if (!content) return;
    // `activeKey` is read so the effect follows the keyboard from option to option.
    const target = activeKey
      ? content.querySelector<HTMLElement>('[data-active="true"]')
      : undefined;
    (target ?? content).focus();
  }, [open, activeKey, content]);

  const requestOpen = (next: boolean) => {
    if (next && locked) return;
    // Hand focus back at once when closing from inside the popup, not after its exit animation.
    if (!next && content?.contains(content.ownerDocument.activeElement)) {
      triggerRef.current?.focus();
    }
    setIsOpen(next);
  };

  const commit = (nextPath: string[], selectedOptions: T[]) => {
    setPath(nextPath);
    onChange?.(nextPath, selectedOptions);
  };

  /** ArrowRight (and Enter on a branch): draw the children column and step onto its first enabled option. */
  const enter = (option: T) => {
    const first = childrenOf(option).find(isEnabled);
    if (first) setNavigation({ path: [...activePath, first.value], expanded: false });
    else if (childrenOf(option).length > 0) setNavigation({ path: activePath, expanded: true });
  };

  const handlePick = (columnIndex: number, option: T) => {
    if (option.disabled) return;
    const nextPath = [...activePath.slice(0, columnIndex), option.value];
    const selectedOptions = [...chain.slice(0, columnIndex), option];
    if (childrenOf(option).length === 0) {
      commit(nextPath, selectedOptions);
      requestOpen(false);
      return;
    }
    setNavigation({ path: nextPath, expanded: true });
    if (changeOnSelect) commit(nextPath, selectedOptions);
  };

  const handlePopupKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const parentPath = activePath.slice(0, -1);
    const enabled = columns[Math.max(chain.length - 1, 0)].filter(isEnabled);
    const at = active ? enabled.indexOf(active) : -1;
    const focusOn = (option: T | undefined) => {
      if (option) setNavigation({ path: [...parentPath, option.value], expanded: false });
    };
    switch (event.key) {
      case 'ArrowDown':
        focusOn(enabled[(at + 1) % enabled.length]);
        break;
      case 'ArrowUp':
        focusOn(enabled[(Math.max(at, 0) - 1 + enabled.length) % enabled.length]);
        break;
      case 'Home':
        focusOn(enabled[0]);
        break;
      case 'End':
        focusOn(enabled.at(-1));
        break;
      case 'ArrowRight':
        if (active) enter(active);
        break;
      case 'ArrowLeft':
        if (chain.length > 1) setNavigation({ path: parentPath, expanded: true });
        break;
      case 'Enter':
      case ' ':
        if (!active) break;
        if (childrenOf(active).length === 0 || changeOnSelect) {
          commit(activePath, chain);
          requestOpen(false);
        } else {
          enter(active);
        }
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    requestOpen(true);
  };

  const handleClear = () => {
    commit([], []);
    onClear?.();
    triggerRef.current?.focus();
  };

  const selected = resolvePath(options, path);
  const hasValue = path.length > 0;
  const showClear = allowClear && hasValue && !locked;
  const state = disabled ? 'disabled' : invalid ? 'invalid' : readOnly ? 'readonly' : 'idle';

  return (
    <Popover open={open} onOpenChange={requestOpen}>
      <div
        data-slot="cascader"
        data-testid={part('root')}
        className={cn('relative w-full', className)}
      >
        <PopoverTrigger asChild>
          <button
            ref={setTriggerRef}
            type="button"
            role="combobox"
            id={id}
            disabled={disabled}
            data-slot="cascader-trigger"
            data-testid={testId}
            data-state={state}
            data-variant={variant ?? 'bordered'}
            data-input-size={inputSize ?? 'default'}
            data-placeholder={!hasValue || undefined}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-readonly={readOnly || undefined}
            aria-required={required || undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            onKeyDown={handleTriggerKeyDown}
            className={cn(
              inputVariants({ variant, inputSize }),
              'cursor-pointer items-center justify-between gap-2 text-left',
              'aria-readonly:cursor-default',
              showClear && 'pr-14',
            )}
          >
            <span
              data-slot="cascader-value"
              className={cn(
                'min-w-0 flex-1 truncate',
                !hasValue && 'text-[var(--oui-foreground-placeholder)]',
              )}
            >
              {hasValue
                ? path.map((segment, index) => (
                    <React.Fragment key={path.slice(0, index + 1).join('/')}>
                      {index > 0 ? (
                        <span data-slot="cascader-separator" className="whitespace-pre">
                          {displaySeparator}
                        </span>
                      ) : null}
                      {selected[index]?.label ?? segment}
                    </React.Fragment>
                  ))
                : (placeholder ?? labels.placeholder)}
            </span>
            <span
              data-slot="cascader-suffix"
              aria-hidden="true"
              className="flex shrink-0 items-center text-[var(--oui-foreground-muted)] [&>svg]:size-3.5"
            >
              {suffixIcon ?? <ChevronDown />}
            </span>
          </button>
        </PopoverTrigger>
        {showClear ? (
          <button
            type="button"
            data-slot="cascader-clear"
            data-testid={part('clear')}
            aria-label={labels.clear}
            onClick={handleClear}
            className={cn(
              'absolute right-8 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center',
              'rounded-full text-[var(--oui-foreground-muted)] outline-none',
              'hover:text-[var(--oui-foreground)]',
              'focus-visible:ring-1 focus-visible:ring-[var(--oui-border-interactive)]',
              '[&>svg]:size-3',
            )}
          >
            {clearIcon ?? <X aria-hidden="true" />}
          </button>
        ) : null}
        {name ? <input type="hidden" name={name} value={path.join('/')} /> : null}
      </div>
      <PopoverContent
        ref={setContent}
        container={container}
        align="start"
        aria-label={labels.popup}
        data-slot="cascader-popup"
        data-testid={part('popup')}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onKeyDown={handlePopupKeyDown}
        className={cn(
          'flex w-auto max-w-[calc(100vw-1rem)] overflow-x-auto p-0',
          'border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] text-[var(--oui-foreground)]',
          'font-[family-name:var(--oui-font-sans)]',
          'motion-reduce:animate-none motion-reduce:transition-none',
        )}
      >
        {options.length === 0 ? (
          <p
            data-slot="cascader-empty"
            className="px-3 py-2 text-sm text-[var(--oui-foreground-muted)]"
          >
            {labels.empty}
          </p>
        ) : (
          columns.map((column, columnIndex) => {
            const columnPath = activePath.slice(0, columnIndex);
            return (
              <div
                key={columnPath.join('/') || 'root'}
                role="listbox"
                aria-label={`${labels.level} ${columnIndex + 1}`}
                data-slot="cascader-column"
                data-testid={part(`column-${columnIndex}`)}
                className={cn(
                  'max-h-64 min-w-32 shrink-0 overflow-y-auto p-1',
                  columnIndex > 0 && 'border-l border-[var(--oui-border-field)]',
                )}
              >
                {column.map((option) => {
                  const optionPath = [...columnPath, option.value];
                  const hasChildren = childrenOf(option).length > 0;
                  const isActive = active === option;
                  const isSelected =
                    path[columnIndex] === option.value &&
                    columnPath.every((segment, index) => path[index] === segment);
                  return (
                    // biome-ignore lint/a11y/useKeyWithClickEvents: the popup handles the keys for the focused option
                    <div
                      key={option.value}
                      role="option"
                      tabIndex={isActive ? 0 : -1}
                      aria-selected={isSelected}
                      aria-disabled={option.disabled || undefined}
                      data-slot="cascader-option"
                      data-testid={part(`option-${optionPath.join('-')}`)}
                      data-active={isActive || undefined}
                      data-expanded={
                        hasChildren ? columns[columnIndex + 1] === option.children : undefined
                      }
                      onClick={() => handlePick(columnIndex, option)}
                      className={optionClasses}
                    >
                      <span data-slot="cascader-option-label" className="truncate">
                        {option.label}
                      </span>
                      {hasChildren ? (
                        <span
                          data-slot="cascader-option-expand"
                          aria-hidden="true"
                          className="flex shrink-0 items-center text-[var(--oui-foreground-muted)] [&>svg]:size-3.5"
                        >
                          {expandIcon ?? <ChevronRight />}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </PopoverContent>
    </Popover>
  );
}

/**
 * The bare cascading picker: a field-like combobox trigger and a popup with one column per open level.
 * The value is the path of option values; chosen options reach `onChange` by reference.
 *
 * @example
 * <CascaderPrimitive aria-label="Stack" options={stack} value={path} onChange={(next) => setPath(next)} />
 */
export const CascaderPrimitive = React.forwardRef(CascaderPrimitiveInner) as (<
  T extends CascaderOption = CascaderOption,
>(
  props: CascaderPrimitiveProps<T> & React.RefAttributes<HTMLButtonElement>,
) => React.ReactElement | null) & { displayName?: string };
CascaderPrimitive.displayName = 'CascaderPrimitive';
