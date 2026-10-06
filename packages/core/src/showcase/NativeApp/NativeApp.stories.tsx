import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { ActionMenu } from "@oc-tech/omni-ui-components/ActionMenu";
import {
  answerStyleMenu,
  captureMenuSpec,
  micLostMenu,
  shortcutsMenu,
  type ActionMenuSpec,
} from "factories/omni-ui-components/ActionMenu/ActionMenu.factories";
import { NativePanelsDemo } from "factories/omni-ui-components/Panel/Panel.factories";
import {
  NativeToolbarDemo,
  toolbarVariants,
} from "factories/omni-ui-components/Toolbar/Toolbar.factories";
import {
  Backdrop,
  CaptureOption,
  captureOptions,
  hideControls,
  NativeAppWindow,
  NativeFooter,
  nativeAppArgTypes,
  nativeAppDefaults,
  StateLabel,
  type NativeAppArgs,
} from "./NativeApp.factories";

const DOCS = `
The Native App window, composed only from library parts with mocked callbacks, mirroring the designer gallery
(*Native Panel Cleanup*, boards 1a, 1c, 1d, 1e; the Zoom-style board 1b and board 1f are not reproduced).

| Story | Board | Requirements covered |
| --- | --- | --- |
| Toolbar States | 1a, Compact icons + caret: live manual, live auto, analysing, mic lost, screen permission lost, mic muted, paused with code hidden | T1 T2 T3 T4 T6 T8 T9 |
| Toolbar Variations | 1c, Merging "Manual" into capture: C1, C2, C3 and the four caret menus shown open (When to analyse, Microphone lost, Answer style, Shortcuts) | T1 T3 T5 T7 |
| Panels In Three States | 1d: ready (nothing analysed), analysing with one screenshot waiting, answer ready with Code hidden | M1 to M11 |
| Footer States | 1e, Timer left, actions right: live dev build, live production build, paused dev build | F1 F2 F3 F4 F5 F6 |
| Window 1180 and Window 900 | Toolbar, panels and footer together at two window widths; every control below drives them | T1 to T9, M10, M11, F1 to F6 |

**Controls.** \`seeThrough\` (0.22 to 1) lowers panel and footer backgrounds only (M11); \`width\` is 900, 1180 or 330
(the transcript alone); \`paused\`, \`devBuild\`, \`mic\` (listening, muted, lost), \`screen\` (ok, problem), \`mode\`
(manual, auto) and \`analysing\` set the starting state. In the window stories the parts also talk to each other:
the capture button and the Answer panel's Stop toggle the run, Pause and Resume in the footer pause the toolbar,
and hiding Code in the panel toggles reflows to two panels. Every press is reported in the Actions panel.
`;

const meta: Meta<NativeAppArgs> = {
  title: "omni-ui-components/Showcase/Native App",
  tags: ["autodocs"],
  parameters: { layout: "padded", docs: { description: { component: DOCS } } },
  args: nativeAppDefaults,
  argTypes: nativeAppArgTypes,
};
export default meta;

type Story = StoryObj<NativeAppArgs>;

const Rows: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex w-max min-w-full flex-col gap-4 overflow-x-auto p-4">
    {children}
  </div>
);

/** Board 1a: the seven toolbar states, plus the live one driven by the controls. */
export const ToolbarStates: Story = {
  name: "Toolbar States (1a)",
  argTypes: hideControls("width", "devBuild", "seeThrough"),
  render: (args) => (
    <Rows>
      <div className="flex w-max flex-col gap-1.5">
        <StateLabel>
          Controls · {args.mode} · mic {args.mic} · screen {args.screen}
          {args.analysing ? " · analysing" : ""}
          {args.paused ? " · paused" : ""}
        </StateLabel>
        <Backdrop>
          <NativeToolbarDemo
            capture={{
              mode: args.mode,
              analysing: args.analysing,
              problem: args.screen === "problem",
              paused: args.paused,
            }}
            mic={{ status: args.paused ? "paused" : args.mic }}
            onAction={args.onAction}
          />
        </Backdrop>
      </div>
      {toolbarVariants.map((variant) => (
        <div key={variant.name} className="flex w-max flex-col gap-1.5">
          <StateLabel>{variant.name}</StateLabel>
          <Backdrop>
            <NativeToolbarDemo {...variant.args} onAction={args.onAction} />
          </Backdrop>
        </div>
      ))}
    </Rows>
  ),
};

