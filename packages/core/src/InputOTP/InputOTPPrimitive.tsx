import * as React from 'react';
import { InputOTP as ShadcnInputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from 'components/ui/input-otp';

import { cn } from 'lib/utils';

export interface InputOTPPrimitiveProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
  length?: number;
  separatorIndex?: number;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  'aria-describedby'?: string;
  'data-testid'?: string;
  className?: string;
}

const SLOT_CLS =
  '!h-11 !w-11 !border !rounded-md !border-[var(--oui-border-field)] text-base font-medium bg-[var(--oui-surface-field)] cursor-text transition-colors hover:!border-[var(--oui-border-interactive)] hover:bg-muted/30 data-[active=true]:!border-[var(--oui-border-interactive)] data-[active=true]:!ring-2 data-[active=true]:!ring-ring/40 data-[active=true]:z-10';

/** Raw OTP grid with no chrome (no label/description/error). */
export const InputOTPPrimitive = React.forwardRef<HTMLInputElement, InputOTPPrimitiveProps>(
  ({ id, name, value, defaultValue, onChange, length = 6, separatorIndex, disabled, required, invalid, className, ...rest }, ref) => {
    const sepAt = separatorIndex ?? Math.floor(length / 2) - 1;
    const testId = rest['data-testid'] ?? id;
    return (
      <ShadcnInputOTP
        ref={ref}
        id={id}
        name={name}
        maxLength={length}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        aria-describedby={rest['aria-describedby']}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        data-slot="input-otp"
        data-testid={testId}
        className={cn(className)}
      >
        <InputOTPGroup className="gap-2">
          {Array.from({ length: Math.max(0, Math.min(sepAt + 1, length)) }).map((_, idx) => (
            <InputOTPSlot key={idx} index={idx} className={SLOT_CLS} />
          ))}
        </InputOTPGroup>
        {sepAt >= 0 && sepAt < length - 1 ? (
          <>
            <InputOTPSeparator />
            <InputOTPGroup className="gap-2">
              {Array.from({ length: length - sepAt - 1 }).map((_, idx) => (
                <InputOTPSlot key={sepAt + 1 + idx} index={sepAt + 1 + idx} className={SLOT_CLS} />
              ))}
            </InputOTPGroup>
          </>
        ) : null}
      </ShadcnInputOTP>
    );
  },
);
InputOTPPrimitive.displayName = 'InputOTPPrimitive';
