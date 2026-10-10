import { cn } from 'lib/utils';
import { Button } from '../Button';
import { useControllableState } from '../lib/use-controllable-state';
import { Popconfirm } from '../Popconfirm';
import { SegmentedPrimitive } from '../Segmented';
import { SettingRow } from '../SettingsDialog/SettingRow';
import type {
  ActivityLogItem,
  DataPrivacyPanelLabels,
  DataPrivacyPanelProps,
  RetentionOption,
} from './DataPrivacyPanel.types';

export const DEFAULT_DATA_PRIVACY_LABELS: DataPrivacyPanelLabels = {
  retentionTitle: 'Keep conversations',
  retentionDescription: 'Older conversations are deleted automatically',
  retentionGroup: 'Keep conversations',
  activityTitle: 'Activity log',
  activityDescription: 'Every tool call and change the assistant made',
  viewLog: 'View log',
  hideLog: 'Hide log',
  activityList: 'Activity log',
  activityLoading: 'Loading…',
  activityEmpty: 'Nothing yet.',
  exportTitle: 'Export all data',
  exportDescription: 'Conversations, memory and settings as JSON',
  exportButton: 'Export',
  deleteTitle: 'Delete everything',
  deleteDescription: 'All conversations, memory and attachments',
  deleteButton: 'Delete all',
  deleteConfirmTitle: 'Delete everything?',
  deleteConfirmDescription: 'This can’t be undone.',
  deleteConfirm: 'Yes, delete all',
  deleteCancel: 'Cancel',
};

export const DEFAULT_RETENTION_OPTIONS: RetentionOption[] = [
  { value: 'forever', label: 'Forever' },
  { value: '90d', label: '90 days' },
  { value: '30d', label: '30 days' },
];

const defaultDate = (at: ActivityLogItem['at']) => new Date(at).toLocaleString();

/**
 * Omni DataPrivacyPanel: what is kept, for how long, and taking it away. A retention Segmented, an activity log you
 * View or Hide (a list capped at 220px that scrolls), Export all data, and Delete everything behind the library
 * Popconfirm (replacing the original's two-click confirmation). Every section appears only when its callback is
 * given; all strings are in `labels`.
 *
 * Slots: `data-slot="data-privacy" | "data-privacy-retention" | "data-privacy-log" | "data-privacy-export" | "data-privacy-delete"`.
 *
 * @example
 * <DataPrivacyPanel retention={r} onRetentionChange={setR} activity={rows} activityOpen={open} onShowActivityChange={load}
 *   onExport={exportAll} onDeleteAll={deleteAll} />
 */
export const DataPrivacyPanel = ({
  retention: retentionProp,
  defaultRetention = 'forever',
  retentionOptions = DEFAULT_RETENTION_OPTIONS,
  onRetentionChange,
  activity,
  activityOpen: activityOpenProp,
  defaultActivityOpen = false,
  onShowActivityChange,
  activityLoading = false,
  onExport,
  onDeleteAll,
  formatDate = defaultDate,
  labels: labelOverrides,
  className,
}: DataPrivacyPanelProps) => {
  const labels = { ...DEFAULT_DATA_PRIVACY_LABELS, ...labelOverrides };
  const [retention, setRetention] = useControllableState<string>(
    retentionProp,
    defaultRetention,
    onRetentionChange,
  );
  const [activityOpen, setActivityOpen] = useControllableState<boolean>(
    activityOpenProp,
    defaultActivityOpen,
    onShowActivityChange,
  );
  return (
    <div data-slot="data-privacy" className={cn('flex flex-col gap-4', className)}>
      {onRetentionChange ? (
        <div data-slot="data-privacy-retention">
          <SettingRow title={labels.retentionTitle} description={labels.retentionDescription}>
            <div role="group" aria-label={labels.retentionGroup}>
              <SegmentedPrimitive
                options={retentionOptions}
                value={retention}
                onChange={setRetention}
              />
            </div>
          </SettingRow>
        </div>
      ) : null}

      {onShowActivityChange ? (
        <div data-slot="data-privacy-log" className="flex flex-col gap-2.5">
          <SettingRow title={labels.activityTitle} description={labels.activityDescription}>
            <Button
              variant="outline"
              buttonSize="sm"
              aria-expanded={activityOpen}
              onClick={() => setActivityOpen(!activityOpen)}
            >
              {activityOpen ? labels.hideLog : labels.viewLog}
            </Button>
          </SettingRow>
          {activityOpen ? (
            activityLoading ? (
              <div className="text-[13px] text-[color:var(--oui-panel-meta-fg)]">
                {labels.activityLoading}
              </div>
            ) : (
              <ul
                aria-label={labels.activityList}
                // The list scrolls past 220px: a tab stop lets the keyboard reach the entries below.
                tabIndex={0}
                className="m-0 max-h-[220px] list-none overflow-auto rounded-xl border border-solid border-[color:var(--oui-panel-border)] p-0"
              >
                {(activity ?? []).map((item, index) => (
                  <li
                    key={item.id ?? index}
                    className="flex items-baseline gap-3 border-b border-solid border-[color:var(--oui-panel-divider)] px-3 py-2 text-[13px] last:border-b-0"
                  >
                    <span className="min-w-0 flex-1">
                      {item.summary}
                      {item.context ? (
                        <span className="text-[color:var(--oui-panel-meta-fg)]">
                          {' '}
                          · {item.context}
                        </span>
                      ) : null}
                    </span>
                    <span className="whitespace-nowrap text-[12px] text-[color:var(--oui-panel-meta-fg)]">
                      {formatDate(item.at)}
                    </span>
                  </li>
                ))}
                {(activity ?? []).length === 0 ? (
                  <li className="px-3 py-3 text-[13px] text-[color:var(--oui-panel-meta-fg)]">
                    {labels.activityEmpty}
                  </li>
                ) : null}
              </ul>
            )
          ) : null}
        </div>
      ) : null}

      {onExport ? (
        <div data-slot="data-privacy-export">
          <SettingRow title={labels.exportTitle} description={labels.exportDescription}>
            <Button variant="outline" buttonSize="sm" onClick={() => void onExport()}>
              {labels.exportButton}
            </Button>
          </SettingRow>
        </div>
      ) : null}

      {onDeleteAll ? (
        <div data-slot="data-privacy-delete">
          <SettingRow
            tone="danger"
            title={labels.deleteTitle}
            description={labels.deleteDescription}
          >
            <Popconfirm
              title={labels.deleteConfirmTitle}
              description={labels.deleteConfirmDescription}
              confirmText={labels.deleteConfirm}
              cancelText={labels.deleteCancel}
              onConfirm={() => void onDeleteAll()}
            >
              <Button tone="danger" soft buttonSize="sm">
                {labels.deleteButton}
              </Button>
            </Popconfirm>
          </SettingRow>
        </div>
      ) : null}
    </div>
  );
};
