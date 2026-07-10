import type { RegistryFieldsType } from '@rjsf/utils';

import { StaticPanelField } from '../fields/StaticPanelField';

/**
 * App-level field registry. RJSF v6's internal `ObjectFieldPropertyFn`
 * memoizes each property's render so a Omni-side SchemaField
 * override is redundant for the common case. We do register fields
 * for non-input display surfaces (timer headers, summary panels) that
 * are part of the form layout but not part of the submit payload.
 *
 * @example
 * const merged = { ...appFields, scheduleConfiguration: ScheduleConfigurationField };
 */
export const appFields: RegistryFieldsType = {
  staticPanel: StaticPanelField,
  StaticPanelField,
};
