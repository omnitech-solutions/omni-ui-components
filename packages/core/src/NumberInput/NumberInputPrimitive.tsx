import * as React from 'react';

import { cn } from 'lib/utils';
import { inputVariants } from '../Input/Input.variants';
import type { NumberInputPrimitiveProps } from './NumberInput.types';

const stripFormatting = (s: string): string => s.replace(/[^\d.-]/g, '');

const formatNumber = (n: number | null, opts: { decimals?: number; thousandSeparator?: boolean; locale?: string }): string => {
  if (n === null || Number.isNaN(n)) return '';
  if (opts.thousandSeparator) {
    return new Intl.NumberFormat(opts.locale, {
      minimumFractionDigits: opts.decimals,
      maximumFractionDigits: opts.decimals,
    }).format(n);
  }
  return opts.decimals !== undefined ? n.toFixed(opts.decimals) : String(n);
};

/**
 * Raw Omni NumberInput primitive — formatted numeric input with
 * optional prefix / suffix, thousand separators, and decimal control.
 *
 * Uncontrolled internally (raw text state) so the user can type a partial
 * value like `"-"` or `"1."` without it getting clobbered. Emits a
 * parsed `number | null` via `onChange`.
 *
 * @example
 * <NumberInputPrimitive value={amount} onChange={setAmount} prefix="$" thousandSeparator />
 */
const NumberInputPrimitiveInner = React.forwardRef<HTMLInputElement, NumberInputPrimitiveProps>(
  (
    {
      id,
      name,
      className,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      min,
      max,
      step,
      decimals,
      thousandSeparator,
      locale,
      prefix,
      suffix,
      placeholder,
      disabled,
      required,
      invalid,
      readOnly,
      'aria-describedby': ariaDescribedBy,
      'aria-label': ariaLabel,
      ...rest
    },
    ref,
  ) => {
    const restAny = rest as Record<string, unknown>;
    const testId = typeof restAny['data-testid'] === 'string' && restAny['data-testid'].length > 0 ? (restAny['data-testid'] as string) : id;

    const fmtOpts = React.useMemo(() => ({ decimals, thousandSeparator, locale }), [decimals, thousandSeparator, locale]);
    const externalValue = value !== undefined ? value : defaultValue;

    const [draft, setDraft] = React.useState<string>(() => formatNumber(externalValue ?? null, fmtOpts));
    const [focused, setFocused] = React.useState(false);

    React.useEffect(() => {
      if (!focused && value !== undefined) {
        setDraft(formatNumber(value ?? null, fmtOpts));
      }
    }, [value, fmtOpts, focused]);

    const parse = (raw: string): number | null => {
      const cleaned = stripFormatting(raw);
      if (cleaned === '' || cleaned === '-') return null;
      const n = Number(cleaned);
      return Number.isNaN(n) ? null : n;
    };

    const clamp = (n: number | null): number | null => {
      if (n === null) return null;
      let next = n;
      if (min !== undefined && next < min) next = min;
      if (max !== undefined && next > max) next = max;
      return next;
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      const raw = e.target.value;
      const parsed = clamp(parse(raw));
      /* Live re-format with thousand separators as the user types, but
       * preserve trailing `.` / `.0…` so decimal entry isn't clobbered. */
      const endsWithDot = /\.$/.test(raw);
      const trailingZeros = raw.match(/\.\d*?(0+)$/);
      let formatted = parsed === null ? raw : formatNumber(parsed, { ...fmtOpts, decimals: undefined });
      if (endsWithDot && !formatted.includes('.')) formatted += '.';
      else if (trailingZeros && formatted.includes('.')) {
        formatted = `${formatted}${trailingZeros[1]}`;
      }
      setDraft(formatted);
      onChange?.(parsed);
    };

    const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
      setFocused(false);
      const parsed = clamp(parse(draft));
      setDraft(formatNumber(parsed, fmtOpts));
      onBlur?.(e);
    };

    const handleFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
      setFocused(true);
      onFocus?.(e);
    };

    return (
      <div className={cn('relative flex w-full items-center', className)} data-slot="number-input-wrapper">
        {prefix ? (
          <span aria-hidden="true" className="pointer-events-none absolute left-3 text-sm text-[var(--oui-foreground-muted)]">
            {prefix}
          </span>
        ) : null}
        <input
          ref={ref}
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          value={draft}
          step={step}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={ariaDescribedBy}
          aria-label={ariaLabel}
          placeholder={placeholder}
          data-slot="number-input"
          data-testid={testId}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={cn(inputVariants({ variant: 'bordered', inputSize: 'default' }), prefix && 'pl-7', suffix && 'pr-10', 'text-right tabular-nums')}
        />
        {suffix ? (
          <span aria-hidden="true" className="pointer-events-none absolute right-3 text-sm text-[var(--oui-foreground-muted)]">
            {suffix}
          </span>
        ) : null}
      </div>
    );
  },
);
NumberInputPrimitiveInner.displayName = 'NumberInputPrimitive';

export const NumberInputPrimitive = React.memo(NumberInputPrimitiveInner) as typeof NumberInputPrimitiveInner;
