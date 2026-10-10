import type { WidgetProps } from '@rjsf/utils';

/** `hidden`: a value the form carries and never shows. It is submitted unchanged. */
export const HiddenWidget = (props: WidgetProps) => {
  const { id, value } = props;
  return (
    <input
      id={id}
      type="hidden"
      value={(value as string | number | undefined) ?? ''}
      data-slot="hidden-widget"
      readOnly
    />
  );
};