const OpenMenu: React.FC<{
  spec: ActionMenuSpec;
  minHeight: number;
  caption: string;
}> = ({ spec, minHeight, caption }) => (
  <div
    className="flex flex-col gap-1.5"
    style={{
      minHeight,
      width: typeof spec.width === "number" ? spec.width : 300,
    }}
  >
    <StateLabel>{caption}</StateLabel>
    <ActionMenu
      {...spec}
      open
      portal={false}
      side="bottom"
      align="start"
      sideOffset={0}
      trigger={<span className="block h-0 w-0" />}
    />
  </div>
);

/** Board 1c: the three ways to merge Manual into capture, and the four caret menus shown open. */
export const ToolbarVariations: Story = {
  name: "Toolbar Variations (1c)",
  argTypes: hideControls(
    "width",
    "devBuild",
    "seeThrough",
    "paused",
    "mic",
    "screen",
    "mode",
    "analysing",
  ),
  render: () => (
    <Rows>
      <div className="grid grid-cols-3 gap-4">
        {captureOptions().map((option) => (
          <div
            key={option.id}
            className="flex flex-col gap-3 rounded-xl border border-solid p-4"
            style={{
              borderColor: option.picked
                ? "var(--oui-tone-accent-fg)"
                : "var(--oui-tone-neutral-border)",
            }}
          >
            <Backdrop className="flex min-h-[70px] items-center justify-center">
              <CaptureOption controls={option.controls} />
            </Backdrop>
            <strong className="text-[15px]">
              {option.title}
              {option.picked ? (
                <span className="ml-2 text-[color:var(--oui-tone-success-fg)]">
                  pick
                </span>
              ) : null}
            </strong>
            <p className="m-0 text-[13.5px] leading-snug text-[var(--oui-foreground-muted)]">
              {option.description}
            </p>
          </div>
        ))}
      </div>
      <StateLabel>Caret menus · shown open</StateLabel>
      <div className="grid grid-cols-[320px_320px_300px] items-start gap-6">
        <OpenMenu
          caption="Capture caret"
          spec={captureMenuSpec("manual")}
          minHeight={500}
        />
        <OpenMenu
          caption="Microphone caret · lost"
          spec={micLostMenu}
          minHeight={250}
        />
        <OpenMenu
          caption="Answer style"
          spec={answerStyleMenu}
          minHeight={520}
        />
      </div>
      <div className="min-h-[520px]">
        <OpenMenu caption="Shortcuts" spec={shortcutsMenu} minHeight={520} />
      </div>
    </Rows>
  ),
};

/** Board 1d: panels in three states. */
export const PanelsInThreeStates: Story = {
  name: "Panels In Three States (1d)",
  argTypes: hideControls(
    "devBuild",
    "paused",
    "mic",
    "screen",
    "mode",
    "analysing",
  ),
  render: (args) => (
    <Rows>
      {(
        [
          ["ready", "Ready · nothing analysed yet"],
          ["analysing", "Analysing · one screenshot waiting to apply"],
          [
            "answer",
            "Answer ready · code hidden by the panel toggle (two panels reflow, nothing cropped)",
          ],
        ] as const
      ).map(([state, caption]) => (
        <div key={state} className="flex w-max flex-col gap-1.5">
          <StateLabel>{caption}</StateLabel>
          <NativePanelsDemo
            state={state}
            width={args.width}
            seeThrough={args.seeThrough}
            onAction={args.onAction}
          />
        </div>
      ))}
    </Rows>
  ),
};

/** Board 1e: footer states. */
export const FooterStates: Story = {
  name: "Footer States (1e)",
  argTypes: hideControls(
    "width",
    "mic",
    "screen",
    "mode",
    "analysing",
    "paused",
    "devBuild",
  ),
  render: (args) => (
    <Rows>
      {(
        [
          ["Live · development build", false, true],
          ["Live · production build", false, false],
          ["Paused · development build (no banner, no tint)", true, true],
        ] as const
      ).map(([caption, paused, devBuild]) => (
        <div key={caption} className="flex w-[1180px] flex-col gap-1.5">
          <StateLabel>{caption}</StateLabel>
          <Backdrop>
            <NativeFooter
              paused={paused}
              devBuild={devBuild}
              seeThrough={args.seeThrough}
              onAction={args.onAction}
            />
          </Backdrop>
        </div>
      ))}
    </Rows>
  ),
};

/** The full window at 1180: toolbar, the three panels and the footer, all driven by the controls. */
export const Window1180: Story = {
  name: "Window 1180",
  args: { width: 1180 },
  render: (args) => (
    <Rows>
      <NativeAppWindow {...args} />
    </Rows>
  ),
};

/** The full window at 900, the narrowest supported width (M10): nothing is cropped. */
export const Window900: Story = {
  name: "Window 900",
  args: { width: 900 },
  render: (args) => (
    <Rows>
      <NativeAppWindow {...args} />
    </Rows>
  ),
};
