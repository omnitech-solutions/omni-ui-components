/**
 * The accepted accessibility exceptions of this Storybook. This file is the only place one is recorded; the
 * preview (`parameters.a11y.config` in `preview.tsx`) hands it to the a11y addon, so it holds wherever the addon
 * runs: the story view's Accessibility panel and `scripts/storybook-inventory.mjs --a11y`. There is one entry.
 *
 * White text on the solid primary: owner's brand colour, 4.10:1, accepted 2026-10-10.
 * `--oui-primary` stays `#1677ff` by the owner's decision. White (`#ffffff`) on it is 4.10:1, under the 4.5:1
 * that `color-contrast` (WCAG 1.4.3, AA) asks of normal-size text: the primary Button, the chosen Segmented
 * option, the solid Badge and whatever else draws `bg-primary text-primary-foreground`.
 *
 * Scope: that one colour pair and nothing else. An element is left out of `color-contrast` only when axe itself
 * measures its text as exactly `#ffffff` on exactly `#1677ff`. Every other pair is still checked: any other text
 * in the same story, white on a hover or see-through primary (a different measured background), the primary used
 * as text (the library uses `--oui-foreground-primary` there, which passes), and a host's own primary. The rule
 * is not disabled anywhere and `a11y.test` stays `'error'`.
 */
const BRAND_PRIMARY = '#1677ff';
const ON_BRAND_PRIMARY = '#ffffff';

type AxeColor = { toHexString(): string } | null | undefined;
type AxeMatches = (node: Element, virtualNode: unknown, context?: unknown) => boolean;
type AxeGlobal = {
  utils: { getRule(id: string): { matches: AxeMatches } | undefined };
  commons: {
    color: {
      getForegroundColor(node: Element): AxeColor;
      getBackgroundColor(node: Element): AxeColor;
    };
  };
};

const isWhiteOnBrandPrimary: AxeMatches = (node, virtualNode, context) => {
  const axe = (globalThis as { axe?: AxeGlobal }).axe;
  if (!axe) return true;
  // What `color-contrast` itself matches. `color-contrast-enhanced` shares that function and is never configured
  // here, so it is the untouched original (reading it from `color-contrast` would return this function).
  const original = axe.utils.getRule('color-contrast-enhanced')?.matches;
  if (original && !original(node, virtualNode, context)) return false;
  try {
    const { getForegroundColor, getBackgroundColor } = axe.commons.color;
    const foreground = getForegroundColor(node)?.toHexString().toLowerCase();
    if (foreground !== ON_BRAND_PRIMARY) return true;
    return getBackgroundColor(node)?.toHexString().toLowerCase() !== BRAND_PRIMARY;
  } catch {
    // A pair that cannot be measured is not the accepted one: leave the element to the rule.
    return true;
  }
};

/** Passed to `axe.configure` by the a11y addon (`parameters.a11y.config.rules`). */
export const a11yAllowances: { id: string; matches: AxeMatches }[] = [
  { id: 'color-contrast', matches: isWhiteOnBrandPrimary },
];
