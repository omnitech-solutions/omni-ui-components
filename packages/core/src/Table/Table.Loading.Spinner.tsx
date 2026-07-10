/**
 * Spinner loading variant — legacy overlay that dims the table and centers a
 * spinner. Real body rows keep rendering underneath.
 */

import * as React from 'react';

import type { TableLoadingVariant } from './Table.Loading';

export const TableLoadingSpinnerVariant: TableLoadingVariant = {
  name: 'spinner',
  replacesBody: false,
  renderOverlay: ({ Spinner, props, testIdPrefix }) => (
    <div className="bui-table-loading-overlay" data-testid={`${testIdPrefix}-loading`}>
      <Spinner {...(props ?? {})} />
    </div>
  ),
};
