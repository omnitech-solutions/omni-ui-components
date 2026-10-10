import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react-vite';
import { a11yAllowList } from './a11yAllowList';
import { a11yGateMessage, judgeA11y } from './a11yGate';
import * as previewAnnotations from './preview';

type A11yReport = {
  type: string;
  result?: { error?: unknown; violations?: { id: string }[] };
};
type AfterEachContext = {
  id: string;
  parameters: { a11y?: { test?: string } };
  reporting: { reports: A11yReport[] };
};
type AfterEach = (context: AfterEachContext) => Promise<void> | void;

const runAxe = (a11yAddonAnnotations as unknown as { afterEach?: AfterEach }).afterEach;

/**
 * The accessibility gate. The a11y addon runs axe after every story (after its `play`), exactly as the story
 * view does, with `parameters.a11y` from the preview (`test: 'error'`, and the one accepted colour pair of
 * `a11yAllowances.ts`). On its own the addon fails a story on any violation; here its result is judged against
 * `a11yAllowList.ts` instead: a violation that is not listed fails, and a listed one that no longer happens
 * fails too. A story whose `a11y.test` is `'off'` or `'todo'` is left to the addon.
 */
const gatedAfterEach: AfterEach = async (context) => {
  let thrown: unknown;
  try {
    await runAxe?.(context);
  } catch (error) {
    thrown = error;
  }
  const report = context.reporting.reports.find((each) => each.type === 'a11y');
  if (context.parameters.a11y?.test !== 'error' || !report) {
    if (thrown) throw thrown;
    return;
  }
  // axe itself failed: that is never an allowed outcome.
  if (report.result?.error) throw thrown ?? report.result.error;
  const violated = (report.result?.violations ?? []).map((each) => each.id);
  const message = a11yGateMessage(context.id, judgeA11y(context.id, violated, a11yAllowList));
  if (message) throw new Error(message);
};

// Apply the Storybook preview (decorators, globals) to every story run by `pnpm test:storybook`, and the a11y
// addon with its check gated by the allow-list.
setProjectAnnotations([
  { ...a11yAddonAnnotations, afterEach: gatedAfterEach } as Parameters<
    typeof setProjectAnnotations
  >[0],
  previewAnnotations,
]);
