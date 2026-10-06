import '@testing-library/jest-dom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from '@oc-tech/omni-ui-components/Button';
import {
  buttonActionVariants,
  buttonPropsFactory,
  buttonSizeVariants,
  buttonStateVariants,
  buttonToneVariants,
} from 'factories/omni-ui-components/Button/Button.factories';

const TONES = ['neutral', 'accent', 'success', 'warning', 'danger', 'dim'] as const;

describe('omni-ui-components/Button variations', () => {
  describe('tone + soft', () => {
    TONES.forEach((tone) => {
      it(`tone=${tone} filled uses the solid tone tokens`, () => {
        render(<Button tone={tone}>Go</Button>);
        const btn = screen.getByRole('button', { name: 'Go' });
        expect(btn).toHaveAttribute('data-tone', tone);
        expect(btn.className).toContain(`--oui-tone-${tone}-`);
        expect(btn).not.toHaveClass('bg-transparent');
      });

      it(`tone=${tone} soft is outlined (transparent fill, tone border)`, () => {
        render(
          <Button tone={tone} soft>
            Go
          </Button>,
        );
        const btn = screen.getByRole('button', { name: 'Go' });
        expect(btn).toHaveClass('bg-transparent');
        expect(btn).toHaveClass(`border-[color:var(--oui-tone-${tone}-border)]`);
      });
    });

    it('leaves the variant look untouched when no tone is set', () => {
      render(<Button>Save</Button>);
      const btn = screen.getByRole('button', { name: 'Save' });
      expect(btn).not.toHaveAttribute('data-tone');
      expect(btn).toHaveClass('bg-primary');
      expect(btn.className).not.toMatch(/(^| )(hover:)?(bg|text|border)-\[color:var\(--oui-tone-/);
    });

    it('does not leak tone, soft or fillIcon to the DOM as attributes', () => {
      render(
        <Button tone="danger" soft fillIcon>
          End
        </Button>,
      );
      const btn = screen.getByRole('button', { name: 'End' });
      expect(btn).not.toHaveAttribute('soft');
      expect(btn).not.toHaveAttribute('fillicon');
      expect(btn).not.toHaveAttribute('tone');
    });
  });

  describe('control sizes', () => {
    it('buttonSize=control is the 36px token height with the control radius', () => {
      render(<Button buttonSize="control">Go</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toHaveAttribute('data-button-size', 'control');
      expect(btn).toHaveClass('h-[var(--oui-control-height)]');
      expect(btn).toHaveClass('rounded-[var(--oui-control-radius)]');
    });

    it('buttonSize=control-labelled is the 52px token height', () => {
      render(<Button buttonSize="control-labelled">Go</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-[var(--oui-control-height-labelled)]');
    });

    it('keeps the existing default size untouched', () => {
      render(<Button>Go</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-[var(--oui-field-height-md)]');
    });
  });

  describe('fillIcon', () => {
    it('fills the leading icon only when asked', () => {
      const { rerender } = render(<Button icon={<svg data-testid="i" />}>Go</Button>);
      expect(screen.getByRole('button')).not.toHaveClass('[&_svg]:fill-current');
      rerender(
        <Button fillIcon icon={<svg data-testid="i" />}>
          Go
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveClass('[&_svg]:fill-current');
    });
  });

  describe('shortcut', () => {
    it('renders the keys as one plain mono text run after the label, hidden from the accessible name', () => {
      render(<Button shortcut={['⌘', '⇧', 'S']}>Capture</Button>);
      const btn = screen.getByRole('button', { name: 'Capture' });
      const shortcut = btn.querySelector('[data-slot="button-shortcut"]')!;
      expect(shortcut.textContent).toBe('⌘⇧S');
      expect(shortcut.querySelector('kbd')).toBeNull();
      expect(shortcut).toHaveClass('font-mono', 'text-[11px]', 'opacity-70');
      expect(shortcut.className).not.toMatch(/border|rounded/);
      expect(btn.querySelector('[data-slot="button-shortcut"]')).toHaveAttribute('aria-hidden', 'true');
      expect(btn.lastElementChild).toBe(btn.querySelector('[data-slot="button-shortcut"]'));
    });

    it('exposes the shortcut through aria-keyshortcuts', () => {
      render(<Button shortcut={['⌥', '⇧', 'U']}>Auto</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-keyshortcuts', 'Alt+Shift+U');
    });

    it('renders nothing for an empty shortcut', () => {
      render(<Button shortcut={[]}>Go</Button>);
      expect(screen.getByRole('button').querySelector('[data-slot="button-shortcut"]')).toBeNull();
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-keyshortcuts');
    });
  });

  describe('loading', () => {
    it('disables natively, sets aria-busy and swaps the leading icon for a spinner', () => {
      render(
        <Button loading icon={<svg data-testid="lead" />}>
          Analysing
        </Button>,
      );
      const btn = screen.getByRole('button', { name: 'Analysing' });
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute('aria-busy', 'true');
      expect(btn).toHaveAttribute('data-loading', 'true');
      expect(screen.queryByTestId('lead')).toBeNull();
      expect(btn.querySelector('[data-slot="button-spinner"]')).toHaveAttribute('aria-hidden', 'true');
    });

    it('does not call onClick while loading', async () => {
      const onClick = jest.fn();
      render(
        <Button loading onClick={onClick}>
          Go
        </Button>,
      );
      await userEvent.setup().click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('is not busy by default', () => {
      render(<Button>Go</Button>);
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
      expect(screen.getByRole('button')).toBeEnabled();
    });
  });

  describe('pressed', () => {
    it('sets aria-pressed true / false and nothing when unset', () => {
      const { rerender } = render(<Button pressed>Answer</Button>);
      expect(screen.getByRole('button', { pressed: true })).toBeInTheDocument();
      rerender(<Button pressed={false}>Answer</Button>);
      expect(screen.getByRole('button', { pressed: false })).toBeInTheDocument();
      rerender(<Button>Answer</Button>);
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');
    });

    it('carries the pressed look as a style hook on aria-pressed', () => {
      render(<Button pressed>Answer</Button>);
      expect(screen.getByRole('button').className).toContain('aria-pressed:bg-[color:var(--oui-tone-accent-bg)]');
    });
  });

  describe('labelMaxWidth', () => {
    it('caps the label and truncates it', () => {
      render(<Button labelMaxWidth={120}>Data Structures &amp; Algorithms</Button>);
      const label = screen.getByText('Data Structures & Algorithms');
      expect(label).toHaveAttribute('data-slot', 'button-label');
      expect(label).toHaveClass('truncate');
      expect(label).toHaveStyle({ maxWidth: '120px' });
    });

    it('accepts any CSS length', () => {
      render(<Button labelMaxWidth="16rem">Long label</Button>);
      expect(screen.getByText('Long label')).toHaveAttribute('style', expect.stringContaining('max-width: 16rem'));
    });

    it('sets the full label as the title only when the label is truncated', () => {
      const scroll = vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(300);
      const client = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(120);
      const { unmount } = render(<Button labelMaxWidth={120}>Data Structures &amp; Algorithms</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Data Structures & Algorithms');
      unmount();
      scroll.mockReturnValue(100);
      render(<Button labelMaxWidth={120}>Short</Button>);
      expect(screen.getByRole('button')).not.toHaveAttribute('title');
      scroll.mockRestore();
      client.mockRestore();
    });

    it('does not wrap the label when unset', () => {
      render(<Button>Plain</Button>);
      expect(screen.getByRole('button').querySelector('[data-slot="button-label"]')).toBeNull();
    });
  });

  describe('asChild', () => {
    it('renders the single child element instead of a <button>', () => {
      render(
        <Button asChild variant="outline">
          <a href="/docs">Docs</a>
        </Button>,
      );
      const link = screen.getByRole('link', { name: 'Docs' });
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/docs');
      expect(link).toHaveAttribute('data-slot', 'button');
      expect(link).toHaveClass('inline-flex');
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('does not leak asChild (or tone/soft/loading props) to the DOM', () => {
      render(
        <Button asChild tone="accent" soft loading={false}>
          <a href="/x">X</a>
        </Button>,
      );
      const link = screen.getByRole('link');
      ['aschild', 'asChild', 'tone', 'soft', 'loading', 'type'].forEach((attr) => expect(link).not.toHaveAttribute(attr));
    });

    it('renders icon, label and shortcut inside the child', () => {
      render(
        <Button asChild icon={<svg data-testid="lead" />} shortcut={['⌘', 'K']}>
          <a href="/x">Search</a>
        </Button>,
      );
      const link = screen.getByRole('link');
      expect(link).toContainElement(screen.getByTestId('lead'));
      expect(link.querySelector('[data-slot="button-shortcut"]')).not.toBeNull();
      expect(link).toHaveTextContent('Search');
    });

    it('forwards the ref to the child element and merges the child handlers', async () => {
      const ref = { current: null as HTMLButtonElement | null };
      const own = jest.fn();
      const onClick = jest.fn();
      render(
        <Button asChild ref={ref} onClick={onClick}>
          <a href="#x" onClick={own}>
            Go
          </a>
        </Button>,
      );
      expect(ref.current?.tagName).toBe('A');
      await userEvent.setup().click(screen.getByRole('link'));
      expect(own).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('disabled becomes aria-disabled + tabIndex -1 and blocks the click', async () => {
      const onClick = jest.fn();
      render(
        <Button asChild disabled onClick={onClick}>
          <a href="#x">Go</a>
        </Button>,
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).toHaveAttribute('tabindex', '-1');
      expect(link).not.toHaveAttribute('disabled');
      await userEvent.setup().click(link);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('loading on an asChild anchor is aria-busy + aria-disabled', () => {
      render(
        <Button asChild loading>
          <a href="#x">Go</a>
        </Button>,
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-busy', 'true');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).toHaveAttribute('tabindex', '-1');
    });

    it('a plain button never gets aria-disabled', () => {
      render(<Button disabled>Go</Button>);
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('focus ring', () => {
    it('keeps the focus-visible ring on tone and control buttons', () => {
      render(
        <Button tone="danger" soft buttonSize="control">
          End
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('factories', () => {
    it('every tone has a filled and a soft entry', () => {
      expect(buttonToneVariants).toHaveLength(TONES.length * 2);
      TONES.forEach((tone) => {
        expect(buttonToneVariants.some((v) => v.args.tone === tone && v.args.soft === true)).toBe(true);
        expect(buttonToneVariants.some((v) => v.args.tone === tone && !v.args.soft)).toBe(true);
      });
    });

    it('the size matrix includes both control sizes', () => {
      expect(buttonSizeVariants.map((v) => v.args.buttonSize)).toEqual(expect.arrayContaining(['control', 'control-labelled']));
    });

    [...buttonToneVariants, ...buttonActionVariants, ...buttonStateVariants].forEach((variant) => {
      it(`renders the "${variant.name}" matrix entry`, () => {
        const { container } = render(<Button {...buttonPropsFactory(variant.args)} />);
        expect(container.firstElementChild).toHaveAttribute('data-slot', 'button');
      });
    });
  });

  describe('tokens', () => {
    const css = readFileSync(resolve(import.meta.dirname, '../../src/styles/tokens.css'), 'utf8');
    const dark = css.slice(css.indexOf('[data-theme="dark"]'));

    it('defines the control scale', () => {
      expect(css).toMatch(/--oui-control-height:\s*36px/);
      expect(css).toMatch(/--oui-control-height-labelled:\s*52px/);
      expect(css).toMatch(/--oui-control-radius:\s*10px/);
      expect(css).toMatch(/--oui-control-gap:\s*6px/);
      expect(css).toMatch(/--oui-control-separator:\s*20px/);
      expect(css).toMatch(/--oui-control-icon:\s*20px/);
    });

    TONES.forEach((tone) => {
      it(`defines the ${tone} tone (fg, bg, border) for light and, except neutral, dark`, () => {
        ['fg', 'bg', 'border', 'solid-bg', 'solid-fg'].forEach((part) => expect(css).toContain(`--oui-tone-${tone}-${part}:`));
        if (tone !== 'neutral') expect(dark).toContain(`--oui-tone-${tone}-fg:`);
      });
    });
  });
});
