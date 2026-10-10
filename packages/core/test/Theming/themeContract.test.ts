import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const styles = resolve(__dirname, '../../src/styles');
const read = (name: string) =>
  readFileSync(resolve(styles, name), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const declarations = (css: string) =>
  [...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(
    ([, name, value]) => [name, value.trim()] as const,
  );
/** The text between the braces of the first block that starts with `opener`. */
const block = (css: string, opener: string) => {
  const start = css.indexOf(opener);
  expect(start, `${opener} not found`).toBeGreaterThanOrEqual(0);
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    if (css[i] === '}' && (depth -= 1) === 0) return css.slice(css.indexOf('{', start) + 1, i);
  }
  throw new Error(`${opener} is not closed`);
};

describe('theme contract (subtree theming)', () => {
  const tailwind = read('tailwind.css');
  const themed = new Set(
    declarations(block(read('theme-tokens.css'), '[data-theme="dark"] {')).map(([name]) => name),
  );

  it('declares every @theme alias of a theme-switched token again on each theme root', () => {
    const theme = new Map(declarations(block(tailwind, '@theme {')));
    const bridge = new Map(declarations(block(tailwind, ':root,\n  :host,\n  [data-theme] {')));
    const expected = [...theme].filter(([name, value]) => {
      const target = value.match(/^var\((--[\w-]+)\)$/)?.[1];
      return target && target !== name && themed.has(target);
    });
    expect(expected.length).toBeGreaterThan(50);
    for (const [name, value] of expected)
      expect(bridge.get(name), `${name} missing from the theme bridge`).toBe(value);
    for (const [name, value] of bridge)
      expect(theme.get(name), `${name} is bridged but not an @theme entry`).toBe(value);
  });

  it('keeps seeds and fixed tokens on :root only, so a host overrides them on any ancestor', () => {
    const palette = read('base-palette.css');
    const derived = declarations(block(palette, ':root,\n[data-theme] {')).map(([name]) => name);
    for (const seed of [
      '--oui-primary',
      '--oui-background',
      '--oui-background-dark',
      '--white',
      '--black',
    ]) {
      expect(derived).not.toContain(seed);
    }
    const tokens = read('tokens.css');
    const everywhere = declarations(block(tokens, ':root,\n  [data-theme] {')).map(
      ([name]) => name,
    );
    for (const fixed of ['--oui-control-height', '--oui-panel-radius', '--oui-panel-see-through'])
      expect(everywhere).not.toContain(fixed);
    for (const derivedToken of ['--oui-foreground', '--oui-surface-field', '--oui-border-field'])
      expect(everywhere).toContain(derivedToken);
  });

  it('has a light and a dark value for every theme-dependent --oui token, and no :root-only dark selector', () => {
    const tokens = read('tokens.css');
    const light = new Set(
      declarations(block(tokens, ":root,\n  [data-theme='light'] {")).map(([name]) => name),
    );
    for (const name of declarations(block(tokens, '[data-theme="dark"] {')).map(([n]) => n))
      expect(light.has(name), `${name} has no light value`).toBe(true);
    for (const file of ['base-palette.css', 'theme-tokens.css', 'tokens.css'])
      expect(read(file)).not.toMatch(/html\s*\[data-theme|:root\[data-theme/);
  });

  it('keeps the brand primary and gives text its own shade of it that reaches 4.5:1 in each theme', () => {
    const channels = (hex: string) =>
      [1, 3, 5].map((at) => Number.parseInt(hex.slice(at, at + 2), 16));
    const luminance = (rgb: number[]) => {
      const [r, g, b] = rgb.map((value) => {
        const unit = value / 255;
        return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a: number[], b: number[]) => {
      const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (light + 0.05) / (dark + 0.05);
    };
    const palette = new Map(declarations(block(read('base-palette.css'), ':root {')));
    expect(palette.get('--oui-primary')).toBe('#1677ff');
    const primary = channels('#1677ff');

    const tokens = read('tokens.css');
    const textShade = (opener: string) => {
      const value = new Map(declarations(block(tokens, opener))).get('--oui-foreground-primary');
      const mix = value?.match(
        /^color-mix\(in srgb, var\(--oui-primary\) (\d+)%, var\(--(black|white)\)\)$/,
      );
      expect(mix, `--oui-foreground-primary in ${opener} is ${value}`).toBeTruthy();
      const share = Number(mix?.[1]) / 100;
      const other = mix?.[2] === 'black' ? 0 : 255;
      return primary.map((value) => Math.round(value * share + other * (1 - share)));
    };
    const light = textShade(":root,\n  [data-theme='light'] {");
    for (const surface of ['#ffffff', '#fafafa', '#f5f5f5'])
      expect(contrast(light, channels(surface)), `light on ${surface}`).toBeGreaterThanOrEqual(4.5);
    const dark = textShade('[data-theme="dark"] {');
    for (const surface of ['#1a1c1d', '#1d1d1d', '#2f2f2f'])
      expect(contrast(dark, channels(surface)), `dark on ${surface}`).toBeGreaterThanOrEqual(4.5);
  });
});
