import '@testing-library/jest-dom';
import * as React from 'react';
import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { Camera } from 'lucide-react';

import { Button } from '@oc-tech/omni-ui-components/Button';
import { IconButton } from '@oc-tech/omni-ui-components/IconButton';
import { Segmented } from '@oc-tech/omni-ui-components/Segmented';
import { SplitButton } from '@oc-tech/omni-ui-components/SplitButton';
import { hitAreaBoth, hitAreaEnd, hitAreaStart, hitAreaY } from '../../src/internal/support/hitArea';

const tokens = readFileSync(`${import.meta.dirname}/../../src/styles/tokens.css`, 'utf8');
const token = (name: string) => Number(new RegExp(`--oui-${name}:\\s*(\\d+)px`).exec(tokens)?.[1]);

/** What the `min(0px, calc((base - hit) / 2))` offset in hitArea.ts resolves to, and the rectangle it yields. */
const hitSize = (base: number, hit: number) => base - 2 * Math.min(0, (base - hit) / 2);

describe('omni-ui-components/hit area (40px target on the control row)', () => {
  it('defines a 40px hit token beside the 36px control and 52px labelled heights', () => {
    expect(token('control-hit')).toBe(40);
    expect(token('control-height')).toBe(36);
    expect(token('control-height-labelled')).toBe(52);
  });

  it('measures a 40px hit rectangle for a 36px control and leaves the 52px labelled mode unchanged', () => {
    expect(hitSize(token('control-height'), token('control-hit'))).toBe(40);
    expect(hitSize(token('control-height-labelled'), token('control-hit'))).toBe(52);
    // A Segmented option is the 36px root minus 1px border and 2px padding on each side.
    expect(hitSize(30, token('control-hit'))).toBe(40);
  });

  it('clamps the pseudo-element offset at zero and keeps it out of flow', () => {
    for (const classes of [hitAreaBoth, hitAreaY, hitAreaStart, hitAreaEnd]) expect(classes).toContain('oui-hit');
    expect(tokens).toMatch(/min\(0px, \(var\(--oui-hit-base, var\(--oui-control-height\)\) - var\(--oui-control-hit\)\) \/ 2\)/);
    expect(tokens).toMatch(/\.oui-hit::before \{\s*content: '';\s*position: absolute;/);
    expect(hitAreaStart).toContain('oui-hit-start');
    expect(hitAreaEnd).toContain('oui-hit-end');
  });

  it('applies the hit area to the 36px Button and IconButton, not to the 52px labelled ones', () => {
    render(
      <>
        <Button buttonSize="control">Compact</Button>
        <Button buttonSize="control-labelled">Labelled</Button>
        <IconButton iconSize="control" aria-label="Compact icon" icon={<Camera />} />
        <IconButton iconSize="control-labelled" aria-label="Labelled icon" icon={<Camera />} />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Compact' })).toHaveClass('oui-hit');
    expect(screen.getByRole('button', { name: 'Labelled' })).not.toHaveClass('oui-hit');
    expect(screen.getByRole('button', { name: 'Compact icon' })).toHaveClass('oui-hit');
    expect(screen.getByRole('button', { name: 'Labelled icon' })).not.toHaveClass('oui-hit');
  });

  it('applies it to both SplitButton segments (compact only) and to Segmented control options', () => {
    const menu = { label: 'Options', sections: [] };
    const { rerender } = render(<SplitButton main={{ label: 'Capture', icon: <Camera /> }} menu={menu} />);
    expect(screen.getByRole('button', { name: 'Capture' })).toHaveClass('oui-hit');
    expect(screen.getByRole('button', { name: 'More options' })).toHaveClass('oui-hit');
    rerender(<SplitButton size="control-labelled" main={{ label: 'Capture', icon: <Camera /> }} menu={menu} />);
    expect(screen.getByRole('button', { name: 'Capture' })).not.toHaveClass('oui-hit');
    expect(screen.getByRole('button', { name: 'More options' })).not.toHaveClass('oui-hit');
  });

  it('applies it to Segmented control options only', () => {
    const options = [
      { value: 'a', ariaLabel: 'Alpha', icon: <Camera /> },
      { value: 'b', ariaLabel: 'Beta', icon: <Camera /> },
    ];
    const { rerender } = render(<Segmented label="Mode" appearance="control" options={options} value="a" />);
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveClass('oui-hit');
    rerender(<Segmented label="Mode" appearance="pill" options={options} value="a" />);
    expect(screen.getByRole('radio', { name: 'Alpha' })).not.toHaveClass('oui-hit');
  });
});
