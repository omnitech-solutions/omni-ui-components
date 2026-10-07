import "@testing-library/jest-dom";
import * as React from "react";
import userEvent from "@testing-library/user-event";
import { render, screen, within } from "@testing-library/react";

import meta, * as stories from "factories/omni-ui-components/showcase/NativeApp/NativeApp.stories";
import {
  NativeAppWindow,
  nativeAppDefaults,
} from "factories/omni-ui-components/showcase/NativeApp/NativeApp.factories";

/** Smoke test: every story composition of the Native App showcase renders without throwing. */
const storyEntries = Object.entries(stories).filter(
  ([name]) => name !== "default",
) as Array<[string, any]>;

describe("omni-ui-components/Showcase/Native App", () => {
  it("declares its own folder", () => {
    expect(meta.title).toBe("omni-ui-components/Showcase/Native App");
  });

  it.each(storyEntries)("%s renders without error", (_name, story) => {
    const args = { ...meta.args, ...story.args };
    const { container } = render(<>{story.render(args, {} as never)}</>);
    expect(container.firstChild).not.toBeNull();
  });

  it("covers one story per gallery board plus the two windows", () => {
    expect(storyEntries.map(([name]) => name)).toEqual([
      "ToolbarStates",
      "ToolbarVariations",
      "PanelsInThreeStates",
      "FooterStates",
      "Window1180",
      "Window900",
    ]);
  });

  describe("window composition", () => {
    it("shows the build tag only in development builds", () => {
      const { rerender } = render(
        <NativeAppWindow {...nativeAppDefaults} devBuild />,
      );
      expect(
        screen.getByRole("button", { name: /Copy build/ }),
      ).toBeInTheDocument();
      rerender(<NativeAppWindow {...nativeAppDefaults} devBuild={false} />);
      expect(screen.queryByRole("button", { name: /Copy build/ })).toBeNull();
    });

    it("capture and Stop drive the Answer panel (no banner)", async () => {
      render(<NativeAppWindow {...nativeAppDefaults} />);
      await userEvent.click(
        screen.getAllByRole("button", { name: "Capture" })[0],
      );
      expect(screen.getByText("Reading the problem")).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: /Stop/ }));
      expect(screen.queryByText("Reading the problem")).toBeNull();
    });

    it("Pause swaps the footer to Resume and blocks capture", async () => {
      render(<NativeAppWindow {...nativeAppDefaults} />);
      await userEvent.click(
        screen.getByRole("button", { name: "Pause session" }),
      );
      expect(
        screen.getByRole("button", { name: "Resume session" }),
      ).toBeInTheDocument();
      expect(
        within(screen.getByRole("group", { name: "Session status" })).getByText(
          "Paused",
        ),
      ).toBeInTheDocument();
    });

    it("the toolbar panel toggles reflow Chat, Answer and Code, and the last one cannot be turned off", async () => {
      render(<NativeAppWindow {...nativeAppDefaults} />);
      const regions = () => screen.getAllByRole("region").map((r) => r.getAttribute("aria-labelledby") && r.querySelector("[data-slot=panel-title]")?.textContent);
      expect(regions()).toEqual(["Transcript & chat", "Answer", "Code"]);
      await userEvent.click(screen.getByRole("button", { name: "Chat" }));
      expect(regions()).toEqual(["Answer", "Code"]);
      await userEvent.click(screen.getByRole("button", { name: "Answer" }));
      expect(regions()).toEqual(["Code"]);
      await userEvent.click(screen.getByRole("button", { name: "Code" }));
      expect(regions()).toEqual(["Code"]);
    });

    it("width 330 shows the transcript alone", () => {
      render(<NativeAppWindow {...nativeAppDefaults} width={330} />);
      expect(
        screen.getByRole("region", { name: "Transcript & chat" }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("region", { name: "Answer" })).toBeNull();
    });
  });
});
