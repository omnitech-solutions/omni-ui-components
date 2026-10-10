import * as React from 'react';
import { FieldShell, useFieldChrome } from '../lib/FieldShell';
import type { MentionsOption, MentionsProps } from './Mentions.types';
import { MentionsPrimitive } from './MentionsPrimitive';

function MentionsInner<T extends MentionsOption = MentionsOption>(
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
  }: MentionsProps<T>,
  ref: React.ForwardedRef<HTMLTextAreaElement>,
) {
  const { id, isInvalid, descriptionId, errorId, describedBy } = useFieldChrome({
    id: idProp,
    label,
    description,
    error,
    invalid,
    prefix: 'oui-mentions',
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
      <MentionsPrimitive<T>
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
 * Chrome-wrapped Omni Mentions: {@link MentionsPrimitive} inside {@link FieldShell}. The value is plain text.
 *
 * @example
 * <Mentions label="Comment" value={text} onChange={setText} options={people} />
 */
export const Mentions = React.forwardRef(MentionsInner) as (<
  T extends MentionsOption = MentionsOption,
>(
  props: MentionsProps<T> & { ref?: React.Ref<HTMLTextAreaElement> },
) => React.ReactElement) & { displayName?: string };
Mentions.displayName = 'Mentions';
