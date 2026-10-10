import { cn } from 'lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import type { InputPrimitiveProps } from '../Input/Input.types';
import { InputPrimitive } from '../Input/InputPrimitive';

/** Words of the reveal control. */
export interface PasswordInputLabels {
  show: string;
  hide: string;
}

export const DEFAULT_PASSWORD_INPUT_LABELS: PasswordInputLabels = {
  show: 'Show password',
  hide: 'Hide password',
};

export interface PasswordInputPrimitiveProps extends Omit<InputPrimitiveProps, 'type'> {
  /** Draw the reveal control at the end of the field. Default false on the primitive (a bare password box). */
  toggleable?: boolean;
  /** Whether the password is shown as text. Controlled; leave it out for the control to keep its own state. */
  revealed?: boolean;
  defaultRevealed?: boolean;
  /** Called with the next state when the person shows or hides the password. */
  onRevealedChange?: (revealed: boolean) => void;
  labels?: Partial<PasswordInputLabels>;
  /** Icon of the control while the password is hidden / shown. */
  showIcon?: React.ReactNode;
  hideIcon?: React.ReactNode;
}

/**
 * Bare password input. With `toggleable`, a reveal control sits at the end of the field: it switches the input
 * between `password` and `text`, says which through `aria-pressed`, and leaves focus in the input.
 *
 * @example
 * <PasswordInputPrimitive toggleable value={password} onChange={setPassword} autoComplete="current-password" />
 */
const PasswordInputPrimitiveInner = React.forwardRef<HTMLInputElement, PasswordInputPrimitiveProps>(
  (
    {
      toggleable = false,
      revealed: revealedProp,
      defaultRevealed = false,
      onRevealedChange,
      labels: labelsProp,
      showIcon,
      hideIcon,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [internal, setInternal] = React.useState(defaultRevealed);
    const revealed = revealedProp ?? internal;
    const labels = { ...DEFAULT_PASSWORD_INPUT_LABELS, ...labelsProp };
    const setRefs = (element: HTMLInputElement | null) => {
      inputRef.current = element;
      if (typeof ref === 'function') ref(element);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = element;
    };

    if (!toggleable) {
      return (
        <InputPrimitive
          ref={ref}
          type="password"
          className={className}
          disabled={disabled}
          {...props}
        />
      );
    }

    return (
      <div className="relative flex w-full items-center" data-slot="password-input-wrapper">
        <InputPrimitive
          ref={setRefs}
          type={revealed ? 'text' : 'password'}
          disabled={disabled}
          className={cn('pr-10', className)}
          {...props}
        />
        <button
          type="button"
          data-slot="password-input-toggle"
          aria-label={revealed ? labels.hide : labels.show}
          aria-pressed={revealed}
          aria-controls={props.id}
          disabled={disabled}
          onClick={() => {
            const next = !revealed;
            if (revealedProp === undefined) setInternal(next);
            onRevealedChange?.(next);
            inputRef.current?.focus();
          }}
          className={cn(
            'absolute right-2 inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-[var(--oui-foreground-muted)]',
            'transition-colors hover:text-[var(--oui-foreground)] motion-reduce:transition-none',
            'outline-none focus-visible:ring-2 focus-visible:ring-[var(--oui-border-interactive)]',
            'disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4',
          )}
        >
          {revealed
            ? (hideIcon ?? <EyeOff aria-hidden="true" />)
            : (showIcon ?? <Eye aria-hidden="true" />)}
        </button>
      </div>
    );
  },
);
PasswordInputPrimitiveInner.displayName = 'PasswordInputPrimitive';

export const PasswordInputPrimitive = React.memo(
  PasswordInputPrimitiveInner,
) as typeof PasswordInputPrimitiveInner;
