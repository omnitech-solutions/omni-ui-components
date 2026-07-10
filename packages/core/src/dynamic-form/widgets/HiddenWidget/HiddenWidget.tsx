import type { WidgetProps } from '@rjsf/utils';

/**
 * RJSF Hidden widget — renders nothing visible but keeps the value in
 * the form data. Use for IDs, tokens, or computed fields.
 *
 * @example
 * const uiSchema = { recordId: { 'ui:widget': 'hidden' } };
 */
export const HiddenWidget = (props: WidgetProps) => {
  const { id, value } = props;
  return <input id={id} type="hidden" value={(value as string | number | undefined) ?? ''} data-slot="hidden-widget" readOnly />;
};
