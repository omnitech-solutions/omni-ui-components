import { type ModelInfo, ModelPicker } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { formContextOf, stringOption, widgetField } from '../../lib/widgetKit';

/**
 * `modelPicker`: the chat model menu as a form field; the stored value is the chosen model's `id`. The models
 * are `formContext.modelSets[ui:options.modelSetKey]`: the host supplies them, the schema only names the list.
 * The reasoning-effort row is not drawn: a widget holds one value.
 *
 * Read-only rule: the menu is a button that opens a list and has no read-only state of its own, so a read-only
 * field is drawn disabled.
 */
export const ModelPickerWidget = (props: WidgetProps) => {
  const { value, options } = props;
  const { onChange } = useStableRjsfCallbacks<string>(props);
  const field = widgetField(props);
  const key = stringOption(options, 'modelSetKey');
  const models = (key ? formContextOf(props).modelSets?.[key] : undefined) ?? [];
  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset would restyle the host; the group role is enough.
    <span
      id={field.id}
      role="group"
      aria-describedby={field['aria-describedby']}
      aria-invalid={field.invalid || undefined}
      data-slot="model-picker-field"
      className="inline-flex"
    >
      <ModelPicker
        models={models as ModelInfo[]}
        selectedId={(value as string | undefined) ?? ''}
        showEffort={false}
        disabled={field.disabled || field.readOnly}
        onPick={(model: ModelInfo) => onChange(model.id)}
      />
    </span>
  );
};
