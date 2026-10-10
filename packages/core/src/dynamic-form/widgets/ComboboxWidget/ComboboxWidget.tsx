import type { WidgetProps } from '@rjsf/utils';
import { SelectControl } from '../SelectWidget';

/** `combobox`: `select` with the search box always on. Same schema, same options, same stored value. */
export const ComboboxWidget = (props: WidgetProps) => <SelectControl props={props} searchable />;
