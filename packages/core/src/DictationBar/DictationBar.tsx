import { cn } from 'lib/utils';
import * as React from 'react';
import { IconButton } from '../IconButton';
import { DEFAULT_DICTATION_LABELS, type DictationBarProps } from './DictationBar.types';
import {
  dictationBarClasses,
  dictationBarVariants,
  dictationRecordClasses,
  dictationTextClasses,
  dictationWaveClasses,
} from './DictationBar.variants';

/** Bar timings are deterministic (a function of the index), so a render never changes them: ported from the original. */
const barStyle = (index: number): React.CSSProperties => ({
  animationDuration: `${0.6 + ((index * 37) % 5) / 10}s`,
  animationDelay: `${(index * 0.13) % 0.7}s`,
});

/**
 * The dictation bar that replaces a composer's field while the microphone is listening: a pulsing record dot
 * (stacked variant), the live transcript or `Listening…` in a polite live region, a 20-bar CSS waveform
 * (`aria-hidden`, decorative) and Cancel and Done buttons. All animation stops under `prefers-reduced-motion`.
 * Wire `onDone` to append `text` to the draft and `onCancel` to discard it.
 * Slots: `data-slot="dictation-bar" | "dictation-record" | "dictation-text" | "dictation-wave" | "dictation-cancel" | "dictation-done"`.
 *
 * @example
 * <DictationBar text={heard} onCancel={cancel} onDone={finish} cancelIcon={<X />} doneIcon={<Check />} />
 */
export const DictationBar = React.forwardRef<HTMLDivElement, DictationBarProps>(
  (
    {
      active = true,
      text = '',
      onCancel,
      onDone,
      cancelIcon,
      doneIcon,
      variant = 'stacked',
      bars = 20,
      waveform,
      showActions = true,
      labels: labelsProp,
      className,
      ...rest
    },
    ref,
  ) => {
    const labels = { ...DEFAULT_DICTATION_LABELS, ...labelsProp };
    if (!active) return null;
    return (
      <div
        ref={ref}
        data-slot="dictation-bar"
        data-variant={variant}
        className={cn(dictationBarVariants({ variant }), className)}
        {...rest}
      >
        {variant === 'stacked' ? (
          <span
            data-slot="dictation-record"
            aria-hidden="true"
            className={dictationRecordClasses}
          />
        ) : null}
        <span
          data-slot="dictation-text"
          role="status"
          aria-live="polite"
          className={dictationTextClasses}
        >
          {text || (
            <span className="text-[color:var(--oui-panel-meta-fg)]">{labels.listening}</span>
          )}
        </span>
        {waveform ?? (
          <span data-slot="dictation-wave" aria-hidden="true" className={dictationWaveClasses}>
            {Array.from({ length: bars }, (_, index) => (
              <span key={index} className={dictationBarClasses} style={barStyle(index)} />
            ))}
          </span>
        )}
        {showActions && (onCancel || onDone) ? (
          <span className="flex flex-none items-center gap-1">
            {onCancel ? (
              <IconButton
                variant="ghost"
                iconSize="md"
                icon={cancelIcon ?? <span aria-hidden="true">×</span>}
                label={labels.cancel}
                data-slot="dictation-cancel"
                className="size-[30px] rounded-full"
                onClick={() => void onCancel()}
              />
            ) : null}
            {onDone ? (
              <IconButton
                variant="ghost"
                iconSize="md"
                tone="accent"
                icon={doneIcon ?? <span aria-hidden="true">✓</span>}
                label={labels.done}
                data-slot="dictation-done"
                className="size-[30px] rounded-full"
                onClick={() => void onDone(text)}
              />
            ) : null}
          </span>
        ) : null}
      </div>
    );
  },
);
DictationBar.displayName = 'DictationBar';
