import { DatePickerPrimitive, type DateRange } from '@oc-tech/omni-ui-components';
import type { FieldProps } from '@rjsf/utils';
import { getUiOptions } from '@rjsf/utils';
import * as React from 'react';
import { FieldShell } from '../../../lib/FieldShell';
import { DEFAULT_DYNAMIC_FORM_LABELS, type OmniRjsfFormContext } from '../../lib/formContext';
import {
  fieldDescribedBy,
  fieldPartIds,
  fromIsoDate,
  layoutOption,
  sizeOption,
  stringOption,
  toIsoDate,
  variantOption,
} from '../../lib/widgetKit';

/** What the field stores: both ends as `YYYY-MM-DD`. An end that is not chosen is absent. */
export interface DateRangeValue {
  from?: string;
  to?: string;
}

/**
 * `dateRange` (a FIELD, chosen with `ui:field`, because its value is an object): a first and a last day in one
 * control. Schema: an object with `from` and `to`, each `{ type: 'string', format: 'date' }`. It draws its own
 * label, description and errors through the shared field chrome, since the form's template draws none for an
 * object. `ui:options.min`, `max` (`YYYY-MM-DD`), `placeholder`, `size`, `variant`, `layout`.
 *
 * @example
 * schema: { period: { type: 'object', title: 'Period', properties: { from: { type: 'string', format: 'date' }, to: { type: 'string', format: 'date' } } } }
 * uiSchema: { period: { 'ui:field': 'dateRange' } }
 */
export const DateRangeField = (props: FieldProps) => {
  const { formData, schema, uiSchema, registry, disabled, readonly, required, name, errorSchema } =
    props;
  const options = getUiOptions(uiSchema, registry?.globalUiOptions);
  const path = (props as { fieldPathId?: { $id?: string; path?: (string | number)[] } })
    .fieldPathId;
  const id = path?.$id ?? (name ? `root_${name}` : 'root');
  const ids = fieldPartIds(id);
  const stored = (formData ?? {}) as DateRangeValue;
  const value = React.useMemo<DateRange>(
    () => ({
      from: fromIsoDate(stored.from) ?? undefined,
      to: fromIsoDate(stored.to) ?? undefined,
    }),
    [stored.from, stored.to],
  );
  const nested = errorSchema as
    | { from?: { __errors?: string[] }; to?: { __errors?: string[] } }
    | undefined;
  const errors = [...(nested?.from?.__errors ?? []), ...(nested?.to?.__errors ?? [])];
  const title = (options.title as string | undefined) ?? schema.title ?? name;
  const description = (options.description as string | undefined) ?? schema.description;
  const labels = {
    ...DEFAULT_DYNAMIC_FORM_LABELS,
    ...(registry?.formContext as Partial<OmniRjsfFormContext> | undefined)?.labels,
  };
  const variant = variantOption(options);

  return (
    <div data-slot="form-field" data-field-id={id} data-field-key={path?.path?.join('.') || name}>
      <FieldShell
        id={id}
        layout={layoutOption(options)}
        label={title}
        labelTag="span"
        labelId={ids.label}
        required={required}
        requiredId={required ? ids.required : undefined}
        requiredLabel={labels.required}
        description={description}
        descriptionId={ids.description}
        error={
          errors.length > 0
            ? errors.map((message) => (
                <span key={message} className="block">
                  {message}
                </span>
              ))
            : undefined
        }
        errorId={ids.error}
      >
        <DatePickerPrimitive
          id={id}
          mode="range"
          value={value}
          min={fromIsoDate(options.min) ?? undefined}
          max={fromIsoDate(options.max) ?? undefined}
          placeholder={stringOption(options, 'placeholder')}
          variant={variant}
          inputSize={sizeOption(options)}
          disabled={Boolean(disabled)}
          readOnly={Boolean(readonly) && !disabled}
          required={required}
          invalid={errors.length > 0}
          aria-labelledby={`${ids.label} ${id}`}
          aria-describedby={fieldDescribedBy(id, {
            hasError: errors.length > 0,
            hasDescription: Boolean(description),
            hasHelp: false,
            hasRequiredHint: Boolean(required),
          })}
          onChange={(next) => {
            const range = next && !(next instanceof Date) ? next : undefined;
            const out: DateRangeValue = {};
            if (range?.from) out.from = toIsoDate(range.from);
            if (range?.to) out.to = toIsoDate(range.to);
            const stored = out.from || out.to ? out : undefined;
            // RJSF 6 addresses a change by the field's path; RJSF 5 took the value alone.
            if (path?.path)
              (props.onChange as (value: unknown, at: unknown) => void)(stored, path.path);
            else (props.onChange as (value: unknown) => void)(stored);
          }}
        />
      </FieldShell>
    </div>
  );
};
