import {
  SessionBar,
  type SessionBarProps,
  type SessionStatus,
} from '@oc-tech/omni-ui-components/SessionBar';
import { StatusClock, type StatusClockBuildTag } from '@oc-tech/omni-ui-components/StatusClock';
import { Pause, Play } from 'lucide-react';
import * as React from 'react';
import type { Variant } from '../../internal/support/makeFactory';
import { PauseDiscIcon, RecordIcon, SAMPLE_BUILD_TAG } from '../StatusClock/StatusClock.factories';

export type OnSessionAction = (name: string, detail?: unknown) => void;

/** Build `<SessionBar>` props (buttons with icons, no callbacks) for stories and tests. */
export const sessionBarPropsFactory = (
  overrides: Partial<SessionBarProps> = {},
): SessionBarProps => ({
  status: 'live',
  pause: { icon: <Pause /> },
  resume: { icon: <Play /> },
  end: {},
  ...overrides,
});

export interface SessionBarDemoProps {
  initial?: SessionStatus;
  elapsed?: string;
  /** Show the development build tag (a caller decision: dev builds only). */
  devBuild?: boolean;
  /** Ask before ending (Popconfirm). */
  confirmEnd?: boolean;
  /** Width in px for the narrow stories; unset = fill the parent. */
  width?: number;
  onAction?: OnSessionAction;
}

/** The footer from library parts only, with working state: Pause / Resume toggle, copy confirmation, End. */
export const SessionBarDemo: React.FC<SessionBarDemoProps> = ({
  initial = 'live',
  elapsed = '2:18:20',
  devBuild = false,
  confirmEnd = false,
  width,
  onAction,
}) => {
  const [status, setStatus] = React.useState<SessionStatus>(initial);
  React.useEffect(() => setStatus(initial), [initial]);
  const [copied, setCopied] = React.useState(false);
  const [ended, setEnded] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const buildTag: StatusClockBuildTag | undefined = devBuild
    ? {
        ...SAMPLE_BUILD_TAG,
        copied,
        onCopy: () => {
          onAction?.('build:copy', SAMPLE_BUILD_TAG.title);
          void navigator.clipboard?.writeText(SAMPLE_BUILD_TAG.title)?.catch(() => undefined);
          setCopied(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 1500);
        },
      }
    : undefined;

  return (
    <div style={width ? { width } : undefined} className="flex flex-col gap-2">
      <SessionBar
        status={status}
        leading={
          <StatusClock
            state={status}
            elapsed={elapsed}
            icon={<RecordIcon />}
            pausedIcon={<PauseDiscIcon />}
            buildTag={buildTag}
          />
        }
        pause={{
          icon: <Pause />,
          onClick: () => {
            onAction?.('pause');
            setStatus('paused');
          },
        }}
        resume={{
          icon: <Play />,
          onClick: () => {
            onAction?.('resume');
            setStatus('live');
          },
        }}
        end={{
          onClick: () => {
            onAction?.('end');
            setEnded(true);
          },
          confirm: confirmEnd
            ? {
                title: 'End this session?',
                description: 'The recording stops and the session is saved.',
                onCancel: () => onAction?.('end:cancel'),
              }
            : undefined,
        }}
      />
      {ended ? (
        <span role="status" className="font-mono text-xs text-white">
          Session ended
        </span>
      ) : null}
    </div>
  );
};

export const sessionBarExamples: Variant<SessionBarDemoProps>[] = [
  { name: 'Live · development build', args: { devBuild: true } },
  { name: 'Live · production build', args: {} },
  {
    name: 'Paused · development build (no tint)',
    args: { initial: 'paused', devBuild: true },
  },
];
