import type { AlertProps } from '@oc-tech/omni-ui-components/Alert';
import type { Variant } from '../../internal/support/makeFactory';

export const alertPropsFactory = (overrides: Partial<AlertProps> = {}): AlertProps => ({
  variant: 'info',
  title: 'Heads up',
  children: 'This is an informational message.',
  ...overrides,
});

export const alertVariants: Variant<AlertProps>[] = [
  { name: 'Info', args: { variant: 'info' } },
  { name: 'Success', args: { variant: 'success', title: 'Saved', children: 'Changes were saved successfully.' } },
  { name: 'Warning', args: { variant: 'warning', title: 'Warning', children: 'Review this value before continuing.' } },
  { name: 'Error', args: { variant: 'error', title: 'Error', children: 'Something went wrong.' } },
  { name: 'Loading', args: { variant: 'loading', title: 'Loading', children: 'Fetching the latest data.' } },
];
