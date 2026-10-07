import { SplitButton, type SplitButtonProps } from '@oc-tech/omni-ui-components/SplitButton';
import { Eye, Mic, MicOff, Monitor, MonitorOff } from 'lucide-react';
import * as React from 'react';
import type { Variant } from '../../internal/support/makeFactory';
import {
  type CaptureMode,
  captureMenuSpec,
  micLostNotice,
  micMenuSpec,
  screenPermissionNotice,
} from '../ActionMenu/ActionMenu.factories';

/** What the capture control reflects: mode (tint), display, a running analysis, a screen problem, paused. */
export interface CaptureState {
  mode: CaptureMode;
  display?: string;
  analysing?: boolean;
  /** Screen recording permission is missing: amber outline, "!" badge and a leading notice in the menu. */
  problem?: boolean;
  paused?: boolean;
}

/**
 * Map the capture state to SplitButton props (the adapter an app would write): paused dims and blocks the main
 * action, a problem turns the control amber with a badge and a fix action, analysing shows the ring, Auto tints blue.
 */
export const captureSplitButtonProps = (
  state: CaptureState,
  handlers: { onFix?: () => void } = {},
): SplitButtonProps => {
  const { mode, display = 'follow', analysing, problem, paused } = state;
  const menu = captureMenuSpec(
    mode,
    display,
    problem ? screenPermissionNotice(handlers.onFix) : undefined,
  );
  if (paused) {
    return {
      tone: 'dim',
      main: { label: 'Capture', icon: <MonitorOff />, disabledReason: 'Resume to capture' },
      menu,
    };
  }
  if (problem) {
    return {
      tone: 'warning',
      status: { tone: 'warning', label: '!', description: 'Screen recording permission lost' },
      main: { label: 'Capture', icon: <Monitor />, tooltip: 'Screen recording permission lost' },
      menu,
    };
  }
  if (analysing) {
    return {
      main: {
        label: 'Capture',
        icon: <Monitor />,
        state: 'analysing',
        caption: 'Stop',
        tooltip: 'Analysing · click to stop',
        shortcut: ['⌘', '⇧', 'S'],
      },
      menu,
    };
  }
  return mode === 'auto'
    ? {
        tone: 'accent',
        main: {
          label: 'Capture',
          icon: <Monitor />,
          tooltip: 'Auto · re-analyses when the screen changes',
          caption: 'Auto',
        },
        menu,
      }
    : {
        main: {
          label: 'Capture',
          icon: <Monitor />,
          tooltip: 'Manual · click to analyse',
          shortcut: ['⌘', '⇧', 'S'],
        },
        menu,
      };
};

export type MicStatus = 'listening' | 'muted' | 'lost' | 'paused';

export interface MicState {
  status: MicStatus;
  device?: string;
}

/** Zoom semantics: neutral listening, red slash muted, amber outline + badge lost, dim paused. */
export const micSplitButtonProps = (
  state: MicState,
  handlers: { onRetry?: () => void } = {},
): SplitButtonProps => {
  const { status, device = 'macbook' } = state;
  const menu = micMenuSpec(device, status === 'lost' ? micLostNotice(handlers.onRetry) : undefined);
  switch (status) {
    case 'paused':
      return {
        tone: 'dim',
        main: { label: 'Mic', icon: <MicOff />, disabledReason: 'Resume to listen' },
        menu,
      };
    case 'lost':
      return {
        tone: 'warning',
        status: { tone: 'warning', label: '!', description: 'Microphone lost' },
        main: { label: 'Mic', icon: <Mic />, tooltip: 'Microphone lost · trying again' },
        menu,
      };
    case 'muted':
      return {
        tone: 'danger',
        main: {
          label: 'Unmute',
          icon: <MicOff />,
          tooltip: 'Muted · ⌥R to listen',
          shortcut: ['⌥', 'R'],
        },
        menu,
      };
    default:
      return {
        main: { label: 'Mic', icon: <Mic />, tooltip: 'Listening', shortcut: ['⌥', 'R'] },
        menu,
      };
  }
};

/** Report an interaction by name (Storybook wires this to the Actions panel). */
export type OnAction = (name: string, detail?: unknown) => void;

export interface CaptureSplitButtonDemoProps {
  initial?: CaptureState;
  size?: SplitButtonProps['size'];
  onAction?: OnAction;
}

/**
 * A working capture control: pressing starts / stops an analysis, the menu changes mode (the control tints blue and
 * its tooltip changes) and display, and the notice's fix action clears a screen problem. Controlled state lives here;
 * the SplitButton and ActionMenu themselves keep none.
 */
