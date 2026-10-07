import * as React from "react";
import { Eye, Monitor } from "lucide-react";

import {
  SplitButton,
  type SplitButtonProps,
} from "@oc-tech/omni-ui-components/SplitButton";
import { captureMenuSpec } from "factories/omni-ui-components/ActionMenu/ActionMenu.factories";
import {
  NativePanelsDemo,
  PANEL_BACKDROP,
  type NativePanelsState,
} from "factories/omni-ui-components/Panel/Panel.factories";
import {
  TranscriptPanel,
  readyEntries,
} from "factories/omni-ui-components/Transcript/Transcript.factories";
import { SessionBarDemo } from "factories/omni-ui-components/SessionBar/SessionBar.factories";
import { NativeToolbarDemo } from "factories/omni-ui-components/Toolbar/Toolbar.factories";
import type {
  MicStatus,
  OnAction,
} from "factories/omni-ui-components/SplitButton/SplitButton.factories";

/** Everything the Native App showcase stories are driven by (the Storybook controls). */
export interface NativeAppArgs {
  /** Panel and footer surface opacity, 0.22 to 1. Text and icons stay opaque. */
  seeThrough: number;
  /** Window width in px: 900, 1180 or 330 (the transcript alone). */
  width: number;
  paused: boolean;
  /** Development build: the footer shows the `<short sha> · <branch>` tag. */
  devBuild: boolean;
  mic: Exclude<MicStatus, "paused">;
  screen: "ok" | "problem";
  mode: "manual" | "auto";
  analysing: boolean;
  onAction?: OnAction;
}

export const nativeAppDefaults: Omit<NativeAppArgs, "onAction"> = {
  seeThrough: 1,
  width: 1180,
  paused: false,
  devBuild: true,
  mic: "listening",
  screen: "ok",
  mode: "manual",
  analysing: false,
};

/** The controls shared by every story; each story shows only the ones it reads. */
export const nativeAppArgTypes = {
  seeThrough: {
    control: { type: "range", min: 0.22, max: 1, step: 0.01 },
    description: "Panel and footer background opacity (M11).",
  },
  width: {
    control: "inline-radio",
    options: [900, 1180, 330],
    description: "Window width in px (330 = the transcript alone).",
  },
  paused: {
    control: "boolean",
    description:
      "Paused session: dimmed capture and mic (T8), Resume in the footer (F3).",
  },
  devBuild: {
    control: "boolean",
    description: "Development build: show the build tag in the footer (F2).",
  },
  mic: {
    control: "inline-radio",
    options: ["listening", "muted", "lost"],
    description: "Microphone state (T3).",
  },
  screen: {
    control: "inline-radio",
    options: ["ok", "problem"],
    description: "Screen state (T4).",
  },
  mode: {
    control: "inline-radio",
    options: ["manual", "auto"],
    description: "When to analyse (T1).",
  },
  analysing: {
    control: "boolean",
    description:
      "A run is active: ring on the capture button (T2), steps and Stop in the Answer panel (M3).",
  },
  onAction: {
    action: "native-app",
    description: "Story-only: reports presses, menu choices and panel changes.",
  },
} as const;

/** Hide the controls a story does not read, keeping the Controls panel honest. */
export const hideControls = (...names: Array<keyof NativeAppArgs>) =>
  Object.fromEntries(names.map((name) => [name, { table: { disable: true } }]));

export interface NativeFooterProps {
  paused?: boolean;
  devBuild?: boolean;
  seeThrough?: number;
  onAction?: OnAction;
}

/**
 * The footer (board 1e): the library's SessionBarDemo (SessionBar + StatusClock), with the panel see-through token
 * set around it. Pause and Resume are reported through `onAction` as `pause` and `resume`.
 */
export const NativeFooter: React.FC<NativeFooterProps> = ({
  paused = false,
  devBuild = true,
  seeThrough = 1,
  onAction,
}) => (
  <div style={{ ["--oui-panel-see-through" as string]: seeThrough }}>
    <SessionBarDemo
      initial={paused ? "paused" : "live"}
      devBuild={devBuild}
      confirmEnd
      onAction={onAction}
    />
  </div>
);

/** The designer gallery's blue panel behind a row (story-only chrome). */
export const Backdrop: React.FC<
  React.PropsWithChildren<{ width?: number; className?: string }>
> = ({ children, width, className }) => (
  <div
    className={`box-border rounded-xl p-3.5 ${className ?? ""}`}
    style={{ background: PANEL_BACKDROP, width }}
  >
    {children}
  </div>
);

/** A mono caption above a board state, as in the gallery. */
export const StateLabel: React.FC<React.PropsWithChildren> = ({ children }) => (
  <span className="font-mono text-[11.5px] text-[var(--oui-foreground-muted)]">
    {children}
  </span>
);

