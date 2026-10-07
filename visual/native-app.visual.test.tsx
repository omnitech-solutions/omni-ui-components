import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { composeStories } from '@storybook/react-vite';
import { page } from 'vitest/browser';
import { afterEach, describe, expect, test } from 'vitest';
import * as nativeApp from '../packages/core/src/showcase/NativeApp/NativeApp.stories';

// Pixel baselines for the key Native App stories, dark and light. Update with `pnpm test:visual:update`.
// The theme is a story global read by the preview decorators, so each theme composes its own set.
const storiesByTheme = {
  dark: composeStories(nativeApp, { initialGlobals: { theme: 'dark' } }),
  light: composeStories(nativeApp, { initialGlobals: { theme: 'light' } }),
};
const KEY_STORIES = ['ToolbarStates', 'PanelsInThreeStates', 'FooterStates', 'Window1180', 'Window900'] as const;
const THEMES = ['dark', 'light'] as const;

// Animations, transitions and the caret are off so a capture never lands mid-frame.
const FREEZE = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';

afterEach(() => {
  document.body.innerHTML = '';
  document.querySelectorAll('style[data-visual]').forEach((el) => el.remove());
});

describe.each(THEMES)('Native App (%s)', (theme) => {
  test.each(KEY_STORIES)('%s', async (name) => {
    const freeze = document.createElement('style');
    freeze.dataset.visual = '';
    freeze.textContent = FREEZE;
    document.head.append(freeze);

    const host = document.createElement('div');
    host.id = 'storybook-root';
    document.body.append(host);
    const Story = storiesByTheme[theme][name];
    const root = createRoot(host);
    root.render(<Story />);
    await document.fonts.ready;
    await new Promise((r) => setTimeout(r, 300));

    await expect(page.elementLocator(host.querySelector(':scope > :not(style)') as HTMLElement)).toMatchScreenshot(`${name}-${theme}`);
    root.unmount();
  });
});
