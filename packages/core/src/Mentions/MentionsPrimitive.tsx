import { cn } from 'lib/utils';
import * as React from 'react';
import { useControllableState } from '../lib/use-controllable-state';
import { useStableId } from '../lib/use-stable-id';
import { TextareaPrimitive } from '../Textarea/TextareaPrimitive';
import {
  DEFAULT_MENTIONS_LABELS,
  type MentionsOption,
  type MentionsPrimitiveProps,
} from './Mentions.types';

/** The mention being typed: `start` is the index of its trigger in the text. */
interface ActiveMention {
  trigger: string;
  query: string;
  start: number;
}

const optionText = (option: MentionsOption) =>
  typeof option.label === 'string' ? option.label : option.value;

/**
 * The mention the caret is in, if any: the run of non-whitespace before the caret must begin with a trigger,
 * so a trigger counts only at the start of the text or after whitespace, and whitespace ends the mention.
 */
const findMention = (text: string, caret: number, triggers: string[]): ActiveMention | null => {
  const before = text.slice(0, caret);
  const start = before.search(/\S*$/);
  const word = before.slice(start);
  const trigger = triggers.find((candidate) => candidate && word.startsWith(candidate));
  return trigger ? { trigger, query: word.slice(trigger.length), start } : null;
};

/** Next enabled index from `from` in `step` direction, wrapping; -1 when nothing is enabled. */
const nextEnabled = (options: MentionsOption[], from: number, step: 1 | -1) => {
  const count = options.length;
  for (let offset = 1; offset <= count; offset += 1) {
    const index = (((from + step * offset) % count) + count) % count;
    if (!options[index].disabled) return index;
  }
  return -1;
};