export const CaptureSplitButtonDemo: React.FC<CaptureSplitButtonDemoProps> = ({
  initial = { mode: 'manual' },
  size,
  onAction,
}) => {
  const [state, setState] = React.useState<CaptureState>(initial);
  React.useEffect(
    () => setState(initial),
    [initial.mode, initial.display, initial.analysing, initial.problem, initial.paused],
  );
  const props = captureSplitButtonProps(state, {
    onFix: () => {
      onAction?.('capture:fix');
      setState((s) => ({ ...s, problem: false }));
    },
  });
  return (
    <SplitButton
      {...props}
      size={size}
      main={{
        ...props.main,
        onPress: () => {
          onAction?.('capture:press');
          setState((s) => ({ ...s, analysing: !s.analysing }));
        },
      }}
      menu={{
        ...props.menu,
        onSelect: (id) => onAction?.('capture:select', id),
        onValueChange: (sectionId, id) => {
          if (sectionId === 'mode') setState((s) => ({ ...s, mode: id as CaptureMode }));
          if (sectionId === 'display') setState((s) => ({ ...s, display: id }));
        },
      }}
      onOpenChange={(open) => onAction?.('capture:open', open)}
    />
  );
};

export interface MicSplitButtonDemoProps {
  initial?: MicState;
  size?: SplitButtonProps['size'];
  onAction?: OnAction;
}

/** A working microphone control: press mutes / unmutes, the menu picks the device, "Retry now" recovers a lost mic. */
export const MicSplitButtonDemo: React.FC<MicSplitButtonDemoProps> = ({
  initial = { status: 'listening' },
  size,
  onAction,
}) => {
  const [state, setState] = React.useState<MicState>(initial);
  React.useEffect(() => setState(initial), [initial.status, initial.device]);
  const props = micSplitButtonProps(state, {
    onRetry: () => {
      onAction?.('mic:retry');
      setState((s) => ({ ...s, status: 'listening' }));
    },
  });
  return (
    <SplitButton
      {...props}
      size={size}
      main={{
        ...props.main,
        onPress: () => {
          onAction?.('mic:press');
          setState((s) => ({
            ...s,
            status:
              s.status === 'listening' ? 'muted' : s.status === 'muted' ? 'listening' : s.status,
          }));
        },
      }}
      menu={{
        ...props.menu,
        onSelect: (id) => onAction?.('mic:select', id),
        onValueChange: (_sectionId, id) => setState((s) => ({ ...s, device: id })),
      }}
      onOpenChange={(open) => onAction?.('mic:open', open)}
    />
  );
};

/** Build `<SplitButton>` props for standalone stories and tests (default: the capture button in Manual mode). */
export const splitButtonPropsFactory = (
  overrides: Partial<SplitButtonProps> = {},
): SplitButtonProps => ({
  ...captureSplitButtonProps({ mode: 'manual' }),
  ...overrides,
});

/** Capture: neutral = Manual, accent = Auto, ring while analysing, amber badge when permission is lost, dim when paused. */
export const splitButtonCaptureVariants: Variant<SplitButtonProps>[] = [
  { name: 'Capture · manual', args: captureSplitButtonProps({ mode: 'manual' }) },
  { name: 'Capture · auto (blue tint)', args: captureSplitButtonProps({ mode: 'auto' }) },
  {
    name: 'Capture · analysing (ring)',
    args: captureSplitButtonProps({ mode: 'manual', analysing: true }),
  },
  {
    name: 'Capture · screen permission lost',
    args: captureSplitButtonProps({ mode: 'manual', problem: true }),
  },
  { name: 'Capture · paused', args: captureSplitButtonProps({ mode: 'manual', paused: true }) },
];

/** Microphone: neutral listening, red slash when muted, amber outline + badge when lost, dim when paused. */
export const splitButtonMicVariants: Variant<SplitButtonProps>[] = [
  { name: 'Mic · listening', args: micSplitButtonProps({ status: 'listening' }) },
  { name: 'Mic · muted by you', args: micSplitButtonProps({ status: 'muted' }) },
  { name: 'Mic · lost, retrying', args: micSplitButtonProps({ status: 'lost' }) },
  { name: 'Mic · paused', args: micSplitButtonProps({ status: 'paused' }) },
];

/** Board 1c: C2 puts the mode word on the main button, C3 adds an Auto "eye" toggle as a third segment. */
export const splitButtonBoardVariants: Variant<SplitButtonProps>[] = [
  {
    name: 'C2 · mode word on the button',
    args: {
      main: {
        label: 'Capture, Manual',
        caption: 'Manual',
        labelInline: true,
        icon: <Monitor />,
        tooltip: 'Manual · click to analyse',
      },
      menu: captureMenuSpec('manual'),
    },
  },
  {
    name: 'C3 · capture + auto toggle (eye)',
    args: {
      main: { label: 'Capture', icon: <Monitor />, tooltip: 'Analyse now' },
      segments: [
        {
          id: 'auto',
          label: 'Auto',
          icon: <Eye />,
          pressed: true,
          tooltip: 'Auto · re-analyses when the screen changes',
          shortcut: ['⌥', '⇧', 'U'],
        },
      ],
      menu: captureMenuSpec('auto'),
    },
  },
];

export const splitButtonVariants: Variant<SplitButtonProps>[] = [
  ...splitButtonCaptureVariants,
  ...splitButtonMicVariants,
  ...splitButtonBoardVariants,
];
