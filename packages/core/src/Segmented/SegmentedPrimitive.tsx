import { ToggleGroup, ToggleGroupItem } from 'components/ui/toggle-group';
import { cn } from 'lib/utils';
import * as React from 'react';
import { hitAreaY } from '../internal/support/hitArea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';
import type { SegmentedOption, SegmentedPrimitiveProps } from './Segmented.types';

const PILL_ROOT =
  'inline-flex w-fit gap-1 rounded-full border border-[var(--oui-border-field)] bg-muted/40 p-1';
const PILL_ITEM = cn(
  'h-8 rounded-full px-4 text-sm font-medium cursor-pointer',
  'text-[var(--oui-foreground)] hover:bg-muted/60',
  'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'transition-colors',
);

/** One bordered group on the control row: 2px inset, 2px gaps, accent-tinted active segment, transparent inactive. */
const CONTROL_ROOT =
  'box-border inline-flex h-[var(--oui-control-height)] w-fit items-stretch gap-[2px] rounded-[calc(var(--oui-control-radius)+1px)] border border-[color:var(--oui-tone-neutral-border)] p-[2px]';
/** The item is the root's 36px minus its 1px border and 2px padding (30px): the hit area grows from that. */
const CONTROL_ITEM = cn(
  hitAreaY,
  '[--oui-hit-base:30px]',
  'h-auto min-w-8 gap-1.5 rounded-[8px] px-2 text-[13px] font-medium cursor-pointer',
  'bg-transparent text-[color:var(--oui-segment-inactive-fg)] hover:bg-[color:var(--oui-tone-neutral-bg)] hover:text-[color:var(--oui-tone-neutral-fg)]',
  'data-[state=on]:bg-[color:var(--oui-segment-active-bg)] data-[state=on]:text-[color:var(--oui-segment-active-fg)]',
  'data-[state=on]:hover:bg-[color:var(--oui-segment-active-bg)] data-[state=on]:hover:text-[color:var(--oui-segment-active-fg)] data-[state=on]:hover:brightness-110',
  '[&_svg]:size-[19px]',
  'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
  'data-[locked=true]:cursor-default data-[locked=true]:opacity-100',
  'transition-colors',
);

/**
 * Raw Omni Segmented primitive — a toggle row built on Radix `ToggleGroup`.
 *
 * - `mode="single"` (default): one selected option; `value`/`onChange` are a string.
 *   Selected uses `bg-primary` + white text in the default `pill` appearance.
 * - `mode="multiple"`: a toggle group; `value`/`onChange` are `string[]` and
 *   `minActive` keeps the last on-option(s) from being turned off.
 * - `appearance="control"`: the 36px bordered control-row group used by the
 *   Native App toolbar (icon options, accent-tinted active, transparent inactive).
 *
 * Options may carry an `icon`, a `label` (optional when icon-only), and a
 * `disabledReason` (`aria-disabled` + tooltip). Whole control is
 * keyboard-friendly (Left / Right move focus inside the group).
 */
const SegmentedPrimitiveInner = React.forwardRef<HTMLDivElement, SegmentedPrimitiveProps>(
  (props, ref) => {
    const {
      id,
      name: _name,
      className,
      options,
      disabled,
      required,
      invalid,
      readOnly,
      appearance = 'pill',
      minActive = 0,
      minActiveReason = 'Keep at least one on',
      'aria-describedby': ariaDescribedBy,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    } = props;
    const restAny = rest as Record<string, unknown>;
    const testId =
      typeof restAny['data-testid'] === 'string' && restAny['data-testid'].length > 0
        ? (restAny['data-testid'] as string)
        : id;
    const control = appearance === 'control';
    const multiple = props.mode === 'multiple';

    // Multiple mode: the on-values, used to tell which options the minActive rule locks.
    const activeValues = multiple ? (props.value ?? props.defaultValue ?? []) : [];
    const atMinimum = multiple && activeValues.length <= minActive;

    const renderOption = (opt: SegmentedOption) => {
      const reasoned =
        opt.disabledReason !== undefined &&
        opt.disabledReason !== null &&
        opt.disabledReason !== '';
      const locked = atMinimum && activeValues.includes(opt.value) && !reasoned;
      const accessibleName =
        opt.ariaLabel ?? (typeof opt.label === 'string' ? opt.label : undefined);
      const tip = reasoned ? opt.disabledReason : locked ? minActiveReason : undefined;

      const item = (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          aria-label={accessibleName}
          // aria-disabled (not native disabled) keeps a reasoned or locked option hoverable for its tooltip.
          // A toggle has no `aria-readonly`: a read-only option is `aria-disabled` and stays focusable.
          aria-disabled={reasoned || locked || readOnly ? true : undefined}
          data-locked={locked ? 'true' : undefined}
          title={tip === undefined && !opt.label ? accessibleName : undefined}
          disabled={disabled || opt.disabled}
          data-testid={testId ? `${testId}-option-${opt.value}` : undefined}
          // Radix skips its toggle when the click is default-prevented.
          onClick={(event) => {
            if (reasoned || locked || readOnly) event.preventDefault();
          }}
          className={cn(
            control ? CONTROL_ITEM : PILL_ITEM,
            readOnly && 'cursor-default aria-disabled:cursor-default aria-disabled:opacity-100',
          )}
        >
          {opt.icon}
          {opt.label}
        </ToggleGroupItem>
      );
      if (tip === undefined) return item;
      return (
        <TooltipProvider key={opt.value}>
          <Tooltip>
            {/* The trigger sits on a wrapper: a trigger on the item itself would overwrite its data-state (on/off). */}
            <TooltipTrigger asChild>
              <span className="inline-flex">{item}</span>
            </TooltipTrigger>
            <TooltipContent>{tip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    };

    const shared = {
      ref,
      disabled,
      'data-testid': testId,
      'data-slot': 'segmented',
      'data-appearance': appearance,
      'aria-invalid': invalid || undefined,
      'aria-required': required || undefined,
      'aria-describedby': ariaDescribedBy,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'data-readonly': readOnly ? '' : undefined,
      className: cn(control ? CONTROL_ROOT : PILL_ROOT, className),
    } as const;

    if (props.mode === 'multiple') {
      return (
        <ToggleGroup
          type="multiple"
          value={props.value}
          defaultValue={props.defaultValue}
          onValueChange={(next: string[]) => {
            /* The minActive rule: never report a selection below the floor. */
            if (!readOnly && next.length >= minActive) props.onChange?.(next);
          }}
          {...shared}
        >
          {options.map(renderOption)}
        </ToggleGroup>
      );
    }

    return (
      <ToggleGroup
        type="single"
        value={props.value ?? ''}
        defaultValue={props.defaultValue}
        onValueChange={(v: string) => {
          /* Radix lets the user "deselect" by clicking the active item.
           * Omni Segmented is conceptually a required single-select, so
           * we ignore empty-string transitions. */
          if (v && !readOnly) props.onChange?.(v);
        }}
        {...shared}
      >
        {options.map(renderOption)}
      </ToggleGroup>
    );
  },
);
SegmentedPrimitiveInner.displayName = 'SegmentedPrimitive';

export const SegmentedPrimitive = React.memo(
  SegmentedPrimitiveInner,
) as typeof SegmentedPrimitiveInner;
