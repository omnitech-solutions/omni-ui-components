export interface RetentionOption {
  value: string;
  label: string;
}

/** One line of the activity log. */
export interface ActivityLogItem {
  id?: string;
  /** What happened: `Searched evidence`. */
  summary: string;
  /** Where: the conversation title, shown muted after the summary. */
  context?: string;
  /** When: ISO string, epoch ms or Date. */
  at: string | number | Date;
}

export interface DataPrivacyPanelLabels {
  retentionTitle: string;
  retentionDescription: string;
  /** Accessible name of the retention choices. Default `Keep conversations`. */
  retentionGroup: string;
  activityTitle: string;
  activityDescription: string;
  viewLog: string;
  hideLog: string;
  /** Accessible name of the log list. Default `Activity log`. */
  activityList: string;
  activityLoading: string;
  activityEmpty: string;
  exportTitle: string;
  exportDescription: string;
  exportButton: string;
  deleteTitle: string;
  deleteDescription: string;
  deleteButton: string;
  /** Popconfirm title. Default `Delete everything?` */
  deleteConfirmTitle: string;
  deleteConfirmDescription: string;
  deleteConfirm: string;
  deleteCancel: string;
}

export interface DataPrivacyPanelProps {
  /** Current retention value (controlled). Omit for an uncontrolled choice starting at `defaultRetention`. */
  retention?: string;
  defaultRetention?: string;
  /** Default Forever / 90 days / 30 days with the values `forever`, `90d`, `30d`. */
  retentionOptions?: RetentionOption[];
  /** Fires with the chosen value whenever retention changes, controlled or not. The section is not rendered without it. */
  onRetentionChange?: (value: string) => void | Promise<void>;
  /** The log rows. `undefined` while closed or not loaded. */
  activity?: ActivityLogItem[];
  /** Whether the log is shown (controlled). Omit for an uncontrolled toggle starting at `defaultActivityOpen`. */
  activityOpen?: boolean;
  defaultActivityOpen?: boolean;
  /** Fires with the new open state whenever View log / Hide log is chosen, controlled or not: load the rows when it is `true`. The section is not rendered without it. */
  onShowActivityChange?: (open: boolean) => void | Promise<void>;
  activityLoading?: boolean;
  /** Fires when Export is chosen. The section is not rendered without it. */
  onExport?: () => void | Promise<void>;
  /** Fires after the Popconfirm is confirmed. The section is not rendered without it. */
  onDeleteAll?: () => void | Promise<void>;
  /** Date text of a log row. Default `toLocaleString`. */
  formatDate?: (at: string | number | Date) => string;
  labels?: Partial<DataPrivacyPanelLabels>;
  className?: string;
}
