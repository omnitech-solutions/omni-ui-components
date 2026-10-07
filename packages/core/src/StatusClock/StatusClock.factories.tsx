import type { StatusClockProps } from '@oc-tech/omni-ui-components/StatusClock';

import { GitBranch, GitCommitHorizontal } from 'lucide-react';
import type * as React from 'react';
import type { Variant } from '../../internal/support/makeFactory';

/** Story-only icon nodes (the library takes icons from the caller). Recording: a ring with a solid centre. */
export const RecordIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="12" cy="12" r="9.5" />
    <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" />
  </svg>
);

/** Paused: a filled disc with two cut-out bars. */
export const PauseDiscIcon: React.FC = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10.5" fill="currentColor" />
    <rect x="8.5" y="7.5" width="2.4" height="9" rx="0.8" fill="var(--oui-panel-bg)" />
    <rect x="13.1" y="7.5" width="2.4" height="9" rx="0.8" fill="var(--oui-panel-bg)" />
  </svg>
);

export const SAMPLE_BUILD_TAG = {
  sha: 'a1b2c3d',
  branch: 'feat/native-panel-cleanup',
  commitIcon: <GitCommitHorizontal />,
  branchIcon: <GitBranch />,
  title: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
};

/** Build `<StatusClock>` props for stories and tests. */
export const statusClockPropsFactory = (
  overrides: Partial<StatusClockProps> = {},
): StatusClockProps => ({
  state: 'live',
  elapsed: '2:18:20',
  icon: <RecordIcon />,
  pausedIcon: <PauseDiscIcon />,
  ...overrides,
});

export const statusClockExamples: Variant<StatusClockProps>[] = [
  { name: 'Live', args: {} },
  { name: 'Live · dev build tag', args: { buildTag: SAMPLE_BUILD_TAG } },
  { name: 'Paused', args: { state: 'paused' } },
  {
    name: 'Paused · dev build tag',
    args: { state: 'paused', buildTag: SAMPLE_BUILD_TAG },
  },
];
