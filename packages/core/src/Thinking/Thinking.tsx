import { useControllableState } from 'lib/use-controllable-state';

import { cn } from 'lib/utils';
import * as React from 'react';
import type { ThinkingLabels, ThinkingProps } from './Thinking.types';
import {
  thinkingBodyClasses,
  thinkingButtonClasses,
  thinkingSpinnerClasses,
} from './Thinking.variants';

/** English strings of {@link Thinking}. */
export const DEFAULT_THINKING_LABELS: ThinkingLabels = {
  thinking: 'Thinking…',
  thought: 'Thought',
  thoughtFor: 'Thought for {n}s',
};

/**
 * Omni Thinking: the model's reasoning as a disclosure. While `streaming` it shows a spinner and `Thinking…`; after,
 * your `icon` and `Thought for Ns` (or `Thought` when no duration is known). The header is a button
 * (`aria-expanded`) that shows or hides the text. Open state is controlled (`open`) or kept inside.
 *
 * Slots: `data-slot="thinking" | "thinking-toggle" | "thinking-body"`.
 *
 * @example
 * <Thinking streaming={running && !text} seconds={4} text={reasoning} icon={<Brain />} chevron={<ChevronDown />} />
 */
export const Thinking = React.forwardRef<HTMLDivElement, ThinkingProps>(
  (
    {
      text,
      streaming = false,
      seconds,
      open,
      defaultOpen = false,
      onOpenChange,
      icon,
      spinner,
      chevron,
      labels: labelOverrides,
      className,
      ...rest
    },
    ref,
  ) => {
    const labels = { ...DEFAULT_THINKING_LABELS, ...labelOverrides };
    const [expanded, setExpanded] = useControllableState(open, defaultOpen, onOpenChange);
    const bodyId = React.useId();
    const heading = streaming
      ? labels.thinking
      : seconds !== undefined
        ? labels.thoughtFor.replace('{n}', String(Math.max(1, Math.round(seconds))))
        : labels.thought;
    return (
      <div
        ref={ref}
        data-slot="thinking"
        data-streaming={streaming ? 'true' : undefined}
        className={cn('flex min-w-0 flex-col items-start', className)}
        {...rest}
      >
        <button
          type="button"
          data-slot="thinking-toggle"
          aria-expanded={expanded}
          aria-controls={expanded ? bodyId : undefined}
          className={thinkingButtonClasses}
          onClick={() => setExpanded(!expanded)}
        >
          {streaming ? (
            (spinner ?? (
              <span
                aria-hidden="true"
                data-slot="thinking-spinner"
                className={thinkingSpinnerClasses}
              />
            ))
          ) : icon ? (
            <span aria-hidden="true" className="inline-flex">
              {icon}
            </span>
          ) : null}
          <span>{heading}</span>
          {chevron ? (
            <span
              aria-hidden="true"
              className={cn(
                'inline-flex transition-transform motion-reduce:transition-none',
                expanded && 'rotate-180',
              )}
            >
              {chevron}
            </span>
          ) : null}
        </button>
        {expanded ? (
          <div id={bodyId} data-slot="thinking-body" className={thinkingBodyClasses}>
            {text}
          </div>
        ) : null}
      </div>
    );
  },
);
Thinking.displayName = 'Thinking';
