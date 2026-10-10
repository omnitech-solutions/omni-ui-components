import type { FieldTemplateProps } from '@rjsf/utils';
import { getTemplate, getUiOptions } from '@rjsf/utils';
import { FieldShell } from '../../lib/FieldShell';
import {
  DEFAULT_DYNAMIC_FORM_LABELS,
  type OmniRjsfAction,
  type OmniRjsfFormContext,
} from '../lib/formContext';
import { fieldPartIds, layoutOption } from '../lib/widgetKit';
import { StatusMark } from './StatusMark';

const ACTION_CLASS = 'text-xs font-medium text-[color:var(--oui-foreground-primary)]';

/**
 * The action beside a label, resolved by key from `formContext.actions`. The library never navigates: with
 * `href` it is a link element, with `onSelect` a button that calls the host, with neither plain text.
 */
const LabelAction = ({ id, action }: { id: string; action: OmniRjsfAction }) => {
  const testId = `${id}-label-action`;
  if (action.href) {
    return (
      <a
        href={action.href}
        data-testid={testId}
        className={`${ACTION_CLASS} hover:underline`}
        onClick={action.onSelect ? () => action.onSelect?.(action) : undefined}
      >
        {action.label}
      </a>
    );
  }
  if (action.onSelect) {
    return (
      <button
        type="button"
        data-testid={testId}
        className={`${ACTION_CLASS} cursor-pointer hover:underline`}
        onClick={() => action.onSelect?.(action)}
      >
        {action.label}
      </button>
    );
  }
  return (
    <span data-testid={testId} className={ACTION_CLASS}>
      {action.label}
    </span>
  );
};

/**
 * The chrome of every schema field: the SAME `FieldShell` a hand-built field uses (label, required mark, hidden
 * "Required" hint, description, error with `role="alert"`, vertical or horizontal layout), so the two kinds of
 * form cannot drift apart.
 *
 * The ids of the description, the error and the help are {@link fieldPartIds}; each widget points its control at
 * them with `aria-describedby` through `widgetField`. The label carries the id `<field>__title` so a group
 * control can be named by `aria-labelledby`.
 *
 * Options, per field in `ui:options` or for the whole form in `ui:globalOptions`:
 *   - `layout: 'vertical' | 'horizontal'`: the label above (default) or to the left of the control.
 *   - `labelActionKey`: a link or button beside the label, from `formContext.actions`.
 * A status beside the label comes from `formContext.fieldStatus[<field key>]` (a tone and its words).
 */
export const FieldTemplate = (props: FieldTemplateProps) => {
  const {
    id,
    children,
    displayLabel,
    rawErrors = [],
    rawDescription,
    rawHelp,
    classNames,
    style,
    disabled,
    label,
    hidden,
    onKeyRename,
    onKeyRenameBlur,
    onRemoveProperty,
    readonly,
    required,
    schema,
    uiSchema,
    registry,
  } = props;
  const uiOptions = getUiOptions(uiSchema, registry?.globalUiOptions);
  const WrapIfAdditionalTemplate = getTemplate('WrapIfAdditionalTemplate', registry, uiOptions);
  const formContext = (registry?.formContext ?? {}) as Partial<OmniRjsfFormContext>;
  const labels = { ...DEFAULT_DYNAMIC_FORM_LABELS, ...formContext.labels };

  if (hidden) {
    return <div className="hidden">{children}</div>;
  }

  const labelActionKey =
    typeof uiOptions.labelActionKey === 'string' ? uiOptions.labelActionKey : '';
  const labelAction = labelActionKey ? formContext.actions?.[labelActionKey] : undefined;
  // A checkbox draws its own label beside the box.
  const showLabel = displayLabel && uiOptions.widget !== 'checkbox';
  const ids = fieldPartIds(id);
  // The field's path as the host writes it (`address.city`); the root object has none.
  const path = (props as { fieldPathId?: { path?: (string | number)[] } }).fieldPathId?.path;
  const fieldKey = path?.length ? path.join('.') : undefined;
  const status = fieldKey ? formContext.fieldStatus?.[fieldKey] : undefined;
  const error =
    rawErrors.length > 0
      ? rawErrors.map((message, index) => (
          <span key={`${index}-${message}`} className="block">
            {message}
          </span>
        ))
      : undefined;

  return (
    <WrapIfAdditionalTemplate
      classNames={classNames}
      style={style}
      disabled={disabled}
      id={id}
      label={label}
      displayLabel={displayLabel}
      onKeyRename={onKeyRename}
      onKeyRenameBlur={onKeyRenameBlur}
      onRemoveProperty={onRemoveProperty}
      rawDescription={rawDescription}
      readonly={readonly}
      required={required}
      schema={schema}
      uiSchema={uiSchema}
      registry={registry}
    >
      <div data-slot="form-field" data-field-id={id} data-field-key={fieldKey}>
        <FieldShell
          id={id}
          layout={layoutOption(uiOptions)}
          label={showLabel ? label : undefined}
          labelId={ids.label}
          labelAction={
            showLabel && (labelAction || status) ? (
              <span className="inline-flex items-baseline gap-3">
                {status ? <StatusMark status={status} /> : null}
                {labelAction ? <LabelAction id={id} action={labelAction} /> : null}
              </span>
            ) : undefined
          }
          required={required}
          requiredId={required && showLabel ? ids.required : undefined}
          requiredLabel={labels.required}
          description={displayLabel && rawDescription ? rawDescription : undefined}
          descriptionId={ids.description}
          error={error}
          errorId={ids.error}
          help={rawHelp || undefined}
          helpId={ids.help}
        >
          {children}
        </FieldShell>
      </div>
    </WrapIfAdditionalTemplate>
  );
};
