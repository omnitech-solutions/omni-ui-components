import { Button } from '@oc-tech/omni-ui-components';
import type {
  ArrayFieldItemTemplateProps,
  ArrayFieldTemplateProps,
  IconButtonProps,
} from '@rjsf/utils';
import { getTemplate, getUiOptions } from '@rjsf/utils';
import { DEFAULT_DYNAMIC_FORM_LABELS, type OmniRjsfFormContext } from '../lib/formContext';
import { TitleFieldTemplate } from './TitleFieldTemplate';

/**
 * The "add a row" button of an array, a library `Button`. Its words are `formContext.labels.addItem`, or
 * `ui:options.addLabel` on the array for one list ("Add person").
 */
export const AddButton = (props: IconButtonProps) => {
  const { uiSchema, registry, iconType: _iconType, icon: _icon, className, ...rest } = props;
  const labels = {
    ...DEFAULT_DYNAMIC_FORM_LABELS,
    ...(registry?.formContext as Partial<OmniRjsfFormContext> | undefined)?.labels,
  };
  const own = getUiOptions(uiSchema, registry?.globalUiOptions).addLabel;
  return (
    <Button
      {...(rest as React.ComponentProps<typeof Button>)}
      type="button"
      buttonSize="sm"
      data-slot="form-array-add"
      className={className}
    >
      {typeof own === 'string' ? own : labels.addItem}
    </Button>
  );
};

/** One row of an array: the row's fields, and its move, copy and remove buttons beside them. */
export const ArrayFieldItemTemplate = (props: ArrayFieldItemTemplateProps) => {
  const { children, buttonsProps, hasToolbar, registry, uiSchema } = props;
  const ItemButtons = getTemplate(
    'ArrayFieldItemButtonsTemplate',
    registry,
    getUiOptions(uiSchema, registry?.globalUiOptions),
  );
  return (
    // biome-ignore lint/a11y/useSemanticElements: rows hold form fields; a `li` would need a `ul` the host may restyle.
    <div role="listitem" data-slot="form-array-item" className="flex w-full items-start gap-2">
      <div className="min-w-0 flex-1">{children}</div>
      {hasToolbar ? (
        <div data-slot="form-array-item-actions" className="flex shrink-0 items-center gap-1">
          <ItemButtons {...buttonsProps} />
        </div>
      ) : null}
    </div>
  );
};

/**
 * An array of rows, drawn from library parts: a title that is not a stray heading, the description, the rows as
 * a list, and the add button. `ui:options.addLabel` names the button for this list; `ui:options.headingLevel`
 * makes the title a heading.
 */
export const ArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
  const {
    items,
    canAdd,
    onAddClick,
    title,
    schema,
    uiSchema,
    registry,
    disabled,
    readonly,
    required,
  } = props;
  const options = getUiOptions(uiSchema, registry?.globalUiOptions);
  const Add = registry.templates.ButtonTemplates.AddButton;
  const id = (props as { fieldPathId?: { $id?: string } }).fieldPathId?.$id ?? 'root';
  const heading = (options.title as string | undefined) ?? title ?? schema.title;
  const description = (options.description as string | undefined) ?? schema.description;
  return (
    <div data-slot="form-array" className="flex w-full flex-col gap-3">
      {heading ? (
        <TitleFieldTemplate
          id={`${id}__title`}
          title={heading}
          required={required}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      ) : null}
      {description ? (
        <p className="font-[family-name:var(--oui-font-sans)] text-xs text-[var(--oui-foreground-muted)]">
          {description}
        </p>
      ) : null}
      {/* biome-ignore lint/a11y/useSemanticElements: see ArrayFieldItemTemplate. */}
      <div
        role="list"
        aria-labelledby={heading ? `${id}__title` : undefined}
        className="flex w-full flex-col gap-3"
      >
        {items}
      </div>
      {canAdd ? (
        <div>
          <Add
            id={`${id}__add`}
            onClick={onAddClick}
            disabled={disabled || readonly}
            uiSchema={uiSchema}
            registry={registry}
          />
        </div>
      ) : null}
    </div>
  );
};
