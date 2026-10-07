/** The five recency buckets of a conversation list, in display order. */
export type RecencyGroupKey = 'pinned' | 'today' | 'week' | 'month' | 'older';

export const RECENCY_GROUP_ORDER: readonly RecencyGroupKey[] = [
  'pinned',
  'today',
  'week',
  'month',
  'older',
];

/** English default headings; pass `labels` to translate any of them. */
export const DEFAULT_RECENCY_LABELS: Record<RecencyGroupKey, string> = {
  pinned: 'Pinned',
  today: 'Today',
  week: 'Previous 7 days',
  month: 'Previous 30 days',
  older: 'Older',
};

export interface RecencyGroup<T> {
  key: RecencyGroupKey;
  label: string;
  items: T[];
}

export interface GroupByRecencyOptions<T> {
  /** Items for which this returns true go to the `pinned` group. Omit (or pass `false`) to disable the pinned group. */
  pinned?: false | ((item: T) => boolean);
  /** The timestamp of an item (ISO string, epoch ms or Date). Default: the item's `updatedAt`. */
  at?: (item: T) => string | number | Date;
  /** Heading overrides. */
  labels?: Partial<Record<RecencyGroupKey, string>>;
}

const DAY = 86_400_000;

const toMs = (value: string | number | Date): number =>
  value instanceof Date ? value.getTime() : typeof value === 'number' ? value : Date.parse(value);

/**
 * The bucket of one timestamp. Day boundaries are local midnight (as in omnitech-assistant's `dateGroup`):
 * today is on or after midnight, week is the 7 days before it, month the 30 days before it, everything else older.
 * An unparseable timestamp is `older`.
 */
export const recencyGroupOf = (
  at: string | number | Date,
  now: Date | number = new Date(),
  pinned = false,
): RecencyGroupKey => {
  if (pinned) return 'pinned';
  const reference = new Date(now);
  const midnight = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
  ).getTime();
  const time = toMs(at);
  if (Number.isNaN(time)) return 'older';
  if (time >= midnight) return 'today';
  if (time >= midnight - 7 * DAY) return 'week';
  if (time >= midnight - 30 * DAY) return 'month';
  return 'older';
};

/**
 * Groups items by recency: Pinned, Today, Previous 7 days, Previous 30 days, Older. Empty groups are dropped, the
 * input order is kept inside each group (the caller sorts), and nothing is mutated.
 *
 * @example
 * groupByRecency(threads, new Date(), { pinned: (t) => t.pinned })
 */
export const groupByRecency = <T>(
  items: readonly T[],
  now: Date | number = new Date(),
  options: GroupByRecencyOptions<T> = {},
): RecencyGroup<T>[] => {
  const {
    pinned,
    at = (item: T) => (item as { updatedAt: string | number | Date }).updatedAt,
    labels,
  } = options;
  const buckets = new Map<RecencyGroupKey, T[]>(RECENCY_GROUP_ORDER.map((key) => [key, []]));
  items.forEach((item) => {
    const key = recencyGroupOf(at(item), now, pinned ? pinned(item) : false);
    buckets.get(key)?.push(item);
  });
  return RECENCY_GROUP_ORDER.flatMap((key) => {
    const bucket = buckets.get(key) ?? [];
    return bucket.length
      ? [{ key, label: labels?.[key] ?? DEFAULT_RECENCY_LABELS[key], items: bucket }]
      : [];
  });
};
