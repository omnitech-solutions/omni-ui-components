import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from 'lib/utils';
import { inputVariants } from '../Input/Input.variants';

const PRESETS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#0f172a', '#ffffff'];

const normalizeHex = (s: string): string => {
  const t = s.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(t)) return `#${t}`;
  if (/^[0-9a-fA-F]{6}$/.test(t)) return `#${t.toLowerCase()}`;
  return s;
};

export interface ColorPickerPrimitiveProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
  presets?: string[];
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  'aria-describedby'?: string;
  'data-testid'?: string;
  className?: string;
}

/** Raw color picker control: popover trigger + hex input + preset palette. */
export const ColorPickerPrimitive = React.forwardRef<HTMLButtonElement, ColorPickerPrimitiveProps>(
  ({ id, value, defaultValue, onChange, presets = PRESETS, disabled, required, invalid, readOnly, className, ...rest }, ref) => {
    const testId = rest['data-testid'] ?? id;
    const [open, setOpen] = React.useState(false);
    const [internal, setInternal] = React.useState<string>(defaultValue ?? '#3b82f6');
    const isControlled = value !== undefined;
    const current = isControlled ? (value as string) : internal;

    const commit = (next: string) => {
      const normalized = normalizeHex(next);
      if (!isControlled) setInternal(normalized);
      onChange?.(normalized);
    };

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            id={id}
            type="button"
            disabled={disabled}
            data-slot="color-picker"
            data-testid={testId}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            aria-describedby={rest['aria-describedby']}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={cn(
              inputVariants({ variant: 'bordered', inputSize: 'default' }),
              'items-center gap-2 px-2 text-left cursor-pointer disabled:cursor-not-allowed',
              className,
            )}
          >
            <span
              aria-hidden="true"
              className="inline-block size-6 shrink-0 rounded-md border border-[var(--oui-border-field)]"
              style={{ background: current }}
            />
            <span className="truncate text-sm tabular-nums">{current}</span>
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-50 w-64 rounded-md border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-3 shadow-md outline-none"
            data-testid={`${testId}-popover`}
          >
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Pick a color"
                value={current}
                onInput={(e) => commit((e.currentTarget as HTMLInputElement).value)}
                onChange={(e) => {
                  commit(e.currentTarget.value);
                  setOpen(false);
                }}
                disabled={disabled || readOnly}
                className="size-9 shrink-0 cursor-pointer rounded-md border border-[var(--oui-border-field)] bg-transparent"
              />
              <input
                type="text"
                aria-label="Hex"
                value={current}
                onChange={(e) => commit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    commit((e.currentTarget as HTMLInputElement).value);
                    setOpen(false);
                  }
                }}
                disabled={disabled || readOnly}
                placeholder="#000000"
                className={cn(inputVariants({ variant: 'bordered', inputSize: 'default' }), 'flex-1 px-3 text-sm tabular-nums uppercase')}
              />
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1.5" role="listbox" aria-label="Preset colors">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  role="option"
                  aria-selected={current.toLowerCase() === p.toLowerCase()}
                  onClick={() => {
                    commit(p);
                    setOpen(false);
                  }}
                  disabled={disabled || readOnly}
                  title={p}
                  className={cn(
                    'aspect-square w-full rounded-md border border-[var(--oui-border-field)] cursor-pointer transition-transform',
                    'hover:scale-110 hover:border-[var(--oui-border-interactive)]',
                    current.toLowerCase() === p.toLowerCase() && 'ring-2 ring-ring',
                  )}
                  style={{ background: p }}
                />
              ))}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  },
);
ColorPickerPrimitive.displayName = 'ColorPickerPrimitive';