/**
 * The whole Native App window: toolbar, panels and footer, in one blue backdrop `width` wide. State lives here
 * (analysing, paused, visible panels) so the controls drive the real library parts the way the app does:
 * pressing capture or Stop toggles a run, Pause and Resume flip the session, hiding any panel reflows the rest (the last one stays).
 */
export const NativeAppWindow: React.FC<NativeAppArgs> = ({
  seeThrough,
  width,
  paused: pausedProp,
  devBuild,
  mic,
  screen,
  mode,
  analysing: analysingProp,
  onAction,
}) => {
  const [analysing, setAnalysing] = React.useState(analysingProp);
  const [paused, setPaused] = React.useState(pausedProp);
  const [panels, setPanels] = React.useState(["chat", "answer", "code"]);
  React.useEffect(() => setAnalysing(analysingProp), [analysingProp]);
  React.useEffect(() => setPaused(pausedProp), [pausedProp]);

  const report: OnAction = (name, detail) => {
    onAction?.(name, detail);
    if (name === "capture:press" || name === "stop")
      setAnalysing((current) => (name === "stop" ? false : !current));
    if (name === "pause" || name === "resume") setPaused(name === "pause");
    if (name === "panels:change") setPanels(detail as string[]);
  };

  const visible = {
    chat: panels.includes("chat"),
    answer: panels.includes("answer"),
    code: panels.includes("code"),
  };
  const panelState: NativePanelsState = analysing ? "analysing" : "ready";

  if (width <= 400) {
    return (
      <TranscriptPanel
        entries={readyEntries()}
        seeThrough={seeThrough}
        width={Math.min(width, 330)}
        onAction={report}
      />
    );
  }

  return (
    <div
      data-testid="native-app-window"
      className="box-border flex flex-col gap-0 overflow-hidden rounded-xl"
      style={{
        background: PANEL_BACKDROP,
        width,
        ["--oui-panel-see-through" as string]: seeThrough,
      }}
    >
      <div className="flex justify-center px-3.5 pt-3.5">
        <NativeToolbarDemo
          capture={{ mode, analysing, problem: screen === "problem", paused }}
          mic={{ status: paused ? "paused" : mic }}
          panels={panels}
          onAction={report}
        />
      </div>
      <NativePanelsDemo
        state={panelState}
        visible={visible}
        seeThrough={seeThrough}
        width={width}
        onAction={report}
      />
      <div className="px-3.5 pb-3.5">
        <NativeFooter
          paused={paused}
          devBuild={devBuild}
          seeThrough={seeThrough}
          onAction={report}
        />
      </div>
    </div>
  );
};

/** The three capture-control options of board 1c, as SplitButton configurations (C1 picked; C2 and C3 for comparison). */
export const captureOptions = (): Array<{
  id: string;
  title: string;
  description: string;
  picked?: boolean;
  controls: SplitButtonProps[];
}> => {
  const menu = captureMenuSpec("manual");
  const main = { label: "Capture", icon: <Monitor /> };
  return [
    {
      id: "c1",
      title: "C1 · Mode in the menu, tint shows Auto",
      description:
        'The narrowest option. Neutral means Manual and blue means Auto (watching). Clicking always means "analyse now". The tooltip names the mode.',
      picked: true,
      controls: [
        { main: { ...main, tooltip: "Manual · click to analyse" }, menu },
        {
          tone: "accent",
          main: {
            ...main,
            tooltip: "Auto · re-analyses when the screen changes",
          },
          menu: captureMenuSpec("auto"),
        },
      ],
    },
    {
      id: "c2",
      title: "C2 · Mode word on the button",
      description:
        "The mode is always readable, which is closest to today's toolbar. But it's the icon-plus-text pairing you disliked, and it's about 60px wider.",
      controls: [
        {
          main: {
            label: "Capture, Manual",
            icon: (
              <span className="inline-flex items-center gap-2 text-[15px]">
                <Monitor className="!size-5" />
                Manual
              </span>
            ),
          },
          menu,
        },
      ],
    },
    {
      id: "c3",
      title: "C3 · Capture + Auto toggle (eye)",
      description:
        "Auto is one click away, like ⌥⇧U. It's explicit, but it adds a third segment that people may confuse with see-through.",
      controls: [
        {
          main: {
            label: "Capture and auto toggle",
            icon: (
              <span className="inline-flex items-center gap-3">
                <Monitor className="!size-5" />
                <Eye className="!size-5 text-[color:var(--oui-tone-accent-fg)]" />
              </span>
            ),
          },
          menu,
        },
      ],
    },
  ];
};

/** `SplitButton` row used by the 1c cards. */
export const CaptureOption: React.FC<{ controls: SplitButtonProps[] }> = ({
  controls,
}) => (
  <div className="flex items-center justify-center gap-3">
    {controls.map((props, index) => (
      <SplitButton key={index} {...props} />
    ))}
  </div>
);
