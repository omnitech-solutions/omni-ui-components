import * as React from 'react';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import type { AutoCompleteOption, AutoCompleteProps } from './AutoComplete.types';
import { AutoCompletePrimitive } from './AutoCompletePrimitive';

function AutoCompleteInner<T extends AutoCompleteOption = AutoCompleteOption>(
  {
    id: idProp,
    label,
    description,
    error,
    required,
    invalid,
    layout = 'vertical',
    wrapperClassName,
    labelClassName,
    'aria-describedby': describedByProp,
    ...primitiveProps
  }: AutoCompleteProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
    id: idProp,
    label,
    description,
    error,
    invalid,
    prefix: 'oui-autocomplete',
  });
  return (
    <FieldShell
      id={id}
      layout={layout}
      label={label}
      description={description}
      error={error}
      required={required}
      descriptionId={descriptionId}
      errorId={errorId}
      wrapperClassName={wrapperClassName}
      labelClassName={labelClassName}
    >
      <AutoCompletePrimitive<T>
        ref={ref}
        id={id}
        invalid={isInvalid}
        required={required}
        aria-describedby={[describedByProp, describedBy].filter(Boolean).join(' ') || undefined}
        {...primitiveProps}
      />
    </FieldShell>
  );
}

/**
 * Chrome-wrapped Omni AutoComplete: {@link AutoCompletePrimitive} inside {@link FieldShell}.
 * Free text with suggestions: the value is the typed string.
 *
 * @example
 * <AutoComplete label="Assignee" value={name} onChange={setName} options={people} />
 */
export const AutoComplete = React.forwardRef(AutoCompleteInner) as (<
  T extends AutoCompleteOption = AutoCompleteOption,
>(
  props: AutoCompleteProps<T> & { ref?: React.Ref<HTMLInputElement> },
) => React.ReactElement) & { displayName?: string };
AutoComplete.displayName = 'AutoComplete';
