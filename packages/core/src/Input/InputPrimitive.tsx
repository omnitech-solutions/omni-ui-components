import { cn } from 'lib/utils';
import * as React from 'react';
import type { InputPrimitiveProps } from './Input.types';
import { inputVariants } from './Input.variants';
import { MultilineField } from './MultilineField';

/**
 * Raw Omni input primitive. Renders a styled `<input>` and nothing else.
 * No label, no description, no error row — pair with {@link Input} when
 * field chrome is needed.
 *
 * Wrapped in `React.memo` so RJSF parent re-renders only touch fields whose
 * props actually changed; unchanged sibling fields skip the work entirely.
 *
 * @example
 * <InputPrimitive variant="ghost" value={value} onChange={setValue} />
 *
 * @example
 * <InputPrimitive
 *   variant="bordered"
 *   inputSize="default"
 *   invalid={Boolean(errors.subject)}
 *   commitOnEnter
 *   onBlur={save}
 *   value={subject}
 *   onChange={setSubject}
 * />
 */
const InputPrimitiveInner = React.forwardRef<HTMLInputElement, InputPrimitiveProps>(
  (
    {
      id,
      className,
      variant,
      inputSize,
      invalid,
      commitOnEnter = false,
      value,
      onChange,
      onKeyDown,
      disabled,
      readOnly,
      multiline,
      maxHeight,
      sendOnEnter,
      onSubmit,
      ...rest
    },
    ref,
  ) => {
    const isInvalid = Boolean(invalid);
    const state = disabled ? 'disabled' : readOnly ? 'readonly' : isInvalid ? 'invalid' : 'idle';

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(e);
        if (!commitOnEnter || e.defaultPrevented) return;
        if (e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
      },
      [commitOnEnter, onKeyDown],
    );

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
      },
      [onChange],
    );

    if (multiline) {
      return (
        <MultilineField
          ref={ref as unknown as React.Ref<HTMLTextAreaElement>}
          id={id}
          className={className}
          variant={variant}
          inputSize={inputSize}
          invalid={invalid}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onSubmit={onSubmit}
          disabled={disabled}
          readOnly={readOnly}
          maxHeight={maxHeight}
          sendOnEnter={sendOnEnter}
          {...rest}
        />
      );
    }

    const restAny = rest as Record<string, unknown>;
    const testId =
      typeof restAny['data-testid'] === 'string' && restAny['data-testid'].length > 0
        ? (restAny['data-testid'] as string)
        : id;
    return (
      <input
        ref={ref}
        id={id}
        data-testid={testId}
        data-slot="input"
        data-variant={variant ?? 'bordered'}
        data-input-size={inputSize ?? 'default'}
        data-state={state}
        value={value ?? ''}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={isInvalid || undefined}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(inputVariants({ variant, inputSize }), className)}
        {...rest}
      />
    );
  },
);
InputPrimitiveInner.displayName = 'InputPrimitive';

export const InputPrimitive = React.memo(InputPrimitiveInner) as typeof InputPrimitiveInner;
