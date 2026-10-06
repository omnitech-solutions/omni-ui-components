import * as React from 'react';

import { cn } from 'lib/utils';
import { useControllableState } from 'lib/use-controllable-state';
import { Button } from '../Button';
import type { FeedbackPanelLabels, FeedbackPanelProps, FeedbackReason } from './FeedbackPanel.types';
import { feedbackChipVariants, feedbackPanelClasses } from './FeedbackPanel.variants';

/** English strings of {@link FeedbackPanel}. */
export const DEFAULT_FEEDBACK_LABELS: FeedbackPanelLabels = {
  title: 'What went wrong?',
  cancel: 'Cancel',
  submit: 'Send feedback',
  notePlaceholder: 'Anything else? (optional)',
};

/**
 * Omni FeedbackPanel: what a thumbs-down opens. A heading, reason chips (toggle buttons with `aria-pressed`; the
 * list is data) and Cancel / Send. The chosen reasons are controlled (`selected`) or kept inside; `onSubmit` gets
 * them. Whether the panel is shown, and the thanks toast, are the caller's.
 *
 * Slots: `data-slot="feedback-panel" | "feedback-chip" | "feedback-cancel" | "feedback-submit"`.
 *
 * @example
 * <FeedbackPanel reasons={['Incorrect', 'Too long']} onSubmit={(reasons) => send(reasons)} onCancel={close} />
 */
const FeedbackPanelImpl = React.forwardRef<HTMLDivElement, FeedbackPanelProps>(
  (
    {
      reasons,
      selected,
      defaultSelected = [],
      onSelectedChange,
      onToggle,
      withNote = false,
      onSubmit,
      onCancel,
      submitDisabled,
      labels: labelOverrides,
      className,
      ...rest
    },
    ref,
  ) => {
    const labels = { ...DEFAULT_FEEDBACK_LABELS, ...labelOverrides };
    const [chosenIds, setChosenIds] = useControllableState<string[]>(selected, defaultSelected);
    // Items in the order chosen, by reference.
    const chosen = chosenIds.map((id) => reasons.find((reason) => reason.id === id)).filter((reason) => reason !== undefined);
    const titleId = React.useId();
    const [note, setNote] = React.useState('');
    const toggle = (reason: FeedbackReason) => {
      const on = !chosenIds.includes(reason.id);
      const nextIds = on ? [...chosenIds, reason.id] : chosenIds.filter((id) => id !== reason.id);
      setChosenIds(nextIds);
      onToggle?.(reason, on);
      onSelectedChange?.(nextIds.map((id) => reasons.find((item) => item.id === id)).filter((item) => item !== undefined));
    };
    return (
      <div ref={ref} role="group" aria-labelledby={titleId} data-slot="feedback-panel" className={cn(feedbackPanelClasses, className)} {...rest}>
        <div id={titleId} className="text-[13px] font-medium">
          {labels.title}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {reasons.map((reason) => (
            <button
              key={reason.id}
              type="button"
              data-slot="feedback-chip"
              aria-pressed={chosenIds.includes(reason.id)}
              className={feedbackChipVariants()}
              onClick={() => toggle(reason)}
            >
              {reason.label}
            </button>
          ))}
        </div>
        {withNote ? (
          <textarea
            data-slot="feedback-note"
            rows={2}
            value={note}
            aria-label={labels.notePlaceholder}
            placeholder={labels.notePlaceholder}
            className="w-full resize-none rounded-lg border border-solid border-[color:var(--oui-panel-divider)] bg-transparent px-2.5 py-1.5 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onChange={(event) => setNote(event.target.value)}
          />
        ) : null}
        {onSubmit || onCancel ? (
          <div className="flex justify-end gap-2">
            {onCancel ? (
              <Button variant="outline" buttonSize="sm" data-slot="feedback-cancel" onClick={onCancel}>
                {labels.cancel}
              </Button>
            ) : null}
            {onSubmit ? (
              <Button
                buttonSize="sm"
                disabled={submitDisabled}
                data-slot="feedback-submit"
                onClick={() => onSubmit({ reasons: chosen, ...(withNote && note.trim() ? { note: note.trim() } : {}) })}
              >
                {labels.submit}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);
FeedbackPanelImpl.displayName = 'FeedbackPanel';

/** Generic over the reason item type: an extended reason reaches every callback by reference. */
export const FeedbackPanel = FeedbackPanelImpl as unknown as <T extends FeedbackReason = FeedbackReason>(
  props: FeedbackPanelProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
