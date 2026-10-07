import { cn } from 'lib/utils';
import * as React from 'react';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { useControllableState } from '../lib/use-controllable-state';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Progress } from '../Progress';
import type { ContextMeterLabels, ContextMeterProps, ContextSection } from './ContextMeter.types';
import {
  contextLevel,
  contextPercent,
  DEFAULT_CONTEXT_THRESHOLDS,
  formatTokens,
} from './ContextMeter.utils';
import {
  contextBarFillVariants,
  contextLevelTone,
  contextPopoverClasses,
} from './ContextMeter.variants';

const NO_SECTIONS: ContextSection[] = [];

/** English defaults for every string. */
export const DEFAULT_CONTEXT_METER_LABELS: ContextMeterLabels = {
  title: (percent) => `Context ${percent}% used`,
  titleNoWindow: (used) => `About ${used} tokens in context`,
  dialog: 'Context window',
  heading: 'Context window',
  approx: (used) => `~${used}`,
  summary: (used, window) => `About ${used}${window ? ` of ${window}` : ''} tokens`,
  note: 'When it fills up, older turns are summarised — never silently dropped.',
  summarise: 'Summarise now',
};

/**
 * Omni ContextMeter: a ring button showing how full the model's window is. The ring is accent, amber above
 * `thresholds.warn` and red above `thresholds.danger`; with no `window` it is empty and the tooltip says how many
 * tokens are in context. The ring opens a popover (`role="dialog"`) with the percent, a bar, the token summary, a row
 * per section and an optional "Summarise now" button. The popover returns focus to the ring on close and closes on
 * Escape.
 *
 * @example
 * <ContextMeter used={3100} window={262000} sections={[{ label: 'Conversation', tokens: 2100 }]} onSummarise={summarise} />
 */
const ContextMeterInner = React.forwardRef<HTMLButtonElement, ContextMeterProps>(
  (
    {
      used,
      window: windowSize,
      sections = NO_SECTIONS,
      thresholds = DEFAULT_CONTEXT_THRESHOLDS,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      onSummarise,
      ringSize = 20,
      align = 'end',
      side = 'top',
      labels: labelsProp,
      menuClassName,
      container,
      className,
      ...rest
    },
    ref,
  ) => {
    const labels = React.useMemo(
      () => ({ ...DEFAULT_CONTEXT_METER_LABELS, ...labelsProp }),
      [labelsProp],
    );
    const [open, setOpen] = useControllableState<boolean>(openProp, defaultOpen, onOpenChange);
    // The popover returns focus to the ring only after its exit animation; Escape puts it there at once.
    const ringRef = React.useRef<HTMLButtonElement | null>(null);
    const percent = contextPercent(used, windowSize);
    const level = contextLevel(percent, thresholds);
    const title =
      percent === undefined ? labels.titleNoWindow(formatTokens(used)) : labels.title(percent);
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <IconButton
            ref={(node) => {
              ringRef.current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
            }}
            variant="ghost"
            label={title}
            title={title}
            aria-haspopup="dialog"
            aria-expanded={open}
            data-slot="context-meter"
            data-level={level}
            data-percent={percent}
            className={cn('size-7 rounded-full p-0', className)}
            icon={
              <Progress
                shape="ring"
                value={percent ?? 0}
                tone={contextLevelTone[level]}
                size={ringSize}
                aria-hidden="true"
              />
            }
            {...rest}
          />
        </PopoverTrigger>
        <PopoverContent
          container={container}
          data-oui-surface="context-meter"
          align={align}
          side={side}
          sideOffset={6}
          aria-label={labels.dialog}
          className={cn(contextPopoverClasses, menuClassName)}
          onEscapeKeyDown={() => ringRef.current?.focus()}
        >
          <div data-slot="context-popover" className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between font-medium">
              <span>{labels.heading}</span>
              <span data-slot="context-percent">
                {percent === undefined ? labels.approx(formatTokens(used)) : `${percent}%`}
              </span>
            </div>
            {percent !== undefined ? (
              <div
                role="progressbar"
                aria-label={labels.heading}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                data-slot="context-bar"
                className="h-1.5 overflow-hidden rounded-full bg-[color:var(--oui-panel-dock-bg)]"
              >
                <div
                  data-slot="context-bar-fill"
                  data-level={level}
                  className={contextBarFillVariants({ level })}
                  style={{ width: `${percent}%` }}
                />
              </div>
            ) : null}
            <div
              data-slot="context-summary"
              className="text-xs text-[color:var(--oui-panel-meta-fg)]"
            >
              {labels.summary(
                formatTokens(used),
                windowSize ? formatTokens(windowSize, 0) : undefined,
              )}
            </div>
            {sections.length ? (
              <ul data-slot="context-sections" className="m-0 flex list-none flex-col gap-1 p-0">
                {sections.map((section) => (
                  <li
                    key={section.label}
                    data-slot="context-section"
                    className="flex justify-between text-[12.5px]"
                  >
                    <span>{section.label}</span>
                    <span className="font-mono text-[color:var(--oui-panel-meta-fg)]">
                      {formatTokens(section.tokens)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="text-xs text-[color:var(--oui-panel-meta-fg)]">{labels.note}</div>
            {onSummarise ? (
              <Button
                type="button"
                variant="outline"
                buttonSize="sm"
                className="w-full"
                data-slot="context-summarise"
                onClick={() => void onSummarise(sections)}
              >
                {labels.summarise}
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);
ContextMeterInner.displayName = 'ContextMeter';

/** Generic over the section type: extra fields reach `onSummarise` by reference. */
export const ContextMeter = ContextMeterInner as <S extends ContextSection = ContextSection>(
  props: ContextMeterProps<S> & React.RefAttributes<HTMLButtonElement>,
) => React.ReactElement | null;
