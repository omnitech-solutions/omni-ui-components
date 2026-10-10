import type { WidgetProps } from '@rjsf/utils';
import type { InputSize, InputVariant } from '../../Input/Input.variants';
import {
  DEFAULT_DYNAMIC_FORM_LABELS,
  type OmniRjsfAction,
  type OmniRjsfFormContext,
  type OmniRjsfLabels,
  type OmniSelectOption,
  type OmniTreeOption,
} from './formContext';

/**
 * The widget author's kit. A widget is SHALLOW: it adapts the form's widget props to one primitive and nothing
 * else. Everything every widget must do the same way lives here, so a widget is three lines of wiring:
 *
 * @example
 * export const SwitchWidget = (props: WidgetProps) => {
 *   const { onChange } = useStableRjsfCallbacks<boolean>(props, (next) => next);
 *   return <SwitchPrimitive {...widgetField(props)} checked={Boolean(props.value)} onChange={onChange} />;
 * };
 */

/** Ids of what the field template draws around a control. One naming rule for the template and the widgets. */
export const fieldPartIds = (id: string) => ({
  label: `${id}__title`,
  description: `${id}__description`,
  error: `${id}__error`,
  help: `${id}__help`,
  required: `${id}__required`,
});

export interface FieldPartsPresent {
  hasError: boolean;
  hasDescription: boolean;
  hasHelp: boolean;
  /** The hidden "Required" hint, drawn for a required control whose role cannot carry `aria-required`. */
  hasRequiredHint: boolean;
}

/**
 * `aria-describedby` for a control: the ids of the parts that ARE drawn, in reading order. The description is
 * replaced by the error while the field is invalid (the shared field chrome draws one or the other).
 */
