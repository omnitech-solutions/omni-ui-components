import { cn } from 'lib/utils';
import * as React from 'react';
import type { InputPrimitiveProps } from './Input.types';
import { inputVariants, multilineClasses } from './Input.variants';

/**
 * The multiline mode of {@link InputPrimitive}: an auto-growing `<textarea>` that follows the same variants as the
 * single-line field (so `variant="panel"` is the see-through dock look).
 *
 * Keys: with `sendOnEnter`, Enter calls `onSubmit(value)` (blank too: the host guards); Shift+Enter is a newline and an IME
 * composition is never interrupted. `commitOnEnter` has no meaning here and is ignored.
 */
export const MultilineField = React.forwardRef<HTMLTextAreaElement, InputPrimitiveProps>(
  (
    {
      id,
      className,
      variant,
      inputSize,
      invalid,
      value,
      onChange,
      onKeyDown,
      onSubmit,
      disabled,
      readOnly,
      maxHeight = 200,
      sendOnEnter = false,
      multiline: _multiline,
      commitOnEnter: _commit,
      type: _type,
      ...rest
    },
    forwarded,
  ) => {
    const area = React.useRef<HTMLTextAreaElement | null>(null);
    const text =
      typeof value === 'string'
        ? value
        : value === undefined || value === null
          ? ''
          : String(value);
    const state = disabled ? 'disabled' : readOnly ? 'readonly' : invalid ? 'invalid' : 'idle';

    // [STATE] Grow with the content up to maxHeight, then scroll inside; shrink again when text is deleted.
    React.useLayoutEffect(() => {
      const element = area.current;
      if (!element) return;
      element.style.height = 'auto';
      element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`;
      element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }, [text, maxHeight]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      (onKeyDown as React.KeyboardEventHandler<HTMLTextAreaElement> | undefined)?.(event);
      // [GUARD] A handler that took the key keeps it; composition and Shift+Enter stay newlines.
      if (event.defaultPrevented || !sendOnEnter || !onSubmit) return;
      if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        // The host decides what a blank value means (a composer stops a running reply on a blank Enter).
        if (!disabled && !readOnly) void onSubmit(text);
      }
    };

    const restAny = rest as Record<string, unknown>;
    const testId =
      typeof restAny['data-testid'] === 'string' && restAny['data-testid'].length > 0
        ? (restAny['data-testid'] as string)
        : id;
    return (
      <textarea
        ref={(node) => {
          area.current = node;
          if (typeof forwarded === 'function') forwarded(node);
          else if (forwarded)
            (forwarded as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }}
        id={id}
        rows={1}
        data-testid={testId}
        data-slot="input"
        data-multiline="true"
        data-variant={variant ?? 'bordered'}
        data-input-size={inputSize ?? 'default'}
        data-state={state}
        value={text}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={invalid || undefined}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(inputVariants({ variant, inputSize }), multilineClasses, className)}
        {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    );
  },
);
MultilineField.displayName = 'MultilineField';