function MentionsPrimitiveInner<T extends MentionsOption = MentionsOption>(
  {
    id: idProp,
    value: valueProp,
    defaultValue,
    onChange,
    options = [],
    trigger = '@',
    filter = true,
    onMention,
    onSearch,
    labels: labelsProp,
    disabled,
    readOnly,
    required,
    invalid,
    onBlur,
    onKeyDown,
    onKeyUp,
    onClick,
    ...rest
  }: MentionsPrimitiveProps<T>,
  forwardedRef: React.ForwardedRef<HTMLTextAreaElement>,
) {
  const labels = { ...DEFAULT_MENTIONS_LABELS, ...labelsProp };
  const fallbackId = useStableId('oui-mentions');
  const id = idProp ?? fallbackId;
  const listId = `${id}-listbox`;
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const setRefs = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );
  const [value, setValue] = useControllableState(valueProp, defaultValue ?? '', onChange);
  const [mention, setMention] = React.useState<ActiveMention | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const pendingCaret = React.useRef<number | null>(null);

  // After a pick the new text is in the DOM: put the caret after the inserted mention.
  React.useLayoutEffect(() => {
    if (pendingCaret.current === null) return;
    textareaRef.current?.setSelectionRange(pendingCaret.current, pendingCaret.current);
    pendingCaret.current = null;
  });

  const matches = React.useMemo(() => {
    if (!mention) return [];
    const query = mention.query.toLowerCase();
    if (!filter || !query) return options;
    return options.filter(
      (option) =>
        option.value.toLowerCase().includes(query) ||
        optionText(option).toLowerCase().includes(query),
    );
  }, [options, mention, filter]);

  const isOpen = matches.length > 0;
  const active = !isOpen
    ? -1
    : activeIndex >= 0 && activeIndex < matches.length && !matches[activeIndex].disabled
      ? activeIndex
      : nextEnabled(matches, -1, 1);

  /** Re-reads the mention at the caret; tells the host when the query changed. */
  const sync = (text: string) => {
    if (disabled || readOnly) return;
    const caret = textareaRef.current?.selectionStart ?? text.length;
    const triggers = (Array.isArray(trigger) ? [...trigger] : [trigger]).sort(
      (a, b) => b.length - a.length,
    );
    const next = findMention(text, caret, triggers);
    if (next?.query !== mention?.query || next?.trigger !== mention?.trigger) {
      setActiveIndex(0);
      if (next) onSearch?.(next.query, next.trigger);
    }
    setMention(next);
  };

  const pick = (option: T) => {
    if (!mention) return;
    const caret = textareaRef.current?.selectionStart ?? value.length;
    const inserted = `${mention.trigger}${option.value} `;
    pendingCaret.current = mention.start + inserted.length;
    setMention(null);
    setValue(
      value.slice(0, mention.start) + inserted + value.slice(Math.max(caret, mention.start)),
    );
    onMention?.(option, mention.trigger);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !isOpen || event.nativeEvent.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(nextEnabled(matches, active, event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      if (active < 0) return;
      event.preventDefault();
      pick(matches[active]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setMention(null);
    }
  };

  return (
    <div data-slot="mentions" className="relative w-full">
      <TextareaPrimitive
        {...rest}
        ref={setRefs}
        id={id}
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        invalid={invalid}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        // A textbox has no `aria-expanded`: the open list is announced through `aria-controls` and the active option.
        data-open={isOpen ? '' : undefined}
        aria-controls={isOpen ? listId : undefined}
        aria-activedescendant={active >= 0 ? `${id}-option-${active}` : undefined}
        aria-required={required || undefined}
        aria-readonly={readOnly || undefined}
        onChange={(next) => {
          setValue(next);
          sync(next);
        }}
        onKeyDown={handleKeyDown}
        onKeyUp={(event) => {
          onKeyUp?.(event);
          // The caret moved without an edit: the mention it sits in may have changed.
          if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) sync(value);
        }}
        onClick={(event) => {
          onClick?.(event);
          sync(value);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          setMention(null);
        }}
      />
      {isOpen ? (
        <div
          id={listId}
          role="listbox"
          aria-label={labels.suggestions}
          data-slot="mentions-list"
          className="absolute top-full left-0 z-50 mt-1 max-h-64 w-full max-w-xs overflow-y-auto rounded-[var(--oui-radius-field)] border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-1 font-[family-name:var(--oui-font-sans)] text-sm text-[var(--oui-foreground)] shadow-md"
        >
          {matches.map((option, index) => (
            <div
              key={option.value}
              id={`${id}-option-${index}`}
              role="option"
              tabIndex={-1}
              aria-selected={index === active}
              aria-disabled={option.disabled || undefined}
              data-slot="mentions-option"
              data-active={index === active || undefined}
              className={cn(
                'flex cursor-pointer select-none flex-col rounded-[calc(var(--oui-radius-field)-2px)] px-2 py-1.5',
                'data-[active]:bg-[var(--oui-tone-neutral-bg)]',
                option.disabled && 'cursor-not-allowed opacity-50',
              )}
              onMouseDown={(event) => {
                // Keeps focus (and the caret) in the textarea.
                event.preventDefault();
                if (!option.disabled) pick(option);
              }}
              onMouseEnter={() => {
                if (!option.disabled) setActiveIndex(index);
              }}
            >
              <span data-slot="mentions-option-label">{option.label ?? option.value}</span>
              {option.description ? (
                <span
                  data-slot="mentions-option-description"
                  className="text-xs text-[var(--oui-foreground-muted)]"
                >
                  {option.description}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Raw Omni Mentions primitive: a textarea that opens a suggestion listbox under it while a mention is being typed
 * (a trigger at the start of the text or after whitespace, then the query). Picking writes
 * `trigger + option.value + ' '` over the trigger and query. The list is closed when nothing matches.
 * No label, no description, no error row: pair with {@link Mentions}. The ref and `id` are the textarea's.
 *
 * @example
 * <MentionsPrimitive aria-label="Comment" value={text} onChange={setText} onMention={notify} options={people} />
 */
export const MentionsPrimitive = React.forwardRef(MentionsPrimitiveInner) as (<
  T extends MentionsOption = MentionsOption,
>(
  props: MentionsPrimitiveProps<T> & { ref?: React.Ref<HTMLTextAreaElement> },
) => React.ReactElement) & { displayName?: string };
MentionsPrimitive.displayName = 'MentionsPrimitive';