export const fieldDescribedBy = (id: string, present: FieldPartsPresent): string | undefined => {
  const ids = fieldPartIds(id);
  return (
    [
      present.hasRequiredHint ? ids.required : undefined,
      present.hasDescription && !present.hasError ? ids.description : undefined,
      present.hasError ? ids.error : undefined,
      present.hasHelp ? ids.help : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined
  );
};

/** Which parts the field template draws for this field, read from the same props the template reads. */
export const fieldPartsPresent = (
  props: Pick<WidgetProps, 'schema' | 'options' | 'rawErrors' | 'hideLabel' | 'required'>,
  requiredHint = false,
): FieldPartsPresent => ({
  hasError: Boolean(props.rawErrors?.length),
  hasDescription:
    !props.hideLabel && Boolean(props.options?.description ?? props.schema.description),
  hasHelp: Boolean(props.options?.help),
  hasRequiredHint: requiredHint && Boolean(props.required) && !props.hideLabel,
});

/**
 * The accessible name of a GROUP control (radio group, slider, rating, transfer): a `<label for>` cannot name an
 * element that is not a form control, so the group points at the label the template drew, or carries the words
 * itself when the label is hidden.
 */
export const widgetGroupName = (
  props: Pick<WidgetProps, 'id' | 'label' | 'hideLabel' | 'schema'>,
): { 'aria-labelledby'?: string; 'aria-label'?: string } => {
  const name = props.label || props.schema.title;
  if (!name) return {};
  return props.hideLabel
    ? { 'aria-label': String(name) }
    : { 'aria-labelledby': fieldPartIds(props.id).label };
};

/** The props every primitive takes the same way. Spread it first; the widget adds its value and its options. */
export interface WidgetFieldProps {
  id: string;
  /** Only a disabled field. A read-only field is NOT disabled: it stays focusable and readable. */
  disabled: boolean;
  /** A read-only field (`ui:readonly`, `readOnly` on the schema or on the form). `disabled` wins. */
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  /** Ties the description, the error and `ui:help` to the control for a screen reader. */
  'aria-describedby': string | undefined;
  /** `ui:options.testId`, for a test that cannot use a role and a label. Absent: the control keeps its default. */
  'data-testid'?: string;
}

export interface WidgetFieldOptions {
  /**
   * For a control whose role cannot carry `aria-required` (a button that opens a list, a slider, a group): the
   * template draws a hidden "Required" hint and the control is described by it.
   */
  requiredHint?: boolean;
}

/**
 * The shared contract of every widget: id, disabled, read-only, required, invalid and `aria-describedby`.
 *
 * Read-only rule: `readOnly` is passed to the primitive, which keeps the control focusable, announces it as
 * read-only and refuses changes. No widget turns read-only into `disabled`.
 */
export const widgetField = (
  props: WidgetProps,
  { requiredHint = false }: WidgetFieldOptions = {},
): WidgetFieldProps => ({
  id: props.id,
  disabled: Boolean(props.disabled),
  readOnly: Boolean(props.readonly) && !props.disabled,
  required: Boolean(props.required),
  invalid: Boolean(props.rawErrors?.length),
  'aria-describedby': fieldDescribedBy(props.id, fieldPartsPresent(props, requiredHint)),
  ...(typeof props.options?.testId === 'string' ? { 'data-testid': props.options.testId } : {}),
});

const INPUT_SIZES: readonly InputSize[] = ['sm', 'default', 'md', 'lg'];
const INPUT_VARIANTS: readonly InputVariant[] = ['bordered', 'panel', 'ghost'];

/** `ui:options.size`, or the form's (`ui:globalOptions.size`). A value that is not a size is ignored. */
export const sizeOption = (options: Record<string, unknown> | undefined): InputSize | undefined =>
  INPUT_SIZES.includes(options?.size as InputSize) ? (options?.size as InputSize) : undefined;

/** `ui:options.variant`, or the form's (`ui:globalOptions.variant`). A value that is not a variant is ignored. */
export const variantOption = (
  options: Record<string, unknown> | undefined,
): InputVariant | undefined =>
  INPUT_VARIANTS.includes(options?.variant as InputVariant)
    ? (options?.variant as InputVariant)
    : undefined;

/** `ui:options.layout`: where the label sits. Read by the field template. */
export const layoutOption = (
  options: Record<string, unknown> | undefined,
): 'vertical' | 'horizontal' | undefined =>
  options?.layout === 'horizontal' || options?.layout === 'vertical' ? options.layout : undefined;

/**
 * Size and look for a FIELD-SHAPED primitive (a box a person types in or opens). Choice controls (switch,
 * checkbox, radio, segmented, slider, rating) have no field box: they do not take these.
 */
export const widgetLook = (
  props: Pick<WidgetProps, 'options' | 'registry'>,
): { variant: InputVariant | undefined; inputSize: InputSize | undefined } => ({
  variant: variantOf(props),
  inputSize: sizeOf(props),
});

/** The field's size: its own `ui:options.size`, else the form's `ui:globalOptions.size`. */
export const sizeOf = (props: Pick<WidgetProps, 'options' | 'registry'>): InputSize | undefined =>
  sizeOption(props.options) ?? sizeOption(props.registry?.globalUiOptions);

/** The field's look: its own `ui:options.variant`, else the form's `ui:globalOptions.variant`. */
export const variantOf = (
  props: Pick<WidgetProps, 'options' | 'registry'>,
): InputVariant | undefined =>
  variantOption(props.options) ?? variantOption(props.registry?.globalUiOptions);

/** A `ui:options` value of the expected type, or `undefined`. A wrong type is ignored, never thrown on. */
export const stringOption = (
  options: WidgetProps['options'] | undefined,
  key: string,
): string | undefined =>
  typeof options?.[key] === 'string' ? (options[key] as string) : undefined;

export const numberOption = (
  options: WidgetProps['options'] | undefined,
  key: string,
): number | undefined =>
  typeof options?.[key] === 'number' && Number.isFinite(options[key])
    ? (options[key] as number)
    : undefined;

export const booleanOption = (
  options: WidgetProps['options'] | undefined,
  key: string,
): boolean | undefined =>
  typeof options?.[key] === 'boolean' ? (options[key] as boolean) : undefined;

/** The typed form context of a widget. Never undefined: an absent context reads as empty. */
export const formContextOf = <TDerived extends Record<string, unknown> = Record<string, unknown>>(
  props: Pick<WidgetProps, 'registry'>,
): Partial<OmniRjsfFormContext<TDerived>> =>
  (props.registry?.formContext ?? {}) as Partial<OmniRjsfFormContext<TDerived>>;

/** The words of the form: the host's `formContext.labels` over the defaults. */
export const formLabelsOf = (props: Pick<WidgetProps, 'registry'>): OmniRjsfLabels => ({
  ...DEFAULT_DYNAMIC_FORM_LABELS,
  ...formContextOf(props).labels,
});

/** The named action `ui:options[optionKey]` points at in `formContext.actions`, if both exist. */
export const actionOf = (
  props: Pick<WidgetProps, 'registry' | 'options'>,
  optionKey: string,
): OmniRjsfAction | undefined => {
  const key = stringOption(props.options, optionKey);
  return key ? formContextOf(props).actions?.[key] : undefined;
};

/** One choice of a list widget. `description` and `disabled` come from `ui:options`, the rest from the schema. */
export interface WidgetChoice {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

/**
 * The choices of a list widget, as plain data:
 *   1. `ui:options.optionSetKey` names a list in `formContext.optionSets` (a list the host loads), else
 *   2. the schema's `enum` / `oneOf` (RJSF hands them over as `options.enumOptions`), with
 *      `ui:options.enumDisabled` and `ui:options.optionDescriptions` applied.
 */
export const choicesOf = (
  props: Pick<WidgetProps, 'options' | 'registry'>,
): (WidgetChoice | OmniSelectOption)[] => {
  const { options } = props;
  const setKey = stringOption(options, 'optionSetKey');
  const set = setKey ? formContextOf(props).optionSets?.[setKey] : undefined;
  if (set) return set.map((option) => ({ ...option }));
  const enumOptions = Array.isArray(options?.enumOptions)
    ? (options.enumOptions as { value: unknown; label: string }[])
    : [];
  const disabled = Array.isArray(options?.enumDisabled) ? (options.enumDisabled as unknown[]) : [];
  const descriptions =
    options?.optionDescriptions && typeof options.optionDescriptions === 'object'
      ? (options.optionDescriptions as Record<string, string>)
      : {};
  return enumOptions.map((option) => ({
    value: String(option.value),
    label: option.label,
    description: descriptions[String(option.value)],
    disabled: disabled.includes(option.value),
  }));
};

/** The tree `ui:options.optionTreeKey` names in `formContext.optionTrees`, else `ui:options.tree` (plain data). */
export const treeOf = (props: Pick<WidgetProps, 'options' | 'registry'>): OmniTreeOption[] => {
  const key = stringOption(props.options, 'optionTreeKey');
  const fromContext = key ? formContextOf(props).optionTrees?.[key] : undefined;
  if (fromContext) return fromContext;
  return Array.isArray(props.options?.tree) ? (props.options.tree as OmniTreeOption[]) : [];
};

/** A placeholder from `ui:options.placeholder`, `ui:placeholder`, or a labelled template with the field title. */
export const placeholderOf = (
  props: Pick<WidgetProps, 'options' | 'placeholder' | 'schema'>,
  template: string,
  untitled: string,
): string =>
  stringOption(props.options, 'placeholder') ??
  (props.placeholder ? String(props.placeholder) : undefined) ??
  (props.schema.title
    ? template.replace('{title}', String(props.schema.title).toLowerCase())
    : untitled);

/** A local calendar day as `YYYY-MM-DD` (the JSON Schema `date` format). */
export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** `YYYY-MM-DD` as a local `Date` at midnight; anything else is `null`. */
export const fromIsoDate = (value: unknown): Date | null => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) return null;
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** The DOM id RJSF gives the field at `path` (`['address', 'city']` or `'address.city'`): `root_address_city`. */
export const fieldIdOf = (path: string | readonly string[], idPrefix = 'root'): string =>
  [idPrefix, ...(typeof path === 'string' ? path.split('.') : path)].filter(Boolean).join('_');

const FOCUSABLE =
  'input:not([type="hidden"]):not([disabled]),textarea:not([disabled]),select:not([disabled]):not([aria-hidden="true"]),button:not([disabled]),[contenteditable="true"],[tabindex]:not([tabindex="-1"])';

/**
 * Moves focus to a field by its key. Looks for the control that carries the field's id; when that element cannot
 * take focus itself (a group, a hidden input), the first focusable control of the field is used. Returns whether
 * something was focused. Used by `DynamicForm`'s `apiRef`; exported for a host that renders the form elsewhere.
 */
export const focusFieldIn = (
  root: ParentNode,
  path: string | readonly string[],
  idPrefix = 'root',
): boolean => {
  const id = fieldIdOf(path, idPrefix);
  const escaped = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id;
  const control = root.querySelector<HTMLElement>(`#${escaped}`);
  const field = root.querySelector<HTMLElement>(`[data-field-id="${id}"]`);
  const candidates = [
    ...(control?.matches(FOCUSABLE) ? [control] : []),
    ...(control ? Array.from(control.querySelectorAll<HTMLElement>(FOCUSABLE)) : []),
    ...(field ? Array.from(field.querySelectorAll<HTMLElement>(FOCUSABLE)) : []),
  ];
  // A control that is drawn hidden (a file input behind its drop zone) refuses focus: the next one is tried.
  for (const target of candidates) {
    target.focus();
    if (target.ownerDocument.activeElement === target) {
      target.scrollIntoView?.({ block: 'nearest' });
      return true;
    }
  }
  return false;
};
