import * as React from 'react';

import { cn } from 'lib/utils';
import { useStableId } from '../lib';
import { fieldGroupVariants, fieldLabelVariants } from '../Input/Input.variants';
import { RadioPrimitive } from './RadioPrimitive';
import type { RadioProps } from './Radio.types';

/**
 * Chrome-wrapped Omni Radio group. Composes {@link RadioPrimitive} with
 * a label / description / error stack mirroring Input + Select.
 *
 * @example
 * <Radio
 *   label="Billing plan"
 *   required
 *   value={plan}
 *   onChange={setPlan}
 *   options={[
 *     { value: 'free', label: 'Free' },
 *     { value: 'pro',  label: 'Pro', description: '$15 / month' },
 *   ]}
 * />
 */
const RadioInner = React.forwardRef<HTMLDivElement, RadioProps>(
  ({ id: idProp, wrapperClassName, labelClassName, layout = 'vertical', label, description, error, required, invalid, className, ...primitiveProps }, ref) => {
    const fallbackId = useStableId('oui-radio');
    const id = idProp ?? fallbackId;
    const isInvalid = Boolean(error) || Boolean(invalid);
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

    const labelNode = label ? (
      <span className={cn(fieldLabelVariants({ layout }), labelClassName)} id={`${id}-label`}>
        {label}
        {required ? (
          <span className="ml-0.5 text-[var(--oui-foreground-required)]" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
    ) : null;

    const radioNode = (
      <RadioPrimitive
        ref={ref}
        id={id}
        invalid={isInvalid}
        required={required}
        aria-describedby={describedBy}
        className={cn(layout === 'horizontal' && 'flex-1', className)}
        {...primitiveProps}
      />
    );

    const helpers =
      description && !error ? (
        <p id={descriptionId} className="font-[family-name:var(--oui-font-sans)] text-xs text-[var(--oui-foreground-muted)]">
          {description}
        </p>
      ) : null;
    const errorNode = error ? (
      <p id={errorId} role="alert" className="font-[family-name:var(--oui-font-sans)] text-xs text-[var(--oui-border-invalid)]">
        {error}
      </p>
    ) : null;

    if (layout === 'horizontal') {
      return (
        <div
          className={cn(fieldGroupVariants({ layout }), wrapperClassName)}
          data-layout="horizontal"
          role="group"
          aria-labelledby={label ? `${id}-label` : undefined}
        >
          {labelNode}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {radioNode}
            {helpers}
            {errorNode}
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(fieldGroupVariants({ layout }), wrapperClassName)}
        data-layout="vertical"
        role="group"
        aria-labelledby={label ? `${id}-label` : undefined}
      >
        {labelNode}
        {radioNode}
        {helpers}
        {errorNode}
      </div>
    );
  },
);
RadioInner.displayName = 'Radio';

export const Radio = React.memo(RadioInner) as typeof RadioInner;
