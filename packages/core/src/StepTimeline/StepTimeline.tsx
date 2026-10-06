import * as React from 'react';

import { cn } from 'lib/utils';
import { useControllableState } from 'lib/use-controllable-state';
import type { StepTimelineLabels, StepTimelineProps, StepTimelineStatus, StepTimelineStep } from './StepTimeline.types';
import {
  railDotVariants,
  railLineClasses,
  stepListClasses,
  stepParallelClasses,
  stepRowClasses,
  stepSpinnerClasses,
  stepSummaryButtonClasses,
} from './StepTimeline.variants';

/** English strings of {@link StepTimeline}. */
export const DEFAULT_STEP_TIMELINE_LABELS: StepTimelineLabels = {
  running: '{label}…',
  runningMore: '{label} + {n} more…',
  waiting: 'Waiting for your approval',
  stopped: 'Stopped while working',
  done: (count, seconds) => `Used ${count} tool${count === 1 ? '' : 's'}${seconds !== undefined ? ` · ${seconds.toFixed(1)}s` : ''}`,
  working: '…',
  parallel: 'parallel',
};

const labelOf = (step: StepTimelineStep) => (step.state === 'running' ? (step.activeLabel ?? step.label) : step.label);
const text = (node: React.ReactNode): string => (typeof node === 'string' || typeof node === 'number' ? String(node) : '');

/**
 * Omni StepTimeline: the work a reply did, from plain `steps` (`id`, `icon`, `label`, `detail`, `state`,
 * `parallel`). Nothing app-specific is computed: the summary line comes from the step states and `status`.
 * - `summary` (default): a collapsible summary button (spinner while running, a check once done) and a list of rows.
 * - `rail`: a vertical dotted timeline that is shown while a step runs, or when opened from the summary button.
 *
 * The button is a disclosure (`aria-expanded`); open state is controlled (`open`) or kept inside. Every string is
 * in `labels`; icons are nodes in `icons` and each step.
 *
 * Slots: `data-slot="step-timeline" | "step-timeline-toggle" | "step-timeline-list" | "step-timeline-row" | "step-timeline-rail" | "step-timeline-parallel"`.
 *
 * @example
 * <StepTimeline steps={steps} variant="rail" seconds={4.2} icons={{ done: <Check />, chevron: <ChevronDown /> }} />
 */
