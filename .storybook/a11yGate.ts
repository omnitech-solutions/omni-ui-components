/**
 * The accessibility gate of `pnpm test:storybook`: what one story's axe result means against the allow-list
 * (`a11yAllowList.ts`). Three outcomes fail a story:
 *
 * - a violated rule that is not listed for that story (a NEW violation);
 * - a listed rule that the story no longer violates (a STALE entry: delete it, so the list cannot rot);
 * - an axe run that itself failed.
 *
 * This file is pure (no Storybook, no DOM) so the mechanism has its own unit test.
 */
export type A11yAllowance = {
  /** Story id, as in the Storybook URL: `omni-ui-components-watermark--default`. */
  story: string;
  /** axe rule id: `color-contrast`. */
  rule: string;
  /** Why it is not fixed. */
  reason: string;
  /** When it was accepted, `YYYY-MM-DD`. */
  date: string;
};

export type A11yVerdict = { unexpected: string[]; stale: string[] };

export function judgeA11y(
  story: string,
  violatedRules: readonly string[],
  allowList: readonly A11yAllowance[],
): A11yVerdict {
  const allowed = new Set(
    allowList.filter((each) => each.story === story).map((each) => each.rule),
  );
  const violated = new Set(violatedRules);
  return {
    unexpected: [...violated].filter((rule) => !allowed.has(rule)).sort(),
    stale: [...allowed].filter((rule) => !violated.has(rule)).sort(),
  };
}

/** The failure message of a story, or `null` when the story passes the gate. */
export function a11yGateMessage(story: string, verdict: A11yVerdict): string | null {
  const lines: string[] = [];
  if (verdict.unexpected.length)
    lines.push(
      `New accessibility violation in "${story}": ${verdict.unexpected.join(', ')}. Fix it (the story's Accessibility panel shows the nodes), or record it in .storybook/a11yAllowList.ts with a reason.`,
    );
  if (verdict.stale.length)
    lines.push(
      `Stale entry in .storybook/a11yAllowList.ts: "${story}" no longer violates ${verdict.stale.join(', ')}. Delete the entry.`,
    );
  return lines.length ? lines.join('\n') : null;
}

/** Entries that are malformed or repeated: the list is checked by the unit test. */
export function a11yAllowListProblems(allowList: readonly A11yAllowance[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const each of allowList) {
    const key = `${each.story} / ${each.rule}`;
    if (seen.has(key)) problems.push(`${key}: listed twice`);
    seen.add(key);
    if (!/^[a-z0-9-]+--[a-z0-9-]+$/.test(each.story)) problems.push(`${key}: not a story id`);
    if (!each.rule.trim()) problems.push(`${key}: no rule`);
    if (each.reason.trim().length < 10) problems.push(`${key}: no reason`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(each.date)) problems.push(`${key}: date is not YYYY-MM-DD`);
  }
  return problems;
}
