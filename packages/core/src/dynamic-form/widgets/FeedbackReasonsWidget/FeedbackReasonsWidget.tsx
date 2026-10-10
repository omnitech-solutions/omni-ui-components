import { FeedbackPanel, type FeedbackReason } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import * as React from 'react';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { choicesOf, widgetField, widgetGroupName } from '../../lib/widgetKit';

/**
 * `feedbackReasons`: the chat feedback panel's reason chips as a form field; the stored value is the chosen
 * reason ids, an array of strings. Same schema as `checkboxes` (an array of `enum` / `oneOf`, or
 * `ui:options.optionSetKey`). The panel's own note box and its submit and cancel buttons are not drawn: the form
 * submits, and a note is its own `textarea` field.
 *
 * Read-only rule: the panel has no read-only or disabled state of its own, so a locked field is `aria-disabled`,
 * takes no pointer, keeps its chips focusable and readable, and ignores every change.
 */
export const FeedbackReasonsWidget = (props: WidgetProps) => {
  const { value } = props;
  const { onChange } = useStableRjsfCallbacks<string[]>(props, (next) => next);
  const field = widgetField(props, { requiredHint: true });
  const choices = choicesOf(props);
  const reasons: FeedbackReason[] = React.useMemo(
    () => choices.map((choice) => ({ id: choice.value, label: choice.label })),
    [choices],
  );
  const locked = field.disabled || field.readOnly;
  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset would restyle the host; the group role is enough.
    <div
      id={field.id}
      role="group"
      {...widgetGroupName(props)}
      aria-describedby={field['aria-describedby']}
      aria-invalid={field.invalid || undefined}
      aria-disabled={locked || undefined}
      data-readonly={field.readOnly ? '' : undefined}
      data-slot="feedback-reasons-field"
      className={locked ? 'pointer-events-none' : undefined}
    >
      <FeedbackPanel
        reasons={reasons}
        selected={Array.isArray(value) ? (value as unknown[]).map(String) : []}
        withNote={false}
        onSelectedChange={(selected) => {
          // The value is controlled: a locked field ignores the change and the chips do not move.
          if (!locked) onChange(selected.map((reason) => reason.id));
        }}
      />
    </div>
  );
};