const StepTimelineImpl = React.forwardRef<HTMLDivElement, StepTimelineProps>(
  (
    {
      steps,
      variant = 'summary',
      status,
      seconds,
      open,
      defaultOpen = false,
      onOpenChange,
      summary,
      icons,
      label = 'Steps',
      labels: labelOverrides,
      className,
      ...rest
    },
    ref,
  ) => {
    const labels = { ...DEFAULT_STEP_TIMELINE_LABELS, ...labelOverrides };
    const [expanded, setExpanded] = useControllableState(open, defaultOpen, onOpenChange);
    const listId = React.useId();

    if (steps.length === 0) return null;

    const unfinished = steps.filter((step) => step.state === 'pending' || step.state === 'running');
    const resolved: StepTimelineStatus =
      status ?? (steps.some((step) => step.state === 'running') ? 'running' : unfinished.length ? 'stopped' : 'done');
    const working = resolved === 'running' && unfinished.length > 0;
    const firstLabel = text(labelOf(unfinished[0] ?? steps[0]!));
    const line =
      summary ??
      (resolved === 'running' && unfinished.length
        ? unfinished.length > 1
          ? labels.runningMore.replace('{label}', firstLabel).replace('{n}', String(unfinished.length - 1))
          : labels.running.replace('{label}', firstLabel)
        : resolved === 'waiting'
          ? labels.waiting
          : resolved === 'stopped' || unfinished.length
            ? labels.stopped
            : labels.done(steps.length, seconds));
    const rail = variant === 'rail';
    const spinner = icons?.spinner ?? <span aria-hidden="true" data-slot="step-timeline-spinner" className={stepSpinnerClasses} />;

    const stateIcon = (step: StepTimelineStep) =>
      step.state === 'running' ? spinner : step.state === 'done' ? icons?.done : step.state === 'failed' ? icons?.failed : null;

    const detailOf = (step: StepTimelineStep) => (step.state === 'running' ? labels.working : step.detail);

    return (
      <div
        ref={ref}
        role="group"
        aria-label={label}
        data-slot="step-timeline"
        data-variant={variant}
        data-status={resolved}
        className={cn('flex min-w-0 flex-col gap-1.5', className)}
        {...rest}
      >
        {!rail || !working ? (
          <button
            type="button"
            data-slot="step-timeline-toggle"
            aria-expanded={expanded}
            aria-controls={expanded ? listId : undefined}
            className={stepSummaryButtonClasses}
            onClick={() => setExpanded(!expanded)}
          >
            {working ? (
              spinner
            ) : resolved === 'done' && icons?.done ? (
              <span aria-hidden="true" className="inline-flex text-[color:var(--oui-tone-success-fg)]">
                {icons.done}
              </span>
            ) : null}
            <span className="min-w-0 truncate">{line}</span>
            {icons?.chevron ? (
              <span aria-hidden="true" className={cn('inline-flex transition-transform motion-reduce:transition-none', expanded && 'rotate-180')}>
                {icons.chevron}
              </span>
            ) : null}
          </button>
        ) : null}

        {!rail && expanded ? (
          <ul id={listId} data-slot="step-timeline-list" className={cn(stepListClasses, 'm-0 list-none')}>
            {steps.map((step) => (
              <li key={step.id} data-slot="step-timeline-row" data-state={step.state} className={stepRowClasses}>
                {step.icon ? (
                  <span aria-hidden="true" className="inline-flex flex-none text-[color:var(--oui-panel-meta-fg)] [&_svg]:size-4">
                    {step.icon}
                  </span>
                ) : null}
                <span className="font-medium whitespace-nowrap">{labelOf(step)}</span>
                <span className="min-w-0 flex-1 truncate text-[color:var(--oui-panel-meta-fg)]">{detailOf(step)}</span>
                {step.parallel ? (
                  <span data-slot="step-timeline-parallel" className={stepParallelClasses}>
                    {labels.parallel}
                  </span>
                ) : null}
                {stateIcon(step) ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'inline-flex flex-none [&_svg]:size-3.5',
                      step.state === 'done' && 'text-[color:var(--oui-tone-success-fg)]',
                      step.state === 'failed' && 'text-[color:var(--oui-tone-danger-fg)]',
                    )}
                  >
                    {stateIcon(step)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        {rail && (working || expanded) ? (
          <ol id={listId} data-slot="step-timeline-rail" className="m-0 flex list-none flex-col p-0 ps-0.5">
            {steps.map((step, index) => (
              <li key={step.id} data-slot="step-timeline-row" data-state={step.state} className="flex gap-2.5">
                <div className="flex w-[18px] flex-none flex-col items-center">
                  <span data-slot="step-timeline-dot" className={railDotVariants({ state: step.state })}>
                    {stateIcon(step)}
                  </span>
                  {index < steps.length - 1 ? <span aria-hidden="true" data-slot="step-timeline-line" className={railLineClasses} /> : null}
                </div>
                <div className={cn('flex min-w-0 flex-1 flex-col', index < steps.length - 1 && 'pb-2.5')}>
                  <div className="flex items-center gap-1.5 text-[13px] leading-[18px] font-medium">
                    {step.icon ? (
                      <span aria-hidden="true" className="inline-flex flex-none text-[color:var(--oui-panel-meta-fg)] [&_svg]:size-3.5">
                        {step.icon}
                      </span>
                    ) : null}
                    {labelOf(step)}
                    {step.parallel ? (
                      <span data-slot="step-timeline-parallel" className={stepParallelClasses}>
                        {labels.parallel}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-[12.5px] text-[color:var(--oui-panel-meta-fg)]">{detailOf(step)}</div>
                </div>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    );
  },
);
StepTimelineImpl.displayName = 'StepTimeline';

/** Generic over the step item type, so an extended step keeps its fields in props and slots. */
export const StepTimeline = StepTimelineImpl as unknown as <T extends StepTimelineStep = StepTimelineStep>(
  props: StepTimelineProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
