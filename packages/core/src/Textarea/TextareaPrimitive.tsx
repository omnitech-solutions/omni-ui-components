import * as React from 'react';

import { cn } from 'lib/utils';
import { textareaVariants } from './Textarea.variants';
import type { TextareaPrimitiveProps } from './Textarea.types';

/**
 * Raw Omni textarea primitive. Renders a styled `<textarea>` and nothing
 * else. No label, no description, no error row — pair with {@link Textarea}
 * when field chrome is needed.
 *
 * Wrapped in `React.memo` so RJSF parent re-renders only touch fields whose
 * props actually changed; unchanged sibling fields skip the work entirely.
 *
 * @example
 * <TextareaPrimitive variant="ghost" value={value} onChange={setValue} />
 *
 * @example
 * <TextareaPrimitive
 *   variant="bordered"
 *   textareaSize="default"
 *   rows={6}
 *   invalid={Boolean(errors.message)}
 *   onChange={setMessage}
 *   value={message}
 * />
 */
const TextareaPrimitiveInner = React.forwardRef<HTMLTextAreaElement, TextareaPrimitiveProps>(
  ({ id, className, variant, textareaSize, invalid, rows = 5, value, onChange, disabled, readOnly, ...rest }, ref) => {
    const isInvalid = Boolean(invalid);
    const state = disabled ? 'disabled' : readOnly ? 'readonly' : isInvalid ? 'invalid' : 'idle';

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e.target.value);
      },
      [onChange],
    );

    const restAny = rest as Record<string, unknown>;
    const testId = typeof restAny['data-testid'] === 'string' && restAny['data-testid'].length > 0 ? (restAny['data-testid'] as string) : id;
    return (
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        data-testid={testId}
        data-slot="textarea"
        data-variant={variant ?? 'bordered'}
        data-textarea-size={textareaSize ?? 'default'}
        data-state={state}
        value={value ?? ''}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={isInvalid || undefined}
        onChange={handleChange}
        className={cn(textareaVariants({ variant, textareaSize }), className)}
        {...rest}
      />
    );
  },
);
TextareaPrimitiveInner.displayName = 'TextareaPrimitive';

export const TextareaPrimitive = React.memo(TextareaPrimitiveInner) as typeof TextareaPrimitiveInner;
