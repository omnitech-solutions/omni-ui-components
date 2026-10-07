import { cn } from 'lib/utils';
import * as React from 'react';
import type { SuggestionItem, SuggestionsProps } from './Suggestions.types';
import { suggestionChipVariants } from './Suggestions.variants';

/**
 * Omni Suggestions: follow-up chips under a finished reply. Plain strings or `{ id, label }`; choosing one calls
 * `onSelect(label, item)` (the host sends it as the next message). The icon is a node you pass in.
 *
 * Slots: `data-slot="suggestions" | "suggestions-chip"`.
 *
 * @example
 * <Suggestions items={['Show a test', 'Explain the complexity']} icon={<CornerDownRight />} onSelect={send} />
 */
const SuggestionsImpl = React.forwardRef<HTMLDivElement, SuggestionsProps>(
  (
    {
      items,
      onSelect,
      renderItem,
      icon,
      disabled = false,
      layout = 'column',
      label = 'Follow-up suggestions',
      className,
      ...rest
    },
    ref,
  ) => {
    if (items.length === 0 || !onSelect) return null;
    return (
      <div
        ref={ref}
        role="group"
        aria-label={label}
        data-slot="suggestions"
        data-layout={layout}
        className={cn(
          'flex gap-1.5',
          layout === 'column' ? 'flex-col items-start' : 'flex-wrap',
          className,
        )}
        {...rest}
      >
        {items.map((item, index) => {
          return (
            <button
              key={item.id}
              type="button"
              data-slot="suggestions-chip"
              disabled={disabled}
              className={suggestionChipVariants()}
              onClick={() => onSelect(item, index)}
            >
              {icon ? <span aria-hidden="true">{icon}</span> : null}
              <span className="min-w-0">{renderItem ? renderItem(item, index) : item.label}</span>
            </button>
          );
        })}
      </div>
    );
  },
);
SuggestionsImpl.displayName = 'Suggestions';

/** Generic over the item type: an extended item flows to every callback and slot, by reference. */
export const Suggestions = SuggestionsImpl as unknown as <
  T extends SuggestionItem = SuggestionItem,
>(
  props: SuggestionsProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
