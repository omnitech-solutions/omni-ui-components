import { a11yAllowList } from 'storybook-helpers/a11yAllowList';
import {
  type A11yAllowance,
  a11yAllowListProblems,
  a11yGateMessage,
  judgeA11y,
} from 'storybook-helpers/a11yGate';
import { describe, expect, it } from 'vitest';

const entry = (story: string, rule: string): A11yAllowance => ({
  story,
  rule,
  reason: 'A deliberate demo of a faint mark.',
  date: '2026-10-10',
});
const list = [entry('lib-watermark--default', 'color-contrast')];

describe('the accessibility gate of the Storybook test run', () => {
  it('passes a story with no violation and no entry', () => {
    const verdict = judgeA11y('lib-button--default', [], list);
    expect(verdict).toEqual({ unexpected: [], stale: [] });
    expect(a11yGateMessage('lib-button--default', verdict)).toBeNull();
  });

  it('passes a story whose only violation is listed', () => {
    const verdict = judgeA11y('lib-watermark--default', ['color-contrast'], list);
    expect(a11yGateMessage('lib-watermark--default', verdict)).toBeNull();
  });

  it('fails a new violation, on a story with no entry and on a listed story alike', () => {
    expect(judgeA11y('lib-button--default', ['button-name'], list).unexpected).toEqual([
      'button-name',
    ]);
    const verdict = judgeA11y('lib-watermark--default', ['color-contrast', 'label'], list);
    expect(verdict).toEqual({ unexpected: ['label'], stale: [] });
    expect(a11yGateMessage('lib-watermark--default', verdict)).toContain(
      'New accessibility violation',
    );
  });

  it('fails an entry that no longer fails, so the list cannot rot', () => {
    const verdict = judgeA11y('lib-watermark--default', [], list);
    expect(verdict).toEqual({ unexpected: [], stale: ['color-contrast'] });
    expect(a11yGateMessage('lib-watermark--default', verdict)).toContain('Stale entry');
  });

  it('an entry covers its own story only', () => {
    expect(judgeA11y('lib-watermark--internal', ['color-contrast'], list).unexpected).toEqual([
      'color-contrast',
    ]);
  });

  it('finds a malformed or repeated entry', () => {
    expect(a11yAllowListProblems(list)).toEqual([]);
    expect(
      a11yAllowListProblems([
        ...list,
        ...list,
        { story: 'Not An Id', rule: '', reason: 'why', date: 'today' },
      ]),
    ).toHaveLength(5);
  });

  it('the real allow-list is well formed', () => {
    expect(a11yAllowListProblems(a11yAllowList)).toEqual([]);
  });
});
