import type { RegistryFieldsType } from '@rjsf/utils';
import { DateRangeField } from '../fields/DateRangeField';
import { StaticPanelField } from '../fields/StaticPanelField';

/**
 * The library's field registry. A field owns a whole schema node: one whose value is an object (`dateRange`),
 * or one with no value at all (`staticPanel`). Chosen with `ui:field`.
 *
 * @example
 * const merged = { ...appFields, scheduleConfiguration: ScheduleConfigurationField };
 */
export const appFields: RegistryFieldsType = {
  dateRange: DateRangeField,
  DateRangeField,
  staticPanel: StaticPanelField,
  StaticPanelField,
};
