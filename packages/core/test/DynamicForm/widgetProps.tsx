import type { RegistryWidgetsType, WidgetProps } from '@rjsf/utils';
import { vi } from 'vitest';

/** A complete WidgetProps with spies for the three RJSF callbacks; override what a test cares about. */
export const makeWidgetProps = (overrides: Partial<WidgetProps> = {}) => {
  const onChange = vi.fn();
  const onBlur = vi.fn();
  const onFocus = vi.fn();
  const props = {
    id: 'root_field',
    name: 'field',
    label: 'Field',
    schema: { type: 'string' },
    options: {},
    value: undefined,
    required: false,
    disabled: false,
    readonly: false,
    autofocus: false,
    rawErrors: undefined,
    multiple: false,
    placeholder: '',
    onChange,
    onBlur,
    onFocus,
    registry: { formContext: {} } as unknown as WidgetProps['registry'],
    ...overrides,
  } as WidgetProps;
  return { props, onChange, onBlur, onFocus };
};

export type WidgetMap = RegistryWidgetsType;
