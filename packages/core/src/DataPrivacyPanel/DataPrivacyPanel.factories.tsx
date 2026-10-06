import * as React from 'react';

import { DataPrivacyPanel } from '@oc-tech/omni-ui-components/DataPrivacyPanel';
import type { ActivityLogItem, DataPrivacyPanelProps } from '@oc-tech/omni-ui-components/DataPrivacyPanel';
import type { Variant } from '../../internal/support/makeFactory';

export const sampleActivity = (count = 3): ActivityLogItem[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `a${index}`,
    summary: ['Searched evidence', 'Applied a change', 'Rolled back a change', 'Ran a tool'][index % 4],
    context: ['Two Sum with a hash map', 'Design a rate limiter', 'STAR story: the outage'][index % 3],
    at: new Date(Date.UTC(2026, 9, 6, 12, 0, 0) - index * 3_600_000).toISOString(),
  }));

/** Build `<DataPrivacyPanel>` props for standalone stories and tests. */
export const dataPrivacyPanelPropsFactory = (overrides: Partial<DataPrivacyPanelProps> = {}): DataPrivacyPanelProps => ({
  retention: 'forever',
  onRetentionChange: () => undefined,
  onShowActivityChange: () => undefined,
  onExport: () => undefined,
  onDeleteAll: () => undefined,
  formatDate: (at) => new Date(at).toISOString().slice(0, 16).replace('T', ' '),
  ...overrides,
});

export const dataPrivacyPanelVariants: Variant<DataPrivacyPanelProps>[] = [
  { name: 'All sections', args: {} },
  { name: 'Log open (3 rows)', args: { activityOpen: true, activity: sampleActivity() } },
  { name: 'Log open (scrolls at 220px)', args: { activityOpen: true, activity: sampleActivity(14) } },
  { name: 'Log empty', args: { activityOpen: true, activity: [] } },
  { name: 'Log loading', args: { activityOpen: true, activityLoading: true } },
  { name: 'Retention only', args: { onShowActivityChange: undefined, onExport: undefined, onDeleteAll: undefined } },
];

/** A working panel: retention changes, the log loads on View, Export and Delete report through `onAction`. */
export const DataPrivacyPanelDemo: React.FC<{ onAction?: (name: string, ...args: unknown[]) => void }> = ({ onAction }) => {
  const [retention, setRetention] = React.useState('forever');
  const [open, setOpen] = React.useState(false);
  const [rows, setRows] = React.useState<ActivityLogItem[]>();
  return (
    <div className="w-[560px]">
      <DataPrivacyPanel
        {...dataPrivacyPanelPropsFactory({
          retention,
          onRetentionChange: (value) => {
            setRetention(value);
            onAction?.('retention', value);
          },
          activityOpen: open,
          activity: rows,
          onShowActivityChange: (next) => {
            setOpen(next);
            if (next) setRows(sampleActivity(8));
            onAction?.('activity', next);
          },
          onExport: () => onAction?.('export'),
          onDeleteAll: () => onAction?.('delete-all'),
        })}
      />
    </div>
  );
};
