import { CheckboxPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { schemaRequiresTrueValue } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';

/**
 * RJSF Checkbox widget for boolean schemas. The field template draws no label for a boolean field, so the
 * widget draws it beside the box (`ui:title` replaces it, `ui:options.label: false` hides it). Hidden or not,
 * the box is named by it.
 */
export const CheckboxWidget = (props: WidgetProps) => {
  const { id, value, disabled, readonly, rawErrors, schema, autofocus, label, hideLabel, options } =
    props;
  const { onChange, onBlur, onFocus } = useStableRjsfCallbacks<boolean>(props, (next) => next);
  const required = schemaRequiresTrueValue(schema);
  const name = label || schema.title || '';
  const showLabel = Boolean(name) && !hideLabel && options?.label !== false;
  const labelId = `${id}__label`;

  return (
    <span className="inline-flex items-center gap-2">
      <CheckboxPrimitive
        id={id}
        checked={Boolean(value)}
        required={required}
        disabled={disabled || readonly}
        invalid={Boolean(rawErrors?.length)}
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
          // A hidden label still names the box.
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
