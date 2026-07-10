/**
 * Skeleton loading variant — replaces body rows with shimmering placeholder
 * cells while keeping column headers untouched.
 */

import * as React from 'react';

import type { TableLoadingVariant } from './Table.Loading';

export const TableLoadingSkeletonVariant: TableLoadingVariant = {
  name: 'skeleton',
  replacesBody: true,
  renderRows: ({ rowCount, columnCount, columns, testIdPrefix }) => {
    const total = Math.max(rowCount, 2);
    const extra = Math.max(0, columnCount - columns.length);
    return Array.from({ length: total }).map((_, rowIdx) => (
      <tr key={`${testIdPrefix}-skeleton-${rowIdx}`} className="bui-table-skeleton-row" aria-hidden="true">
        {Array.from({ length: extra }).map((__, i) => (
          <td key={`sk-extra-${i}`} className="bui-table-skeleton-cell">
            <span className="bui-table-skeleton-block" />
          </td>
        ))}
        {columns.map((col) => (
          <td key={`sk-${col.key}`} className="bui-table-skeleton-cell">
            <span className="bui-table-skeleton-block" />
          </td>
        ))}
      </tr>
    ));
  },
};
