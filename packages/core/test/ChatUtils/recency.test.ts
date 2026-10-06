import { groupByRecency, recencyGroupOf } from '@oc-tech/omni-ui-components/lib/chat';

// Tuesday 6 October 2026, midday (local time): midnight is the day boundary.
const NOW = new Date(2026, 9, 6, 12, 0, 0);
const at = (days: number, hours = 0) => new Date(NOW.getTime() - days * 86_400_000 - hours * 3_600_000);

describe('groupByRecency', () => {
  it('buckets by local midnight: today, previous 7 days, previous 30 days, older', () => {
    expect(recencyGroupOf(at(0, 11), NOW)).toBe('today');
    expect(recencyGroupOf(at(0, 13), NOW)).toBe('week'); // 23:00 yesterday
    expect(recencyGroupOf(at(6), NOW)).toBe('week');
    expect(recencyGroupOf(at(8), NOW)).toBe('month');
    expect(recencyGroupOf(at(31), NOW)).toBe('older');
    expect(recencyGroupOf('not a date', NOW)).toBe('older');
  });

  it('puts pinned items first, drops empty groups and keeps the input order inside a group', () => {
    const items = [
      { id: 'a', updatedAt: at(0, 1).toISOString() },
      { id: 'b', updatedAt: at(40).toISOString(), pinned: true },
      { id: 'c', updatedAt: at(0, 2).toISOString() },
      { id: 'd', updatedAt: at(100).toISOString() },
    ];
    const groups = groupByRecency(items, NOW, { pinned: (item) => Boolean((item as { pinned?: boolean }).pinned) });
    expect(groups.map((group) => group.key)).toEqual(['pinned', 'today', 'older']);
    expect(groups[1].items.map((item) => item.id)).toEqual(['a', 'c']);
    expect(groups[0].label).toBe('Pinned');
    expect(groups[1].label).toBe('Today');
  });

  it('ignores pinned when the option is off, accepts a custom timestamp and labels, and does not mutate', () => {
    const items = [{ id: 'a', stamp: at(3).getTime(), pinned: true }];
    const frozen = JSON.stringify(items);
    const groups = groupByRecency(items, NOW, { at: (item) => item.stamp, labels: { week: 'Esta semana' } });
    expect(groups).toEqual([{ key: 'week', label: 'Esta semana', items }]);
    expect(JSON.stringify(items)).toBe(frozen);
  });

  it('accepts `now` as a number and returns nothing for no items', () => {
    expect(groupByRecency([], NOW.getTime())).toEqual([]);
    expect(groupByRecency([{ updatedAt: at(0, 1) }], NOW.getTime())[0].key).toBe('today');
  });
});
