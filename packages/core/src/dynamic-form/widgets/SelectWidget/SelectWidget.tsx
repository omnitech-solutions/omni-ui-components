import { type SelectOption, SelectPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import {
  actionOf,
  choicesOf,
  formLabelsOf,
  placeholderOf,
  sizeOf,
  variantOf,
  widgetField,
} from '../../lib/widgetKit';
import { MultiSelectWidget } from '../MultiSelectWidget';

/**
 * The one-of-a-list control behind `select` and `combobox`. Choices come from the schema (`enum` / `oneOf`) or,
 * with `ui:options.optionSetKey`, from `formContext.optionSets` (grouped, with avatar, colour, description).
 * `ui:options.footerActionKey` names an action in `formContext.actions` drawn under the list: a link when it has
 * an `href`, a call to the host's `onSelect` otherwise. The library never navigates.
 */
export const SelectControl = ({
  props,
  searchable,
}: {
  props: WidgetProps;
  searchable: boolean;
}) => {
  const { value, options, autofocus } = props;
  const { onChange, onBlur, onFocus } = useStableRjsfCallbacks<string>(props);
  const labels = formLabelsOf(props);
  const action = actionOf(props, 'footerActionKey');
  const variant = variantOf(props);

  return (
    <SelectPrimitive
      {...widgetField(props, { requiredHint: true })}
      variant={variant === 'panel' ? undefined : variant}
      inputSize={sizeOf(props)}
      options={choicesOf(props) as SelectOption[]}
      placeholder={
        searchable
          ? placeholderOf(props, labels.searchPlaceholder, labels.searchPlaceholderUntitled)
          : placeholderOf(props, labels.selectPlaceholder, labels.selectPlaceholderUntitled)
      }
      searchable={searchable}
      footerAction={
        action
          ? {
              label: action.label,
              href: action.href,
              onSelect: action.onSelect ? () => action.onSelect?.(action) : undefined,
            }
          : undefined
      }
      value={(value as string | undefined) ?? ''}
      autoFocus={autofocus}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
};

/**
 * `select`: one choice from a list. An array schema is handed to `multiSelect`. `ui:options.searchable` adds a
 * search box (the same as `combobox`).
 */
export const SelectWidget = (props: WidgetProps) =>
  props.multiple ? (
    <MultiSelectWidget {...props} />
  ) : (
    <SelectControl props={props} searchable={Boolean(props.options?.searchable)} />
  );
