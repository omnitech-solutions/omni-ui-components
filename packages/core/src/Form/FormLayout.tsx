import * as React from 'react';

import { cn } from 'lib/utils';

export interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns. Default 2. Single-field rows stay at half width by
   * default — to fill the row, widen the child cell via its own
   * `gridColumn` style (e.g. `style={{ gridColumn: 'span 2' }}` for a
   * notes textarea, mirroring the `{ value, span }` form in RJSF
   * `ui:rows`).
   */
  cols?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}

/**
 * Row primitive used inside `<Form>`. Renders a CSS grid with `cols` equal
 * columns. Column gap is 2rem, row gap is 1.5rem — matched to
 * `dynamic-form`'s ObjectFieldTemplate so vanilla `<Form>` and
 * `<DynamicForm>` render identically.
 *
 * @example
 * // 2-col row (default)
 * <FormRow>
 *   <FormField name="address1">…</FormField>
 *   <FormField name="address2">…</FormField>
 * </FormRow>
 *
 * @example
 * // single-field row — auto full-width
 * <FormRow>
 *   <FormField name="email">…</FormField>
 * </FormRow>
 *
 * @example
 * // explicit half-width single field (trailing cell stays empty)
 * <FormRow cols={2}>
 *   <FormField name="label">…</FormField>
 * </FormRow>
 */
export const FormRow: React.FC<FormRowProps> = ({ cols, className, children, ...rest }) => {
  const items = React.Children.toArray(children);
  const resolvedCols = cols ?? (items.length === 1 ? 1 : 2);
  const trailing = resolvedCols - (items.length % resolvedCols || resolvedCols);
  return (
    <div className={cn('grid gap-x-8 gap-y-6', className)} style={{ gridTemplateColumns: `repeat(${resolvedCols}, minmax(0, 1fr))` }} {...rest}>
      {items}
      {trailing > 0 && trailing < resolvedCols ? Array.from({ length: trailing }).map((_, i) => <div key={`__pad-${i}`} aria-hidden />) : null}
    </div>
  );
};

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Divider above the actions row. Default `true`. */
  divider?: boolean;
  /** Horizontal alignment of action buttons. Default `end`. */
  align?: 'start' | 'center' | 'end' | 'between';
  children: React.ReactNode;
}

const JUSTIFY: Record<NonNullable<FormActionsProps['align']>, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
};

/**
 * Actions row primitive — divider + flex container for submit / cancel
 * buttons. Matches the `mt-6 border-t pt-6` rhythm used by
 * `dynamic-form`'s ObjectFieldTemplate.
 *
 * @example
 * <FormActions>
 *   <Button type="button" variant="ghost">Cancel</Button>
 *   <Button type="submit">Save</Button>
 * </FormActions>
 */
export const FormActions: React.FC<FormActionsProps> = ({ divider = true, align = 'end', className, children, ...rest }) => (
  <div className={cn('mt-6 flex items-center gap-3 pt-6', JUSTIFY[align], divider && 'border-t border-border', className)} {...rest}>
    {children}
  </div>
);
