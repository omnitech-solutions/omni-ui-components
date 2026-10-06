import * as React from 'react';
import { CircleAlert, CircleStop, RefreshCw } from 'lucide-react';

import { Button } from '@oc-tech/omni-ui-components/Button';
import type { ErrorCardProps } from '@oc-tech/omni-ui-components/ErrorCard';
import type { Variant } from '../../internal/support/makeFactory';

/** Titles per error code, the way the original app maps them (kept here as an example: the app owns the mapping). */
export const SAMPLE_ERROR_TITLES: Record<string, string> = {
  'model-unavailable': 'Couldn’t reach the model',
  'model-timeout': 'The model took too long',
  'output-truncated': 'The reply was cut off',
};

/** Build `<ErrorCard>` props for stories and tests. */
export const errorCardPropsFactory = (overrides: Partial<ErrorCardProps> = {}): ErrorCardProps => ({
  title: SAMPLE_ERROR_TITLES['model-timeout']!,
  message: 'The request timed out after 30 seconds.',
  note: 'Your message is saved and nothing has been applied.',
  icon: <CircleAlert />,
  retryIcon: <RefreshCw />,
  ...overrides,
});

export const errorCardVariants: Variant<ErrorCardProps>[] = [
  { name: 'Error with Retry', args: { onRetry: () => undefined } },
  {
    name: 'Retry disabled while busy',
    args: { onRetry: () => undefined, retryDisabled: true },
  },
  {
    name: 'Extra action',
    args: {
      onRetry: () => undefined,
      actions: (
        <Button variant="outline" buttonSize="sm">
          Switch model
        </Button>
      ),
    },
  },
  {
    name: 'Stopped banner',
    args: {
      variant: 'stopped',
      icon: <CircleStop />,
      title: 'Stopped. Nothing has been applied.',
    },
  },
];
