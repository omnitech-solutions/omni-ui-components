import { CheckboxPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { schemaRequiresTrueValue } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { widgetField } from '../../lib/widgetKit';

/**
 * `checkbox`: a boolean. The one widget that draws its own label, beside the box. Required only when the schema
 * demands `true`. `ui:options.label: false` keeps the label for a screen reader and hides it on screen.
 */
export const CheckboxWidget = (props: WidgetProps) => {
  const { id, value, schema, autofocus, label, hideLabel, options } = props;
  const { onChange, onBlur, onFocus } = useStableRjsfCallbacks<boolean>(props, (next) => next);
  const required = schemaRequiresTrueValue(schema);
  const name = label || schema.title || '';
  const showLabel = Boolean(name) && !hideLabel && options?.label !== false;
  const labelId = `${id}__label`;
  // The template draws the description of a boolean only when it draws a label row; a checkbox has none.
  const field = widgetField({ ...props, hideLabel: true });

  return (
    <span className="inline-flex items-center gap-2">
      <CheckboxPrimitive
        {...field}
        checked={Boolean(value)}
        required={required}
        autoFocus={autofocus}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        aria-labelledby={name ? labelId : undefined}
      />
      {name ? (
        <label
          id={labelId}
          htmlFor={id}
          className={
            showLabel ? 'text-sm font-medium leading-none text-[var(--oui-foreground)]' : 'sr-only'
          }
        >
          {name}
          {required ? (
            <span className="ml-0.5 text-[var(--oui-foreground-required)]" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}
    </span>
  );
};
